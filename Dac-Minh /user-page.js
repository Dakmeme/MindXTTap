// Import Firebase functions
import { getAllUsers, getAllPosts, createPost, deleteUser, deletePost} from "./firebase-config.js"

// Global variables
let allUsers = []
let allPosts = []
let currentUsersSort = { field: null, direction: "asc" }
let currentPostsSort = { field: null, direction: "asc" }
let userStory = []

const bootstrap = window.bootstrap

document.addEventListener("DOMContentLoaded", async () => {
  showLoadingState()
  await initializeApp()
//   setupEventListeners()
  showTab("posts") 
})

// Initialize the application
async function initializeApp() {
  try {
    await loadInitialData()
    hideLoadingState()
    showNotification("Tải dữ liệu thành công!", "success")
  } catch (error) {
    console.error("Lỗi khởi tạo ứng dụng:", error)
    hideLoadingState()
    showNotification("Lỗi khi tải dữ liệu: " + error.message, "danger")
  }
}

// async function loadInitialData() {
//   try {
//     const [users] = await Promise.all([getAllUsers()])

//     allUsers = users
//     allPosts = posts
//     filteredUsers = [...users]
//     filteredPosts = [...posts]

//     renderUsersTable()
//     renderPostsTable()
//     updatePostsStats()
//   } catch (error) {
//     console.error("Lỗi khi tải dữ liệu ban đầu:", error)
//     throw error
//   }
// }


// Event Listeners Setup
// function setupEventListeners() {
//   const userSearch = document.getElementById("userSearch")
//   const userRoleFilter = document.getElementById("userRoleFilter")
//   if (userSearch) {
//     userSearch.addEventListener("input", debounce(filterUsers, 300))
//   }
//   if (userRoleFilter) {
//     userRoleFilter.addEventListener("change", filterUsers)
//   }

//   const postSearch = document.getElementById("postSearch")
//   const postStatusFilter = document.getElementById("postStatusFilter")
//   const postCategoryFilter = document.getElementById("postCategoryFilter")
//   if (postSearch) {
//     postSearch.addEventListener("input", debounce(filterPosts, 300))
//   }
//   if (postStatusFilter) {
//     postStatusFilter.addEventListener("change", filterPosts)
//   }
//   if (postCategoryFilter) {
//     postCategoryFilter.addEventListener("change", filterPosts)
//   }



//   document.querySelectorAll("#usersTable .sortable").forEach((header) => {
//     header.addEventListener("click", () => sortUsers(header.dataset.sort))
//   })
//   document.querySelectorAll("#postsTable .sortable").forEach((header) => {
//     header.addEventListener("click", () => sortPosts(header.dataset.sort))
//   })
// }

// Nav Management
function showTab(tabName) {
  document.querySelectorAll(".tab-pane").forEach((tab) => {
    tab.style.display = "none"
  })
  document.querySelectorAll(".sidebar-nav .nav-link").forEach((link) => {
    link.classList.remove("active")
  })

  // Show selected tab
  const selectedTab = document.getElementById(tabName + "-tab")
  if (selectedTab) {
    selectedTab.style.display = "block"
  }

  // Add active class to clicked nav link
  if (event && event.target) {
    event.target.closest(".nav-link").classList.add("active")
  }
}

// Filter(Hnhu minh lam roi)
// function filterUsers() {
//   const searchTerm = document.getElementById("userSearch")?.value.toLowerCase() || ""
//   const roleFilter = document.getElementById("userRoleFilter")?.value || ""

//   filteredUsers = allUsers.filter((user) => {
//     const matchesSearch =
//       searchTerm === "" ||
//       user.username?.toLowerCase().includes(searchTerm) ||
//       user.email?.toLowerCase().includes(searchTerm)

//     const matchesRole = roleFilter === "" || user.role === roleFilter

//     return matchesSearch && matchesRole
//   })

//   renderUsersTable()
// }

// function clearUserFilters() {
//   const userSearch = document.getElementById("userSearch")
//   const userRoleFilter = document.getElementById("userRoleFilter")

//   if (userSearch) userSearch.value = ""
//   if (userRoleFilter) userRoleFilter.value = ""

//   filteredUsers = [...allUsers]
//   renderUsersTable()
// }

// function sortUsers(field) {
//   const direction = currentUsersSort.field === field && currentUsersSort.direction === "asc" ? "desc" : "asc"
//   currentUsersSort = { field, direction }

//   filteredUsers.sort((a, b) => {
//     let aVal = a[field]
//     let bVal = b[field]

//     if (typeof aVal === "string") {
//       aVal = aVal.toLowerCase()
//       bVal = bVal.toLowerCase()
//     }

//     if (direction === "asc") {
//       return aVal > bVal ? 1 : -1
//     } else {
//       return aVal < bVal ? 1 : -1
//     }
//   })

