import {
  doc,
  setDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  writeBatch,
  query,
  orderBy,
  serverTimestamp,
  getDoc,
  
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js"

import { db } from "./firebase.js"

export const createUser = async (userId, data) => {
  try {
    await setDoc(doc(db, "users", userId), {
      username: data.username,
      email: data.email,
      avatar: data.avatar || "",
      coverImage: data.coverImage || "",
      bio: data.bio || "",
      role: data.role || "user",
      status: data.status || "active",
      followers: data.followers || 0,
      following: data.following || 0,
      postsCount: 0,
      storiesCount: 0,
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp(),
    })
    console.log("User created successfully!")
    return { success: true, message: "Tạo người dùng thành công!" }
  } catch (error) {
    console.error("Error creating user:", error)
    return { success: false, message: "Lỗi khi tạo người dùng: " + error.message }
  }
}

export const getAllUsers = async () => {
  try {
    console.log("Fetching all users...")
    const usersRef = collection(db, "users")
    const usersSnapshot = await getDocs(usersRef)

    if (usersSnapshot.empty) {
      console.log("No users found in database!")
      return []
    }

    const usersList = []
    usersSnapshot.docs.forEach((doc) => {
      try {
        const userData = doc.data()
        const processedUser = {
          id: doc.id,
          ...userData,
          joinDate: userData.createdAt?.toDate().toISOString().split("T")[0] || "",
          lastActive: formatLastActive(userData.lastActive?.toDate()),
        }
        usersList.push(processedUser)
      } catch (error) {
        console.error("Error processing user:", error)
      }
    })

    console.log("Users fetched successfully:", usersList.length)
    return usersList
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

export const getUserInfo = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return {
        id: userSnap.id,
        ...userSnap.data(),
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng:", error);
    return null;
  }
};


export const deleteUser = async (userId) => {
  try {
    await deleteDoc(doc(db, "users", userId))
    return { success: true, message: "Xóa người dùng thành công!" }
  } catch (error) {
    console.error("Error deleting user:", error)
    return { success: false, message: "Lỗi khi xóa người dùng: " + error.message }
  }
}


export const createPost = async (postData) => {
  try {
    const postsRef = collection(db, "posts")
    const docRef = await addDoc(postsRef, {
      title: postData.title,
      content: postData.content,
      author: postData.author || "Admin",
      authorId: postData.authorId || "admin",
      authorAvatar: postData.authorAvatar || "",
      category: postData.category,
      status: postData.status || "draft",
      tags: postData.tags || [],
      views: 0,
      comments: 0,
      likes: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return { success: true, message: "Tạo bài viết thành công!", id: docRef.id }
  } catch (error) {
    console.error("Error creating post:", error)
    return { success: false, message: "Lỗi khi tạo bài viết: " + error.message }
  }
}

export const getAllPosts = async () => {
  try {
    const postsRef = collection(db, "posts")
    const q = query(postsRef, orderBy("createdAt", "desc"))
    const postsSnapshot = await getDocs(q)
    const postsList = postsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }))
    return postsList
  } catch (error) {
    console.error("Error fetching posts:", error)
    return []
  }
}

export const getUserPosts = async (userId) => {
  try {
    const userPostCol = collection(db, "users", userId, "posts")
    const userPostSnap = await getDocs(userPostCol)

    if (userPostSnap.empty) {
      console.log("No user's posts found in database!")
      return []
    }

    const usersPostList = []
    userPostSnap.docs.forEach((doc) => {
      try {
        const userPostData = doc.data()
        const processedUserPost = {
          id: doc.id,
          ...userPostData,
        }
        usersPostList.push(processedUserPost)
      } catch (error) {
        console.error("Error processing user's posts:", error)
      }
    })

    console.log("User's posts fetched successfully:", usersPostList)
    return usersPostList
  } catch (error) {
    console.error("Error fetching user's posts:", error)
    return []
  }
}
export const updateUser = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      return { success: false, message: `Không tìm thấy user ${userId}` };
    }

    const postsSnap = await getDocs(collection(userRef, "posts"));
    const storiesSnap = await getDocs(collection(userRef, "stories"));
    const followersSnap = await getDocs(collection(userRef, "followers"));
    const followingSnap = await getDocs(collection(userRef, "following"));

    const updates = {
      posts: postsSnap.size,
      stories: storiesSnap.size,
      followers: followersSnap.size,
      following: followingSnap.size,
    };

    await updateDoc(userRef, updates);

    return {
      success: true,
      message: `Cập nhật user ${userId} thành công.`,
      counts: updates,
    };
  } catch (error) {
    console.error(`Lỗi khi cập nhật user ${userId}:`, error);
    return { success: false, message: "Lỗi: " + error.message };
  }
};
export const updatePost = async (postId, data) => {
  try {
    const postRef = doc(db, "posts", postId)
    await updateDoc(postRef, {
      ...data,
      updatedAt: serverTimestamp(),
    })
    return { success: true, message: "Cập nhật bài viết thành công!" }
  } catch (error) {
    console.error("Error updating post:", error)
    return { success: false, message: "Lỗi khi cập nhật bài viết: " + error.message }
  }
}

