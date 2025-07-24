// Sample Data
const usersData = [
  {
    id: 1,
    name: "Nguyễn Văn An",
    email: "nguyenvanan@email.com",
    role: "admin",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    joinDate: "2024-01-15",
    status: "active",
    lastActive: "2 giờ trước",
  },
  {
    id: 2,
    name: "Trần Thị Bình",
    email: "tranthibinh@email.com",
    role: "moderator",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    joinDate: "2024-02-20",
    status: "active",
    lastActive: "1 ngày trước",
  },
  {
    id: 3,
    name: "Lê Hoàng Cường",
    email: "lehoangcuong@email.com",
    role: "user",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    joinDate: "2024-03-10",
    status: "inactive",
    lastActive: "1 tuần trước",
  },
  {
    id: 4,
    name: "Phạm Thị Dung",
    email: "phamthidung@email.com",
    role: "user",
    avatar: "https://randomuser.me/api/portraits/women/4.jpg",
    joinDate: "2024-03-25",
    status: "active",
    lastActive: "5 phút trước",
  },
  {
    id: 5,
    name: "Hoàng Văn Em",
    email: "hoangvanem@email.com",
    role: "user",
    avatar: "https://randomuser.me/api/portraits/men/5.jpg",
    joinDate: "2024-04-01",
    status: "active",
    lastActive: "30 phút trước",
  },
]

const postsData = [
  {
    id: 1,
    title: "Hướng dẫn học lập trình JavaScript từ cơ bản đến nâng cao",
    author: "Nguyễn Văn An",
    authorAvatar: "https://randomuser.me/api/portraits/men/1.jpg",
    category: "technology",
    status: "published",
    views: 1250,
    comments: 45,
    createdAt: "2024-01-15",
    updatedAt: "2024-01-16",
    content: "JavaScript là ngôn ngữ lập trình phổ biến nhất hiện nay...",
    tags: ["javascript", "programming", "tutorial"],
  },
  {
    id: 2,
    title: "10 mẹo để cân bằng cuộc sống công việc và gia đình",
    author: "Trần Thị Bình",
    authorAvatar: "https://randomuser.me/api/portraits/women/2.jpg",
    category: "lifestyle",
    status: "published",
    views: 890,
    comments: 23,
    createdAt: "2024-01-20",
    updatedAt: "2024-01-21",
    content: "Trong thời đại hiện đại, việc cân bằng giữa công việc và cuộc sống...",
    tags: ["lifestyle", "work-life-balance", "tips"],
  },
  {
    id: 3,
    title: "Khởi nghiệp trong thời đại số - Cơ hội và thách thức",
    author: "Lê Hoàng Cường",
    authorAvatar: "https://randomuser.me/api/portraits/men/3.jpg",
    category: "business",
    status: "draft",
    views: 0,
    comments: 0,
    createdAt: "2024-01-25",
    updatedAt: "2024-01-25",
    content: "Khởi nghiệp luôn là một hành trình đầy thử thách...",
    tags: ["startup", "business", "digital"],
  },
  {
    id: 4,
    title: "Phương pháp học tập hiệu quả cho sinh viên",
    author: "Phạm Thị Dung",
    authorAvatar: "https://randomuser.me/api/portraits/women/4.jpg",
    category: "education",
    status: "pending",
    views: 0,
    comments: 0,
    createdAt: "2024-01-30",
    updatedAt: "2024-01-30",
    content: "Học tập hiệu quả không chỉ là việc ghi nhớ kiến thức...",
    tags: ["education", "study", "students"],
  },
  {
    id: 5,
    title: "Xu hướng công nghệ 2024: AI và Machine Learning",
    author: "Hoàng Văn Em",
    authorAvatar: "https://randomuser.me/api/portraits/men/5.jpg",
    category: "technology",
    status: "published",
    views: 2100,
    comments: 67,
    createdAt: "2024-02-01",
    updatedAt: "2024-02-02",
    content: "Trí tuệ nhân tạo và Machine Learning đang thay đổi thế giới...",
    tags: ["ai", "machine-learning", "technology", "2024"],
  },
  {
    id: 6,
    title: "Cách quản lý tài chính cá nhân thông minh",
    author: "Nguyễn Văn An",
    authorAvatar: "https://randomuser.me/api/portraits/men/1.jpg",
    category: "business",
    status: "archived",
    views: 567,
    comments: 12,
    createdAt: "2024-01-10",
    updatedAt: "2024-01-11",
    content: "Quản lý tài chính cá nhân là kỹ năng quan trọng...",
    tags: ["finance", "money", "personal"],
  },
]