//   updateSortIndicators("#usersTable", field, direction)
//   renderUsersTable()
// }

function renderUsersTable() {
  const tbody = document.getElementById("usersTableBody")
  if (!tbody) return

  tbody.innerHTML = ""

  if (filteredUsers.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-5">
          <i class="bi bi-search fa-3x text-muted mb-3"></i>
          <h5 class="text-muted">Không tìm thấy người dùng nào</h5>
          <p class="text-muted">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
        </td>
      </tr>
    `
    return
  }

  filteredUsers.forEach((user) => {
    const row = document.createElement("tr")
    row.innerHTML = `
      <td><strong>${user.id}</strong></td>
      <td>
        <div class="d-flex align-items-center">
          <img src="${user.avatar || "/placeholder.svg?height=40&width=40"}" alt="Avatar" class="avatar me-3">
          <div>
            <div class="fw-bold">${highlightSearchTerm(user.username || "N/A", "userSearch")}</div>
            <small class="text-muted">${user.lastActive || "Chưa xác định"}</small>
          </div>
        </div>
      </td>
      <td>${highlightSearchTerm(user.email || "N/A", "userSearch")}</td>
      <td>
        <span class="badge bg-${getRoleBadgeColor(user.role)}">${getRoleDisplayName(user.role)}</span>
      </td>
      <td>${formatDate(user.joinDate)}</td>
      <td>
        <span class="badge bg-${user.status === "active" ? "success" : "secondary"}">
          ${user.status === "active" ? "Hoạt động" : "Không hoạt động"}
        </span>
      </td>
      <td>
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-primary" onclick="editUser('${user.id}')" title="Chỉnh sửa">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-outline-danger" onclick="deleteUserConfirm('${user.id}')" title="Xóa">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    `
    tbody.appendChild(row)
  })

  updatePagination("users", filteredUsers.length)
}

// Posts Functions
// function filterPosts() {
//   const searchTerm = document.getElementById("postSearch")?.value.toLowerCase() || ""
//   const statusFilter = document.getElementById("postStatusFilter")?.value || ""
//   const categoryFilter = document.getElementById("postCategoryFilter")?.value || ""

//   filteredPosts = allPosts.filter((post) => {
//     const matchesSearch =
//       searchTerm === "" ||
//       post.title?.toLowerCase().includes(searchTerm) ||
//       post.author?.toLowerCase().includes(searchTerm)

//     const matchesStatus = statusFilter === "" || post.status === statusFilter
//     const matchesCategory = categoryFilter === "" || post.category === categoryFilter

//     return matchesSearch && matchesStatus && matchesCategory
//   })

//   renderPostsTable()
//   updatePostsStats()
// }

// function clearPostFilters() {
//   const postSearch = document.getElementById("postSearch")
//   const postStatusFilter = document.getElementById("postStatusFilter")
//   const postCategoryFilter = document.getElementById("postCategoryFilter")

//   if (postSearch) postSearch.value = ""
//   if (postStatusFilter) postStatusFilter.value = ""
//   if (postCategoryFilter) postCategoryFilter.value = ""

//   filteredPosts = [...allPosts]
//   renderPostsTable()
//   updatePostsStats()
// }

// function sortPosts(field) {
//   const direction = currentPostsSort.field === field && currentPostsSort.direction === "asc" ? "desc" : "asc"
//   currentPostsSort = { field, direction }

//   filteredPosts.sort((a, b) => {
//     let aVal = a[field]
//     let bVal = b[field]

//     if (typeof aVal === "string") {
//       aVal = aVal.toLowerCase()
//       bVal = bVal.toLowerCase()
//     }

//     if (direction === "asc") {
//       return aVal > bVal ? 1 : -1
//     } else {
//       return aVal < bVal ? 1 : -1
//     }
//   })

//   updateSortIndicators("#postsTable", field, direction)
//   renderPostsTable()
// }

function renderPostsTable() {
  const tbody = document.getElementById("postsTableBody")
  if (!tbody) return

  tbody.innerHTML = ""

  if (filteredPosts.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-5">
          <i class="bi bi-search fa-3x text-muted mb-3"></i>
          <h5 class="text-muted">Không tìm thấy bài viết nào</h5>
          <p class="text-muted">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
        </td>
      </tr>
    `
    return
  }

  filteredPosts.forEach((post) => {
    const row = document.createElement("tr")
    row.innerHTML = `
      <td><strong>${post.id}</strong></td>
      <td>
        <div class="fw-bold mb-1">${highlightSearchTerm(post.title || "Không có tiêu đề", "postSearch")}</div>
        <small class="text-muted">${(post.content || "").substring(0, 60)}...</small>
      </td>
      <td>
        <div class="d-flex align-items-center">
          <img src="${post.authorAvatar || "/placeholder.svg?height=35&width=35"}" alt="Avatar" class="avatar me-2" style="width: 35px; height: 35px;">
          <span class="fw-semibold">${highlightSearchTerm(post.author || "N/A", "postSearch")}</span>
        </div>
      </td>
      <td>
        <span class="badge bg-${getCategoryBadgeColor(post.category)}">${getCategoryDisplayName(post.category)}</span>
      </td>
      <td>
        <span class="badge bg-${getStatusBadgeColor(post.status)}">${getStatusDisplayName(post.status)}</span>
      </td>
      <td>
        <div class="d-flex align-items-center">
          <i class="bi bi-eye text-muted me-2"></i>
          <strong>${(post.views || 0).toLocaleString()}</strong>
        </div>
      </td>
      <td>${formatDate(post.createdAt)}</td>
      <td>
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-primary" onclick="editPost('${post.id}')" title="Chỉnh sửa">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-outline-success" onclick="viewPost('${post.id}')" title="Xem">
            <i class="bi bi-eye"></i>
          </button>
          <button class="btn btn-outline-danger" onclick="deletePostConfirm('${post.id}')" title="Xóa">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    `
    tbody.appendChild(row)
  })

  updatePagination("posts", filteredPosts.length)
}



