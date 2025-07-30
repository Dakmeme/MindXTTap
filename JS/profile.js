import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js"
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js"
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  orderBy,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js"

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
export const db = getFirestore(app)

console.log("Firebase đã được khởi tạo thành công!")

let allUsers = []
const userCardTemplate = document.querySelector("[data-user-template]")
const userCardContainer = document.querySelector("[data-user-cards-container]")
const searchInput = document.querySelector("[data-search]")

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

const getAllUsers = async () => {
  try {
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(usersRef);
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};
const getAllPosts = async () => {
  try {
    const PostsRef = collection(db, "posts");
    const PostSnapshot = await getDocs(PostsRef);
    const posts = [];
    PostSnapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return posts;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
};
const initializeSearch = async () => {
  if (!userCardTemplate || !userCardContainer || !searchInput) {
    console.warn("Search elements not found");
    return;
  }

  allUsers = await getAllUsers();
  
  allUsers.forEach(user => {
    const card = userCardTemplate.content.cloneNode(true).children[0];
    const header = card.querySelector("[data-header]");
    const body = card.querySelector("[data-body]");
    
    header.textContent = user.username || user.name || "Unknown User";
    body.textContent = user.email || "No email";
    card.addEventListener('click', () => {
      console.log(`Navigating to user: ${user.username || user.name}`);
      // window.location.href = `profile.html?userId=${user.id}`;
    });
    
    userCardContainer.append(card);
    user.element = card;
  });


  searchInput.addEventListener("input", (e) => {
    const value = e.target.value.toLowerCase();
    allUsers.forEach(user => {
      const name = (user.username || user.name || "").toLowerCase();
      const email = (user.email || "").toLowerCase();
      const isVisible = name.includes(value) || email.includes(value);
      user.element.classList.toggle("hide", !isVisible);
    });
  });

  searchInput.addEventListener('focus', () => {
    userCardContainer.classList.remove('hide');
  });

  searchInput.addEventListener('blur', (e) => {
    setTimeout(() => {
      userCardContainer.classList.add('hide');
    }, 200);
  });
};

const mockUserData = {
  username: "John Doe",
  email: "john.doe@example.com",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
}

const mockPosts = [
  {
    id: 1,
    content: "lmao I'm cooked",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop",
    timestamp: "2 hours ago",
    likes: 24,
    comments: 5,
    shares: 2,
  },
  {
    id: 2,
    content: "Mot buoi sang dep troi va dan con tho.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
    timestamp: "1 day ago",
    likes: 47,
    comments: 12,
    shares: 8,
  },
  {
    id: 3,
    content: "OH MY PCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC",
    timestamp: "3 days ago",
    likes: 18,
    comments: 3,
    shares: 1,
  },
]

const mockFriends = [
  {
    name: "Alice Johnson",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b9a1ee27?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Bob Smith",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Carol Brown",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "David Wilson",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Emma Davis",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Frank Miller",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  },
]

const mockPhotos = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1515378791036-0648a814c963?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop",
]

const UserData = await getUserInfo("HQk5dXtHghXgIKRRwSeul9jV6Ot1")
const PostsData = await getAllPosts()
console.log(PostsData)
console.log(UserData)

getUserInfo("HQk5dXtHghXgIKRRwSeul9jV6Ot1")
  .then(user => {
    if (!user) {
      console.log("Sai userID r ba");
      return;
    }

    const usernameEls = document.querySelectorAll("#username, #main-username, #header-username");
    const emailEls = document.querySelectorAll("#useremail, #main-useremail, #header-useremail");
    const avatarEls = document.querySelectorAll(".profile-img, .avatar, .small-avatar");
    const coverEls = document.querySelectorAll(".cover-img");
    
    usernameEls.forEach((el) => (el.textContent = user.username));
    emailEls.forEach((el) => (el.textContent = user.email));
    avatarEls.forEach((el) => {
      el.style.backgroundImage = `url("${user.avatar}")`;
      el.style.backgroundSize = "cover";
      el.style.backgroundPosition = "center";
    });
    coverEls.forEach((el) => {
      if (el.classList.contains("cover-section")) {
        el.style.backgroundImage = `url("https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&h=400&fit=crop")`;
      }
    });
    
    loadPosts();
    loadFriends();
    loadPhotos();
    initScrollEffects();
    initializeSearch();
  })
  .catch(error => {
    console.error("Error loading user:", error);
    initializeFallback();
  });

const initializeFallback = () => {
  const usernameEls = document.querySelectorAll("#username, #main-username, #header-username");
  const emailEls = document.querySelectorAll("#useremail, #main-useremail, #header-useremail");
  const avatarEls = document.querySelectorAll(".profile-img, .avatar, .small-avatar");
  const coverEls = document.querySelectorAll(".cover-img");
  
  usernameEls.forEach((el) => (el.textContent = mockUserData.username));
  emailEls.forEach((el) => (el.textContent = mockUserData.email));
  avatarEls.forEach((el) => {
    el.style.backgroundImage = `url("${mockUserData.avatar}")`;
    el.style.backgroundSize = "cover";
    el.style.backgroundPosition = "center";
  });
  coverEls.forEach((el) => {
    if (el.classList.contains("cover-section")) {
      el.style.backgroundImage = `url("https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&h=400&fit=crop")`;
    }
  });
  
  loadPosts();
  loadFriends();
  loadPhotos();
  initScrollEffects();
  initializeSearch();
};

function initScrollEffects() {
  const tabContent = document.querySelector(".tab-content");
  const coverSection = document.getElementById("cover-section");
  const coverOverlay = document.getElementById("cover-overlay");
  const avatarContainer = document.getElementById("avatar-container");
  const profileInfo = document.getElementById("profile-info");
  const profileHeaderInfo = document.getElementById("profile-header-info");
  const headerStats = document.getElementById("header-stats");
  const mainProfileInfo = document.getElementById("main-profile-info");
  const statsContainer = document.getElementById("stats-container");
  const actionButtons = document.getElementById("action-buttons");
  
  if (!tabContent) return;
  
  tabContent.addEventListener("scroll", () => {
    const scrollTop = tabContent.scrollTop;
    const threshold = 0;
    
    if (scrollTop > threshold) {
      coverSection?.classList.add("scrolled");
      avatarContainer?.classList.add("scrolled");
      profileInfo?.classList.add("scrolled");
      profileHeaderInfo?.classList.add("scrolled");
      headerStats?.classList.add("scrolled");
      mainProfileInfo?.classList.add("scrolled");
      statsContainer?.classList.add("scrolled");
      actionButtons?.classList.add("scrolled");
    } else {
      coverSection?.classList.remove("scrolled");
      avatarContainer?.classList.remove("scrolled");
      profileInfo?.classList.remove("scrolled");
      profileHeaderInfo?.classList.remove("scrolled");
      headerStats?.classList.remove("scrolled");
      mainProfileInfo?.classList.remove("scrolled");
      statsContainer?.classList.remove("scrolled");
      actionButtons?.classList.remove("scrolled");
    }

    const opacityFactor = Math.min(scrollTop / threshold, 1);
    const baseOpacity = 0.3;
    const maxOpacity = 0.7;
    const newOpacity = baseOpacity + (maxOpacity - baseOpacity) * opacityFactor;
    
    if (coverOverlay) {
      coverOverlay.style.background = `linear-gradient(135deg, rgba(127, 90, 240, ${newOpacity}) 0%, rgba(0, 0, 0, ${newOpacity + 0.2}) 100%)`;
    }
  });
}

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".tab-pane").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    const tabId = btn.getAttribute("data-tab");
    const targetTab = document.getElementById(tabId);
    if (targetTab) {
      targetTab.classList.add("active");
    }
  });
});