export const deletePost = async (postId) => {
  try {
    await deleteDoc(doc(db, "posts", postId))
    return { success: true, message: "Xóa bài viết thành công!" }
  } catch (error) {
    console.error("Error deleting post:", error)
    return { success: false, message: "Lỗi khi xóa bài viết: " + error.message }
  }
}

export const addFollower = async (userId, followerId, type = "followers") => {
  try {
    const relationRef = collection(db, "users", userId, type)
    await addDoc(relationRef, {
      userId: followerId,
      addedAt: serverTimestamp(),
      status: "active",
    })

    const userRef = doc(db, "users", userId)
    const currentUser = await getDoc(userRef)
    const currentCount = currentUser.data()[type] || 0

    await updateDoc(userRef, {
      [type]: currentCount + 1,
    })

    return { success: true, message: `Thêm ${type} thành công!` }
  } catch (error) {
    console.error(`Error adding ${type}:`, error)
    return { success: false, message: `Lỗi khi thêm ${type}: ` + error.message }
  }
}

export const addUserToGroup = async (userId, groupData) => {
  try {
    const groupsRef = collection(db, "users", userId, "groups")
    await addDoc(groupsRef, {
      groupId: groupData.groupId,
      groupName: groupData.groupName,
      role: groupData.role || "member",
      joinedAt: serverTimestamp(),
      status: "active",
    })
    return { success: true, message: "Thêm vào nhóm thành công!" }
  } catch (error) {
    console.error("Error adding to group:", error)
    return { success: false, message: "Lỗi khi thêm vào nhóm: " + error.message }
  }
}


export const getUserRelations = async (userId, type = "followers") => {
  try {
    const relationsRef = collection(db, "users", userId, type)
    const relationsSnapshot = await getDocs(relationsRef)
    const relationsList = relationsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      addedAt: doc.data().addedAt?.toDate().toISOString().split("T")[0] || "",
    }))
    return relationsList
  } catch (error) {
    console.error(`Error fetching ${type}:`, error)
    return []
  }
}
export const getUserMedia = async (userId) => {
  try {
    const MediasRef = collection(db, "users", userId, "media")
    const MediasSnapshot = await getDocs(MediasRef)
    const MediasList = MediasSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      addedAt: doc.data().addedAt?.toDate().toISOString().split("T")[0] || "",
    }))
    return MediasList
  } catch (error) {
    console.error(`Error fetching ${type}:`, error)
    return []
  }
}


