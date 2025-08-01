import { getUserInfo, getUserPosts, getUserRelations, updateUser, getUserMedia } from "./firebase-config.js"
import { getCurrentUser, initAuth } from "./authState.js"
await initAuth()
const userId = getCurrentUser()
await updateUser(userId)

const UserData = await getUserInfo(userId)
const UserRelations = await getUserRelations(userId)
const UserPostData = await getUserPosts(userId)
const UserMedia = await getUserMedia(userId)

getUserInfo(userId)
  .then(user => {
    if (!user) {
      console.log("Sai userID r ba");
      return;
    }

    const usernameEls = document.querySelectorAll("#username, #main-username, #header-username");
    const emailEls = document.querySelectorAll("#useremail, #main-useremail, #header-useremail");
    const avatarEls = document.querySelectorAll(".profile-img, .avatar, .small-avatar");
    const coverEls = document.querySelectorAll(".cover-img");
    const FollowersEls = document.querySelectorAll(".usersFollowers");
    const FollowingsEls = document.querySelectorAll(".usersFollowing");
    const PostsEls = document.querySelectorAll(".usersCPosts");
    PostsEls.forEach(el => (el.textContent = UserPostData.length));
    usernameEls.forEach((el) => (el.textContent = user.username));
    emailEls.forEach((el) => (el.textContent = user.email));
    FollowersEls.forEach((el) => (el.textContent = user.followers));
    FollowingsEls.forEach((el) => (el.textContent = user.following));

    avatarEls.forEach((el) => {
      el.style.backgroundImage = `url("${user.avatar}")`;
      el.style.backgroundSize = "cover";
      el.style.backgroundPosition = "center";
    });
    coverEls.forEach((el) => {
      if (el.classList.contains("cover-section")) {
        el.style.backgroundImage = `url("${user.coverImage}")`;
      }
    });


    loadFriends();
    loadPosts();
    loadPhotos();
    initScrollEffects();
  })
  .catch(error => {
    console.error("Error loading user:", error);
    // initializeFallback();
  });

function initScrollEffects() {
  const tabContent = document.querySelector(".tab-content");
  const coverOverlay = document.getElementById("cover-overlay");
  const coverSection = document.getElementById("cover-section");
  const avatarContainer = document.getElementById("avatar-container");
  const profileInfo = document.getElementById("profile-info");
  const profileHeaderInfo = document.getElementById("profile-header-info");
  const headerStats = document.getElementById("header-stats");
  const mainProfileInfo = document.getElementById("main-profile-info");
  const statsContainer = document.getElementById("stats-container");
  const actionButtons = document.getElementById("action-buttons");

  if (!tabContent) return;

  const toggledEls = [
    coverSection,
    avatarContainer,
    profileInfo,
    profileHeaderInfo,
    headerStats,
    mainProfileInfo,
    statsContainer,
    actionButtons,
  ].filter(Boolean);
  const ADD_ON_DOWN = 500;
  const REMOVE_ON_UP = 0;
  const OPACITY_START = 30;
  const OPACITY_END = 180;
  const BASE_OPACITY = 0.3;
  const MAX_OPACITY = 0.7;

  let lastScrollTop = tabContent.scrollTop;
  let hasScrolledClass = false;
  let ticking = false;
  function clamp(value, min, max) {
    return value < min ? min : value > max ? max : value;
  }
  function setScrolledState(active) {
    if (active === hasScrolledClass) return;
    toggledEls.forEach(el => {
      if (active) el.classList.add("scrolled");
      else el.classList.remove("scrolled");
    });
    hasScrolledClass = active;
  }

  function updateOverlayOpacity(scrollTop) {
    const raw = (scrollTop - OPACITY_START) / (OPACITY_END - OPACITY_START);
    const factor = clamp(raw, 0, 1);
    const newOpacity = BASE_OPACITY + (MAX_OPACITY - BASE_OPACITY) * factor;
    const secondStop = Math.min(newOpacity + 0.2, 1);
    if (coverOverlay) {
      coverOverlay.style.background = `linear-gradient(135deg, rgba(127,90,240,${newOpacity}) 0%, rgba(0,0,0,${secondStop}) 100%)`;
    }
  }

  function onScroll() {
    const scrollTop = tabContent.scrollTop;
    const isScrollingDown = scrollTop > lastScrollTop;

    if (isScrollingDown) {
      if (scrollTop >= ADD_ON_DOWN) {
        setScrolledState(true);
      }
    } else {
      if (scrollTop <= REMOVE_ON_UP) {
        setScrolledState(false);
      }
    }

    updateOverlayOpacity(scrollTop);
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    ticking = false;
  }

  tabContent.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(onScroll);
  });
  updateOverlayOpacity(tabContent.scrollTop);
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

  postsContainer.innerHTML = UserPostData
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

function loadFriends() {
  const friendsGrid = document.getElementById("friends-grid");
  if (!friendsGrid) return;

  friendsGrid.innerHTML = UserRelations
    .map(
      (friend) => `
        <div class="friend-card" onclick="navigateToFriend('${friend.username}')">
          <div class="friend-avatar" style="background-image: url('${friend.avatar}')"></div>
          <div class="friend-name">${friend.username}</div>
        </div>
      `
    )
    .join("");
}

function loadPhotos() {
  const photosGrid = document.getElementById("photos-grid");
  if (!photosGrid) return;

  photosGrid.innerHTML = UserMedia
    .map(
      (photo) => `
        <div class="photo-item" style="background-image: url('${photo.link}')" onclick="openPhoto('${photo}')"></div>
      `
    )
    .join("");
}

window.openPhoto = function (photoUrl) {
  console.log("Opening photo:", photoUrl);

  alert(`Photo viewer would open for: ${photoUrl}`);
};

window.navigateToFriend = function (friendName) {
  console.log("Navigating to friend:", friendName);
  alert(`Would navigate to ${friendName}'s profile`);
};

document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", () => {
    const id = item.id;
    switch (id) {
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
          window.location.href = 'admin.html';
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


const userCardTemplate = document.querySelector("[data-user-template]")
const userCardContainer = document.querySelector("[data-user-cards-container]")
const searchInput = document.querySelector("[data-search]")
const initializeSearch = async () => {
  if (!userCardTemplate || !userCardContainer || !searchInput) {
    console.warn("Search elements not found");
    return;
  }
  UserRelations.forEach(user => {
    const card = userCardTemplate.content.cloneNode(true).children[0];
    const header = card.querySelector("[data-header]");
    const body = card.querySelector("[data-body]");
    header.textContent = user.username || "Unknown User";
    body.textContent = user.email
    card.addEventListener('click', () => {
      // window.location.href = `profile.html?userId=${user.id}`;
    });
    userCardContainer.append(card);
    user.element = card;
  });


  searchInput.addEventListener("input", (e) => {
    const value = e.target.value.toLowerCase();
    followsInfo.forEach(user => {
      const name = (user.username).toLowerCase();
      const email = (user.email).toLowerCase();
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