function loadPosts() {
  const postsContainer = document.getElementById("posts-container");
  if (!postsContainer) return;
  
  postsContainer.innerHTML = PostsData
    .map(
      (post) => `
        <div class="post-card">
          <div class="post-header">
            <div class="post-avatar" style="background-image: url('${UserData.avatar}')"></div>
            <div class="post-info">
              <h6>${UserData.username}</h6>
              <div class="post-time">${post.timestamp}</div>
            </div>
          </div>
          <div class="post-content">
            ${post.content}
          </div>
          ${post.image ? `<div class="post-image" style="background-image: url('${post.image}')"></div>` : ""}
          <div class="post-actions">
            <button class="post-action" onclick="toggleLike(${post.id})">
              <i class="bi bi-heart"></i> ${post.likeCount} Like
            </button>
            <button class="post-action">
              <i class="bi bi-chat"></i> ${post.comments} Comment
            </button>
            <button class="post-action">
              <i class="bi bi-share"></i> ${post.shareCount} Share
            </button>
          </div>
        </div>
      `
    )
    .join("");
}

function loadFriends() {
  const friendsGrid = document.getElementById("friends-grid");
  if (!friendsGrid) return;
  
  friendsGrid.innerHTML = mockFriends
    .map(
      (friend) => `
        <div class="friend-card" onclick="navigateToFriend('${friend.name}')">
          <div class="friend-avatar" style="background-image: url('${friend.avatar}')"></div>
          <div class="friend-name">${friend.name}</div>
        </div>
      `
    )
    .join("");
}

function loadPhotos() {
  const photosGrid = document.getElementById("photos-grid");
  if (!photosGrid) return;
  
  photosGrid.innerHTML = mockPhotos
    .map(
      (photo) => `
        <div class="photo-item" style="background-image: url('${photo}')" onclick="openPhoto('${photo}')"></div>
      `
    )
    .join("");
}

window.toggleLike = function(postId) {
  const postAction = event.target.closest(".post-action");
  const icon = postAction.querySelector("i");
  const isLiked = postAction.classList.contains("liked");

  if (isLiked) {
    postAction.classList.remove("liked");
    icon.className = "bi bi-heart";
  } else {
    postAction.classList.add("liked");
    icon.className = "bi bi-heart-fill";
  }
};

window.openPhoto = function(photoUrl) {
  console.log("Opening photo:", photoUrl);
  // You can implement a modal or lightbox here
  alert(`Photo viewer would open for: ${photoUrl}`);
};

window.navigateToFriend = function(friendName) {
  console.log("Navigating to friend:", friendName);
  // You can implement friend profile navigation here
  alert(`Would navigate to ${friendName}'s profile`);
};

document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", () => {
    const id = item.id;
    switch(id) {
      case "feed":
        console.log("Navigating to Feed...");
        // window.location.href = 'feed.html';
        alert("Would navigate to Feed");
        break;
      case "friends":
        console.log("Navigating to Friends page...");
        window.location.href = 'friends.html';
        break;
      case "messages":
        console.log("Opening Messages...");
        // window.location.href = 'messages.html';
        alert("Would open Messages");
        break;
      case "notif":
        console.log("Opening Notifications...");
        // window.location.href = 'notifications.html';
        alert("Would open Notifications");
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

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const editBtn = document.querySelector(".btn-primary-custom");
    if (editBtn) {
      editBtn.addEventListener("click", () => {
        console.log("Opening Edit Profile modal...");
        alert("Edit Profile functionality would open here");
      });
    }
    
    const settingsBtn = document.querySelector(".btn-secondary-custom");
    if (settingsBtn) {
      settingsBtn.addEventListener("click", () => {
        console.log("Opening Settings...");
        alert("Settings page would open here");
      });
    }
  }, 600);
});