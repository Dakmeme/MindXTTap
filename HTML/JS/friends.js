        const friendsData = [
            { id: 1, name: "Alice Johnson", avatar: "https://images.unsplash.com/photo-1494790108755-2616b9a1ee27?w=150&h=150&fit=crop&crop=face", status: "Active 2 minutes ago", online: true, mutual: 15 },
            { id: 2, name: "Bob Smith", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face", status: "Active 1 hour ago", online: false, mutual: 8 },
            { id: 3, name: "Carol Brown", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face", status: "Online", online: true, mutual: 23 },
            { id: 4, name: "David Wilson", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face", status: "Active 3 days ago", online: false, mutual: 5 },
            { id: 5, name: "Emma Davis", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face", status: "Online", online: true, mutual: 12 },
            { id: 6, name: "Frank Miller", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face", status: "Active 1 day ago", online: false, mutual: 19 }
        ];

        const groupsData = [
            {
                id: 1,
                name: "Web Developers United",
                description: "A community for passionate web developers sharing knowledge and projects.",
                members: 1248,
                lastActivity: "2 hours ago",
                memberAvatars: [
                    "https://images.unsplash.com/photo-1494790108755-2616b9a1ee27?w=50&h=50&fit=crop&crop=face",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
                    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face"
                ]
            },
            {
                id: 2,
                name: "Photography Enthusiasts",
                description: "Share your best shots and learn from fellow photographers.",
                members: 892,
                lastActivity: "5 minutes ago",
                memberAvatars: [
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face",
                    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop&crop=face",
                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face"
                ]
            },
            {
                id: 3,
                name: "Tech Startups Network",
                description: "Connect with entrepreneurs and share startup experiences.",
                members: 2156,
                lastActivity: "1 day ago",
                memberAvatars: [
                    "https://images.unsplash.com/photo-1494790108755-2616b9a1ee27?w=50&h=50&fit=crop&crop=face",
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face",
                    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face"
                ]
            },
            {
                id: 4,
                name: "Book Club Society",
                description: "Monthly book discussions and literary conversations.",
                members: 456,
                lastActivity: "3 hours ago",
                memberAvatars: [
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
                    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop&crop=face",
                    "https://images.unsplash.com/photo-1494790108755-2616b9a1ee27?w=50&h=50&fit=crop&crop=face"
                ]
            }
        ];

        const mockUserData = {
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face"
        };

        document.getElementById('collapsed-avatar').style.backgroundImage = `url("${mockUserData.avatar}")`;

        function toggleRequests() {
            const dropdown = document.getElementById('requests-dropdown');
            dropdown.classList.toggle('active');
        }
        document.addEventListener('click', function(event) {
            const toggle = document.querySelector('.friend-requests-toggle');
            const dropdown = document.getElementById('requests-dropdown');
            
            if (!toggle.contains(event.target)) {
                dropdown.classList.remove('active');
            }
        });


        function acceptRequest(id) {
            console.log(`Accepting friend request ${id}`);
            const countElement = document.querySelector('.requests-count');
            let currentCount = parseInt(countElement.textContent);
            countElement.textContent = Math.max(0, currentCount - 1);
            event.target.closest('.request-item').remove();
        }

        function declineRequest(id) {
            console.log(`Declining friend request ${id}`);
            const countElement = document.querySelector('.requests-count');
            let currentCount = parseInt(countElement.textContent);
            countElement.textContent = Math.max(0, currentCount - 1);
            event.target.closest('.request-item').remove();
        }

        function loadFriends(filter = 'all') {
            const friendsGrid = document.getElementById('friends-grid');
            let filteredFriends = friendsData;

            if (filter === 'online') {
                filteredFriends = friendsData.filter(f => f.online);
            } else if (filter === 'recent') {
                filteredFriends = friendsData.filter(f =>
                    f.status.includes('minutes') || f.status.includes('hour')
                );
            } else if (filter === 'mutual') {
                filteredFriends = friendsData.filter(f => f.mutual > 10);
            }

            friendsGrid.innerHTML = filteredFriends.map(friend => `
                <div class="friend-card" onclick="viewFriend(${friend.id})">
                    <div class="online-indicator ${friend.online ? '' : 'offline'}"></div>
                    <div class="friend-card-content">
                        <div class="friend-avatar-large" style="background-image: url('${friend.avatar}')"></div>
                        <div class="friend-info">
                            <div class="friend-name">${friend.name}</div>
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

        function loadGroups() {
            const groupsGrid = document.getElementById('groups-grid');
            groupsGrid.innerHTML = groupsData.map(group => `
                <div class="group-card" onclick="viewGroup(${group.id})">
                    <div class="group-header"></div>
                    <div class="group-content">
                        <div class="group-name">${group.name}</div>
                        <div class="group-description">${group.description}</div>
                        <div class="group-stats">
                            <div class="group-members">
                                <i class="bi bi-people-fill me-1"></i>
                                ${group.members.toLocaleString()} members
                            </div>
                            <div class="group-activity">${group.lastActivity}</div>
                        </div>
                        <div class="group-avatar-stack">
                            ${group.memberAvatars.map(avatar =>
                                `<div class="group-member-avatar" style="background-image: url('${avatar}')"></div>`
                            ).join('')}
                            <div class="group-member-avatar" style="background: var(--p-color); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 600;">
                                +${Math.floor(Math.random() * 20) + 5}
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

        function navigateTo(page) {
            console.log(`Navigating to ${page}`);
            if (page === 'feed') window.location.href = 'profile.html';
        }

        function viewFriend(id) { console.log(`Viewing friend ${id}`); }
        function viewProfile(id) { console.log(`Viewing profile ${id}`); }
        function sendMessage(id) { console.log(`Sending message to ${id}`); }
        function viewGroup(id) { console.log(`Viewing group ${id}`); }
        function addFriend() { console.log('Add friend modal'); }
        function createGroup() { console.log('Create group modal'); }
        loadFriends();