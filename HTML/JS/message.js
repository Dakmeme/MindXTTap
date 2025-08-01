import { getUserInfo, getUserPosts, getUserRelations, updateUser, getUserMedia } from "./firebase-config.js"
import { getCurrentUser, initAuth } from "./authState.js"

await initAuth()
const userId = getCurrentUser()
await updateUser(userId)

const UserData = await getUserInfo(userId)
const UserRelations = await getUserRelations(userId)





document.getElementById('collapsed-avatar').style.backgroundImage = `url("${UserData.avatar}")`;


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
  
  friendsGrid.innerHTML = UserRelations
    .map(
      (user) => `
        <div class="d-flex gap-3 p-3 align-items-center friend-card" onclick="navigateToFriend('${user.username}')">
          <div class="friend-avatar" style="background: url('${user.avatar}'); height:45px; width:45px; border-radius:50%"></div>
          <div class="friend-name m-0">${user.username}</div>
        </div>
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
loadFriends()


document.getElementById('friends-search').addEventListener('input', e => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('.friend-card, .group-card').forEach(card => {
        const text = (card.querySelector('.friend-name, .group-name')?.textContent || '').toLowerCase();
        card.style.display = text.includes(term) ? 'block' : 'none';
    });
});
