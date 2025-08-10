import {
  getAllUsers,
  getAllPosts,
  deleteUser,
  getDashboardStats,
  createUser,
  updateUser,
  addUserToGroup,
  deletePost,
  getUserFollowers,
  getUserFollowing,
  createRandomUsers,
} from "./firebase-config.js";
import { auth, onAuthStateChanged } from "./firebase.js";

let filteredUsers = [];
let filteredPosts = [];
let allUsers = [];
let allPosts = [];
let currentUsersSort = { field: null, direction: "asc" };
let currentPostsSort = { field: null, direction: "asc" };
let currentUser = null; // Declare currentUser globally

const bootstrap = window.bootstrap;
const adminEmail = "admin@gmail.com";

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Content Loaded - Checking authentication...");

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      console.log("No user logged in, redirecting to login...");
      window.location.href = "login.html";
      return;
    }

    if (user.email.toLowerCase() !== adminEmail.toLowerCase()) {
      console.log("Not an admin:", user.email);
      alert("Bạn không có quyền truy cập trang quản trị.");
      window.location.href = "profile.html";
      return;
    }

    // Nếu đúng admin
    currentUser = { email: user.email, uid: user.uid };
    updateUserHeader();
    showLoadingState();
    await initializeApp();
    setupEventListeners();
    showTab("posts");
  });
});

function updateUserHeader() {
  const brandText = document.querySelector(".brand-text");
  if (brandText && currentUser) {
    brandText.innerHTML = `
      <h5>Firebase Admin</h5>
      <small>Xin chào, ${currentUser.email}</small>
    `;
  }
}

async function initializeApp() {
  try {
    console.log("Initializing app...");
    await loadInitialData();
    await updateDashboardStats();
    hideLoadingState();
    showNotification(
      `Chào mừng ${currentUser.email}! User ID: ${currentUser.uid}`,
      "success"
    );
    console.log("App initialized successfully!");
  } catch (error) {
    console.error("Error initializing app:", error);
    hideLoadingState();
    showNotification("Lỗi khi tải dữ liệu: " + error.message, "danger");
  }
}

async function loadInitialData() {
  try {
    console.log("Loading initial data...");

    const users = await getAllUsers();
    console.log("Users loaded:", users);

    const posts = await getAllPosts();
    console.log("Posts loaded:", posts);

    allUsers = users || [];
    allPosts = posts || [];
    filteredUsers = [...allUsers];
    filteredPosts = [...allPosts];

    renderUsersTable();
    renderPostsTable();
    updatePostsStats();

    console.log("Initial data loaded successfully");
  } catch (error) {
    console.error("Error in loadInitialData:", error);
    throw error;
  }
}

async function updateDashboardStats() {
  try {
    const stats = await getDashboardStats();

    const dashboardTotalUsers = document.getElementById("dashboardTotalUsers");
    const dashboardTotalPosts = document.getElementById("dashboardTotalPosts");
    const dashboardTotalComments = document.getElementById(
      "dashboardTotalComments"
    );
    const dashboardTotalViews = document.getElementById("dashboardTotalViews");

    if (dashboardTotalUsers) dashboardTotalUsers.textContent = stats.totalUsers;
    if (dashboardTotalPosts) dashboardTotalPosts.textContent = stats.totalPosts;
    if (dashboardTotalComments)
      dashboardTotalComments.textContent = stats.totalComments;
    if (dashboardTotalViews)
      dashboardTotalViews.textContent = stats.totalViews.toLocaleString();

    const totalPostsEl = document.getElementById("totalPosts");
    const publishedPostsEl = document.getElementById("publishedPosts");
    const draftPostsEl = document.getElementById("draftPosts");
    const totalViewsEl = document.getElementById("totalViews");

    if (totalPostsEl) totalPostsEl.textContent = stats.totalPosts;
    if (publishedPostsEl) publishedPostsEl.textContent = stats.publishedPosts;
    if (draftPostsEl) draftPostsEl.textContent = stats.draftPosts;
    if (totalViewsEl)
      totalViewsEl.textContent = stats.totalViews.toLocaleString();
  } catch (error) {
    console.error("Error updating dashboard stats:", error);
  }
}

function setupEventListeners() {
  console.log("Setting up event listeners...");

  const userSearch = document.getElementById("userSearch");
  const userRoleFilter = document.getElementById("userRoleFilter");

  if (userSearch) {
    userSearch.addEventListener("input", debounce(filterUsers, 300));
  }
  if (userRoleFilter) {
    userRoleFilter.addEventListener("change", filterUsers);
  }

  const postSearch = document.getElementById("postSearch");
  const postStatusFilter = document.getElementById("postStatusFilter");
  const postCategoryFilter = document.getElementById("postCategoryFilter");

  if (postSearch) {
    postSearch.addEventListener("input", debounce(filterPosts, 300));
  }
  if (postStatusFilter) {
    postStatusFilter.addEventListener("change", filterPosts);
  }
  if (postCategoryFilter) {
    postCategoryFilter.addEventListener("change", filterPosts);
  }

  document.querySelectorAll("#usersTable .sortable").forEach((header) => {
    header.addEventListener("click", () => sortUsers(header.dataset.sort));
  });

  document.querySelectorAll("#postsTable .sortable").forEach((header) => {
    header.addEventListener("click", () => sortPosts(header.dataset.sort));
  });

  console.log("Event listeners set up successfully!");
}

