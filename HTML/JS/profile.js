import { getUserInfo, getUserPosts, getAllUsers,createRandomStoriesWithInteractions, getUserRelations, createRandomUsers, assignFollowersAndFollowingWithSubcollections, createRandomPostsWithInteractions } from "./firebase-config.js"
const userId = "1MJf8DXzCcbXw0uUSMuGpSBLE9o1"

// let allUsers = []
// const userCardTemplate = document.querySelector("[data-user-template]")
// const userCardContainer = document.querySelector("[data-user-cards-container]")
// const searchInput = document.querySelector("[data-search]")
// const initializeSearch = async () => {
//   if (!userCardTemplate || !userCardContainer || !searchInput) {
//     console.warn("Search elements not found");
//     return;
//   }

//   allUsers = await getAllUsers();
  
//   allUsers.forEach(user => {
//     const card = userCardTemplate.content.cloneNode(true).children[0];
//     const header = card.querySelector("[data-header]");
//     const body = card.querySelector("[data-body]");
    
//     header.textContent = user.username || user.name || "Unknown User";
//     body.textContent = user.email || "No email";
//     card.addEventListener('click', () => {
//       console.log(`Navigating to user: ${user.username || user.name}`);
//       // window.location.href = `profile.html?userId=${user.id}`;
//     });
    
//     userCardContainer.append(card);
//     user.element = card;
//   });


//   searchInput.addEventListener("input", (e) => {
//     const value = e.target.value.toLowerCase();
//     allUsers.forEach(user => {
//       const name = (user.username || user.name || "").toLowerCase();
//       const email = (user.email || "").toLowerCase();
//       const isVisible = name.includes(value) || email.includes(value);
//       user.element.classList.toggle("hide", !isVisible);
//     });
//   });

//   searchInput.addEventListener('focus', () => {
//     userCardContainer.classList.remove('hide');
//   });

//   searchInput.addEventListener('blur', (e) => {
//     setTimeout(() => {
//       userCardContainer.classList.add('hide');
//     }, 200);
//   });
// };


const UserData = await getUserInfo(userId)
const UserPostData = await getUserPosts(userId)
const UserRelations = await getUserRelations(userId)
console.log(UserPostData)
console.log(UserData)

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
    // loadPhotos();
    initScrollEffects();
    // initializeSearch();
  })
  .catch(error => {
    console.error("Error loading user:", error);
    // initializeFallback();
  });

  
// const initializeFallback = () => {
//   const usernameEls = document.querySelectorAll("#username, #main-username, #header-username");
//   const emailEls = document.querySelectorAll("#useremail, #main-useremail, #header-useremail");
//   const avatarEls = document.querySelectorAll(".profile-img, .avatar, .small-avatar");
//   const coverEls = document.querySelectorAll(".cover-img");
  
//   usernameEls.forEach((el) => (el.textContent = mockUserData.username));
//   emailEls.forEach((el) => (el.textContent = mockUserData.email));
//   avatarEls.forEach((el) => {
//     el.style.backgroundImage = `url("${mockUserData.avatar}")`;
//     el.style.backgroundSize = "cover";
//     el.style.backgroundPosition = "center";
//   });
//   coverEls.forEach((el) => {
//     if (el.classList.contains("cover-section")) {
//       el.style.backgroundImage = `url("https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&h=400&fit=crop")`;
//     }
//   });
  
//   loadPosts();
//   loadFriends();
//   loadPhotos();
//   initScrollEffects();
//   initializeSearch();
// };

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

// function loadPhotos() {
//   const photosGrid = document.getElementById("photos-grid");
//   if (!photosGrid) return;
  
//   photosGrid.innerHTML = mockPhotos
//     .map(
//       (photo) => `
//         <div class="photo-item" style="background-image: url('${photo}')" onclick="openPhoto('${photo}')"></div>
//       `
//     )
//     .join("");
// }

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

function initPageNavigation() {
  console.log('initPageNavigation invoked');

  const navMap = {
    'feed-nav': 'main.html',
    'friends-nav': 'friends.html',
    'messages-nav': 'messages.html',
    'profile': 'profile.html',
  };

  // Sanity logging
  console.log('found nav-items:', document.querySelectorAll('.nav-item').length);
  console.log('profile element:', document.getElementById('profile'));

  document.body.addEventListener('click', (e) => {
    const item = e.target.closest('.nav-item, #profile');
    if (!item) return;

    const id = item.id;
    console.log('clicked:', id);

    if (id === 'notif') {
      console.log('Opening Notifications...');
      alert('Would open Notifications');
      return;
    }
    if (id === 'settings') {
      console.log('Opening Settings...');
      alert('Would open Settings');
      return;
    }

    if (navMap[id]) {
      console.log(`Navigating to ${navMap[id]}...`);
      window.location.href = navMap[id];
    } else {
      console.log(`Unhandled click id: ${id}`);
    }
  });
}


document.addEventListener('DOMContentLoaded', initPageNavigation);

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


// const RandomUser= await createRandomUsers(50)
// console.log(RandomUser)
// const users = await getAllUsers()
// const test = await assignFollowersAndFollowingWithSubcollections(users)
// const test2 = await createRandomPostsWithInteractions(50)
// test3= await createRandomStoriesWithInteractions(20)