import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js"
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-analytics.js"
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js"
import {
  getFirestore,
  addDoc,
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  orderBy,
  updateDoc,
  increment,
  deleteDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"
import * as bootstrap from "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"

const firebaseConfig = {
  apiKey: "AIzaSyCi2NKH7Dzf6sLZdvuCQW18hxbsF4cVYB0",
  authDomain: "ttmindx.firebaseapp.com",
  projectId: "ttmindx",
  storageBucket: "ttmindx.firebasestorage.app",
  messagingSenderId: "499689288083",
  appId: "1:499689288083:web:394be22db426aa48b93866",
  measurementId: "G-Y0NCNLB337",
}


const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)
const auth = getAuth(app)
const db = getFirestore(app)

const createFeedModal = document.getElementById("createFeedModal")
const postButton = document.getElementById("postButton")

// User State - Demo Mode
const currentUser = { displayName: "Demo User", email: "demo@example.com", uid: "demo-user-id" }

// Initialize UI
function initializeUI() {
  const username = document.getElementById("username")
  const useremail = document.getElementById("useremail")

  if (username) username.textContent = currentUser.displayName
  if (useremail) useremail.textContent = currentUser.email

  // Show loading spinner initially
  const loadingSpinner = document.getElementById("loading-spinner")
  if (loadingSpinner) {
    loadingSpinner.style.display = "flex"
    setTimeout(() => {
      loadingSpinner.style.display = "none"
    }, 1500)
  }
}

// Character counter for textarea
const contentTextarea = document.getElementById("content")
if (contentTextarea) {
  const charCount = document.getElementById("char-count")
  if (charCount) {
    contentTextarea.addEventListener("input", () => {
      const count = contentTextarea.value.length
      charCount.textContent = count

      if (count > 450) {
        charCount.style.color = "var(--error-color)"
      } else if (count > 350) {
        charCount.style.color = "var(--warning-color)"
      } else {
        charCount.style.color = "var(--p-color)"
      }
    })
  }
}

let feedContainer = document.getElementById("feed")
if (!feedContainer) {
  feedContainer = document.createElement("div")
  feedContainer.id = "feed"
  document.body.appendChild(feedContainer)
}
feedContainer.style.maxHeight = "80vh"
feedContainer.style.minHeight = "200px"
feedContainer.style.paddingRight = "8px"

function renderPost(data, prepend = false) {
  let dateStr = ""
  if (data.date) {
    const dateObj = new Date(data.date)
    dateStr = dateObj.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const likeCount = data.likeCount || 0
  const commentCount = data.commentCount || 0
  const shareCount = data.shareCount || 0
  const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]")
  const isLiked = likedPosts.includes(data.id)

  const menuHtml = `
    <div class="dropdown post-menu" style="margin-left:auto; position:relative;">
      <button class="btn btn-sm post-menu-btn" style="border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; background: var(--secondary-color); border: none;" data-bs-toggle="dropdown" aria-expanded="false" title="More options">
        <i class="bi bi-three-dots-vertical"></i>
      </button>
      <ul class="dropdown-menu dropdown-menu-end" style="border-radius:12px; min-width:120px; font-size:0.98em; background: var(--main-color); border: 1px solid var(--border-color);">
        <li>
          <button class="dropdown-item edit-post-btn" type="button" style="color:var(--headline-color);">
            <i class="bi bi-pencil me-2"></i>Edit
          </button>
        </li>
        <li>
          <button class="dropdown-item delete-post-btn" type="button" style="color:var(--error-color);">
            <i class="bi bi-trash me-2"></i>Delete
          </button>
        </li>
      </ul>
    </div>
  `

  let mediaHtml = ""
  if (data.image) {
    mediaHtml += `<div class="mb-3 media-btn-image"><img src="${data.image}" alt="Post image" style="max-width:100%; max-height:300px; border-radius:16px; display:block; margin:auto; box-shadow: var(--shadow-softer);" loading="lazy"></div>`
  }
  if (data.video) {
    mediaHtml += `<div class="mb-3 media-btn-video"><video src="${data.video}" controls style="max-width:100%; max-height:300px; border-radius:16px; display:block; margin:auto; box-shadow: var(--shadow-softer);"></video></div>`
  }
  if (data.file) {
    mediaHtml += `<div class="mb-3 media-btn-file" style="background-color: var(--secondary-color); color: var(--main-color); border-color: var(--border-color); border-radius: 16px; padding: 1.5rem; display: flex; align-items: center; gap: 12px; min-height:70px;">
      <i class="bi bi-paperclip me-1" style="font-size:1.8rem; color:var(--b-color);"></i>
      <a href="${data.file}" target="_blank" style="color: var(--b-color); word-break:break-all; text-decoration: underline; font-weight: 500;">${data.fileName || "Download file"}</a>
    </div>`
  }

  const feed = document.createElement("div")
  feed.className = "feed"
  feed.innerHTML = `
    <div class="card-body mb-4 post-card" data-post-id="${data.id || ""}">
      <div class="d-flex align-items-center mb-3">
        <div class="profile-img-small me-3">
          <i class="bi bi-person-fill"></i>
        </div>
        <div class="flex-grow-1">
          <h6 class="mb-0 post-author">${data.user ? data.user : "Unknown User"}</h6>
          <div class="post-time">${dateStr}</div>
        </div>
        ${menuHtml}
      </div>
      <div class="mb-3 post-content">${data.content ? data.content : ""}</div>
      ${mediaHtml}
      <div class="post-actions">
        <div class="action-buttons">
          <button class="btn action-btn like-btn"
            data-liked="${isLiked ? "1" : "0"}"
            title="Like"
          >
            <i class="bi bi-heart${isLiked ? "-fill" : ""}"></i>
            <span class="like-count">${likeCount}</span>
          </button>
          <button class="btn action-btn comment-btn open-comment-popup"
            title="Comment"
          >
            <i class="bi bi-chat-dots"></i>
            <span class="comment-count">${commentCount}</span>
          </button>
          <button class="btn action-btn share-btn"
            title="Share"
          >
            <i class="bi bi-share"></i>
            <span class="share-count">${shareCount}</span>
          </button>
        </div>
        
        <div class="comment-input-section">
          <div class="profile-img-tiny">
            <i class="bi bi-person-fill"></i>
          </div>
          <div class="comment-input-wrapper">
            <input type="text" class="form-control comment-input" placeholder="Write a comment..." />
          </div>
          <button class="btn comment-send-btn">
            <i class="bi bi-send"></i>
          </button>
        </div>
      </div>
    </div>
  `

  if (prepend && feedContainer.firstChild) {
    feedContainer.insertBefore(feed, feedContainer.firstChild)
  } else {
    feedContainer.appendChild(feed)
  }
}