function showTab(tabName) {
  console.log("Showing tab:", tabName);

  document.querySelectorAll(".tab-pane").forEach((tab) => {
    tab.style.display = "none";
  });

  document.querySelectorAll(".sidebar-nav .nav-link").forEach((link) => {
    link.classList.remove("active");
  });

  const selectedTab = document.getElementById(tabName + "-tab");
  if (selectedTab) {
    selectedTab.style.display = "block";
  }

  // Check if event is defined before accessing event.target
  if (event && event.target) {
    const navLink = event.target.closest(".nav-link");
    if (navLink) {
      navLink.classList.add("active");
    }
  }

  if (tabName === "users") {
    console.log("Users tab selected - force refresh");
    setTimeout(() => {
      renderUsersTable();
    }, 100);
  }

  if (tabName === "dashboard") {
    updateDashboardStats();
  }
}

function filterUsers() {
  const searchTerm =
    document.getElementById("userSearch")?.value.toLowerCase() || "";
  const roleFilter = document.getElementById("userRoleFilter")?.value || "";

  filteredUsers = allUsers.filter((user) => {
    const matchesSearch =
      searchTerm === "" ||
      user.username?.toLowerCase().includes(searchTerm) ||
      user.email?.toLowerCase().includes(searchTerm);

    const matchesRole = roleFilter === "" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  renderUsersTable();
}

function clearUserFilters() {
  const userSearch = document.getElementById("userSearch");
  const userRoleFilter = document.getElementById("userRoleFilter");

  if (userSearch) userSearch.value = "";
  if (userRoleFilter) userRoleFilter.value = "";

  filteredUsers = [...allUsers];
  renderUsersTable();
}

function sortUsers(field) {
  const direction =
    currentUsersSort.field === field && currentUsersSort.direction === "asc"
      ? "desc"
      : "asc";
  currentUsersSort = { field, direction };

  filteredUsers.sort((a, b) => {
    let aVal = a[field];
    let bVal = b[field];

    if (typeof aVal === "string") {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (direction === "asc") {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  updateSortIndicators("#usersTable", field, direction);
  renderUsersTable();
}

function getPlaceholderAvatar(width = 40, height = 40, name = "User") {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&size=${width}&background=7f5af0&color=ffffff&bold=true`;
}

function renderUsersTable() {
  console.log("Rendering users table...");
  console.log("Filtered users:", filteredUsers.length);

  const tbody = document.getElementById("usersTableBody");
  if (!tbody) {
    console.error("Users table body element not found!");
    return;
  }

  tbody.innerHTML = "";

  if (!filteredUsers || filteredUsers.length === 0) {
    console.log("No users to display");
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-5">
          <i class="bi bi-search fa-3x text-muted mb-3"></i>
          <h5 class="text-muted">Không tìm thấy người dùng nào</h5>
          <p class="text-muted">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
        </td>
      </tr>
    `;
    return;
  }

  console.log("Starting to render users...");

  filteredUsers.forEach((user, index) => {
    console.log(`Rendering user ${index + 1}:`, user);

    try {
      const avatarUrl =
        user.avatar || getPlaceholderAvatar(40, 40, user.username || "User");

      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="col-id"><strong>${user.id || "N/A"}</strong></td>
        <td class="col-user">
          <div class="d-flex align-items-center">
            <img src="${avatarUrl}" 
                 alt="Avatar" 
                 class="rounded-circle me-3 avatar" 
                 onerror="this.src='${getPlaceholderAvatar(
        40,
        40,
        user.username || "User"
      )}'">
            <div style="min-width: 0; flex: 1;">
              <div class="fw-bold" title="${user.username || "N/A"}">${user.username || "N/A"
        }</div>
              <small class="text-muted">
                <i class="bi bi-person-plus me-1"></i>${user.followers || 0}
                <i class="bi bi-person-check ms-2 me-1"></i>${user.following || 0
        }
              </small>
            </div>
          </div>
        </td>
        <td class="col-email" title="${user.email || "N/A"}">${user.email || "N/A"
        }</td>
        <td class="col-role">
          <span class="badge bg-${getRoleBadgeColor(
          user.role
        )}">${getRoleDisplayName(user.role)}</span>
        </td>
        <td class="col-date">${formatDate(user.joinDate)}</td>
        <td class="col-status">
          <span class="badge bg-${user.status === "active" ? "success" : "secondary"
        }">
            ${user.status === "active" ? "Hoạt động" : "Không hoạt động"}
          </span>
        </td>
        <td class="col-actions">
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary" onclick="editUser('${user.id
        }')" title="Chỉnh sửa">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-outline-success" onclick="viewUserFollowers('${user.id
        }')" title="Xem Followers">
              <i class="bi bi-people"></i>
            </button>
            <button class="btn btn-outline-info" onclick="viewUserFollowing('${user.id
        }')" title="Xem Following">
              <i class="bi bi-person-check"></i>
            </button>
            <button class="btn btn-outline-danger" onclick="deleteUserConfirm('${user.id
        }')" title="Xóa">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(row);
      console.log(`User ${index + 1} rendered successfully`);
    } catch (error) {
      console.error(`Error rendering user ${index + 1}:`, error);
    }
  });

  updatePagination("users", filteredUsers.length);
  console.log("Users table rendered successfully");
}

