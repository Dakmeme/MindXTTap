// This script dynamically renders 10 feed posts on page load.
// Each post includes user info, content, a placeholder for media, and action buttons (like, comment, share).
// Now, each post also includes a chat-style message input area below the action buttons.

document.addEventListener("DOMContentLoaded", function() {
    // Locate the feed container element
    const feedContainer = document.querySelector('.feed');
    if (!feedContainer) return; // Exit if feed container is not found

    /**
     * Helper function to create a feed post card element.
     * @param {Object} post - The post data (author, handle, content)
     * @returns {HTMLElement} - The constructed post card element
     */
    function createFeedPost(post) {
        // Create the main card container
        const card = document.createElement('div');
        card.className = "card mb-4";
        card.style.backgroundColor = "var(--main-color)";
        card.style.color = "var(--headline-color)";
        card.style.borderColor = "var(--border-color)";
        card.style.borderRadius = "20px";

        // Card body section
        const cardBody = document.createElement('div');
        cardBody.className = "card-body mb-4";

        // User info row (avatar + name + handle)
        const userRow = document.createElement('div');
        userRow.className = "d-flex align-items-center mb-2";
        // User avatar placeholder
        const userCircle = document.createElement('span');
        userCircle.className = "rounded-circle d-inline-block me-3";
        userCircle.style.width = "40px";
        userCircle.style.height = "40px";
        userCircle.style.backgroundColor = "#fff";
        userCircle.style.display = "flex";
        userCircle.style.alignItems = "center";
        userCircle.style.justifyContent = "center";
        userRow.appendChild(userCircle);

        // User name and handle
        const userInfo = document.createElement('div');
        const userName = document.createElement('h5');
        userName.className = "mb-0";
        userName.style.color = "var(--headline-color)";
        userName.textContent = post.author;
        const userHandle = document.createElement('div');
        userHandle.className = "text-muted small";
        userHandle.style.color = "var(--p-color)";
        userHandle.textContent = post.handle;
        userInfo.appendChild(userName);
        userInfo.appendChild(userHandle);
        userRow.appendChild(userInfo);

        // Post content section
        const postContent = document.createElement('div');
        postContent.className = "mb-2";
        postContent.style.color = "var(--p-color)";
        postContent.textContent = post.content;

        // Placeholder for post media (image/video)
        const postMedia = document.createElement('div');
        postMedia.className = "mb-2";
        postMedia.style.height = "200px";
        postMedia.style.background = "var(--secondary-color)";
        postMedia.style.borderRadius = "20px";

        // Actions row (like, comment, share)
        const actionsRow = document.createElement('div');
        actionsRow.className = "d-flex align-items-center mb-2";

        // Like button
        const likeBtn = document.createElement('button');
        likeBtn.className = "btn btn-outline-danger btn-sm me-2";
        likeBtn.style.color = "var(--highlight-color)";
        likeBtn.style.borderColor = "var(--highlight-color)";
        likeBtn.style.borderRadius = "20px";
        likeBtn.setAttribute("aria-label", "Like");
        likeBtn.innerHTML = '<i class="bi bi-heart"></i>';

        // Comment button
        const commentBtn = document.createElement('button');
        commentBtn.className = "btn btn-outline-secondary btn-sm me-2";
        commentBtn.style.color = "var(--p-color)";
        commentBtn.style.borderColor = "var(--p-color)";
        commentBtn.style.borderRadius = "20px";
        commentBtn.setAttribute("aria-label", "Comment");
        commentBtn.setAttribute("data-bs-toggle", "modal");
        commentBtn.setAttribute("data-bs-target", "#commentModal");
        commentBtn.innerHTML = '<i class="bi bi-chat-dots"></i>';

        // Share button
        const shareBtn = document.createElement('button');
        shareBtn.className = "btn btn-outline-secondary btn-sm";
        shareBtn.style.color = "var(--p-color)";
        shareBtn.style.borderColor = "var(--p-color)";
        shareBtn.style.borderRadius = "20px";
        shareBtn.setAttribute("aria-label", "Share");
        shareBtn.innerHTML = '<i class="bi bi-share"></i>';

        // Add action buttons to the actions row
        actionsRow.appendChild(likeBtn);
        actionsRow.appendChild(commentBtn);
        actionsRow.appendChild(shareBtn);

        // --- Chat-style message input area ---
        const chatSection = document.createElement('div');
        chatSection.className = "d-flex align-items-center mt-3";
        chatSection.style.background = "transparent";
        chatSection.style.padding = "0";

        // Profile avatar/icon (left)
        const chatAvatar = document.createElement('span');
        chatAvatar.className = "rounded-circle d-inline-block";
        chatAvatar.style.width = "36px";
        chatAvatar.style.height = "36px";
        chatAvatar.style.backgroundColor = "#fff";
        chatAvatar.style.display = "flex";
        chatAvatar.style.alignItems = "center";
        chatAvatar.style.justifyContent = "center";
        chatAvatar.style.marginRight = "12px";
        chatSection.appendChild(chatAvatar);

        // Central dark rounded rectangle input
        const chatInputWrapper = document.createElement('div');
        chatInputWrapper.style.flex = "1";
        chatInputWrapper.style.display = "flex";
        chatInputWrapper.style.alignItems = "center";
        chatInputWrapper.style.background = "var(--background-color)";
        chatInputWrapper.style.borderRadius = "20px";
        chatInputWrapper.style.border = "1px solid var(--border-color)";
        chatInputWrapper.style.padding = "0 12px";
        chatInputWrapper.style.marginRight = "12px";
        chatInputWrapper.style.minHeight = "44px";

        const chatInput = document.createElement('input');
        chatInput.type = "text";
        chatInput.className = "form-control border-0 shadow-none";
        chatInput.placeholder = "Write a comment...";
        chatInput.style.background = "transparent";
        // Use CSS for input color instead of inline style
        chatInput.classList.add("chat-input-custom-color");
        chatInput.style.fontSize = "1rem";
        chatInput.style.outline = "none";
        chatInput.style.boxShadow = "none";
        chatInput.style.height = "40px";
        chatInput.style.padding = "0";
        chatInput.setAttribute("aria-label", "Write a comment");

        chatInputWrapper.appendChild(chatInput);

        // Send button (right)
        const sendBtn = document.createElement('button');
        sendBtn.className = "d-flex align-items-center justify-content-center";
        sendBtn.style.width = "40px";
        sendBtn.style.height = "40px";
        sendBtn.style.background = "var(--highlight-color)";
        sendBtn.style.border = "none";
        sendBtn.style.borderRadius = "50%";
        sendBtn.style.color = "var(--b-text-color)";
        sendBtn.style.cursor = "pointer";
        sendBtn.setAttribute("aria-label", "Send comment");
        sendBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M15.854.146a.5.5 0 0 0-.527-.116l-15 6a.5.5 0 0 0 .019.938l6.57 2.19 2.19 6.57a.5.5 0 0 0 .938.019l6-15a.5.5 0 0 0-.116-.527zm-2.89 2.89-4.482 4.482-5.197-1.733 9.679-3.749zm-4.13 5.744 4.482-4.482-3.749 9.679-1.733-5.197z"/>
            </svg>
        `;

        // Simple event handler for demonstration
        sendBtn.addEventListener('click', function() {
            if (chatInput.value.trim() !== "") {
                alert("Message sent: " + chatInput.value);
                chatInput.value = "";
            }
        });

        chatSection.appendChild(chatInputWrapper);
        chatSection.appendChild(sendBtn);

        // Assemble the card body
        cardBody.appendChild(userRow);
        cardBody.appendChild(postContent);
        cardBody.appendChild(postMedia);
        cardBody.appendChild(actionsRow);
        cardBody.appendChild(chatSection); // Add chat-style input area

        // Add card body to card
        card.appendChild(cardBody);
        return card;
    }

    // Add a style block for the input color if not already present
    if (!document.getElementById('chat-input-custom-color-style')) {
        const style = document.createElement('style');
        style.id = 'chat-input-custom-color-style';
        style.textContent = `
            .chat-input-custom-color {
                color: var(--headline-color) !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Example data for 10 posts (authors and contents)
    const authors = [
        {name: "George Jose", handle: "@george"},
        {name: "Alice Smith", handle: "@alice"},
        {name: "Bob Lee", handle: "@bob"},
        {name: "Charlie Kim", handle: "@charlie"},
        {name: "Diana Prince", handle: "@diana"},
        {name: "Eve Adams", handle: "@eve"},
        {name: "Frank Wu", handle: "@frank"},
        {name: "Grace Lin", handle: "@grace"},
        {name: "Henry Ford", handle: "@henry"},
        {name: "Ivy Chen", handle: "@ivy"}
    ];
    const contents = [
        "Lorem ipsum dolor sit amet consectetur. Porttitor.",
        "Had a great day at the park! 🌳",
        "Just finished reading a fantastic book.",
        "Anyone up for a movie night?",
        "Excited to share my new project soon!",
        "Coffee makes everything better ☕",
        "Learning JavaScript is fun!",
        "Check out this amazing sunset.",
        "Feeling grateful for good friends.",
        "Ready for the weekend adventures!"
    ];

    // Render 10 posts using the example data
    for (let i = 0; i < 10; i++) {
        const post = {
            author: authors[i].name,
            handle: authors[i].handle,
            content: contents[i]
        };
        const postCard = createFeedPost(post);
        feedContainer.appendChild(postCard);
    }
});