function updatePostCounts(postId, { likeCount, commentCount, shareCount, isLiked }) {
  const postEl = document.querySelector(`.card-body[data-post-id="${postId}"]`)
  if (!postEl) return

  if (typeof likeCount === "number") {
    const likeCountEl = postEl.querySelector(".like-count")
    if (likeCountEl) likeCountEl.textContent = likeCount
    const likeBtn = postEl.querySelector(".like-btn")
    if (likeBtn) {
      likeBtn.setAttribute("data-liked", isLiked ? "1" : "0")
      const icon = likeBtn.querySelector("i")
      if (icon) {
        icon.className = "bi bi-heart" + (isLiked ? "-fill" : "")
      }
    }
  }
  if (typeof commentCount === "number") {
    const commentCountEl = postEl.querySelector(".comment-count")
    if (commentCountEl) commentCountEl.textContent = commentCount
  }
  if (typeof shareCount === "number") {
    const shareCountEl = postEl.querySelector(".share-count")
    if (shareCountEl) shareCountEl.textContent = shareCount
  }
}

async function loadAllPosts() {
  const samplePost = document.querySelector(".sample-post")
  if (samplePost) samplePost.remove()

  feedContainer.innerHTML = ""
  const querySnapshot = await getDocs(collection(db, "posts"))
  for (const docSnap of querySnapshot.docs) {
    const data = docSnap.data()
    data.id = docSnap.id
    data.likeCount = typeof data.likeCount === "number" ? data.likeCount : 0
    data.shareCount = typeof data.shareCount === "number" ? data.shareCount : 0
    const commentsCol = collection(db, "posts", data.id, "comments")
    const commentsSnap = await getDocs(commentsCol)
    data.commentCount = commentsSnap.size
    renderPost(data)
  }
}

function requireAuthAction(e, actionName = "this action") {
  if (!currentUser || !currentUser.uid) {
    showNotification(`Please sign in to perform ${actionName}.`, "warning", 2000)
    return false
  }
  return true
}