function filterPosts() {
  const searchTerm =
    document.getElementById("postSearch")?.value.toLowerCase() || "";
  const statusFilter = document.getElementById("postStatusFilter")?.value || "";
  const categoryFilter =
    document.getElementById("postCategoryFilter")?.value || "";

  filteredPosts = allPosts.filter((post) => {
    const matchesSearch =
      searchTerm === "" ||
      post.title?.toLowerCase().includes(searchTerm) ||
      post.author?.toLowerCase().includes(searchTerm);

    const matchesStatus = statusFilter === "" || post.status === statusFilter;
    const matchesCategory =
      categoryFilter === "" || post.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  renderPostsTable();
  updatePostsStats();
}

function clearPostFilters() {
  const postSearch = document.getElementById("postSearch");
  const postStatusFilter = document.getElementById("postStatusFilter");
  const postCategoryFilter = document.getElementById("postCategoryFilter");

  if (postSearch) postSearch.value = "";
  if (postStatusFilter) postStatusFilter.value = "";
  if (postCategoryFilter) postCategoryFilter.value = "";

  filteredPosts = [...allPosts];
  renderPostsTable();
  updatePostsStats();
}

function sortPosts(field) {
  const direction =
    currentPostsSort.field === field && currentPostsSort.direction === "asc"
      ? "desc"
      : "asc";
  currentPostsSort = { field, direction };

  filteredPosts.sort((a, b) => {
    let aVal = a[field];
    let bVal = b[field];

    if (typeof aVal === "string") {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (direction === "asc") {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  updateSortIndicators("#postsTable", field, direction);
  renderPostsTable();
}

function renderPostsTable() {
  const tbody = document.getElementById("postsTableBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (filteredPosts.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-5">
          <i class="bi bi-search fa-3x text-muted mb-3"></i>
          <h5 class="text-muted">Không tìm thấy bài viết nào</h5>
          <p class="text-muted">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
        </td>
      </tr>
    `;
    return;
  }

  filteredPosts.forEach((post) => {
    const authorAvatar =
      post.authorAvatar ||
      getPlaceholderAvatar(35, 35, post.author || "Author");

    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="col-id"><strong>${post.id}</strong></td>
      <td class="col-title">
        <div class="fw-bold mb-1" title="${post.title || "Không có tiêu đề"
      }">${highlightSearchTerm(
        post.title || "Không có tiêu đề",
        "postSearch"
      )}</div>
        <small class="text-muted">${(post.content || "").substring(
        0,
        60
      )}...</small>
      </td>
      <td class="col-author">
        <div class="d-flex align-items-center">
          <img src="${authorAvatar}" 
               alt="Avatar" 
               class="avatar me-2" 
               onerror="this.src='${getPlaceholderAvatar(
        35,
        35,
        post.author || "Author"
      )}'">
          <span class="fw-semibold" title="${post.author || "N/A"
      }">${highlightSearchTerm(post.author || "N/A", "postSearch")}</span>
        </div>
      </td>
      <td class="col-category">
        <span class="badge bg-${getCategoryBadgeColor(
        post.category
      )}">${getCategoryDisplayName(post.category)}</span>
      </td>
      <td class="col-status">
        <span class="badge bg-${getStatusBadgeColor(
        post.status
      )}">${getStatusDisplayName(post.status)}</span>
      </td>
      <td class="col-views">
        <div class="d-flex align-items-center">
          <i class="bi bi-eye text-muted me-2"></i>
          <strong>${(post.views || 0).toLocaleString()}</strong>
        </div>
      </td>
      <td class="col-date">${formatDate(post.createdAt)}</td>
      <td class="col-actions">
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-primary" onclick="editPost('${post.id
      }')" title="Chỉnh sửa">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-outline-success" onclick="viewPost('${post.id
      }')" title="Xem">
            <i class="bi bi-eye"></i>
          </button>
          <button class="btn btn-outline-danger" onclick="deletePostConfirm('${post.id
      }')" title="Xóa">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });

  updatePagination("posts", filteredPosts.length);
}

function updatePostsStats() {
  const total = allPosts.length;
  const published = allPosts.filter((p) => p.status === "published").length;
  const draft = allPosts.filter((p) => p.status === "draft").length;
  const totalViews = allPosts.reduce((sum, p) => sum + (p.views || 0), 0);

  const totalPostsEl = document.getElementById("totalPosts");
  const publishedPostsEl = document.getElementById("publishedPosts");
  const draftPostsEl = document.getElementById("draftPosts");
  const totalViewsEl = document.getElementById("totalViews");

  if (totalPostsEl) totalPostsEl.textContent = total;
  if (publishedPostsEl) publishedPostsEl.textContent = published;
  if (draftPostsEl) draftPostsEl.textContent = draft;
  if (totalViewsEl) totalViewsEl.textContent = totalViews.toLocaleString();
}

function addPost() {
  showNotification(
    "Chức năng tạo bài viết sẽ được tích hợp với phần của Mai Anh",
    "info"
  );
}

async function editUser(userId) {
  const user = allUsers.find((u) => u.id === userId);
  if (!user) {
    showNotification("Không tìm thấy người dùng!", "danger");
    return;
  }

  document.getElementById("editUserId").value = user.id;
  document.getElementById("editUsername").value = user.username || "";
  document.getElementById("editEmail").value = user.email || "";
  document.getElementById("editRole").value = user.role || "user";
  document.getElementById("editAvatar").value = user.avatar || "";
  document.getElementById("editStatus").value = user.status || "active";
  document.getElementById("editBio").value = user.bio || "";
  document.getElementById("editCoverImage").value = user.coverImage || "";
  document.getElementById("editFollowers").value = user.followers || 0;
  document.getElementById("editFollowing").value = user.following || 0;

  const modal = new bootstrap.Modal(document.getElementById("editUserModal"));
  modal.show();
}

async function deleteUserConfirm(userId) {
  if (confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
    showLoadingState();

    try {
      const result = await deleteUser(userId);

      if (result.success) {
        showNotification(result.message, "success");

        const users = await getAllUsers();
        allUsers = users;
        filteredUsers = [...users];
        renderUsersTable();
      } else {
        showNotification(result.message, "danger");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      showNotification("Lỗi khi xóa người dùng: " + error.message, "danger");
    } finally {
      hideLoadingState();
    }
  }
}

function editPost(postId) {
  showNotification(`Chỉnh sửa bài viết ID: ${postId}`, "info");
}

function viewPost(postId) {
  showNotification(`Xem bài viết ID: ${postId}`, "info");
}

async function deletePostConfirm(postId) {
  if (confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
    showLoadingState();

    try {
      const result = await deletePost(postId);

      if (result.success) {
        showNotification(result.message, "success");

        const posts = await getAllPosts();
        allPosts = posts;
        filteredPosts = [...posts];
        renderPostsTable();
        updatePostsStats();
      } else {
        showNotification(result.message, "danger");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      showNotification("Lỗi khi xóa bài viết: " + error.message, "danger");
    } finally {
      hideLoadingState();
    }
  }
}

async function updateUserInfo() {
  const userId = document.getElementById("editUserId")?.value;
  const username = document.getElementById("editUsername")?.value;
  const email = document.getElementById("editEmail")?.value;
  const role = document.getElementById("editRole")?.value;
  const avatar = document.getElementById("editAvatar")?.value;
  const status = document.getElementById("editStatus")?.value;
  const bio = document.getElementById("editBio")?.value;

  if (!userId || !username || !email) {
    showNotification("Vui lòng điền đầy đủ thông tin bắt buộc!", "warning");
    return;
  }

  showLoadingState();

  try {
    const userData = {
      username: username,
      email: email,
      avatar: avatar || "",
      coverImage: document.getElementById("editCoverImage")?.value || "",
      bio: bio || "",
      role: role || "user",
      status: status || "active",
      followers:
        Number.parseInt(document.getElementById("editFollowers")?.value) || 0,
      following:
        Number.parseInt(document.getElementById("editFollowing")?.value) || 0,
    };

    const result = await updateUser(userId, userData);

    if (result.success) {
      showNotification(result.message, "success");

      const modal = bootstrap.Modal.getInstance(
        document.getElementById("editUserModal")
      );
      if (modal) modal.hide();

      const users = await getAllUsers();
      allUsers = users;
      filteredUsers = [...users];
      renderUsersTable();

      console.log("User updated successfully:", userData);
    } else {
      showNotification(result.message, "danger");
      console.error("Failed to update user:", result.message);
    }
  } catch (error) {
    console.error("Error updating user:", error);
    showNotification("Lỗi khi cập nhật user: " + error.message, "danger");
  } finally {
    hideLoadingState();
  }
}

async function createNewUser() {
  const username = document.getElementById("newUsername")?.value;
  const email = document.getElementById("newEmail")?.value;
  const role = document.getElementById("newRole")?.value;
  const avatar = document.getElementById("newAvatar")?.value;
  const status = document.getElementById("newStatus")?.value;
  const bio = document.getElementById("newBio")?.value;

  if (!username || !email) {
    showNotification("Vui lòng điền đầy đủ thông tin bắt buộc!", "warning");
    return;
  }

  showLoadingState();

  try {
    const userId =
      "admin_created_" +
      Date.now() +
      "_" +
      Math.random().toString(36).substr(2, 5);

    const userData = {
      username: username,
      email: email,
      avatar: avatar || "",
      coverImage: document.getElementById("newCoverImage")?.value || "",
      bio: bio || "",
      role: role || "user",
      status: status || "active",
      followers:
        Number.parseInt(document.getElementById("newFollowers")?.value) || 0,
      following:
        Number.parseInt(document.getElementById("newFollowing")?.value) || 0,
    };

    const result = await createUser(userId, userData);

    if (result.success) {
      showNotification(result.message, "success");

      document.getElementById("createUserForm")?.reset();
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("createUserModal")
      );
      if (modal) modal.hide();

      const users = await getAllUsers();
      allUsers = users;
      filteredUsers = [...users];
      renderUsersTable();

      console.log("User created successfully:", userData);
    } else {
      showNotification(result.message, "danger");
      console.error("Failed to create user:", result.message);
    }
  } catch (error) {
    console.error("Error creating user:", error);
    showNotification("Lỗi khi tạo user: " + error.message, "danger");
  } finally {
    hideLoadingState();
  }
}

function highlightSearchTerm(text, inputId) {
  const searchInput = document.getElementById(inputId);
  if (!searchInput) return text;

  const searchTerm = searchInput.value.toLowerCase().trim();
  if (!searchTerm) return text;

  const regex = new RegExp(`(${searchTerm})`, "gi");
  return text.replace(regex, '<span class="highlight">$1</span>');
}

function getRoleBadgeColor(role) {
  const colors = {
    admin: "danger",
    moderator: "warning",
    user: "primary",
  };
  return colors[role] || "secondary";
}

function getRoleDisplayName(role) {
  const names = {
    admin: "Quản trị viên",
    moderator: "Điều hành viên",
    user: "Người dùng",
  };
  return names[role] || role;
}

function getCategoryBadgeColor(category) {
  const colors = {
    technology: "primary",
    lifestyle: "success",
    business: "warning",
    education: "info",
  };
  return colors[category] || "secondary";
}

function getCategoryDisplayName(category) {
  const names = {
    technology: "Công nghệ",
    lifestyle: "Đời sống",
    business: "Kinh doanh",
    education: "Giáo dục",
  };
  return names[category] || category;
}

function getStatusBadgeColor(status) {
  const colors = {
    published: "success",
    draft: "warning",
    pending: "info",
    archived: "secondary",
  };
  return colors[status] || "secondary";
}

function getStatusDisplayName(status) {
  const names = {
    published: "Đã xuất bản",
    draft: "Bản nháp",
    pending: "Chờ duyệt",
    archived: "Lưu trữ",
  };
  return names[status] || status;
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
}

function updateSortIndicators(tableSelector, field, direction) {
  document.querySelectorAll(`${tableSelector} .sortable`).forEach((header) => {
    header.classList.remove("sort-asc", "sort-desc");
  });

  const currentHeader = document.querySelector(
    `${tableSelector} [data-sort="${field}"]`
  );
  if (currentHeader) {
    currentHeader.classList.add(direction === "asc" ? "sort-asc" : "sort-desc");
  }
}

function updatePagination(type, totalItems) {
  const paginationElement = document.getElementById(`${type}Pagination`);
  if (paginationElement) {
    paginationElement.textContent = `Hiển thị 1-${totalItems} của ${totalItems} kết quả`;
  }
}

function showNotification(message, type = "info") {
  const alertClass =
    {
      success: "alert-success",
      warning: "alert-warning",
      danger: "alert-danger",
      info: "alert-info",
    }[type] || "alert-info";

  const iconClass =
    {
      success: "bi-check-circle",
      warning: "bi-exclamation-triangle",
      danger: "bi-x-circle",
      info: "bi-info-circle",
    }[type] || "bi-info-circle";

  let notificationContainer = document.getElementById("notificationContainer");
  if (!notificationContainer) {
    notificationContainer = document.createElement("div");
    notificationContainer.id = "notificationContainer";
    notificationContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      max-width: 400px;
      pointer-events: none;
    `;
    document.body.appendChild(notificationContainer);
  }

  const notification = document.createElement("div");
  notification.className = `alert ${alertClass} alert-dismissible fade show notification mb-3`;
  notification.style.cssText = `
    pointer-events: auto;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    border: none;
    animation: slideInRight 0.3s ease-out;
  `;
  notification.innerHTML = `
    <i class="${iconClass} me-2"></i>
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;

  if (!document.getElementById("notificationStyles")) {
    const style = document.createElement("style");
    style.id = "notificationStyles";
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
      
      .notification-exit {
        animation: slideOutRight 0.3s ease-in forwards;
      }
    `;
    document.head.appendChild(style);
  }

  notificationContainer.insertBefore(
    notification,
    notificationContainer.firstChild
  );

  const closeBtn = notification.querySelector(".btn-close");
  closeBtn.addEventListener("click", () => {
    notification.classList.add("notification-exit");
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  });

  setTimeout(() => {
    if (notification.parentNode) {
      notification.classList.add("notification-exit");
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }
  }, 5000);

  const notifications = notificationContainer.querySelectorAll(".notification");
  if (notifications.length > 5) {
    const oldestNotification = notifications[notifications.length - 1];
    oldestNotification.classList.add("notification-exit");
    setTimeout(() => {
      if (oldestNotification.parentNode) {
        oldestNotification.remove();
      }
    }, 300);
  }
}

function showLoadingState() {
  const loadingOverlay = document.createElement("div");
  loadingOverlay.id = "loadingOverlay";
  loadingOverlay.className =
    "position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center";
  loadingOverlay.style.backgroundColor = "rgba(0,0,0,0.5)";
  loadingOverlay.style.zIndex = "9999";
  loadingOverlay.innerHTML = `
    <div class="text-center text-white">
      <div class="spinner-border mb-3" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
      <div>Đang xử lý...</div>
    </div>
  `;
  document.body.appendChild(loadingOverlay);
}

function hideLoadingState() {
  const loadingOverlay = document.getElementById("loadingOverlay");
  if (loadingOverlay) {
    loadingOverlay.remove();
  }
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  if (sidebar) {
    sidebar.classList.toggle("show");
  }
}

document.addEventListener("click", (event) => {
  const sidebar = document.getElementById("sidebar");
  const toggle = document.querySelector(".mobile-sidebar-toggle");

  if (
    window.innerWidth <= 768 &&
    sidebar &&
    !sidebar.contains(event.target) &&
    !toggle?.contains(event.target) &&
    sidebar.classList.contains("show")
  ) {
    sidebar.classList.remove("show");
  }
});

async function testCreateUser() {
  const userId = document.getElementById("testUserId")?.value;
  const username = document.getElementById("testUsername")?.value;
  const email = document.getElementById("testEmail")?.value;
  const role = document.getElementById("testRole")?.value;
  const avatar = document.getElementById("testAvatar")?.value;
  const status = document.getElementById("testStatus")?.value;
  const bio = document.getElementById("testBio")?.value;

  if (!userId || !username || !email) {
    showNotification("Vui lòng điền đầy đủ thông tin bắt buộc!", "warning");
    return;
  }

  showLoadingState();

  try {
    const userData = {
      username: username,
      email: email,
      avatar: avatar || "",
      bio: bio || "",
      role: role || "user",
      status: status || "active",
    };

    const result = await createUser(userId, userData);

    if (result.success) {
      showNotification(result.message, "success");

      document.getElementById("testCreateUserForm")?.reset();

      const users = await getAllUsers();
      allUsers = users;
      filteredUsers = [...users];
      renderUsersTable();

      console.log("User created successfully:", userData);
    } else {
      showNotification(result.message, "danger");
      console.error("Failed to create user:", result.message);
    }
  } catch (error) {
    console.error("Error creating user:", error);
    showNotification("Lỗi khi tạo user: " + error.message, "danger");
  } finally {
    hideLoadingState();
  }
}

async function addUserToGroupAction() {
  const userId = document.getElementById("groupUserId")?.value;
  const groupId = document.getElementById("groupId")?.value;
  const groupName = document.getElementById("groupName")?.value;
  const groupRole = document.getElementById("groupRole")?.value;

  if (!userId || !groupId || !groupName) {
    showNotification("Vui lòng điền đầy đủ thông tin!", "warning");
    return;
  }

  showLoadingState();

  try {
    const groupData = {
      groupId: groupId,
      groupName: groupName,
      role: groupRole || "member",
    };

    const result = await addUserToGroup(userId, groupData);

    if (result.success) {
      showNotification(result.message, "success");
      document.getElementById("addUserToGroupForm")?.reset();
    } else {
      showNotification(result.message, "danger");
    }
  } catch (error) {
    console.error("Error adding user to group:", error);
    showNotification("Lỗi: " + error.message, "danger");
  } finally {
    hideLoadingState();
  }
}

function fillSampleData() {
  const randomId = "user_" + Math.random().toString(36).substr(2, 9);
  const sample = {
    id: randomId,
    username: "john_doe_" + Math.floor(Math.random() * 1000),
    email: "john" + Math.floor(Math.random() * 1000) + "@example.com",
    role: "user",
    avatar: "https://ui-avatars.com/api/?name=John+Doe&background=random",
    coverImage:
      "https://picsum.photos/800/200?random=" +
      Math.floor(Math.random() * 1000),
    status: "active",
    bio: "Đây là user test được tạo từ admin dashboard",
    followers: Math.floor(Math.random() * 1000),
    following: Math.floor(Math.random() * 300),
  };

  document.getElementById("testUserId").value = sample.id;
  document.getElementById("testUsername").value = sample.username;
  document.getElementById("testEmail").value = sample.email;
  document.getElementById("testRole").value = sample.role;
  document.getElementById("testAvatar").value = sample.avatar;
  document.getElementById("testStatus").value = sample.status;
  document.getElementById("testBio").value = sample.bio;
}

function exitAdminPage() {
  const confirmExit = confirm(
    "Bạn có chắc chắn muốn thoát khỏi Admin Dashboard?"
  );

  if (confirmExit) {
    try {
      window.close();
    } catch (error) {
      console.log("Cannot close window, redirecting instead...");
    }

    window.location.href = "./profile.html";
  }
}

// ===== FOLLOWERS & FOLLOWING MANAGEMENT =====
async function viewUserFollowers(userId) {
  try {
    showLoadingState();
    const followers = await getUserFollowers(userId);

    let modalHtml = `
      <div class="modal fade" id="followersModal" tabindex="-1">
        <div class="modal-dialog modal-xl">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="bi bi-people me-2"></i>Followers của User: ${userId}
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="row mb-3">
                <div class="col-md-6">
                  <h6>Tổng số followers: <span class="badge bg-primary">${followers.length}</span></h6>
                </div>
                <div class="col-md-6 text-end">
                  <button class="btn btn-success btn-sm" onclick="addRandomFollowersAction('${userId}')">
                    <i class="bi bi-plus-circle me-1"></i>Thêm Random Followers
                  </button>
                </div>
              </div>
              
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Mutual</th>
                      <th>Source</th>
                      <th>Followed At</th>
                      <th>Interactions</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
    `;

    followers.forEach((follower) => {
      modalHtml += `
        <tr>
          <td>
            <div class="d-flex align-items-center">
              <img src="${follower.avatar ||
        getPlaceholderAvatar(35, 35, follower.username)
        }" 
                   class="avatar me-2" alt="Avatar">
              <div>
                <div class="fw-bold">${follower.username || "N/A"}</div>
                <small class="text-muted">${follower.userId}</small>
              </div>
            </div>
          </td>
          <td>
            <span class="badge bg-${follower.mutualFollows ? "success" : "secondary"
        }">
              ${follower.mutualFollows ? "Mutual" : "One-way"}
            </span>
          </td>
          <td>
            <span class="badge bg-info">${follower.source || "direct"}</span>
          </td>
          <td>${follower.followedAt || "N/A"}</td>
          <td>
            <span class="badge bg-warning">${follower.interactionCount || 0
        }</span>
          </td>
          <td>
            <span class="badge bg-${follower.status === "active" ? "success" : "secondary"
        }">
              ${follower.status || "active"}
            </span>
          </td>
        </tr>
      `;
    });

    modalHtml += `
                  </tbody>
                </table>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById("followersModal");
    if (existingModal) {
      existingModal.remove();
    }

    // Add new modal to body
    document.body.insertAdjacentHTML("beforeend", modalHtml);

    // Show modal
    const modal = new bootstrap.Modal(
      document.getElementById("followersModal")
    );
    modal.show();
  } catch (error) {
    console.error("Error viewing followers:", error);
    showNotification("Lỗi khi xem followers: " + error.message, "danger");
  } finally {
    hideLoadingState();
  }
}

async function viewUserFollowing(userId) {
  try {
    showLoadingState();
    const following = await getUserFollowing(userId);

    let modalHtml = `
      <div class="modal fade" id="followingModal" tabindex="-1">
        <div class="modal-dialog modal-xl">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="bi bi-person-check me-2"></i>Following của User: ${userId}
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="row mb-3">
                <div class="col-md-6">
                  <h6>Tổng số following: <span class="badge bg-success">${following.length}</span></h6>
                </div>
                <div class="col-md-6 text-end">
                  <button class="btn btn-primary btn-sm" onclick="addRandomFollowingAction('${userId}')">
                    <i class="bi bi-plus-circle me-1"></i>Thêm Random Following
                  </button>
                </div>
              </div>
              
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Notifications</th>
                      <th>Followed At</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
    `;

    following.forEach((follow) => {
      modalHtml += `
        <tr>
          <td>
            <div class="d-flex align-items-center">
              <img src="${follow.avatar || getPlaceholderAvatar(35, 35, follow.username)
        }" 
                   class="avatar me-2" alt="Avatar">
              <div>
                <div class="fw-bold">${follow.username || "N/A"}</div>
                <small class="text-muted">${follow.userId}</small>
              </div>
            </div>
          </td>
          <td>
            <span class="badge bg-${getCategoryColor(follow.category)}">${follow.category || "general"
        }</span>
          </td>
          <td>
            <span class="badge bg-${getPriorityColor(follow.priority)}">${follow.priority || "normal"
        }</span>
          </td>
          <td>
            <span class="badge bg-${follow.notifications ? "success" : "secondary"
        }">
              ${follow.notifications ? "ON" : "OFF"}
            </span>
          </td>
          <td>${follow.followedAt || "N/A"}</td>
          <td>
            <span class="badge bg-${follow.status === "active" ? "success" : "secondary"
        }">
              ${follow.status || "active"}
            </span>
          </td>
        </tr>
      `;
    });

    modalHtml += `
                  </tbody>
                </table>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById("followingModal");
    if (existingModal) {
      existingModal.remove();
    }

    // Add new modal to body
    document.body.insertAdjacentHTML("beforeend", modalHtml);

    // Show modal
    const modal = new bootstrap.Modal(
      document.getElementById("followingModal")
    );
    modal.show();
  } catch (error) {
    console.error("Error viewing following:", error);
    showNotification("Lỗi khi xem following: " + error.message, "danger");
  } finally {
    hideLoadingState();
  }
}

async function addRandomFollowersAction(userId) {
  const count = prompt("Nhập số lượng followers random muốn thêm:", "5");
  if (!count || isNaN(count)) return;

  try {
    showLoadingState();
    const result = await addRandomFollowersToUser(
      userId,
      Number.parseInt(count)
    );

    if (result.success) {
      showNotification(result.message, "success");
      // Refresh the modal
      setTimeout(() => viewUserFollowers(userId), 1000);
    } else {
      showNotification(result.message, "danger");
    }
  } catch (error) {
    showNotification("Lỗi: " + error.message, "danger");
  } finally {
    hideLoadingState();
  }
}

async function addRandomFollowingAction(userId) {
  const count = prompt("Nhập số lượng following random muốn thêm:", "5");
  if (!count || isNaN(count)) return;

  try {
    showLoadingState();
    const result = await addRandomFollowingToUser(
      userId,
      Number.parseInt(count)
    );

    if (result.success) {
      showNotification(result.message, "success");
      // Refresh the modal
      setTimeout(() => viewUserFollowing(userId), 1000);
    } else {
      showNotification(result.message, "danger");
    }
  } catch (error) {
    showNotification("Lỗi: " + error.message, "danger");
  } finally {
    hideLoadingState();
  }
}

async function createRandomUsersAction() {
  const count = prompt("Nhập số lượng users random muốn tạo:", "10");
  if (!count || isNaN(count)) return;

  try {
    showLoadingState();
    const result = await createRandomUsers(Number.parseInt(count));

    if (result.success) {
      showNotification(result.message, "success");

      // Refresh users table
      const users = await getAllUsers();
      allUsers = users;
      filteredUsers = [...users];
      renderUsersTable();
    } else {
      showNotification(result.message, "danger");
    }
  } catch (error) {
    showNotification("Lỗi: " + error.message, "danger");
  } finally {
    hideLoadingState();
  }
}

function getCategoryColor(category) {
  const colors = {
    friend: "success",
    celebrity: "warning",
    business: "info",
    interest: "primary",
    general: "secondary",
  };
  return colors[category] || "secondary";
}

function getPriorityColor(priority) {
  const colors = {
    high: "danger",
    normal: "primary",
    low: "secondary",
  };
  return colors[priority] || "primary";
}

window.showTab = showTab;
window.addPost = addPost;
window.editUser = editUser;
window.deleteUserConfirm = deleteUserConfirm;
window.editPost = editPost;
window.viewPost = viewPost;
window.deletePostConfirm = deletePostConfirm;
window.clearUserFilters = clearUserFilters;
window.clearPostFilters = clearPostFilters;
window.toggleSidebar = toggleSidebar;
window.testCreateUser = testCreateUser;
window.fillSampleData = fillSampleData;
window.updateUserInfo = updateUserInfo;
window.createNewUser = createNewUser;
window.addUserToGroupAction = addUserToGroupAction;
window.exitAdminPage = exitAdminPage;
window.viewUserFollowers = viewUserFollowers;
window.viewUserFollowing = viewUserFollowing;
window.addRandomFollowersAction = addRandomFollowersAction;
window.addRandomFollowingAction = addRandomFollowingAction;
window.createRandomUsersAction = createRandomUsersAction;
