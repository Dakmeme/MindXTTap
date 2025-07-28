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