let filteredUsers = [...usersData]
let filteredPosts = [...postsData]
let currentUsersSort = { field: null, direction: "asc" }
let currentPostsSort = { field: null, direction: "asc" }

// Import Bootstrap
const bootstrap = window.bootstrap

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  showTab("posts") // Show posts tab by default
  renderUsersTable()
  renderPostsTable()
  updatePostsStats()
  setupEventListeners()
})

// Event Listeners
function setupEventListeners() {
  // Users
  document.getElementById("userSearch").addEventListener("input", debounce(filterUsers, 300))
  document.getElementById("userRoleFilter").addEventListener("change", filterUsers)

  // Posts
  document.getElementById("postSearch").addEventListener("input", debounce(filterPosts, 300))
  document.getElementById("postStatusFilter").addEventListener("change", filterPosts)
  document.getElementById("postCategoryFilter").addEventListener("change", filterPosts)

  // Sorting
  document.querySelectorAll("#usersTable .sortable").forEach((header) => {
    header.addEventListener("click", () => sortUsers(header.dataset.sort))
  })

  document.querySelectorAll("#postsTable .sortable").forEach((header) => {
    header.addEventListener("click", () => sortPosts(header.dataset.sort))
  })
}

// Tab Management
function showTab(tabName) {
  // Hide all tabs
  document.querySelectorAll(".tab-pane").forEach((tab) => {
    tab.style.display = "none"
  })

  // Remove active class from all nav links
  document.querySelectorAll(".sidebar-nav .nav-link").forEach((link) => {
    link.classList.remove("active")
  })

  // Show selected tab
  document.getElementById(tabName + "-tab").style.display = "block"

  // Add active class to clicked nav link
  event.target.closest(".nav-link").classList.add("active")
}

// Users Functions
function filterUsers() {
  const searchTerm = document.getElementById("userSearch").value.toLowerCase()
  const roleFilter = document.getElementById("userRoleFilter").value

  filteredUsers = usersData.filter((user) => {
    const matchesSearch =
      searchTerm === "" || user.name.toLowerCase().includes(searchTerm) || user.email.toLowerCase().includes(searchTerm)

    const matchesRole = roleFilter === "" || user.role === roleFilter

    return matchesSearch && matchesRole
  })

  renderUsersTable()
}

function clearUserFilters() {
  document.getElementById("userSearch").value = ""
  document.getElementById("userRoleFilter").value = ""
  filteredUsers = [...usersData]
  renderUsersTable()
}