export const getFollowsInfo = async (userId) => {
  try {
    const followersCol = collection(db, "users", userId, "followers");
    const followingCol = collection(db, "users", userId, "following");
    const [followersSnap, followingSnap] = await Promise.all([
      getDocs(followersCol),
      getDocs(followingCol),
    ]);
    const followers = followersSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    const following = followingSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return [...followers, ...following];
  } catch (error) {
    console.error("Lỗi khi lấy thông tin follows:", error);
    return [];
  }
};

export const getUserGroups = async (userId) => {
  try {
    const groupsRef = collection(db, "users", userId, "groups")
    const groupsSnapshot = await getDocs(groupsRef)
    const groupsList = groupsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      joinedAt: doc.data().joinedAt?.toDate().toISOString().split("T")[0] || "",
    }))
    return groupsList
  } catch (error) {
    console.error("Error fetching groups:", error)
    return []
  }
}

function formatLastActive(date) {
  if (!date) return "Chưa xác định"

  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "Vừa xong"
  if (minutes < 60) return `${minutes} phút trước`
  if (hours < 24) return `${hours} giờ trước`
  if (days < 7) return `${days} ngày trước`
  return `${Math.floor(days / 7)} tuần trước`
}

// ===== FOLLOWERS & FOLLOWING MANAGEMENT =====
export const addFollowerToUser = async (userId, followerData) => {
  try {
    const followersRef = collection(db, "users", userId, "followers")
    await addDoc(followersRef, {
      userId: followerData.userId,
      username: followerData.username,
      avatar: followerData.avatar || "",
      followedAt: serverTimestamp(),
      status: "active",
      mutualFollows: followerData.mutualFollows || false,
      source: followerData.source || "direct",
      notes: followerData.notes || "",
      lastInteraction: serverTimestamp(),
      interactionCount: 0,
    })
    const userRef = doc(db, "users", userId)
    const currentUser = await getDoc(userRef)
    const currentCount = currentUser.data()?.followers || 0
    await updateDoc(userRef, {
      followers: currentCount + 1,
    })
    return { success: true, message: "Thêm follower thành công!" }
  } catch (error) {
    console.error("Error adding follower:", error)
    return { success: false, message: "Lỗi khi thêm follower: " + error.message }
  }
}

export function loadPosts(PostData) {
  const postsContainer = document.getElementById("feed");
  if (!postsContainer) return;
  
  postsContainer.innerHTML = PostData
    .map(
      (post) => `
        <div class="post-card">
          <div class="post-header">
            <div class="post-avatar" style="background-image: url('${post.avatar}')"></div>
            <div class="post-info">
              <h6>${post.username}</h6>
              <div class="post-time">${post.timestamp}</div>
            </div>
          </div>
          <div class="post-content">
            ${post.content}
          </div>
          ${post.postImg ? `<div class="post-image" style="background-image: url('${post.postImg}')"></div>` : ""}
          <div class="post-actions">
            <button class="post-action" onclick="toggleLike(${post.id})">
              <i class="bi bi-heart"></i> ${post.likeCounter} Like
            </button>
            <button class="post-action">
              <i class="bi bi-chat"></i> ${post.commentCounter} Comment
            </button>
            <button class="post-action">
              <i class="bi bi-share"></i> ${post.shareCounter} Share
            </button>
          </div>
        </div>
      `
    )
    .join("");
}

export const addFollowingToUser = async (userId, followingData) => {
  try {
    const followingRef = collection(db, "users", userId, "following")
    await addDoc(followingRef, {
      userId: followingData.userId,
      username: followingData.username,
      avatar: followingData.avatar || "",
      followedAt: serverTimestamp(),
      status: "active",
      mutualFollows: followingData.mutualFollows || false,
      category: followingData.category || "general",
      notifications: followingData.notifications || true,
      priority: followingData.priority || "normal",
      lastSeen: serverTimestamp(),
      interactionCount: 0,
    })
    const userRef = doc(db, "users", userId)
    const currentUser = await getDoc(userRef)
    const currentCount = currentUser.data()?.following || 0
    await updateDoc(userRef, {
      following: currentCount + 1,
    })

    return { success: true, message: "Thêm following thành công!" }
  } catch (error) {
    console.error("Error adding following:", error)
    return { success: false, message: "Lỗi khi thêm following: " + error.message }
  }
}

