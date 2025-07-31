import {
  doc,
  setDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
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

export const updateUser = async (userId, data) => {
  try {
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp(),
    })
    return { success: true, message: "Cập nhật người dùng thành công!" }
  } catch (error) {
    console.error("Error updating user:", error)
    return { success: false, message: "Lỗi khi cập nhật người dùng: " + error.message }
  }
}

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
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString().split("T")[0] || "",
      updatedAt: doc.data().updatedAt?.toDate().toISOString().split("T")[0] || "",
    }))
    return postsList
  } catch (error) {
    console.error("Error fetching posts:", error)
    return []
  }
}

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

export const addStoryToUser = async (userId, storyData) => {
  try {
    const storiesRef = collection(db, "users", userId, "stories")
    await addDoc(storiesRef, {
      bg: storyData.bg || "",
      bgMusic: storyData.bgMusic || "",
      caption: storyData.caption || "",
      duration: storyData.duration || 60,
      postTime: serverTimestamp(),
      expTime: new Date(Date.now() + 86400000),
      reactions: {},
      viewState: {
        friendsOnly: storyData.friendsOnly || true,
        hidden: storyData.hidden || false,
        public: storyData.public || true,
        restricted: storyData.restricted || false,
      },
    })
    return { success: true, message: "Thêm story thành công!" }
  } catch (error) {
    console.error("Error adding story:", error)
    return { success: false, message: "Lỗi khi thêm story: " + error.message }
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
      source: followerData.source || "direct", // direct, suggested, imported
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
      category: followingData.category || "general", // friend, celebrity, business, interest
      notifications: followingData.notifications || true,
      priority: followingData.priority || "normal", // high, normal, low
      lastSeen: serverTimestamp(),
      interactionCount: 0,
    })

    // Update following count
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
// ===== RANDOM DATA GENERATORS =====
export const generateRandomUserData = () => {
  const firstNames = [
    "Nguyễn",
    "Trần",
    "Lê",
    "Phạm",
    "Hoàng",
    "Huỳnh",
    "Phan",
    "Vũ",
    "Võ",
    "Đặng",
    "Bùi",
    "Đỗ",
    "Hồ",
    "Ngô",
    "Dương",
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
  const sources = [ "suggested", "mutual"]
  const priorities = ["high", "normal", "normal", "low"]

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  const username = (firstName + lastName).toLowerCase().replace(/\s+/g, "") + Math.floor(Math.random() * 1000)
  const email = username + "@" + domains[Math.floor(Math.random() * domains.length)]

  return {
    username: username,
    email: email,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName + " " + lastName)}&background=${Math.floor(Math.random() * 16777215).toString(16)}&color=ffffff&bold=true`,
    coverImage: `https://picsum.photos/800/200?random=${Math.floor(Math.random() * 1000)}`,
    bio: `Xin chào! Tôi là ${firstName} ${lastName}. Rất vui được kết nối với mọi người!`,
    role: roles[Math.floor(Math.random() * roles.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    followers: Math.floor(Math.random() * 5000),
    following: Math.floor(Math.random() * 1000),
    category: categories[Math.floor(Math.random() * categories.length)],
    source: sources[Math.floor(Math.random() * sources.length)],
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    mutualFollows: Math.random() > 0.7, // 30% chance of mutual follows
    notifications: Math.random() > 0.2, // 80% chance of notifications enabled
    interactionCount: Math.floor(Math.random() * 100),
  }
}

export const createRandomUsers = async (count = 10) => {
  try {
    const results = []

    for (let i = 0; i < count; i++) {
      const userData = generateRandomUserData()
      const userId = "random_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5)
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

export const addRandomFollowersToUser = async (userId, count = 5) => {
  try {
    const results = []
    for (let i = 0; i < count; i++) {
      const followerData = generateRandomUserData()
      followerData.userId = "follower_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5)

      const result = await addFollowerToUser(userId, followerData)
      results.push({ followerId: followerData.userId, success: result.success })

      await new Promise((resolve) => setTimeout(resolve, 50))
    }

    return { success: true, message: `Thêm ${count} followers random thành công!`, results }
  } catch (error) {
    console.error("Error adding random followers:", error)
    return { success: false, message: "Lỗi khi thêm followers random: " + error.message }
  }
}

export const addRandomFollowingToUser = async (userId, count = 5) => {
  try {
    const results = []

    for (let i = 0; i < count; i++) {
      const followingData = generateRandomUserData()
      followingData.userId = "following_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5)

      const result = await addFollowingToUser(userId, followingData)
      results.push({ followingId: followingData.userId, success: result.success })

      await new Promise((resolve) => setTimeout(resolve, 50))
    }

    return { success: true, message: `Thêm ${count} following random thành công!`, results }
  } catch (error) {
    console.error("Error adding random following:", error)
    return { success: false, message: "Lỗi khi thêm following random: " + error.message }
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