function sortUsers(field) {
  const direction = currentUsersSort.field === field && currentUsersSort.direction === "asc" ? "desc" : "asc"
  currentUsersSort = { field, direction }

  filteredUsers.sort((a, b) => {
    let aVal = a[field]
    let bVal = b[field]

    if (typeof aVal === "string") {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }

    if (direction === "asc") {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  updateSortIndicators("#usersTable", field, direction)
  renderUsersTable()
}

function renderUsersTable() {
  const tbody = document.getElementById("usersTableBody")
  tbody.innerHTML = ""

  if (filteredUsers.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-5">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
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
                    <img src="${user.avatar}" alt="Avatar" class="avatar me-3">
                    <div>
                        <div class="fw-bold">${highlightSearchTerm(user.name, "userSearch")}</div>
                        <small class="text-muted">${user.lastActive}</small>
                    </div>
                </div>
            </td>
            <td>${highlightSearchTerm(user.email, "userSearch")}</td>
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
                    <button class="btn btn-outline-primary" onclick="editUser(${user.id})" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteUser(${user.id})" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `
    tbody.appendChild(row)
  })

  updatePagination("users", filteredUsers.length)
}

// Posts Functions
function filterPosts() {
  const searchTerm = document.getElementById("postSearch").value.toLowerCase()
  const statusFilter = document.getElementById("postStatusFilter").value
  const categoryFilter = document.getElementById("postCategoryFilter").value

  filteredPosts = postsData.filter((post) => {
    const matchesSearch =
      searchTerm === "" ||
      post.title.toLowerCase().includes(searchTerm) ||
      post.author.toLowerCase().includes(searchTerm)

    const matchesStatus = statusFilter === "" || post.status === statusFilter
    const matchesCategory = categoryFilter === "" || post.category === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  renderPostsTable()
  updatePostsStats()
}

function clearPostFilters() {
  document.getElementById("postSearch").value = ""
  document.getElementById("postStatusFilter").value = ""
  document.getElementById("postCategoryFilter").value = ""
  filteredPosts = [...postsData]
  renderPostsTable()
  updatePostsStats()
}

function sortPosts(field) {
  const direction = currentPostsSort.field === field && currentPostsSort.direction === "asc" ? "desc" : "asc"
  currentPostsSort = { field, direction }

  filteredPosts.sort((a, b) => {
    let aVal = a[field]
    let bVal = b[field]

    if (typeof aVal === "string") {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }

    if (direction === "asc") {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  updateSortIndicators("#postsTable", field, direction)
  renderPostsTable()
}

function renderPostsTable() {
  const tbody = document.getElementById("postsTableBody")
  tbody.innerHTML = ""

  if (filteredPosts.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-5">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
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
                <div class="fw-bold mb-1">${highlightSearchTerm(post.title, "postSearch")}</div>
                <small class="text-muted">${post.content.substring(0, 60)}...</small>
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <img src="${post.authorAvatar}" alt="Avatar" class="avatar me-2" style="width: 35px; height: 35px;">
                    <span class="fw-semibold">${highlightSearchTerm(post.author, "postSearch")}</span>
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
                    <i class="fas fa-eye text-muted me-2"></i>
                    <strong>${post.views.toLocaleString()}</strong>
                </div>
            </td>
            <td>${formatDate(post.createdAt)}</td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="editPost(${post.id})" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-success" onclick="viewPost(${post.id})" title="Xem">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deletePost(${post.id})" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `
    tbody.appendChild(row)
  })

  updatePagination("posts", filteredPosts.length)
}

function updatePostsStats() {
  const total = postsData.length
  const published = postsData.filter((p) => p.status === "published").length
  const draft = postsData.filter((p) => p.status === "draft").length
  const totalViews = postsData.reduce((sum, p) => sum + p.views, 0)

  document.getElementById("totalPosts").textContent = total
  document.getElementById("publishedPosts").textContent = published
  document.getElementById("draftPosts").textContent = draft
  document.getElementById("totalViews").textContent = totalViews.toLocaleString()
}

function addPost() {
  const title = document.getElementById("postTitle").value
  const category = document.getElementById("postCategory").value
  const status = document.getElementById("postStatus").value
  const content = document.getElementById("postContent").value
  const tags = document.getElementById("postTags").value

  if (!title || !category || !status || !content) {
    showNotification("Vui lòng điền đầy đủ thông tin!", "warning")
    return
  }

  const newPost = {
    id: postsData.length + 1,
    title: title,
    author: "Admin User",
    authorAvatar: "https://randomuser.me/api/portraits/men/1.jpg",
    category: category,
    status: status,
    views: 0,
    comments: 0,
    createdAt: new Date().toISOString().split("T")[0],
    updatedAt: new Date().toISOString().split("T")[0],
    content: content,
    tags: tags.split(",").map((tag) => tag.trim()),
  }

  postsData.push(newPost)
  filteredPosts = [...postsData]
  renderPostsTable()
  updatePostsStats()

  // Reset form and close modal
  document.getElementById("addPostForm").reset()
  const modal = bootstrap.Modal.getInstance(document.getElementById("addPostModal"))
  modal.hide()

  showNotification("Thêm bài viết thành công!", "success")
}

// Utility Functions
function highlightSearchTerm(text, inputId) {
  const searchTerm = document.getElementById(inputId).value.toLowerCase().trim()
  if (!searchTerm) return text

  const regex = new RegExp(`(${searchTerm})`, "gi")
  return text.replace(regex, '<span class="highlight">$1</span>')
}

function getRoleBadgeColor(role) {
  const colors = {
    admin: "danger",
    moderator: "warning",
    user: "primary",
  }
  return colors[role] || "secondary"
}

function getRoleDisplayName(role) {
  const names = {
    admin: "Quản trị viên",
    moderator: "Điều hành viên",
    user: "Người dùng",
  }
  return names[role] || role
}

function getCategoryBadgeColor(category) {
  const colors = {
    technology: "primary",
    lifestyle: "success",
    business: "warning",
    education: "info",
  }
  return colors[category] || "secondary"
}

function getCategoryDisplayName(category) {
  const names = {
    technology: "Công nghệ",
    lifestyle: "Đời sống",
    business: "Kinh doanh",
    education: "Giáo dục",
  }
  return names[category] || category
}

function getStatusBadgeColor(status) {
  const colors = {
    published: "success",
    draft: "warning",
    pending: "info",
    archived: "secondary",
  }
  return colors[status] || "secondary"
}

function getStatusDisplayName(status) {
  const names = {
    published: "Đã xuất bản",
    draft: "Bản nháp",
    pending: "Chờ duyệt",
    archived: "Lưu trữ",
  }
  return names[status] || status
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("vi-VN")
}

function updateSortIndicators(tableSelector, field, direction) {
  document.querySelectorAll(`${tableSelector} .sortable`).forEach((header) => {
    header.classList.remove("sort-asc", "sort-desc")
  })

  const currentHeader = document.querySelector(`${tableSelector} [data-sort="${field}"]`)
  currentHeader.classList.add(direction === "asc" ? "sort-asc" : "sort-desc")
}

function updatePagination(type, totalItems) {
  const paginationElement = document.getElementById(`${type}Pagination`)
  paginationElement.textContent = `Hiển thị 1-${totalItems} của ${totalItems} kết quả`
}

function showNotification(message, type = "info") {
  const alertClass =
    {
      success: "alert-success",
      warning: "alert-warning",
      danger: "alert-danger",
      info: "alert-info",
    }[type] || "alert-info"

  const notification = document.createElement("div")
  notification.className = `alert ${alertClass} alert-dismissible fade show notification`
  notification.innerHTML = `
        <i class="fas fa-${type === "success" ? "check-circle" : type === "warning" ? "exclamation-triangle" : type === "danger" ? "times-circle" : "info-circle"} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.remove()
  }, 5000)
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

// Action Functions
function editUser(userId) {
  showNotification(`Chỉnh sửa người dùng ID: ${userId}`, "info")
}

function deleteUser(userId) {
  if (confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
    const index = usersData.findIndex((user) => user.id === userId)
    if (index > -1) {
      usersData.splice(index, 1)
      filterUsers()
      showNotification("Xóa người dùng thành công!", "success")
    }
  }
}

function editPost(postId) {
  showNotification(`Chỉnh sửa bài viết ID: ${postId}`, "info")
}

function viewPost(postId) {
  showNotification(`Xem bài viết ID: ${postId}`, "info")
}

function deletePost(postId) {
  if (confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
    const index = postsData.findIndex((post) => post.id === postId)
    if (index > -1) {
      postsData.splice(index, 1)
      filterPosts()
      showNotification("Xóa bài viết thành công!", "success")
    }
  }
}

// Mobile Sidebar Toggle
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar")
  sidebar.classList.toggle("show")
}

// Close sidebar when clicking outside on mobile
document.addEventListener("click", (event) => {
  const sidebar = document.getElementById("sidebar")
  const toggle = document.querySelector(".mobile-sidebar-toggle")

  if (
    window.innerWidth <= 768 &&
    !sidebar.contains(event.target) &&
    !toggle?.contains(event.target) &&
    sidebar.classList.contains("show")
  ) {
    sidebar.classList.remove("show")
  }
})
