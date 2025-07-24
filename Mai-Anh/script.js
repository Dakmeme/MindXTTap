// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCi2NKH7Dzf6sLZdvuCQW18hxbsF4cVYB0",
  authDomain: "ttmindx.firebaseapp.com",
  projectId: "ttmindx",
  storageBucket: "ttmindx.firebasestorage.app",
  messagingSenderId: "499689288083",
  appId: "1:499689288083:web:394be22db426aa48b93866",
  measurementId: "G-Y0NCNLB337"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

import {
  getFirestore,
  addDoc,
  collection,
  getDocs,
} from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js'

const db = getFirestore(app)

const createFeedModal = document.getElementById('createFeedModal')
const postButton = document.getElementById('postButton')
console.log(postButton)
// Check for null before adding event listener
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

  const feed = document.createElement('div');
  feed.innerHTML = `
        <div class="card-body mb-4">
            <div class="d-flex align-items-center mb-2">
                <span class="rounded-circle d-inline-block me-3" style="width:40px;height:40px; background-color: #fff; display: flex; align-items: center; justify-content: center;"></span>
                <div>
                    <h5 class="mb-0" style="color: var(--headline-color);">${data.user ? data.user : 'Unknown User'}</h5>
                    <div class="text-muted small" style="color: var(--p-color);">${dateStr}</div>
                </div>
            </div>
            <div class="mb-2" style="color: var(--p-color);">${data.content ? data.content : ''}</div>
            <div class="mb-2" style="height:200px; background: var(--secondary-color); border-radius: 20px;"></div>
            <div class="d-flex align-items-center mb-2">
                <button class="btn btn-outline-danger btn-sm me-2" style="color: var(--highlight-color); border-color: var(--highlight-color); border-radius: 20px;" aria-label="Like">
                    <i class="bi bi-heart"></i>
                </button>
                <button class="btn btn-outline-secondary btn-sm me-2" style="color: var(--p-color); border-color: var(--p-color); border-radius: 20px;" aria-label="Comment" data-bs-toggle="modal" data-bs-target="#commentModal">
                    <i class="bi bi-chat-dots"></i>
                </button>
                <button class="btn btn-outline-primary btn-sm me-3" style="color: var(--b-color); border-color: var(--b-color); border-radius: 20px;">
                    <i class="bi bi-share"></i>
                </button>
                <span class="text-muted small" style="color: var(--p-color);"></span>
            </div>
            <div class="d-flex align-items-center mt-3" style="padding: 0;">
                <span class="rounded-circle d-inline-block" style="width:36px; height:36px; background-color:#fff; display:flex; align-items:center; justify-content:center; margin-right:12px;"></span>
                <div style="flex:1; display:flex; align-items:center; background:var(--background-color); border-radius:20px; border:1px solid var(--border-color); padding:0 12px; margin-right:12px; min-height:44px;">
                    <input type="text" class="form-control border-0 shadow-none" placeholder="Write a comment..." style="background:transparent; color:var(--headline-color); font-size:1rem; outline:none; box-shadow:none; height:40px; padding:0;" aria-label="Write a comment">
                </div>
                <button class="d-flex align-items-center justify-content-center" style="width:40px; height:40px; background:var(--highlight-color); border:none; border-radius:50%; color:var(--b-text-color); cursor:pointer;" aria-label="Send message">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M15.854.146a.5.5 0 0 0-.527-.116l-15 6a.5.5 0 0 0 .019.938l6.57 2.19 2.19 6.57a.5.5 0 0 0 .938.019l6-15a.5.5 0 0 0-.116-.527zm-2.89 2.89-4.482 4.482-5.197-1.733 9.679-3.749zm-4.13 5.744 4.482-4.482-3.749 9.679-1.733-5.197z"/>
                    </svg>
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

// Initial load: render all posts
async function loadAllPosts() {
  const feeds = document.getElementById('feed');
  feeds.innerHTML = '';
  const querySnapshot = await getDocs(collection(db, 'posts'));
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    renderPost(data);
  });
}
loadAllPosts();

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
    });

    // Show the new post at the top
    renderPost({
      user: 'name',
      content: contentValue,
      date: new Date().toISOString(),
    }, true);

    // Clear textarea
    contentInput.value = '';

    // Close the modal
    const modalEl = document.getElementById('createFeedModal');
    if (modalEl) {
      // Try Bootstrap 5 modal close
      let modal;
      try {
        modal = bootstrap && bootstrap.Modal ? bootstrap.Modal.getOrCreateInstance(modalEl) : null;
      } catch (err) {
        modal = null;
      }
      if (modal && typeof modal.hide === 'function') {
        modal.hide();
      } else {
        // fallback: manually hide
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