export const getUserFollowers = async (userId) => {
  try {
    const followersRef = collection(db, "users", userId, "followers")
    const q = query(followersRef, orderBy("followedAt", "desc"))
    const followersSnapshot = await getDocs(q)

    const followersList = followersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      followedAt: doc.data().followedAt?.toDate().toISOString().split("T")[0] || "",
      lastInteraction: doc.data().lastInteraction?.toDate().toISOString().split("T")[0] || "",
    }))

    return followersList
  } catch (error) {
    console.error("Error fetching followers:", error)
    return []
  }
}

export const getUserFollowing = async (userId) => {
  try {
    const followingRef = collection(db, "users", userId, "following")
    const q = query(followingRef, orderBy("followedAt", "desc"))
    const followingSnapshot = await getDocs(q)

    const followingList = followingSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      followedAt: doc.data().followedAt?.toDate().toISOString().split("T")[0] || "",
      lastSeen: doc.data().lastSeen?.toDate().toISOString().split("T")[0] || "",
    }))

    return followingList
  } catch (error) {
    console.error("Error fetching following:", error)
    return []
  }
}

export const getDashboardStats = async () => {
  try {
    const [usersSnapshot, postsSnapshot] = await Promise.all([
      getDocs(collection(db, "users")),
      getDocs(collection(db, "posts")),
    ])

    const users = usersSnapshot.docs.map((doc) => doc.data())
    const posts = postsSnapshot.docs.map((doc) => doc.data())

    const stats = {
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.status === "active").length,
      totalPosts: posts.length,
      publishedPosts: posts.filter((p) => p.status === "published").length,
      draftPosts: posts.filter((p) => p.status === "draft").length,
      totalViews: posts.reduce((sum, p) => sum + (p.views || 0), 0),
      totalComments: posts.reduce((sum, p) => sum + (p.comments || 0), 0),
    }

    return stats
  } catch (error) {
    console.error("Error fetching stats:", error)
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalPosts: 0,
      publishedPosts: 0,
      draftPosts: 0,
      totalViews: 0,
      totalComments: 0,
    }
  }
}