// Action Functions


function viewPost(postId) {
  showNotification(`Xem bài viết ID: ${postId}`, "info")
}

// Utility Functions


function formatDate(dateString) {
  if (!dateString) return "N/A"
  const date = new Date(dateString)
  return date.toLocaleDateString("vi-VN")
}

function updateSortIndicators(tableSelector, field, direction) {
  document.querySelectorAll(`${tableSelector} .sortable`).forEach((header) => {
    header.classList.remove("sort-asc", "sort-desc")
  })

  const currentHeader = document.querySelector(`${tableSelector} [data-sort="${field}"]`)
  if (currentHeader) {
    currentHeader.classList.add(direction === "asc" ? "sort-asc" : "sort-desc")
  }
}

function updatePagination(type, totalItems) {
  const paginationElement = document.getElementById(`${type}Pagination`)
  if (paginationElement) {
    paginationElement.textContent = `Hiển thị 1-${totalItems} của ${totalItems} kết quả`
  }
}



function showNotification(message, type = "info") {
  const alertClass =
    {
      success: "alert-success",
      warning: "alert-warning",
      danger: "alert-danger",
      info: "alert-info",
    }[type] || "alert-info"

  const iconClass =
    {
      success: "bi-check-circle",
      warning: "bi-exclamation-triangle",
      danger: "bi-x-circle",
      info: "bi-info-circle",
    }[type] || "bi-info-circle"

  const notification = document.createElement("div")
  notification.className = `alert ${alertClass} alert-dismissible fade show notification`
  notification.innerHTML = `
    <i class="${iconClass} me-2"></i>
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `

  document.body.appendChild(notification)

  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove()
    }
  }, 5000)
}

function showLoadingState() {
  const loadingOverlay = document.createElement("div")
  loadingOverlay.id = "loadingOverlay"
  loadingOverlay.className = "position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
  loadingOverlay.style.backgroundColor = "rgba(0,0,0,0.5)"
  loadingOverlay.style.zIndex = "9999"
  loadingOverlay.innerHTML = `
    <div class="text-center text-white">
      <div class="spinner-border mb-3" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
      <div>Đang xử lý...</div>
    </div>
  `
  document.body.appendChild(loadingOverlay)
}

function hideLoadingState() {
  const loadingOverlay = document.getElementById("loadingOverlay")
  if (loadingOverlay) {
    loadingOverlay.remove()
  }
}

function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Mobile Sidebar Toggle
function toggleSidebar() {// Mobile Sidebar Toggle
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar")
  if (sidebar) {
    sidebar.classList.toggle("show")
  }
}

// Make functions globally available
window.showTab = showTab
window.addPost = addPost
window.editUser = editUser
window.deleteUserConfirm = deleteUserConfirm
window.editPost = editPost
window.viewPost = viewPost
window.deletePostConfirm = deletePostConfirm
window.clearUserFilters = clearUserFilters
window.clearPostFilters = clearPostFilters
window.toggleSidebar = toggleSidebar
  const sidebar = document.getElementById("sidebar")
  if (sidebar) {
    sidebar.classList.toggle("show")
  }
}

// Close sidebar when clicking outside on mobile
document.addEventListener("click", (event) => {
  const sidebar = document.getElementById("sidebar")
  const toggle = document.querySelector(".mobile-sidebar-toggle")

  if (
    window.innerWidth <= 768 &&
    sidebar &&
    !sidebar.contains(event.target) &&
    !toggle?.contains(event.target) &&
    sidebar.classList.contains("show")
  ) {
    sidebar.classList.remove("show")
  }
})