// Post creation
if (postButton) {
  postButton.addEventListener("click", async (e) => {
    e.preventDefault()

    if (!requireAuthAction(e, "creating a post")) return

    const contentInput = document.getElementById("content")
    const imageInput = document.getElementById("image")
    const videoInput = document.getElementById("video")
    const fileInput = document.getElementById("file")

    let imageUrl = ""
    let videoUrl = ""
    let fileUrl = ""
    let fileName = ""

    if (!contentInput) {
      console.error("Content input not found")
      return
    }

    const contentValue = contentInput.value.trim()
    if (!contentValue) {
      showNotification("Post content cannot be empty.", "warning", 1500)
      return
    }

    if (contentValue.length > 500) {
      showNotification("Post content is too long. Maximum 500 characters.", "warning", 2000)
      return
    }

    if (imageInput && imageInput.value.trim()) {
      imageUrl = imageInput.value.trim()
    }
    if (videoInput && videoInput.value.trim()) {
      videoUrl = videoInput.value.trim()
    }
    if (fileInput && fileInput.value.trim()) {
      fileUrl = fileInput.value.trim()
      fileName = fileInput.getAttribute("data-filename") || ""
    }

    const userName = currentUser.displayName || currentUser.email || "User"

    try {
      const docRef = await addDoc(collection(db, "posts"), {
        user: userName,
        content: contentValue,
        date: new Date().toISOString(),
        likeCount: 0,
        shareCount: 0,
        ...(imageUrl && { image: imageUrl }),
        ...(videoUrl && { video: videoUrl }),
        ...(fileUrl && { file: fileUrl, fileName: fileName }),
      })

      renderPost(
        {
          user: userName,
          content: contentValue,
          date: new Date().toISOString(),
          id: docRef.id,
          likeCount: 0,
          commentCount: 0,
          shareCount: 0,
          ...(imageUrl && { image: imageUrl }),
          ...(videoUrl && { video: videoUrl }),
          ...(fileUrl && { file: fileUrl, fileName: fileName }),
        },
        true,
      )

      // Clear inputs
      contentInput.value = ""
      if (imageInput) imageInput.value = ""
      if (videoInput) videoInput.value = ""
      if (fileInput) {
        fileInput.value = ""
        fileInput.removeAttribute("data-filename")
      }

      // Reset character counter
      const charCount = document.getElementById("char-count")
      if (charCount) {
        charCount.textContent = "0"
        charCount.style.color = "var(--p-color)"
      }

      // Close modal
      const modalEl = document.getElementById("createFeedModal")
      if (modalEl) {
        let modal
        try {
          modal = bootstrap.Modal.getOrCreateInstance(modalEl)
        } catch (err) {
          modal = null
        }
        if (modal && typeof modal.hide === "function") {
          modal.hide()
        } else {
          modalEl.classList.remove("show")
          modalEl.style.display = "none"
          document.body.classList.remove("modal-open")
          const backdrop = document.querySelector(".modal-backdrop")
          if (backdrop) backdrop.remove()
        }
      }

      window.scrollTo(0, document.body.scrollHeight)
      showNotification("Post created successfully!", "success", 1500)
    } catch (e) {
      console.error("Error adding document: ", e)
      showNotification("Failed to create post.", "error", 2000)
    }
  })
}