// ===== RANDOM DATA GENERATORS =====
function stripDiacritics(str) {
  return str
    .normalize("NFD")     
    .replace(/\p{M}/gu, "")  
    .replace(/[^\w.-]/g, "") 
    .toLowerCase();
}
export const generateRandomUserData = () => {
  const firstNames = [
    "Nguyễn ",
    "Trần ",
    "Lê ",
    "Phạm ",
    "Hoàng ",
    "Huỳnh ",
    "Phan ",
    "Vũ ",
    "Võ ",
    "Đặng ",
    "Bùi ",
    "Đỗ ",
    "Hồ ",
    "Ngô ",
    "Dương ",
  ]
  const lastNames = [
    "Văn An",
    "Thị Bình",
    "Minh Châu",
    "Hoàng Dũng",
    "Thị Em",
    "Văn Phúc",
    "Thị Giang",
    "Minh Hải",
    "Thị Lan",
    "Văn Khoa",
    "Thị Linh",
    "Minh Nam",
    "Thị Oanh",
    "Văn Phong",
    "Thị Quỳnh",
  ]
  const domains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "example.com"]
  const roles = ["user", "user", "user", "moderator", "admin"]
  const statuses = ["active", "active", "active", "inactive"]
  const categories = ["friend", "celebrity", "business", "interest", "general"]
  const sources = ["suggested", "mutual"]
  const priorities = ["high", "normal", "normal", "low"]

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  const displayName = (firstName + lastName).trim()
  const base = stripDiacritics(displayName);
  const uniqueSuffix = Math.floor(Math.random() * 1000);
  const username = `${displayName}${uniqueSuffix}`;
  const email = `${base}${uniqueSuffix}@${domains[Math.floor(Math.random() * domains.length)]}`;

  return {
    username: username,
    email: email,
    avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(firstName + " " + lastName)}&backgroundColor=${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0")}`,
    coverImage: `https://picsum.photos/800/200?random=${Math.floor(Math.random() * 1000)}`,
    bio: `Xin chào! Tôi là ${firstName} ${lastName}. Rất vui được kết nối với mọi người!`,
    role: roles[Math.floor(Math.random() * roles.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    followers: 0,
    following: 0,
    category: categories[Math.floor(Math.random() * categories.length)],
    source: sources[Math.floor(Math.random() * sources.length)],
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    mutualFollows: 0,
    notifications: Math.random() > 0.2,
    interactionCount: Math.floor(Math.random() * 100),
  }
}
export const createRandomUsers = async (count) => {
  try {
    const results = []

    for (let i = 0; i < count; i++) {
      const userData = generateRandomUserData()
      const userId = `A1-${crypto.randomUUID()}`;
      const result = await createUser(userId, userData)
      results.push({ userId, success: result.success, data: userData })
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    return { success: true, message: `Tạo ${count} users random thành công!`, results }
  } catch (error) {
    console.error("Error creating random users:", error)
    return { success: false, message: "Lỗi khi tạo users random: " + error.message }
  }
}


function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getRandomUniqueElements(arr, count) {
  const copy = [...arr];
  const picked = [];
  while (picked.length < count && copy.length) {
    const i = Math.floor(Math.random() * copy.length);
    picked.push(copy.splice(i, 1)[0]);
  }
  return picked;
}

const clean = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

export const assignFollowersAndFollowingWithSubcollections = async (users) => {
  if (!Array.isArray(users) || users.length === 0) {
    console.warn("No users provided to assignFollowersAndFollowingWithSubcollections");
    return { success: false, message: "Không có người dùng để gán." };
  }

  try {
    const assignments = {};
    users.forEach((user) => {
      const others = users.filter((u) => u.id !== user.id);
      const followers = getRandomUniqueElements(others, getRandomInt(0, 15));
      const following = getRandomUniqueElements(others, getRandomInt(0, 15));
      assignments[user.id] = { user, followers, following };
    });
    Object.values(assignments).forEach(({ user, following }) => {
      following.forEach((followed) => {
        const target = assignments[followed.id];
        if (target && !target.followers.some((f) => f.id === user.id)) {
          target.followers.push(user);
        }
      });
    });

    for (const { user, followers, following } of Object.values(assignments)) {
      if (!user || !user.id) {
        console.warn("Skipping invalid user entry:", user);
        continue;
      }
      try {
        const userRef = doc(db, "users", user.id);
        const batch = writeBatch(db);

        const followersCol = collection(userRef, "followers");
        followers.forEach((follower) => {
          if (!follower || !follower.id) return;
          const payload = clean({
            username: follower.username,
            email: follower.email,
            avatar: follower.avatar,
            status: follower.status,
          });
          batch.set(doc(followersCol, follower.id), payload);
        });

        const followingCol = collection(userRef, "following");
        following.forEach((followed) => {
          if (!followed || !followed.id) return;
          const payload = clean({
            username: followed.username,
            email: followed.email,
            avatar: followed.avatar,
            status: followed.status,
          });
          batch.set(doc(followingCol, followed.id), payload);
        });

        batch.update(userRef, {
          followers: followers.length,
          following: following.length,
        });

        await batch.commit();
      } catch (innerErr) {
        console.warn(`Failed to assign for user ${user.id}:`, innerErr);
      }
    }

    return { success: true, message: "Đã gán followers/following cho tất cả người dùng." };
  } catch (err) {
    console.error("Error in assignFollowersAndFollowingWithSubcollections:", err);
    return { success: false, message: err.message };
  }
};



const samplePostContents = [
  "Hôm nay trời đẹp quá, đi cà phê với bạn bè thôi!",
  "Đang làm project mới, cảm thấy hứng khởi!",
  "Ai có đề xuất phim gì xem cuối tuần không?",
  "Chia sẻ vài tip productivity mình đang dùng.",
  "Mình vừa thử quán mới, đồ ăn ngon lắm!",
  "Tự học code mỗi ngày để tiến bộ hơn.",
  "Có ai chơi game này chưa? Review đi!",
  "Muốn đi du lịch nhưng chưa biết chọn đâu.",
  "Mình vừa hoàn thành mục tiêu tuần này!",
  "Ai muốn kết nối để hợp tác sáng tạo?"
];
const sampleCommentTexts = [
  "Thích bài này!",
  "Tuyệt vời!",
  "Cảm ơn đã chia sẻ.",
  "Quá đúng!",
  "Chia sẻ thêm nhé.",
  "Ngầu quá!",
  "Mình cũng nghĩ vậy.",
  "Ý tưởng hay.",
  "Haha, cười vỡ bụng.",
  "Đọc xong thấy có động lực."
];
const sampleShareNotes = [
  "Xem thử cái này nhé",
  "Đáng chú ý!",
  "Phải chia sẻ ngay",
  "Bạn sẽ thích",
  "Giữ lại để xem sau",
  "Cần lan tỏa"
];
export const generateRandomPostData = (author) => {
  const content = samplePostContents[Math.floor(Math.random() * samplePostContents.length)];
  const createdAt = new Date().toISOString();
  const postIdSeed = crypto.randomUUID();
  return {
    userId: author.id,
    username: author.username,
    avatar: author.avatar,
    createdAt,
    content,
    postImg: `https://picsum.photos/seed/${postIdSeed}/600/400`,
    likeCounter: 0,
    shareCounter: 0,
    commentCounter: 0,
  };
};
export const createRandomPostsWithInteractions = async (count) => {
  try {
    const allUsersSnap = await getDocs(collection(db, "users"));
    const users = allUsersSnap.docs.map((d) => ({
      id: d.id,
      username: d.data().username || "annonymous",
      avatar: d.data().avatar || null
    }));
    if (users.length === 0) {
      return { success: false, message: "Không có người dùng để tạo bài đăng." };
    }

    const results = [];

    for (let i = 0; i < count; i++) {
      const author = users[Math.floor(Math.random() * users.length)];
      const postId = `P31-${crypto.randomUUID()}`;
      const postRef = doc(db, "posts", postId);

      const basePost = generateRandomPostData(author);
      const others = users.filter((u) => u.id !== author.id);
      const likeUsers = getRandomUniqueElements(others, getRandomInt(0, Math.min(10, others.length)));
      const shareUsers = getRandomUniqueElements(others, getRandomInt(0, Math.min(5, others.length)));
      const commentUsers = getRandomUniqueElements(others, getRandomInt(0, Math.min(8, others.length)));

      const postData = {
        ...basePost,
        likeCounter: likeUsers.length,
        shareCounter: shareUsers.length,
        commentCounter: commentUsers.length,
      };

      await setDoc(postRef, postData);

      const authorPostRef = doc(collection(doc(db, "users", author.id), "posts"), postId);
      await setDoc(authorPostRef, {
        createdAt: basePost.createdAt,
        content: basePost.content,
        postImg: basePost.postImg,
        likeCounter: likeUsers.length,
        shareCounter: shareUsers.length,
        commentCounter: commentUsers.length,
      });
      const imgId = `IMG31-${crypto.randomUUID()}`;
      const mediaRef = doc(collection(doc(db, "users", author.id), "media"), imgId);
      await setDoc(mediaRef, {
        link: basePost.postImg,
        createdAt: basePost.createdAt,
      });

      for (const liker of likeUsers) {
        const likeRef = doc(collection(postRef, "likes"), liker.id);
        await setDoc(likeRef, {
          userId: liker.id,
          username: liker.username,
          avatar: liker.avatar
        });
        const interactionRef = doc(collection(doc(db, "users", liker.id), "interaction"), postId);
        await setDoc(interactionRef, { liked: true }, { merge: true });
      }


      for (const sharer of shareUsers) {
        const shareRef = doc(collection(postRef, "shares"), sharer.id);
        await setDoc(shareRef, {
          userId: sharer.id,
          username: sharer.username,
          avatar: sharer.avatar
        });
        const interactionRef = doc(collection(doc(db, "users", sharer.id), "interaction"), postId);
        await setDoc(interactionRef, {}, { merge: true });
        
        const sharedPostId = `SP31-${crypto.randomUUID()}`;
        const sharedRef = doc(collection(interactionRef, "shared"), sharedPostId);
        await setDoc(sharedRef, {
          sharedBy: { id: sharer.id, username: sharer.username, avatar:sharer.avatar },
          original: {
            id: author.id,
            username: author.username,
            avatar:author.avatar,
            content: basePost.content,
            postImg: basePost.postImg,
            createdAt: basePost.createdAt,
          },
          sharedContent: sampleShareNotes[Math.floor(Math.random() * sampleShareNotes.length)],
          originalCreatedAt: basePost.createdAt,
          sharedCreatedAt: new Date().toISOString(),
        });
      }

      for (const commenter of commentUsers) {
        const commentId = `${commenter.id}-${crypto.randomUUID().slice(0, 5)}`;
        const commentRef = doc(collection(postRef, "comments"), commentId);
        const commentText = sampleCommentTexts[Math.floor(Math.random() * sampleCommentTexts.length)];
        const commentCreatedAt = new Date().toISOString();
        await setDoc(commentRef, {
          userId: commenter.id,
          username: commenter.username,
          avatar: commenter.avatar,
          content: commentText,
          createdAt: commentCreatedAt,
        });
        const interactionRef = doc(collection(doc(db, "users", commenter.id), "interaction"), postId);
        await setDoc(interactionRef, {}, { merge: true });
        const userCommentRef = doc(collection(interactionRef, "comment"), commentId);
        await setDoc(userCommentRef, {
          content: commentText,
          createdAt: commentCreatedAt,
        });
      }

      results.push({ postId, success: true, data: postData });
      await new Promise((r) => setTimeout(r, 100));
    }

    return {
      success: true,
      message: `Tạo ${count} bài đăng random với tương tác thành công!`,
      results,
    };
  } catch (error) {
    console.error("Error creating random posts with interactions:", error);
    return {
      success: false,
      message: "Lỗi khi tạo posts và tương tác: " + error.message,
    };
  }
};
const sampleStoryContents = [
  "Nắng hôm nay đẹp quá!",
  "Đang trên đường đi chơi, ai đoán được đích đến không?",
  "Chia sẻ khoảnh khắc sáng nay.",
  "Có một bản nhạc mình đang nghe suốt cả ngày.",
  "Góc yên bình của mình hôm nay.",
  "Story nhanh: làm xong task, giờ chill.",
  "Một chút cảm hứng cho ai đang xem.",
  "Hôm nay mình thử style mới!",
  "Đời sống là những câu chuyện nhỏ.",
  "Bạn có nghe bài này chưa?"
];
const sampleBgMusic = [
  "https://example.com/music1.mp3",
  "https://example.com/music2.mp3",
  "https://example.com/music3.mp3",
  "https://example.com/ambient-loop.mp3",
];

const generateRandomStoryData = (author, ttlHours = 24) => {
  const now = new Date();
  const createdAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + ttlHours * 60 * 60 * 1000); // TTL window
  const content = sampleStoryContents[Math.floor(Math.random() * sampleStoryContents.length)];
  const bgMusic = sampleBgMusic[Math.floor(Math.random() * sampleBgMusic.length)];
  const storyIdSeed = crypto.randomUUID();
  const imageUrl = `https://picsum.photos/seed/${storyIdSeed}/500/800`;
  const viewCount = getRandomInt(0, 100); // simulate some initial views

  return {
    userId: author.id,
    username: author.username,
    createdAt, 
    content,
    image: imageUrl,
    "bg-music": bgMusic,
    "bg-choice": null,
    useravatar: author.avatar || null,
    likesCounter: 0,
    viewCount,
    expiresAt, 
  };
};

export const createRandomStoriesWithInteractions = async (count) => {
  try {
    const allUsersSnap = await getDocs(collection(db, "users"));
    const users = allUsersSnap.docs.map((d) => ({
      id: d.id,
      username: d.data().username || "Annonymous",
      avatar: d.data().avatar || null,
    }));
    if (users.length === 0) {
      return { success: false, message: "Không có người dùng để tạo story." };
    }

    const results = [];

    for (let i = 0; i < count; i++) {
      const author = users[Math.floor(Math.random() * users.length)];
      const storyId = `S31-${crypto.randomUUID()}`;
      const storyRef = doc(db, "stories", storyId);

      const baseStory = generateRandomStoryData(author);

      const others = users.filter((u) => u.id !== author.id);
      const likeUsers = getRandomUniqueElements(others, getRandomInt(0, Math.min(10, others.length)));

      const storyData = {
        ...baseStory,
        likesCounter: likeUsers.length,
      };

      await setDoc(storyRef, storyData);
      const authorStoryRef = doc(collection(doc(db, "users", author.id), "stories"), storyId);
      await setDoc(authorStoryRef, {
        createdAt: baseStory.createdAt,
        content: baseStory.content,
        image: baseStory.image,
        "bg-music": baseStory["bg-music"],
        "bg-choice": null,
        likesCounter: likeUsers.length,
        viewCount: baseStory.viewCount,
        expiresAt: baseStory.expiresAt,
      });
      const imgId = `IMG31-${crypto.randomUUID()}`;
      const mediaRef = doc(collection(doc(db, "users", author.id), "media"), imgId);
      await setDoc(mediaRef, {
        link: baseStory.image,
        createdAt: baseStory.createdAt,
      });

      for (const liker of likeUsers) {
        const likeRef = doc(collection(storyRef, "likes"), liker.id);
        await setDoc(likeRef, {
          userId: liker.id,
          username: liker.username,
          avatar: liker.avatar,
        });
        const interactionRef = doc(collection(doc(db, "users", liker.id), "interaction"), storyId);
        await setDoc(interactionRef, { liked: true }, { merge: true });
      }
      results.push({ storyId, success: true, data: storyData });
      await new Promise((r) => setTimeout(r, 100));
    }

    return {
      success: true,
      message: `Tạo ${count} stories random với tương tác + viewCount + TTL thành công!`,
      results,
    };
  } catch (error) {
    console.error("Error creating random stories with interactions and TTL:", error);
    return {
      success: false,
      message: "Lỗi khi tạo stories và tương tác: " + error.message,
    };
  }
};
// export const cleanupExpiredStories = async () => {
//   try {
//     const now = new Date();
//     const q = query(collection(db, "stories"), where("expiresAt", "<=", now));
//     const expiredSnap = await getDocs(q);
//     let deleted = 0;

//     for (const docSnap of expiredSnap.docs) {
//       const storyId = docSnap.id;
//       const storyData = docSnap.data();
//       const authorId = storyData.userId;
//       await setDoc(doc(db, "stories", storyId), {}, { merge: false }); // or use deleteDoc if imported
//       await setDoc(doc(collection(doc(db, "users", authorId), "stories"), storyId), {}, { merge: false });
//       deleted++;
//     }

//     return { success: true, message: `Cleaned up ${deleted} expired story(ies).` };
//   } catch (e) {
//     console.error("Error cleaning expired stories:", e);
//     return { success: false, message: e.message };
//   }
// };