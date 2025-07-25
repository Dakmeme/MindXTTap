// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js"
// import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js"
// const firebaseConfig = {
//   apiKey: "AIzaSyCi2NKH7Dzf6sLZdvuCQW18hxbsF4cVYB0",
//   authDomain: "ttmindx.firebaseapp.com",
//   projectId: "ttmindx",
//   storageBucket: "ttmindx.firebasestorage.app",
//   messagingSenderId: "499689288083",
//   appId: "1:499689288083:web:394be22db426aa48b93866",
//   measurementId: "G-Y0NCNLB337",
// }
// const app = initializeApp(firebaseConfig)
// export const db = getFirestore(app)

// console.log("Firebase đã được khởi tạo thành công!")

// import {
//   doc,
//   setDoc,
//   getDoc,
//   getDocs,
//   addDoc,
//   updateDoc,
//   deleteDoc,
//   collection,
//   query,
//   orderBy,
//   serverTimestamp,
// } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js"

// export const getUserInfo = async (userId) => {
//   try {
//     const userRef = doc(db, "users", userId);
//     const userSnap = await getDoc(userRef);
//     if (userSnap.exists()) {
//       return {
//         id: userSnap.id,
//         ...userSnap.data(),
//       };
//     } else {
//       return null;
//     }
//   } catch (error) {
//     console.error("Lỗi khi lấy thông tin người dùng:", error);
//     return null;
//   }
// };

// getUserInfo("user_7n1pcr3ef")
//   .then(user => {
//     console.log(user);

//     if (!user) {
//       console.log("Sai userID r ba");
//       return;
//     }

//     const userAvatarPath = user.avatar;
//     const bgValue = `url("${userAvatarPath}")`;

//     const usernameEl = document.getElementById('username');
//     const emailEl = document.getElementById('useremail');

//     if (usernameEl) usernameEl.innerText = user.username || "HOANG MINH THIEU KIAAA";
//     if (emailEl) emailEl.innerText = user.email || "HOANG MINH THIEU KIAAA";

//     const coverImg = document.querySelectorAll('.cover-img');
//     coverImg.forEach(el => {
//       el.style.backgroundImage = bgValue;
//     });
//   })
//   .catch(err => {
//     console.error('Failed to get user info:', err);
//   });

const mockUserData = {
  username: "John Doe",
  email: "john.doe@example.com",
  avatar:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
};
const mockPosts = [
  {
    id: 1,
    content: "lmao I'm cooked",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop",
    timestamp: "2 hours ago",
    likes: 24,
    comments: 5,
    shares: 2,
  },
  {
    id: 2,
    content: "Mot buoi sang dep troi va dan con tho.",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
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
];
const mockFriends = [
  {
    name: "Alice Johnson",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b9a1ee27?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Bob Smith",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Carol Brown",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "David Wilson",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Emma Davis",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Frank Miller",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  },
];
const mockPhotos = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1515378791036-0648a814c963?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop",
];


setTimeout(() => {
  const usernameEls = document.querySelectorAll(
    "#username, #main-username, #header-username"
  );
  const emailEls = document.querySelectorAll(
    "#useremail, #main-useremail, #header-useremail"
  );
    const avatarEls = document.querySelectorAll(
    ".profile-img, .avatar, .small-avatar"
  );
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
}, 500);




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
  tabContent.addEventListener("scroll", () => {
    const scrollTop = tabContent.scrollTop;
    const threshold = 80;
    if (scrollTop > threshold) {
      coverSection.classList.add("scrolled");
      avatarContainer.classList.add("scrolled");
      profileInfo.classList.add("scrolled");
      profileHeaderInfo.classList.add("scrolled");
      headerStats.classList.add("scrolled");
      mainProfileInfo.classList.add("scrolled");
      statsContainer.classList.add("scrolled");
      actionButtons.classList.add("scrolled");
    } else {
      coverSection.classList.remove("scrolled");
      avatarContainer.classList.remove("scrolled");
      profileInfo.classList.remove("scrolled");
      profileHeaderInfo.classList.remove("scrolled");
      headerStats.classList.remove("scrolled");
      mainProfileInfo.classList.remove("scrolled");
      statsContainer.classList.remove("scrolled");
      actionButtons.classList.remove("scrolled");
    }

    const opacityFactor = Math.min(scrollTop / threshold, 1);
    const baseOpacity = 0.3;
    const maxOpacity = 0.7;
    const newOpacity = baseOpacity + (maxOpacity - baseOpacity) * opacityFactor;
    coverOverlay.style.background = `linear-gradient(135deg, rgba(127, 90, 240, ${newOpacity}) 0%, rgba(0, 0, 0, ${
      newOpacity + 0.2
    }) 100%)`;
  });
}