// Event delegation for post interactions
document.addEventListener("click", async (e) => {
  // Like button
  const likeBtn = e.target.closest(".like-btn")
  if (likeBtn) {
    if (!requireAuthAction(e, "liking a post")) return

    const postCard = likeBtn.closest(".card-body")
    if (!postCard) return
    const postId = postCard.getAttribute("data-post-id")
    if (!postId) return

    const user = currentUser
    const likeDocRef = doc(db, "posts", postId, "likes", user.uid)
    let likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]")
    const isLiked = likedPosts.includes(postId)

    try {
      if (!isLiked) {
        await setDoc(likeDocRef, {
          userId: user.uid,
          likedAt: new Date().toISOString(),
        })
        await updateDoc(doc(db, "posts", postId), { likeCount: increment(1) })
        likedPosts.push(postId)
        localStorage.setItem("likedPosts", JSON.stringify(likedPosts))
        const postDoc = await getDoc(doc(db, "posts", postId))
        const likeCount = postDoc.data().likeCount || 1
        updatePostCounts(postId, { likeCount, isLiked: true })
        showNotification("You liked this post!", "success", 1200)
      } else {
        await deleteDoc(likeDocRef)
        await updateDoc(doc(db, "posts", postId), { likeCount: increment(-1) })
        likedPosts = likedPosts.filter((id) => id !== postId)
        localStorage.setItem("likedPosts", JSON.stringify(likedPosts))
        const postDoc = await getDoc(doc(db, "posts", postId))
        const likeCount = postDoc.data().likeCount || 0
        updatePostCounts(postId, { likeCount, isLiked: false })
        showNotification("You unliked this post.", "info", 1200)
      }
    } catch (err) {
      showNotification("Failed to update like.", "error")
    }
    return
  }

  // Share button
  const shareBtn = e.target.closest(".share-btn")
  if (shareBtn) {
    if (!requireAuthAction(e, "sharing a post")) return

    const postCard = shareBtn.closest(".card-body")
    if (!postCard) return
    const postId = postCard.getAttribute("data-post-id")
    if (!postId) return

    const user = currentUser
    const shareDocRef = doc(db, "posts", postId, "shares", user.uid)
    const sharedPosts = JSON.parse(localStorage.getItem("sharedPosts") || "[]")
    if (sharedPosts.includes(postId)) {
      showNotification("You already shared this post.", "info", 1500)
      return
    }
    try {
      await setDoc(shareDocRef, {
        userId: user.uid,
        sharedAt: new Date().toISOString(),
      })
      await updateDoc(doc(db, "posts", postId), { shareCount: increment(1) })
      sharedPosts.push(postId)
      localStorage.setItem("sharedPosts", JSON.stringify(sharedPosts))
      const postDoc = await getDoc(doc(db, "posts", postId))
      const shareCount = postDoc.data().shareCount || 1
      updatePostCounts(postId, { shareCount })
      showNotification("Post shared!", "success", 1200)
    } catch (err) {
      showNotification("Failed to share post.", "error")
    }
    return
  }

  // Edit button
  const editBtn = e.target.closest(".edit-post-btn")
  if (editBtn) {
    if (!requireAuthAction(e, "editing a post")) return

    const postCard = editBtn.closest(".card-body")
    if (!postCard) return
    const postId = postCard.getAttribute("data-post-id")
    if (!postId) return
    const contentDiv = postCard.querySelector(".post-content")
    if (!contentDiv) return

    const postDoc = await getDoc(doc(db, "posts", postId))
    if (!postDoc.exists() || postDoc.data().user !== currentUser.displayName) {
      showNotification("You can only edit your own posts.", "error", 2000)
      return
    }

    if (contentDiv.querySelector("textarea")) return
    const oldContent = contentDiv.textContent
    contentDiv.innerHTML = `
      <textarea class="form-control edit-post-textarea enhanced-textarea" style="width:100%; min-height:80px; margin-bottom:12px;">${oldContent.replace(/"/g, "&quot;")}</textarea>
      <div>
        <button class="btn btn-sm btn-primary save-edit-post-btn" style="border-radius:20px; margin-right:8px;">
          <i class="bi bi-check-circle me-1"></i>Save
        </button>
        <button class="btn btn-sm btn-secondary cancel-edit-post-btn" style="border-radius:20px;">
          <i class="bi bi-x-circle me-1"></i>Cancel
        </button>
      </div>
    `
    const textarea = contentDiv.querySelector("textarea")
    if (textarea) textarea.focus()
    return
  }

  // Save edit button
  const saveEditBtn = e.target.closest(".save-edit-post-btn")
  if (saveEditBtn) {
    if (!requireAuthAction(e, "saving post edits")) return

    const postCard = saveEditBtn.closest(".card-body")
    if (!postCard) return
    const postId = postCard.getAttribute("data-post-id")
    if (!postId) return
    const contentDiv = postCard.querySelector(".post-content")
    const textarea = contentDiv.querySelector("textarea")
    if (!textarea) return
    const newContent = textarea.value.trim()
    if (!newContent) {
      showNotification("Post content cannot be empty.", "warning", 1500)
      return
    }
    if (newContent.length > 500) {
      showNotification("Post content is too long. Maximum 500 characters.", "warning", 2000)
      return
    }
    updateDoc(doc(db, "posts", postId), { content: newContent })
      .then(() => {
        contentDiv.innerHTML = newContent
        showNotification("Post updated!", "success", 1200)
      })
      .catch(() => {
        showNotification("Failed to update post.", "error")
      })
    return
  }

  // Cancel edit button
  const cancelEditBtn = e.target.closest(".cancel-edit-post-btn")
  if (cancelEditBtn) {
    const postCard = cancelEditBtn.closest(".card-body")
    if (!postCard) return
    const postId = postCard.getAttribute("data-post-id")
    if (!postId) return
    getDoc(doc(db, "posts", postId)).then((postDoc) => {
      const contentDiv = postCard.querySelector(".post-content")
      if (contentDiv) {
        contentDiv.innerHTML = postDoc.exists() ? postDoc.data().content || "" : ""
      }
    })
    return
  }

  // Delete button
  const deleteBtn = e.target.closest(".delete-post-btn")
  if (deleteBtn) {
    if (!requireAuthAction(e, "deleting a post")) return

    const postCard = deleteBtn.closest(".card-body")
    if (!postCard) return
    const postId = postCard.getAttribute("data-post-id")
    if (!postId) return

    const postDoc = await getDoc(doc(db, "posts", postId))
    if (!postDoc.exists() || postDoc.data().user !== currentUser.displayName) {
      showNotification("You can only delete your own posts.", "error", 2000)
      return
    }

    if (!confirm("Are you sure you want to delete this post? This cannot be undone.")) return
    deleteDoc(doc(db, "posts", postId))
      .then(() => {
        const feedPost = postCard.closest(".feed")
        if (feedPost) feedPost.remove()
        else postCard.remove()
        showNotification("Post deleted.", "success", 1200)
      })
      .catch(() => {
        showNotification("Failed to delete post.", "error")
      })
    return
  }
})

