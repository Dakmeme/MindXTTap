import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js"
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js"
import {
  doc,
  getDoc,
  getDocs,
  collection,
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


export const getFollowsInfo = async (userId) => {
  try {
    const followersCol = collection(db, "users", userId, "followers");
    const followingCol = collection(db, "users", userId, "following");
    const [followersSnap, followingSnap] = await Promise.all([
      getDocs(followersCol),
      getDocs(followingCol),
    ]);
    const followers = followersSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    const following = followingSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return [...followers, ...following];
  } catch (error) {
    console.error("Lỗi khi lấy thông tin follows:", error);
    return [];
  }
};

// const userInfo = await getAllUsers(userId)
// const followsInfo = await getFollowsInfo(userId)
const userInfo = await getUserInfo( "random_1753897757130_q60r6")
console.log(userInfo)
const followsInfo = await getFollowsInfo("random_1753897757130_q60r6")
console.log(followsInfo)


const userCardTemplate = document.querySelector("[data-user-template]")
const userCardContainer = document.querySelector("[data-user-cards-container]")
const searchInput = document.querySelector("[data-search]")
const initializeSearch = async () => {
  if (!userCardTemplate || !userCardContainer || !searchInput) {
    console.warn("Search elements not found");
    return;
  }
  followsInfo.forEach(user => {
    const card = userCardTemplate.content.cloneNode(true).children[0];
    const header = card.querySelector("[data-header]");
    const body = card.querySelector("[data-body]");
    header.textContent = user.username || user.name || "Unknown User";
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
      const name = (user.username || user.name || "").toLowerCase();
      const email = (user.userID || "").toLowerCase();
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



document.getElementById('collapsed-avatar').style.backgroundImage = `url("${userInfo.avatar}")`;

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
  
  loadFriends();
  loadPhotos();
  initializeSearch();
};


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


function loadFriends() {
  const friendsGrid = document.getElementById("friends-grid");
  if (!friendsGrid) return;
  
  friendsGrid.innerHTML = followsInfo
    .map(
      (user) => `
        <div class="friend-card" onclick="navigateToFriend('${user.username}')">
          <div class="friend-avatar" style="background-image: url('${user.avatar}')"></div>
          <div class="friend-name">${user.username}</div>
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



window.openPhoto = function(photoUrl) {
  console.log("Opening photo:", photoUrl);
  //modal or lightbox here
  alert(`Photo viewer would open for: ${photoUrl}`);
}

window.navigateToFriend = function(friendName) {
  console.log("Navigating to friend:", friendName);
  //friend's chatbox profile navigation here
  alert(`Would navigate to ${friendName}'s profile`);
};


document.querySelectorAll(".nav-item-collapsed").forEach((item) => {
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
        alert("Would open Notifications");
        break;
      case "settings":
        console.log("Opening Settings...");
        alert("Would open Settings");
        break;
      default:
        console.log(`Clicked on: ${id}`);
        break;
    }
  });
});
document.getElementById('collapsed-avatar').addEventListener('click', () => {
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