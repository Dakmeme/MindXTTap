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
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js"
import { db } from "./firebase.js"


// ==================== POST FUNCTIONS ====================

// Tạo bài viết mới
// export const createPost = async (postData) => {
//   try {
//     const postsRef = collection(db, "posts")
//     const docRef = await addDoc(postsRef, {
//       title: postData.title,
//       content: postData.content,
//       author: postData.author || "Admin",
//       authorId: postData.authorId || "admin",
//       authorAvatar: postData.authorAvatar || "/placeholder.svg?height=40&width=40",
//       category: postData.category,
//       status: postData.status || "draft",
//       tags: postData.tags || [],
//       views: 0,
//       comments: 0,
//       likes: 0,
//       createdAt: serverTimestamp(),
//       updatedAt: serverTimestamp(),
//     })
//     return { success: true, message: "Tạo bài viết thành công!", id: docRef.id }
//   } catch (error) {
//     console.error("Lỗi khi tạo bài viết:", error)
//     return { success: false, message: "Lỗi khi tạo bài viết: " + error.message }
//   }
// }

// Lấy bài viết
export const getPosts = async () => {
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
    console.error("Lỗi khi lấy danh sách bài viết:", error)
    return []
  }
}
    console.log(postsList)

// ==================== STORY FUNCTIONS ====================
// export const getUserStory = async() =>{
//     try{
//         const UserStoryData = collection(db, "users", userId, "stories")

//         }}


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
    console.error("Lỗi khi thêm story:", error)
    return { success: false, message: "Lỗi khi thêm story: " + error.message }
  }
}


// Format thời gian hoạt động cuối
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