// Comment Popup Logic
let commentPopup = null
function createCommentPopup() {
  if (commentPopup) return commentPopup
  commentPopup = document.createElement("div")
  commentPopup.id = "commentPopup"
  commentPopup.className = "comment-popup-overlay"

  function getPopupWidth() {
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
    if (vw >= 1200) return "900px"
    if (vw >= 900) return "700px"
    if (vw >= 600) return "90vw"
    return "98vw"
  }

  commentPopup.innerHTML = `
    <div class="comment-popup-content" style="width: ${getPopupWidth()};">
      <button class="close-comment-popup">&times;</button>
      <div class="comment-popup-post"></div>
      <div class="comment-popup-comments"></div>
      <div class="comment-popup-input">
        <input type="text" class="form-control" placeholder="Write a comment...">
        <button class="btn btn-primary send-comment-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M15.854.146a.5.5 0 0 0-.527-.116l-15 6a.5.5 0 0 0 .019.938l6.57 2.19 2.19 6.57a.5.5 0 0 0 .938.019l6-15a.5.5 0 0 0-.116-.527zm-2.89 2.89-4.482 4.482-5.197-1.733 9.679-3.749zm-4.13 5.744 4.482-4.482-3.749 9.679-1.733-5.197z"/>
          </svg>
        </button>
      </div>
    </div>
  `
  document.body.appendChild(commentPopup)

  function resizePopup() {
    const popupContent = commentPopup.querySelector(".comment-popup-content")
    if (popupContent) {
      popupContent.style.width = getPopupWidth()
      popupContent.style.maxWidth = "98vw"
    }
  }
  window.addEventListener("resize", resizePopup)

  return commentPopup
}

