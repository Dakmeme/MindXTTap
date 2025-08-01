import { getUserInfo, getUserPosts, getUserRelations, updateUser, getUserMedia } from "./firebase-config.js"
import { getCurrentUser, initAuth } from "./authState.js"

await initAuth()
const userId = getCurrentUser()
await updateUser(userId)

const UserData = await getUserInfo(userId)
const UserRelations = await getUserRelations(userId)




document.getElementById('collapsed-avatar').style.backgroundImage = `url("${UserData.avatar}")`;

function loadFriends() {
    const friendsGrid = document.getElementById('friends-grid');
    let filteredFriends = UserRelations;
    friendsGrid.innerHTML = filteredFriends.map(friend => `
                <div class="friend-card" onclick="viewFollowers(${friend.id})">
                    <div class="online-indicator ${friend.status}"></div>
                    <div class="friend-card-content">
                        <div class="friend-avatar-large" style="background-image: url('${friend.avatar}')"></div>
                        <div class="friend-info">
                            <div class="friend-name">${friend.username}</div>
                            <div class="friend-status">${friend.status}</div>
                            <div class="friend-actions">
                                <button class="friend-btn" onclick="event.stopPropagation(); viewProfile(${friend.id})">
                                    <i class="bi bi-person"></i>
                                    Profile
                                </button>
                                <button class="friend-btn message" onclick="event.stopPropagation(); sendMessage(${friend.id})">
                                    <i class="bi bi-chat"></i>
                                    Message
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
}




document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;
        const friendsSection = document.getElementById('friends-section');
        const groupsSection = document.getElementById('groups-section');

        if (filter === 'groups') {
            friendsSection.style.display = 'none';
            groupsSection.style.display = 'block';
            loadGroups();
        } else {
            friendsSection.style.display = 'block';
            groupsSection.style.display = 'none';
            loadFriends(filter);
        }
    });
});

document.getElementById('friends-search').addEventListener('input', e => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('.friend-card, .group-card').forEach(card => {
        const text = (card.querySelector('.friend-name, .group-name')?.textContent || '').toLowerCase();
        card.style.display = text.includes(term) ? 'block' : 'none';
    });
});


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
                window.location.href = 'admin.html';
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


function viewFriend(id) { console.log(`Viewing friend ${id}`); }
function viewProfile(id) { console.log(`Viewing profile ${id}`); }
function sendMessage(id) { console.log(`Sending message to ${id}`); }
function viewGroup(id) { console.log(`Viewing group ${id}`); }
function addFriend() { console.log('Add friend modal'); }
function createGroup() { console.log('Create group modal'); }
loadFriends();