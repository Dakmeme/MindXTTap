import { getUserInfo, getUserPosts, getAllPosts, getUserRelations,updateUser, getUserMedia, loadPosts} from "./firebase-config.js"
import {getCurrentUser, initAuth} from "./authState.js"
await initAuth()
const userId =  getCurrentUser()
await updateUser(userId)

const UserData = await getUserInfo(userId)
const PostData = await getAllPosts()
console.log("User Data:", UserData)
console.log("Post Data:", PostData)

let feedContainer = document.getElementById("feed")
if (!feedContainer) {
  feedContainer = document.createElement("div")
  feedContainer.id = "feed"
  document.body.appendChild(feedContainer)
}

feedContainer.style.maxHeight = "80vh"
feedContainer.style.minHeight = "200px"

// function renderPost(data, prepend = false) {
//   if (Array.isArray(data)) {
//     data.forEach(item => renderPost(item, prepend));
//     return;
//   }
//   let dateStr = "";
//   if (data.date) {
//     const dateObj = new Date(data.date);
//     dateStr = dateObj.toLocaleString(undefined, {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   }
//   const likeCount = data.likeCounter || 0;
//   const commentCount = data.commentCounter || 0;
//   const shareCount = data.shareCounter || 0;
//   const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]");
//   const isLiked = likedPosts.includes(data.id);

// const menuHtml = `
//     <div class="dropdown post-menu" style="margin-left:auto; position:relative;">
//       <button class="btn btn-sm post-menu-btn" style="border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; background: var(--secondary-color); border: none;" data-bs-toggle="dropdown" aria-expanded="false" title="More options">
//         <i class="bi bi-three-dots-vertical"></i>
//       </button>
//       <ul class="dropdown-menu dropdown-menu-end" style="border-radius:12px; min-width:120px; font-size:0.98em; background: var(--main-color); border: 1px solid var(--border-color);">
//         <li>
//           <button class="dropdown-item edit-post-btn" type="button" style="color:var(--headline-color);">
//             <i class="bi bi-pencil me-2"></i>Edit
//           </button>
//         </li>
//         <li>
//           <button class="dropdown-item delete-post-btn" type="button" style="color:var(--error-color);">
//             <i class="bi bi-trash me-2"></i>Delete
//           </button>
//         </li>
//       </ul>
//     </div>
//   `

//   let mediaHtmlParts = [];

// if (data.postImg) {
//   mediaHtmlParts.push(`
//     <div class="mb-3 media-btn-image">
//       <img src="${(data.postImg)}" alt="Post image"
//         style="max-width:100%; max-height:300px; border-radius:16px; display:block; margin:auto; box-shadow: var(--shadow-softer);"
//         loading="lazy">
//     </div>`);
// }

// if (data.video) {
//   mediaHtmlParts.push(`
//     <div class="mb-3 media-btn-video">
//       <video src="${(data.video)}" controls
//         style="max-width:100%; max-height:300px; border-radius:16px; display:block; margin:auto; box-shadow: var(--shadow-softer);">
//       </video>
//     </div>`);
// }

// if (data.file) {
//   mediaHtmlParts.push(`
//     <div class="mb-3 media-btn-file" style="background-color: var(--secondary-color); color: var(--main-color); border: 1px solid var(--border-color); border-radius: 16px; padding: 1.5rem; display: flex; align-items: center; gap: 12px; min-height:70px;">
//       <i class="bi bi-paperclip me-1" style="font-size:1.8rem; color:var(--b-color);"></i>
//       <a href="${(data.file)}" target="_blank" style="color: var(--b-color); word-break:break-all; text-decoration: underline; font-weight: 500;">
//         ${(data.fileName || "Download file")}
//       </a>
//     </div>`);
// }

// const mediaHtml = mediaHtmlParts.join("");
//   console.log("Media HTML:", mediaHtml)
//   const feed = document.createElement("div")
//   feed.className = "feed"
//   feed.innerHTML = `
//     <div class="card-body mb-4 post-card" data-post-id="${data.id || ""}">
//       <div class="d-flex align-items-center mb-3">
//         <div class="profile-img-small me-3">
//           <i class="bi bi-person-fill"></i>
//         </div>
//         <div class="flex-grow-1">
//           <h6 class="mb-0 post-author">${data.username ? data.username : "Unknown User"}</h6>
//           <div class="post-time">${dateStr}</div>
//         </div>
//         ${menuHtml}
//       </div>
//       <div class="mb-3 post-content">${data.content ? data.content : ""}</div>
//       ${mediaHtml}
//       <div class="post-actions">
//         <div class="action-buttons">
//           <button class="btn action-btn like-btn"
//             data-liked="${isLiked ? "1" : "0"}"
//             title="Like"
//           >
//             <i class="bi bi-heart${isLiked ? "-fill" : ""}"></i>
//             <span class="like-count">${likeCount}</span>
//           </button>
//           <button class="btn action-btn comment-btn open-comment-popup"
//             title="Comment"
//           >
//             <i class="bi bi-chat-dots"></i>
//             <span class="comment-count">${commentCount}</span>
//           </button>
//           <button class="btn action-btn share-btn"
//             title="Share"
//           >
//             <i class="bi bi-share"></i>
//             <span class="share-count">${shareCount}</span>
//           </button>
//         </div>
        
//         <div class="comment-input-section">
//           <div class="profile-img-tiny">
//             <i class="bi bi-person-fill"></i>
//           </div>
//           <div class="comment-input-wrapper">
//             <input type="text" class="form-control comment-input" placeholder="Write a comment..." />
//           </div>
//           <button class="btn comment-send-btn">
//             <i class="bi bi-send"></i>
//           </button>
//         </div>
//       </div>
//     </div>
//   `
//   feed.className = "feed";

//   if (prepend && feedContainer.firstChild) {
//     feedContainer.insertBefore(feed, feedContainer.firstChild);
//   } else {
//     feedContainer.appendChild(feed);
//   }
// }
// renderPost(PostData, true)
loadPosts(PostData);


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
document.addEventListener("click", async (e) => {
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