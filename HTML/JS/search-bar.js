// search-bar.js - Standalone search functionality
// This file should be loaded after the main profile.js

document.addEventListener('DOMContentLoaded', function() {
  // Wait a bit for Firebase data to load
  setTimeout(initializeSearchBar, 1000);
});

function initializeSearchBar() {
  const userCardTemplate = document.querySelector("[data-user-template]");
  const userCardContainer = document.querySelector("[data-user-cards-container]");
  const searchInput = document.querySelector("[data-search]");
  
  if (!userCardTemplate || !userCardContainer || !searchInput) {
    console.warn("Search elements not found in DOM");
    return;
  }

  let searchUsers = [];

  searchUsers = mockSearchUsers.map(user => {
    const card = userCardTemplate.content.cloneNode(true).children[0];
    const header = card.querySelector("[data-header]");
    const body = card.querySelector("[data-body]");
    
    header.textContent = user.username;
    body.textContent = user.email;
    card.addEventListener('click', function(e) {
      e.preventDefault();
      console.log(`Selected user: ${user.username}`);
      searchInput.value = user.username;
      userCardContainer.classList.add('hide');
      // window.location.href = `profile.html?userId=${user.id}`;
    });
    
    userCardContainer.appendChild(card);
    
    return {
      ...user,
      element: card
    };
  });

  // Search input event handler
  searchInput.addEventListener("input", function(e) {
    const value = e.target.value.toLowerCase();
    
    if (value.trim() === '') {
      userCardContainer.classList.add('hide');
      return;
    }
    
    let hasVisibleResults = false;
    
    searchUsers.forEach(user => {
      const nameMatch = user.username.toLowerCase().includes(value);
      const emailMatch = user.email.toLowerCase().includes(value);
      const isVisible = nameMatch || emailMatch;
      
      user.element.classList.toggle("hide", !isVisible);
      
      if (isVisible) {
        hasVisibleResults = true;
      }
    });
    
    // Show/hide container based on results
    userCardContainer.classList.toggle('hide', !hasVisibleResults);
  });

  // Focus event - show results if there's input
  searchInput.addEventListener('focus', function() {
    if (this.value.trim() !== '') {
      userCardContainer.classList.remove('hide');
    }
  });

  // Blur event - hide results with delay for clicks
  searchInput.addEventListener('blur', function() {
    setTimeout(() => {
      userCardContainer.classList.add('hide');
    }, 200);
  });

  // Click outside to close
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.indicator')) {
      userCardContainer.classList.add('hide');
    }
  });

  console.log("Search bar initialized successfully!");
}