function renderPopupPost(postData) {
  const postDiv = commentPopup.querySelector(".comment-popup-post")
  let dateStr = ""
  if (postData.date) {
    const dateObj = new Date(postData.date)
    dateStr = dateObj.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  let mediaHtml = ""
  if (postData.image) {
    mediaHtml = `<div class="mb-2"><img src="${postData.image}" alt="Post image" class="popup-media-image" loading="lazy"></div>`
  } else if (postData.video) {
    mediaHtml = `<div class="mb-2"><video src="${postData.video}" controls class="popup-media-video"></video></div>`
  } else if (postData.file) {
    mediaHtml = `<div class="mb-2 file-attachment">
      <i class="bi bi-paperclip"></i>
      <a href="${postData.file}" target="_blank">${postData.fileName || "Download file"}</a>
    </div>`
  }

  postDiv.innerHTML = `
    <div class="d-flex align-items-center mb-2">
      <div class="profile-img-small me-3">
        <i class="bi bi-person-fill"></i>
      </div>
      <div>
        <h6 class="mb-0" style="color: var(--headline-color);">${postData.user ? postData.user : "Unknown User"}</h6>
        <div class="text-muted small" style="color: var(--p-color);">${dateStr}</div>
      </div>
    </div>
    <div class="mb-2" style="color: var(--p-color);">${postData.content ? postData.content : ""}</div>
    ${mediaHtml}
  `
}

async function renderPopupComments(postId) {
  const commentsDiv = commentPopup.querySelector(".comment-popup-comments")
  commentsDiv.innerHTML = '<div class="loading-message">Loading comments...</div>'
  try {
    const commentsCol = collection(db, "posts", postId, "comments")
    const q = query(commentsCol, orderBy("date", "asc"))
    const snapshot = await getDocs(q)
    if (snapshot.empty) {
      commentsDiv.innerHTML = '<div class="no-comments-message">No comments yet.</div>'
      updatePostCounts(postId, { commentCount: 0 })
      return
    }
    commentsDiv.innerHTML = ""
    let count = 0
    snapshot.forEach((docSnap) => {
      count++
      const c = docSnap.data()
      let dateStr = ""
      if (c.date) {
        const dateObj = new Date(c.date)
        dateStr = dateObj.toLocaleString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      }
      const commentEl = document.createElement("div")
      commentEl.className = "comment mb-2"
      commentEl.innerHTML = `
        <div class="d-flex align-items-center">
          <div class="profile-img-tiny me-2">
            <i class="bi bi-person-fill"></i>
          </div>
          <div>
            <div>${c.user || "Anonymous"}</div>
            <div>${c.content}</div>
            <div>${dateStr}</div>
          </div>
        </div>
      `
      commentsDiv.appendChild(commentEl)
    })
    updatePostCounts(postId, { commentCount: count })
    commentsDiv.scrollTop = commentsDiv.scrollHeight
  } catch (err) {
    commentsDiv.innerHTML = '<div class="error-message">Failed to load comments.</div>'
  }
}

async function showCommentPopup(postData) {
  createCommentPopup()

  function getPopupWidth() {
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
    if (vw >= 1200) return "900px"
    if (vw >= 900) return "700px"
    if (vw >= 600) return "90vw"
    return "98vw"
  }
  const popupContent = commentPopup.querySelector(".comment-popup-content")
  if (popupContent) {
    popupContent.style.width = getPopupWidth()
    popupContent.style.maxWidth = "98vw"
  }

  renderPopupPost(postData)
  commentPopup.style.display = "flex"
  commentPopup.dataset.postId = postData.id
  await renderPopupComments(postData.id)

  setTimeout(() => {
    const input = commentPopup.querySelector('input[type="text"]')
    if (input) input.focus()
  }, 100)
}

function hideCommentPopup() {
  if (commentPopup) {
    commentPopup.style.display = "none"
    commentPopup.dataset.postId = ""
    commentPopup.querySelector(".comment-popup-comments").innerHTML = ""
    commentPopup.querySelector('input[type="text"]').value = ""
  }
}

// Comment popup event listeners
document.addEventListener("click", async (e) => {
  const commentBtn = e.target.closest(".open-comment-popup")
  if (commentBtn) {
    const postCard = commentBtn.closest(".card-body")
    if (postCard) {
      const postId = postCard.getAttribute("data-post-id")
      if (!postId) return
      const postDoc = await getDoc(doc(db, "posts", postId))
      if (!postDoc.exists()) return
      const postData = postDoc.data()
      postData.id = postId
      showCommentPopup(postData)
    }
  }
  if (e.target.classList.contains("close-comment-popup")) {
    hideCommentPopup()
  }
  if (commentPopup && e.target === commentPopup) {
    hideCommentPopup()
  }
})

// Comment submission
if (!window._commentPopupListenerAdded) {
  window._commentPopupListenerAdded = true
  document.addEventListener("click", async (e) => {
    if (!commentPopup || commentPopup.style.display !== "flex") return
    if (e.target.closest(".send-comment-btn")) {
      if (!requireAuthAction(e, "adding a comment")) return

      const postId = commentPopup.dataset.postId
      const input = commentPopup.querySelector('input[type="text"]')
      const commentText = input ? input.value.trim() : ""
      if (!postId || !commentText) return
      const userName = currentUser.displayName || currentUser.email || "User"
      try {
        await addDoc(collection(db, "posts", postId, "comments"), {
          user: userName,
          content: commentText,
          date: new Date().toISOString(),
        })
        input.value = ""
        await renderPopupComments(postId)
        showNotification("Comment added!", "success", 1200)
      } catch (err) {
        showNotification("Failed to add comment.", "error", 2000)
      }
    }
  })

  document.addEventListener("keydown", async (e) => {
    if (!commentPopup || commentPopup.style.display !== "flex") return
    if (e.key === "Enter" && !e.shiftKey) {
      const input = commentPopup.querySelector('input[type="text"]')
      if (document.activeElement === input) {
        if (!requireAuthAction(e, "adding a comment")) return

        e.preventDefault()
        const postId = commentPopup.dataset.postId
        const commentText = input ? input.value.trim() : ""
        if (!postId || !commentText) return
        const userName = currentUser.displayName || currentUser.email || "User"
        try {
          await addDoc(collection(db, "posts", postId, "comments"), {
            user: userName,
            content: commentText,
            date: new Date().toISOString(),
          })
          input.value = ""
          await renderPopupComments(postId)
          showNotification("Comment added!", "success", 1200)
        } catch (err) {
          showNotification("Failed to add comment.", "error", 2000)
        }
      }
    }
    if (e.key === "Escape" && commentPopup && commentPopup.style.display === "flex") {
      hideCommentPopup()
    }
  })
}

// Notification System
function showNotification(message, type = "info", duration = 3000) {
  const existing = document.getElementById("custom-notification");
  if (existing) existing.remove();
  const notif = document.createElement("div");
  notif.id = "custom-notification";
  notif.textContent = message;
  notif.className = "custom-notification-base";
  // Center and fix notification at top, with fade
  notif.style.position = "fixed";
  notif.style.left = "50%";
  notif.style.top = "32px";
  notif.style.transform = "translateX(-50%)";
  notif.style.zIndex = "9999";
  notif.style.textAlign = "center";
  notif.style.opacity = "0";
  notif.style.transition = "opacity 0.35s cubic-bezier(.4,0,.2,1)";
  notif.style.pointerEvents = "none";
  notif.style.boxShadow = "0 4px 16px rgba(0,0,0,0.18)";
  notif.style.padding = "1rem 2rem";
  notif.style.borderRadius = "12px";
  notif.style.fontSize = "1.1rem";
  notif.style.fontWeight = "500";
  notif.style.letterSpacing = "0.01em";
  notif.style.background = "var(--card-bg, #282828)";
  notif.style.color = "var(--headline-color, #fff)";
  notif.style.border = "1px solid var(--card-border, rgba(255,255,255,0.1))";
  notif.style.maxWidth = "90vw";
  notif.style.width = "auto";
  notif.style.minWidth = "40rem";
  notif.style.boxSizing = "border-box";
  notif.style.pointerEvents = "auto";
  // Responsive max width
  const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  notif.style.maxWidth = vw >= 600 ? "600px" : "90vw";
  // Type-based color
  if (type === "success") {
    notif.style.background = "var(--success-color, #2CB67D)";
    notif.style.color = "#fff";
    notif.style.border = "none";
  } else if (type === "error") {
    notif.style.background = "var(--error-color, #D90429)";
    notif.style.color = "#fff";
    notif.style.border = "none";
  } else if (type === "warning") {
    notif.style.background = "var(--warning-color, #FFBE0B)";
    notif.style.color = "var(--warning-text-color, #222)";
    notif.style.border = "none";
  } else {
    notif.style.background = "var(--b-color, #7F5AF0)";
    notif.style.color = "var(--b-text-color, #fff)";
    notif.style.border = "none";
  }
  document.body.appendChild(notif);
  setTimeout(() => {
    notif.style.opacity = "1";
  }, 10);
  // Fade out
  setTimeout(() => {
    notif.style.opacity = "0";
    setTimeout(() => {
      notif.remove();
    }, 350);
  }, duration);
}
// Notification Popup System (modal fade)
let notificationList = [];
// Use id="notif" for the notification button
let notifBtn = document.getElementById("notif");
if (!notifBtn) {
  notifBtn = document.createElement("button");
  notifBtn.id = "notif";
  notifBtn.innerHTML = '<i class="bi bi-bell"></i>';
  notifBtn.className = "notification-btn-base";
  notifBtn.style.position = "fixed";
  notifBtn.style.top = "32px";
  notifBtn.style.right = "32px";
  notifBtn.style.zIndex = "10000";
  notifBtn.style.background = "var(--card-bg, #282828)";
  notifBtn.style.color = "var(--headline-color, #fff)";
  notifBtn.style.border = "none";
  notifBtn.style.borderRadius = "50%";
  notifBtn.style.width = "44px";
  notifBtn.style.height = "44px";
  notifBtn.style.display = "flex";
  notifBtn.style.alignItems = "center";
  notifBtn.style.justifyContent = "center";
  notifBtn.style.boxShadow = "0 2px 8px rgba(0,0,0,0.18)";
  notifBtn.style.cursor = "pointer";
  document.body.appendChild(notifBtn);
}
let notifModalOverlay = document.getElementById("notification-modal-overlay");
let notifPopup = document.getElementById("notification-popup");
if (!notifModalOverlay) {
  notifModalOverlay = document.createElement("div");
  notifModalOverlay.id = "notification-modal-overlay";
  notifModalOverlay.style.position = "fixed";
  notifModalOverlay.style.top = "0";
  notifModalOverlay.style.left = "0";
  notifModalOverlay.style.width = "100vw";
  notifModalOverlay.style.height = "100vh";
  notifModalOverlay.style.background = "rgba(0,0,0,0.32)";
  notifModalOverlay.style.zIndex = "10000";
  notifModalOverlay.style.display = "none";
  notifModalOverlay.style.opacity = "0";
  notifModalOverlay.style.transition = "opacity 0.35s cubic-bezier(.4,0,.2,1)";
  document.body.appendChild(notifModalOverlay);
}
if (!notifPopup) {
  notifPopup = document.createElement("div");
  notifPopup.id = "notification-popup";
  notifPopup.className = "notification-popup-base";
  notifPopup.innerHTML = `
    <div class="notification-header" style="display:flex;align-items:center;justify-content:space-between;padding:0.7rem 1.2rem 0.7rem 1.2rem;font-weight:600;font-size:1.1rem;border-bottom:1px solid var(--card-border,rgba(255,255,255,0.1));">
      <span>Notifications</span>
      <button id="close-notif-popup" style="background:none;border:none;font-size:1.5rem;line-height:1;color:var(--headline-color,#fff);cursor:pointer;">&times;</button>
    </div>
    <div id="notification-list" style="max-height:320px;overflow-y:auto;padding:0.7rem 1.2rem;"></div>
  `;
  notifPopup.style.position = "fixed";
  notifPopup.style.left = "50%";
  notifPopup.style.top = "50%";
  notifPopup.style.transform = "translate(-50%, -50%)";
  notifPopup.style.zIndex = "10001";
  notifPopup.style.background = "var(--card-bg, #282828)";
  notifPopup.style.color = "var(--headline-color, #fff)";
  notifPopup.style.border = "1px solid var(--card-border, rgba(255,255,255,0.1))";
  notifPopup.style.borderRadius = "16px";
  notifPopup.style.boxShadow = "0 8px 32px rgba(0,0,0,0.25)";
  notifPopup.style.display = "none";
  notifPopup.style.minWidth = "40rem";
  notifPopup.style.maxWidth = "98vw";
  notifPopup.style.width = "min(400px, 98vw)";
  notifPopup.style.boxSizing = "border-box";
  notifPopup.style.padding = "0";
  notifPopup.style.opacity = "0";
  notifPopup.style.transition = "opacity 0.35s cubic-bezier(.4,0,.2,1)";
  document.body.appendChild(notifPopup);
  function resizeNotifPopup() {
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    notifPopup.style.width = vw >= 600 ? "min(400px, 98vw)" : "98vw";
    notifPopup.style.maxWidth = "98vw";
  }
  window.addEventListener("resize", resizeNotifPopup);
}
function renderNotificationPopup() {
  const notifListDiv = notifPopup.querySelector("#notification-list");
  notifListDiv.innerHTML = "";
  if (notificationList.length === 0) {
    notifListDiv.innerHTML = '<div class="no-notifications-message" style="text-align:center;color:var(--p-color,#94A1B2);padding:1.5rem 0;">No notifications.</div>';
    return;
  }
  notificationList.slice(0, 10).forEach((notif, idx) => {
    const notifItem = document.createElement("div");
    notifItem.className = `notification-item ${notif.type}`;
    notifItem.textContent = notif.message;
    notifItem.style.margin = "0.5rem 0";
    notifItem.style.padding = "1rem 1rem";
    notifItem.style.borderRadius = "8px";
    notifItem.style.background = "rgba(127,90,240,0.08)";
    notifItem.style.color = "var(--headline-color,#fff)";
    notifItem.style.fontSize = "1rem";
    notifItem.style.wordBreak = "break-word";
    if (notif.type === "success") {
      notifItem.style.background = "rgba(44,182,125,0.13)";
      notifItem.style.color = "#2CB67D";
    } else if (notif.type === "error") {
      notifItem.style.background = "rgba(217,4,41,0.13)";
      notifItem.style.color = "#D90429";
    } else if (notif.type === "warning") {
      notifItem.style.background = "rgba(255,190,11,0.13)";
      notifItem.style.color = "#FFBE0B";
    } else {
      notifItem.style.background = "rgba(127,90,240,0.08)";
      notifItem.style.color = "var(--headline-color,#fff)";
    }
    notifListDiv.appendChild(notifItem);
  });
}
const _originalShowNotification = showNotification;
showNotification = (message, type = "info", duration = 3000) => {
  notificationList.unshift({ message, type, date: new Date() });
  if (notificationList.length > 10) notificationList = notificationList.slice(0, 10);
  renderNotificationPopup();
  _originalShowNotification(message, type, duration);
};
function openNotifModal() {
  renderNotificationPopup();
  notifModalOverlay.style.display = "block";
  notifPopup.style.display = "block";
  // Fade in
  setTimeout(() => {
    notifModalOverlay.style.opacity = "1";
    notifPopup.style.opacity = "1";
  }, 10);
}
function closeNotifModal() {
  notifModalOverlay.style.opacity = "0";
  notifPopup.style.opacity = "0";
  setTimeout(() => {
    notifModalOverlay.style.display = "none";
    notifPopup.style.display = "none";
  }, 350);
}
notifBtn.addEventListener("click", () => {
  if (notifModalOverlay.style.display === "none" || notifModalOverlay.style.display === "") {
    openNotifModal();
  } else {
    closeNotifModal();
  }
});
notifPopup.addEventListener("click", (e) => {
  if (e.target && e.target.id === "close-notif-popup") {
    closeNotifModal();
  }
});
notifModalOverlay.addEventListener("mousedown", (e) => {
  // Only close if click is outside the popup
  if (!notifPopup.contains(e.target)) {
    closeNotifModal();
  }
});
document.addEventListener("keydown", (e) => {
  if (notifModalOverlay.style.display === "block" && e.key === "Escape") {
    closeNotifModal();
  }
});
// Scroll to top button
let scrollTopBtn = document.getElementById("feed-scroll-top-btn")
if (!scrollTopBtn) {
  scrollTopBtn = document.createElement("button")
  scrollTopBtn.id = "feed-scroll-top-btn"
  scrollTopBtn.innerHTML = '<i class="bi bi-arrow-up"></i>'
  scrollTopBtn.className = "scroll-top-btn-base"
  document.body.appendChild(scrollTopBtn)

  scrollTopBtn.addEventListener("click", () => {
    if (feedContainer) feedContainer.scrollTo({ top: 0, behavior: "smooth" })
  })
}

feedContainer.addEventListener("scroll", () => {
  if (feedContainer.scrollTop > 200) {
    scrollTopBtn.style.display = "block"
  } else {
    scrollTopBtn.style.display = "none"
  }
})


document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", () => {
    const id = item.id;
    switch(id) {
      case "feed-nav":
        console.log("Navigating to Feed...");
        window.location.href = 'main.html';
        break;
      case "friends-nav":
        console.log("Navigating to Friends page...");
        window.location.href = 'friends.html';
        break;
      case "messages-nav":
        console.log("Opening Messages...");
        window.location.href = 'messages.html';
        break;
      case "notif":
        console.log("Opening Notifications...");
        // window.location.href = 'notifications.html';
        break;
      case "settings":
        console.log("Opening Settings...");
        // window.location.href = 'settings.html';
        alert("Would open Settings");
        break;
      default:
        console.log(`Clicked on: ${id}`);
        break;
    }
  });
});
document.getElementById('profile').addEventListener('click', () => {
  window.location.href = 'profile.html';
});
// Initialize the application

initializeUI()
loadAllPosts()


