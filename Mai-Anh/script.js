// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: "AIzaSyCi2NKH7Dzf6sLZdvuCQW18hxbsF4cVYB0",
  authDomain: "ttmindx.firebaseapp.com",
  projectId: "ttmindx",
  storageBucket: "ttmindx.firebasestorage.app",
  messagingSenderId: "499689288083",
  appId: "1:499689288083:web:394be22db426aa48b93866",
  measurementId: "G-Y0NCNLB337"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

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
  arrayUnion,
  deleteDoc
} from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js'

const db = getFirestore(app);

const createFeedModal = document.getElementById('createFeedModal');
const postButton = document.getElementById('postButton');

// Helper to render a single post (prepend if needed)
function renderPost(data, prepend = false) {
  let dateStr = '';
  if (data.date) {
    const dateObj = new Date(data.date);
    dateStr = dateObj.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Default counts
  const likeCount = data.likeCount || 0;
  const commentCount = data.commentCount || 0;
  const shareCount = data.shareCount || 0;

  // For demo, use localStorage to track liked posts by this user
  const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
  const isLiked = likedPosts.includes(data.id);

  // Three-dot menu for edit/delete
  // CHANGED: Added background color to three-dot menu button
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
          <button class="dropdown-item delete-post-btn" type="button" style="color:#d90429;">
            <i class="bi bi-trash me-2"></i>Delete
          </button>
        </li>
      </ul>
    </div>
  `;

  const feed = document.createElement('div');
  feed.className = 'feed-post';
  feed.innerHTML = `
    <div class="card-body mb-4" data-post-id="${data.id || ''}">
      <div class="d-flex align-items-center mb-2">
        <span class="rounded-circle d-inline-block me-3" style="width:40px;height:40px; background-color: #fff; display: flex; align-items: center; justify-content: center;"></span>
        <div>
          <h5 class="mb-0" style="color: var(--headline-color);">${data.user ? data.user : 'Unknown User'}</h5>
          <div class="text-muted small" style="color: var(--p-color);">${dateStr}</div>
        </div>
        ${menuHtml}
      </div>
      <div class="mb-2 post-content" style="color: var(--p-color);">${data.content ? data.content : ''}</div>
      <div class="mb-2" style="height:200px; background: var(--secondary-color); border-radius: 20px;"></div>
      <div class="d-flex align-items-center mb-2">
        <button class="btn btn-outline-danger btn-sm me-2 like-btn" 
          style="color: var(--highlight-color); border-color: var(--highlight-color); border-radius: 20px; position:relative;"
          aria-label="Like"
          data-liked="${isLiked ? '1' : '0'}"
          title="Like"
        >
          <i class="bi bi-heart${isLiked ? '-fill' : ''}"></i>
          <span class="like-count" style="margin-left:6px;">${likeCount}</span>
          <span class="like-hover" style="display:none;position:absolute;top:-28px;left:50%;transform:translateX(-50%);background:#fff;padding:4px 10px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.08);font-size:0.95em;color:var(--headline-color);z-index:2;">${likeCount} like${likeCount===1?'':'s'}</span>
        </button>
        <button class="btn btn-outline-secondary btn-sm me-2 open-comment-popup comment-btn" 
          style="color: var(--p-color); border-color: var(--p-color); border-radius: 20px; position:relative;"
          aria-label="Comment"
          title="Comment"
        >
          <i class="bi bi-chat-dots"></i>
          <span class="comment-count" style="margin-left:6px;">${commentCount}</span>
          <span class="comment-hover" style="display:none;position:absolute;top:-28px;left:50%;transform:translateX(-50%);background:#fff;padding:4px 10px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.08);font-size:0.95em;color:var(--headline-color);z-index:2;">${commentCount} comment${commentCount===1?'':'s'}</span>
        </button>
        <button class="btn btn-outline-primary btn-sm me-3 share-btn" 
          style="color: var(--b-color); border-color: var(--b-color); border-radius: 20px; position:relative;"
          aria-label="Share"
          title="Share"
        >
          <i class="bi bi-share"></i>
          <span class="share-count" style="margin-left:6px;">${shareCount}</span>
          <span class="share-hover" style="display:none;position:absolute;top:-28px;left:50%;transform:translateX(-50%);background:#fff;padding:4px 10px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.08);font-size:0.95em;color:var(--headline-color);z-index:2;">${shareCount} share${shareCount===1?'':'s'}</span>
        </button>
      </div>
    </div>
  `;
  const feeds = document.getElementById('feed');
  if (prepend && feeds.firstChild) {
    feeds.insertBefore(feed, feeds.firstChild);
  } else if (prepend) {
    feeds.appendChild(feed);
  } else {
    feeds.appendChild(feed);
  }
}

// Helper to update a single post's counts in the DOM
function updatePostCounts(postId, {likeCount, commentCount, shareCount, isLiked}) {
  const postEl = document.querySelector(`.card-body[data-post-id="${postId}"]`);
  if (!postEl) return;
  if (typeof likeCount === 'number') {
    const likeCountEl = postEl.querySelector('.like-count');
    if (likeCountEl) likeCountEl.textContent = likeCount;
    const likeBtn = postEl.querySelector('.like-btn');
    if (likeBtn) {
      likeBtn.setAttribute('data-liked', isLiked ? '1' : '0');
      const icon = likeBtn.querySelector('i');
      if (icon) {
        icon.className = 'bi bi-heart' + (isLiked ? '-fill' : '');
      }
      // Update hover text
      const hover = likeBtn.querySelector('.like-hover');
      if (hover) hover.textContent = `${likeCount} like${likeCount===1?'':'s'}`;
    }
  }
  if (typeof commentCount === 'number') {
    const commentCountEl = postEl.querySelector('.comment-count');
    if (commentCountEl) commentCountEl.textContent = commentCount;
    const commentBtn = postEl.querySelector('.comment-btn');
    if (commentBtn) {
      const hover = commentBtn.querySelector('.comment-hover');
      if (hover) hover.textContent = `${commentCount} comment${commentCount===1?'':'s'}`;
    }
  }
  if (typeof shareCount === 'number') {
    const shareCountEl = postEl.querySelector('.share-count');
    if (shareCountEl) shareCountEl.textContent = shareCount;
    const shareBtn = postEl.querySelector('.share-btn');
    if (shareBtn) {
      const hover = shareBtn.querySelector('.share-hover');
      if (hover) hover.textContent = `${shareCount} share${shareCount===1?'':'s'}`;
    }
  }
}

// Initial load: render all posts with counts
async function loadAllPosts() {
  const feeds = document.getElementById('feed');
  feeds.innerHTML = '';
  const querySnapshot = await getDocs(collection(db, 'posts'));
  for (const docSnap of querySnapshot.docs) {
    const data = docSnap.data();
    data.id = docSnap.id;
    // Get likeCount, shareCount, commentCount
    data.likeCount = typeof data.likeCount === 'number' ? data.likeCount : 0;
    data.shareCount = typeof data.shareCount === 'number' ? data.shareCount : 0;
    // For commentCount, count subcollection
    const commentsCol = collection(db, 'posts', data.id, 'comments');
    const commentsSnap = await getDocs(commentsCol);
    data.commentCount = commentsSnap.size;
    renderPost(data);
  }
}
loadAllPosts();

// Listen for comment added to update comment count in real time (optional, not implemented here)

// Handle post creation, close modal, and show new post without reload
postButton.addEventListener('click', async function (e) {
  e.preventDefault();
  const contentInput = document.getElementById('content');
  if (!contentInput) {
    console.error('Content input not found');
    return;
  }
  const contentValue = contentInput.value.trim();
  if (!contentValue) {
    // Optionally show validation error
    return;
  }
  try {
    // Save to Firestore and get the server timestamp
    const docRef = await addDoc(collection(db, 'posts'), {
      user: 'name',
      content: contentValue,
      date: new Date().toISOString(),
      likeCount: 0,
      shareCount: 0
    });

    // Show the new post at the top
    renderPost({
      user: 'name',
      content: contentValue,
      date: new Date().toISOString(),
      id: docRef.id,
      likeCount: 0,
      commentCount: 0,
      shareCount: 0
    }, true);

    // Clear textarea
    contentInput.value = '';

    // Close the modal
    const modalEl = document.getElementById('createFeedModal');
    if (modalEl) {
      let modal;
      try {
        modal = bootstrap && bootstrap.Modal ? bootstrap.Modal.getOrCreateInstance(modalEl) : null;
      } catch (err) {
        modal = null;
      }
      if (modal && typeof modal.hide === 'function') {
        modal.hide();
      } else {
        modalEl.classList.remove('show');
        modalEl.style.display = 'none';
        document.body.classList.remove('modal-open');
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) backdrop.remove();
      }
    }
  } catch (e) {
    console.error('Error adding document: ', e);
  }
});

// --- Like, Comment, Share, Edit, Delete Button Logic ---

// Like/unlike toggle: first click +1, second click -1 (per localStorage, not secure!)
// Hover: show count on hover
// Counting: update count in Firestore and UI

// Event delegation for like, comment, share, edit, delete buttons
document.addEventListener('mouseover', function(e) {
  // Like hover
  const likeBtn = e.target.closest('.like-btn');
  if (likeBtn) {
    const hover = likeBtn.querySelector('.like-hover');
    if (hover) hover.style.display = 'block';
  }
  // Comment hover
  const commentBtn = e.target.closest('.comment-btn');
  if (commentBtn) {
    const hover = commentBtn.querySelector('.comment-hover');
    if (hover) hover.style.display = 'block';
  }
  // Share hover
  const shareBtn = e.target.closest('.share-btn');
  if (shareBtn) {
    const hover = shareBtn.querySelector('.share-hover');
    if (hover) hover.style.display = 'block';
  }
});
document.addEventListener('mouseout', function(e) {
  // Like hover
  const likeBtn = e.target.closest('.like-btn');
  if (likeBtn) {
    const hover = likeBtn.querySelector('.like-hover');
    if (hover) hover.style.display = 'none';
  }
  // Comment hover
  const commentBtn = e.target.closest('.comment-btn');
  if (commentBtn) {
    const hover = commentBtn.querySelector('.comment-hover');
    if (hover) hover.style.display = 'none';
  }
  // Share hover
  const shareBtn = e.target.closest('.share-btn');
  if (shareBtn) {
    const hover = shareBtn.querySelector('.share-hover');
    if (hover) hover.style.display = 'none';
  }
});

document.addEventListener('click', async function(e) {
  // Like button
  const likeBtn = e.target.closest('.like-btn');
  if (likeBtn) {
    const postCard = likeBtn.closest('.card-body');
    if (!postCard) return;
    const postId = postCard.getAttribute('data-post-id');
    if (!postId) return;
    // Check if already liked (localStorage)
    let likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
    const isLiked = likedPosts.includes(postId);
    try {
      if (!isLiked) {
        // Like: increment
        await updateDoc(doc(db, 'posts', postId), { likeCount: increment(1) });
        likedPosts.push(postId);
        localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
        // Get new likeCount
        const postDoc = await getDoc(doc(db, 'posts', postId));
        const likeCount = postDoc.data().likeCount || 1;
        updatePostCounts(postId, { likeCount, isLiked: true });
        showNotification('You liked this post!', 'success', 1200);
      } else {
        // Unlike: decrement
        await updateDoc(doc(db, 'posts', postId), { likeCount: increment(-1) });
        likedPosts = likedPosts.filter(id => id !== postId);
        localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
        // Get new likeCount
        const postDoc = await getDoc(doc(db, 'posts', postId));
        const likeCount = postDoc.data().likeCount || 0;
        updatePostCounts(postId, { likeCount, isLiked: false });
        showNotification('You unliked this post.', 'info', 1200);
      }
    } catch (err) {
      showNotification('Failed to update like.', 'error');
    }
    return;
  }

  // Share button
  const shareBtn = e.target.closest('.share-btn');
  if (shareBtn) {
    const postCard = shareBtn.closest('.card-body');
    if (!postCard) return;
    const postId = postCard.getAttribute('data-post-id');
    if (!postId) return;
    // Remove second click: allow only one share per user (localStorage)
    let sharedPosts = JSON.parse(localStorage.getItem('sharedPosts') || '[]');
    if (sharedPosts.includes(postId)) {
      showNotification('You already shared this post.', 'info', 1500);
      return;
    }
    // Update Firestore shareCount
    try {
      await updateDoc(doc(db, 'posts', postId), { shareCount: increment(1) });
      sharedPosts.push(postId);
      localStorage.setItem('sharedPosts', JSON.stringify(sharedPosts));
      // Get new shareCount
      const postDoc = await getDoc(doc(db, 'posts', postId));
      const shareCount = postDoc.data().shareCount || 1;
      updatePostCounts(postId, { shareCount });
      showNotification('Post shared!', 'success', 1200);
    } catch (err) {
      showNotification('Failed to share post.', 'error');
    }
    return;
  }

  // Edit post button
  const editBtn = e.target.closest('.edit-post-btn');
  if (editBtn) {
    const postCard = editBtn.closest('.card-body');
    if (!postCard) return;
    const postId = postCard.getAttribute('data-post-id');
    if (!postId) return;
    // Find the content div
    const contentDiv = postCard.querySelector('.post-content');
    if (!contentDiv) return;
    // If already editing, do nothing
    if (contentDiv.querySelector('textarea')) return;
    const oldContent = contentDiv.textContent;
    // Replace with textarea and save/cancel buttons
    contentDiv.innerHTML = `
      <textarea class="form-control edit-post-textarea" style="width:100%; min-height:60px; border-radius:12px; margin-bottom:8px;">${oldContent.replace(/"/g, '&quot;')}</textarea>
      <div>
        <button class="btn btn-sm btn-primary save-edit-post-btn" style="border-radius:20px; margin-right:8px;">Save</button>
        <button class="btn btn-sm btn-secondary cancel-edit-post-btn" style="border-radius:20px;">Cancel</button>
      </div>
    `;
    // Focus textarea
    const textarea = contentDiv.querySelector('textarea');
    if (textarea) textarea.focus();
    return;
  }

  // Save edit post
  const saveEditBtn = e.target.closest('.save-edit-post-btn');
  if (saveEditBtn) {
    const postCard = saveEditBtn.closest('.card-body');
    if (!postCard) return;
    const postId = postCard.getAttribute('data-post-id');
    if (!postId) return;
    const contentDiv = postCard.querySelector('.post-content');
    const textarea = contentDiv.querySelector('textarea');
    if (!textarea) return;
    const newContent = textarea.value.trim();
    if (!newContent) {
      showNotification('Post content cannot be empty.', 'warning', 1500);
      return;
    }
    // Update Firestore
    updateDoc(doc(db, 'posts', postId), { content: newContent })
      .then(() => {
        contentDiv.innerHTML = newContent;
        showNotification('Post updated!', 'success', 1200);
      })
      .catch(() => {
        showNotification('Failed to update post.', 'error');
      });
    return;
  }

  // Cancel edit post
  const cancelEditBtn = e.target.closest('.cancel-edit-post-btn');
  if (cancelEditBtn) {
    const postCard = cancelEditBtn.closest('.card-body');
    if (!postCard) return;
    const postId = postCard.getAttribute('data-post-id');
    if (!postId) return;
    // Get original content from Firestore
    getDoc(doc(db, 'posts', postId)).then(postDoc => {
      const contentDiv = postCard.querySelector('.post-content');
      if (contentDiv) {
        contentDiv.innerHTML = postDoc.exists() ? (postDoc.data().content || '') : '';
      }
    });
    return;
  }

  // Delete post button
  const deleteBtn = e.target.closest('.delete-post-btn');
  if (deleteBtn) {
    const postCard = deleteBtn.closest('.card-body');
    if (!postCard) return;
    const postId = postCard.getAttribute('data-post-id');
    if (!postId) return;
    // Confirm delete
    if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) return;
    // Delete from Firestore
    deleteDoc(doc(db, 'posts', postId))
      .then(() => {
        // Remove from DOM
        const feedPost = postCard.closest('.feed-post');
        if (feedPost) feedPost.remove();
        showNotification('Post deleted.', 'success', 1200);
      })
      .catch(() => {
        showNotification('Failed to delete post.', 'error');
      });
    return;
  }
});

// --- Comment Popup Logic ---

let commentPopup = null;
function createCommentPopup() {
  if (commentPopup) return commentPopup;
  commentPopup = document.createElement('div');
  commentPopup.id = 'commentPopup';
  commentPopup.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; 
    background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 9999; 
    display: none;
  `;

  function getPopupWidth() {
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    if (vw >= 1200) return '900px';
    if (vw >= 900) return '700px';
    if (vw >= 600) return '90vw';
    return '98vw';
  }

  commentPopup.innerHTML = `
    <div class="comment-popup-content" style="
      background: #fff; 
      border-radius: 16px; 
      width: ${getPopupWidth()};
      max-width: 98vw;
      min-width: 0;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18); 
      padding: 0; 
      overflow: hidden; 
      position: relative;
      transition: width 0.2s;
      ">
      <button class="close-comment-popup" style="position:absolute;top:10px;right:10px;background:none;border:none;font-size:1.5rem;z-index:2;">&times;</button>
      <div class="comment-popup-post" style="padding: 24px 24px 12px 24px; border-bottom: 1px solid #eee;"></div>
      <div class="comment-popup-comments" style="max-height: 220px; overflow-y: auto; padding: 12px 24px 0 24px;"></div>
      <div class="comment-popup-input" style="display: flex; align-items: center; padding: 16px 24px 24px 24px; border-top: 1px solid #eee;">
        <input type="text" class="form-control" placeholder="Write a comment..." style="flex:1; margin-right: 12px; border-radius: 20px; border: 1px solid #ccc; padding: 8px 16px;">
        <button class="btn btn-primary send-comment-btn" style="border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M15.854.146a.5.5 0 0 0-.527-.116l-15 6a.5.5 0 0 0 .019.938l6.57 2.19 2.19 6.57a.5.5 0 0 0 .938.019l6-15a.5.5 0 0 0-.116-.527zm-2.89 2.89-4.482 4.482-5.197-1.733 9.679-3.749zm-4.13 5.744 4.482-4.482-3.749 9.679-1.733-5.197z"/>
          </svg>
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(commentPopup);

  function resizePopup() {
    const popupContent = commentPopup.querySelector('.comment-popup-content');
    if (popupContent) {
      popupContent.style.width = getPopupWidth();
      popupContent.style.maxWidth = '98vw';
    }
  }
  window.addEventListener('resize', resizePopup);

  return commentPopup;
}

function renderPopupPost(postData) {
  const postDiv = commentPopup.querySelector('.comment-popup-post');
  let dateStr = '';
  if (postData.date) {
    const dateObj = new Date(postData.date);
    dateStr = dateObj.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  postDiv.innerHTML = `
    <div class="d-flex align-items-center mb-2">
      <span class="rounded-circle d-inline-block me-3" style="width:40px;height:40px; background-color: #fff; display: flex; align-items: center; justify-content: center;"></span>
      <div>
        <h6 class="mb-0" style="color: var(--headline-color);">${postData.user ? postData.user : 'Unknown User'}</h6>
        <div class="text-muted small" style="color: var(--p-color);">${dateStr}</div>
      </div>
    </div>
    <div class="mb-2" style="color: var(--p-color);">${postData.content ? postData.content : ''}</div>
    <div class="mb-2" style="height:120px; background: var(--secondary-color); border-radius: 20px;"></div>
  `;
}

async function renderPopupComments(postId) {
  const commentsDiv = commentPopup.querySelector('.comment-popup-comments');
  commentsDiv.innerHTML = '<div style="color:#aaa;font-size:0.95em;">Loading comments...</div>';
  try {
    const commentsCol = collection(db, 'posts', postId, 'comments');
    const q = query(commentsCol, orderBy('date', 'asc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      commentsDiv.innerHTML = '<div style="color:#aaa;font-size:0.95em;">No comments yet.</div>';
      // Update comment count in feed
      updatePostCounts(postId, { commentCount: 0 });
      return;
    }
    commentsDiv.innerHTML = '';
    let count = 0;
    snapshot.forEach(docSnap => {
      count++;
      const c = docSnap.data();
      let dateStr = '';
      if (c.date) {
        const dateObj = new Date(c.date);
        dateStr = dateObj.toLocaleString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      const commentEl = document.createElement('div');
      commentEl.className = 'comment mb-2';
      commentEl.innerHTML = `
        <div class="d-flex align-items-center">
          <span class="rounded-circle d-inline-block me-2" style="width:32px;height:32px; background-color: #eee; display: flex; align-items: center; justify-content: center; font-size:1rem;">${c.user ? c.user[0] : '?'}</span>
          <div>
            <div style="font-weight:500;">${c.user || 'Anonymous'}</div>
            <div style="font-size:0.95em; color:var(--headline-color);">${c.content}</div>
            <div style="font-size:0.8em; color:var(--p-color);">${dateStr}</div>
          </div>
        </div>
      `;
      commentsDiv.appendChild(commentEl);
    });
    // Update comment count in feed
    updatePostCounts(postId, { commentCount: count });
    commentsDiv.scrollTop = commentsDiv.scrollHeight;
  } catch (err) {
    commentsDiv.innerHTML = '<div style="color:#e53e3e;">Failed to load comments.</div>';
  }
}

async function showCommentPopup(postData) {
  createCommentPopup();

  function getPopupWidth() {
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    if (vw >= 1200) return '900px';
    if (vw >= 900) return '700px';
    if (vw >= 600) return '90vw';
    return '98vw';
  }
  const popupContent = commentPopup.querySelector('.comment-popup-content');
  if (popupContent) {
    popupContent.style.width = getPopupWidth();
    popupContent.style.maxWidth = '98vw';
  }

  renderPopupPost(postData);
  commentPopup.style.display = 'flex';
  commentPopup.dataset.postId = postData.id;
  await renderPopupComments(postData.id);

  setTimeout(() => {
    const input = commentPopup.querySelector('input[type="text"]');
    if (input) input.focus();
  }, 100);
}

function hideCommentPopup() {
  if (commentPopup) {
    commentPopup.style.display = 'none';
    commentPopup.dataset.postId = '';
    commentPopup.querySelector('.comment-popup-comments').innerHTML = '';
    commentPopup.querySelector('input[type="text"]').value = '';
  }
}

// Event delegation for comment button on posts
document.addEventListener('click', async function(e) {
  // Open comment popup
  const commentBtn = e.target.closest('.open-comment-popup');
  if (commentBtn) {
    const postCard = commentBtn.closest('.card-body');
    if (postCard) {
      const postId = postCard.getAttribute('data-post-id');
      if (!postId) return;
      // Fetch post data from Firestore for up-to-date info
      const postDoc = await getDoc(doc(db, 'posts', postId));
      if (!postDoc.exists()) return;
      const postData = postDoc.data();
      postData.id = postId;
      showCommentPopup(postData);
    }
  }
  // Close popup
  if (e.target.classList.contains('close-comment-popup')) {
    hideCommentPopup();
  }
  // Click outside popup content closes popup
  if (commentPopup && e.target === commentPopup) {
    hideCommentPopup();
  }
});

// Add comment from popup
if (!window._commentPopupListenerAdded) {
  window._commentPopupListenerAdded = true;
  document.addEventListener('click', async function(e) {
    if (!commentPopup || commentPopup.style.display !== 'flex') return;
    // Send button
    if (e.target.closest('.send-comment-btn')) {
      const postId = commentPopup.dataset.postId;
      const input = commentPopup.querySelector('input[type="text"]');
      const commentText = input ? input.value.trim() : '';
      if (!postId || !commentText) return;
      const userName = 'Current User'; // Replace with actual user name if available
      try {
        await addDoc(collection(db, 'posts', postId, 'comments'), {
          user: userName,
          content: commentText,
          date: new Date().toISOString()
        });
        input.value = '';
        await renderPopupComments(postId);
        // Optionally update commentCount in Firestore (not needed, we count subcollection)
      } catch (err) {
        alert('Failed to add comment.');
      }
    }
  });

  // Enter key to send comment
  document.addEventListener('keydown', async function(e) {
    if (!commentPopup || commentPopup.style.display !== 'flex') return;
    if (e.key === 'Enter' && !e.shiftKey) {
      const input = commentPopup.querySelector('input[type="text"]');
      if (document.activeElement === input) {
        e.preventDefault();
        const postId = commentPopup.dataset.postId;
        const commentText = input ? input.value.trim() : '';
        if (!postId || !commentText) return;
        const userName = 'Current User';
        try {
          await addDoc(collection(db, 'posts', postId, 'comments'), {
            user: userName,
            content: commentText,
            date: new Date().toISOString()
          });
          input.value = '';
          await renderPopupComments(postId);
        } catch (err) {
          alert('Failed to add comment.');
        }
      }
    }
    // Escape closes popup
    if (e.key === 'Escape' && commentPopup && commentPopup.style.display === 'flex') {
      hideCommentPopup();
    }
  });
}

// Simple notification system with notification popup list

function showNotification(message, type = 'info', duration = 3000) {
  let existing = document.getElementById('custom-notification');
  if (existing) existing.remove();

  const notif = document.createElement('div');
  notif.id = 'custom-notification';
  notif.textContent = message;
  notif.style.position = 'fixed';
  notif.style.top = '30px';
  notif.style.left = '50%';
  notif.style.transform = 'translateX(-50%)';
  notif.style.zIndex = 99999;
  notif.style.padding = '16px 32px';
  notif.style.borderRadius = '12px';
  notif.style.fontSize = '1rem';
  notif.style.fontFamily = 'Inter, sans-serif';
  notif.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
  notif.style.color = 'var(--headline-color)';
  notif.style.background = 'var(--main-color)';
  notif.style.border = '1px solid var(--border-color)';
  notif.style.opacity = '0';
  notif.style.transition = 'opacity 0.2s';

  const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  notif.style.maxWidth = vw >= 600 ? '600px' : '90vw';
  notif.style.width = 'auto';
  notif.style.boxSizing = 'border-box';

  if (type === 'success') {
    notif.style.background = 'var(--tertiary-color)';
    notif.style.color = '#fff';
  } else if (type === 'error') {
    notif.style.background = '#d90429';
    notif.style.color = '#fff';
  } else if (type === 'warning') {
    notif.style.background = '#ffbe0b';
    notif.style.color = '#222';
  }

  document.body.appendChild(notif);

  setTimeout(() => {
    notif.style.opacity = '1';
  }, 10);

  setTimeout(() => {
    notif.style.opacity = '0';
    setTimeout(() => {
      notif.remove();
    }, 300);
  }, duration);
}

// --- Notification Popup System ---

let notificationList = [];

let notifBtn = document.getElementById('notification-dropdown');
if (!notifBtn) {
  notifBtn = document.createElement('button');
  notifBtn.id = 'notification-btn';
  notifBtn.textContent = '🔔';
  notifBtn.style.position = 'fixed';
  notifBtn.style.top = '30px';
  notifBtn.style.right = '30px';
  notifBtn.style.zIndex = 100000;
  notifBtn.style.background = 'var(--main-color)';
  notifBtn.style.color = 'var(--headline-color)';
  notifBtn.style.border = '1px solid var(--border-color)';
  notifBtn.style.borderRadius = '50%';
  notifBtn.style.width = '48px';
  notifBtn.style.height = '48px';
  notifBtn.style.fontSize = '1.5rem';
  notifBtn.style.cursor = 'pointer';
  notifBtn.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
  notifBtn.style.display = 'flex';
  notifBtn.style.alignItems = 'center';
  notifBtn.style.justifyContent = 'center';
  document.body.appendChild(notifBtn);
}

let notifPopup = document.getElementById('notification-popup');
if (!notifPopup) {
  notifPopup = document.createElement('div');
  notifPopup.id = 'notification-popup';
  notifPopup.style.position = 'fixed';
  notifPopup.style.top = '80px';
  notifPopup.style.right = '30px';
  notifPopup.style.width = 'min(600px, 98vw)';
  notifPopup.style.maxWidth = '98vw';
  notifPopup.style.minWidth = '0';
  notifPopup.style.maxHeight = '70vh';
  notifPopup.style.overflowY = 'auto';
  notifPopup.style.background = 'var(--main-color)';
  notifPopup.style.border = '1px solid var(--border-color)';
  notifPopup.style.borderRadius = '16px';
  notifPopup.style.boxShadow = '0 8px 32px rgba(0,0,0,0.18)';
  notifPopup.style.zIndex = 100001;
  notifPopup.style.display = 'none';
  notifPopup.style.padding = '0';
  notifPopup.style.fontFamily = 'Inter, sans-serif';
  notifPopup.style.color = 'var(--headline-color)';
  notifPopup.innerHTML = `
    <div style="padding: 16px; font-weight: bold; border-bottom: 1px solid var(--border-color); background: var(--main-color);">
      Notifications
      <button id="close-notif-popup" style="float:right; background:none; border:none; color:var(--p-color); font-size:1.2em; cursor:pointer;">&times;</button>
    </div>
    <div id="notification-list" style="max-height: 50vh; overflow-y: auto; background: var(--main-color);"></div>
  `;
  document.body.appendChild(notifPopup);

  function resizeNotifPopup() {
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    notifPopup.style.width = vw >= 600 ? 'min(600px, 98vw)' : '98vw';
    notifPopup.style.maxWidth = '98vw';
  }
  window.addEventListener('resize', resizeNotifPopup);
}

function renderNotificationPopup() {
  const notifListDiv = notifPopup.querySelector('#notification-list');
  notifListDiv.innerHTML = '';
  if (notificationList.length === 0) {
    notifListDiv.innerHTML = '<div style="padding: 16px; color: var(--p-color);">No notifications.</div>';
    return;
  }
  notificationList.slice(0, 10).forEach((notif, idx) => {
    const notifItem = document.createElement('div');
    notifItem.style.padding = '16px';
    notifItem.style.borderBottom = '1px solid var(--border-color)';
    notifItem.style.background = idx % 2 === 0 ? 'var(--main-color)' : 'var(--background-color)';
    notifItem.style.color = notif.type === 'error' ? '#d90429' :
                            notif.type === 'success' ? 'var(--tertiary-color)' :
                            notif.type === 'warning' ? '#ffbe0b' :
                            'var(--headline-color)';
    notifItem.textContent = notif.message;
    notifListDiv.appendChild(notifItem);
  });
}

const _originalShowNotification = showNotification;
showNotification = function(message, type = 'info', duration = 3000) {
  notificationList.unshift({ message, type, date: new Date() });
  if (notificationList.length > 10) notificationList = notificationList.slice(0, 10);
  renderNotificationPopup();
  _originalShowNotification(message, type, duration);
};

notifBtn.addEventListener('click', function() {
  if (notifPopup.style.display === 'none' || notifPopup.style.display === '') {
    renderNotificationPopup();
    notifPopup.style.display = 'block';
  } else {
    notifPopup.style.display = 'none';
  }
});

notifPopup.addEventListener('click', function(e) {
  if (e.target && e.target.id === 'close-notif-popup') {
    notifPopup.style.display = 'none';
  }
});

document.addEventListener('mousedown', function(e) {
  if (notifPopup.style.display === 'block' && !notifPopup.contains(e.target) && e.target !== notifBtn) {
    notifPopup.style.display = 'none';
  }
});