document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".tab-btn")
      .forEach((t) => t.classList.remove("active"));
    document
      .querySelectorAll(".tab-pane")
      .forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    const tabId = btn.getAttribute("data-tab");
    document.getElementById(tabId).classList.add("active");
  });
});
function loadPosts() {
  const postsContainer = document.getElementById("posts-container");
  postsContainer.innerHTML = mockPosts
    .map(
      (post) => `
                <div class="post-card">
                    <div class="post-header">
                        <div class="post-avatar" style="background-image: url('${
                          mockUserData.avatar
                        }')"></div>
                        <div class="post-info">
                            <h6>${mockUserData.username}</h6>
                            <div class="post-time">${post.timestamp}</div>
                        </div>
                    </div>
                    <div class="post-content">
                        ${post.content}
                    </div>
                    ${
                      post.image
                        ? `<div class="post-image" style="background-image: url('${post.image}')"></div>`
                        : ""
                    }
                    <div class="post-actions">
                        <button class="post-action" onclick="toggleLike(${
                          post.id
                        })">
                            <i class="bi bi-heart"></i> ${post.likes} Like
                        </button>
                        <button class="post-action">
                            <i class="bi bi-chat"></i> ${post.comments} Comment
                        </button>
                        <button class="post-action">
                            <i class="bi bi-share"></i> ${post.shares} Share
                        </button>
                    </div>
                </div>
            `
    )
    .join("");
}



function loadFriends() {
  const friendsGrid = document.getElementById("friends-grid");
  friendsGrid.innerHTML = mockFriends
    .map(
      (friend) => `
                <div class="friend-card">
                    <div class="friend-avatar" style="background-image: url('${friend.avatar}')"></div>
                    <div class="friend-name">${friend.name}</div>
                </div>
            `
    )
    .join("");
}
function loadPhotos() {
  const photosGrid = document.getElementById("photos-grid");
  photosGrid.innerHTML = mockPhotos
    .map(
      (photo) => `
                <div class="photo-item" style="background-image: url('${photo}')" onclick="openPhoto('${photo}')"></div>
            `
    )
    .join("");
}


function toggleLike(postId) {
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
}

function openPhoto(photoUrl) {
  // Create modal laterrrrr
  console.log("Opening photo:", photoUrl);
}

document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", () => {
    const itemText = item.querySelector("span").textContent.trim();
    document
      .querySelectorAll(".nav-item")
      .forEach((i) => (i.style.background = ""));
    item.style.background = "var(--hover-bg)";
    switch (itemText) {
      case "Feed":
        console.log("Navigating to Feed...");
        // window.location.href = 'feed.html';
        break;
      case "Friends":
        console.log("Navigating to Friends page...");
        // window.location.href = 'friends.html';
        break;
      case "Messages":
        console.log("Opening Messages...");
        // window.location.href = 'messages.html';
        break;
      case "Notifications":
        console.log("Opening Notifications...");
        // window.location.href = 'notifications.html';
        break;
      case "Settings":
        console.log("Opening Settings...");
        // window.location.href = 'settings.html';
        break;
      case "Pinned":
        console.log("Showing Pinned items...");
        break;
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const editBtn = document.querySelector(".btn-primary-custom");
    if (editBtn) {
      editBtn.addEventListener("click", () => {
        console.log("Opening Edit Profile modal...");
        // Add pop up sau nha <3
        alert("Edit Profile functionality would open here");
      });
    }
    const settingsBtn = document.querySelector(".btn-secondary-custom");
    if (settingsBtn) {
      settingsBtn.addEventListener("click", () => {
        console.log("Opening Settings...");
        // window.location.href = 'admin.html';
        alert("Settings page would open here");
      });
    }
  }, 600);
});
