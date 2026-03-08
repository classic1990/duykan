// ========================================
// ADMIN JAVASCRIPT - DUYDODEE Admin Panel
// ========================================

// Admin Application State
const AdminState = {
    user: null,
    movies: [],
    users: [],
    stats: {},
    loading: false,
    currentView: 'dashboard',
    selectedMovie: null
};

// Admin Utility Functions
const AdminUtils = {
    // Show loading
    showLoading() {
        const loader = document.getElementById('adminLoader');
        if (loader) {
            loader.style.display = 'flex';
        }
        AdminState.loading = true;
    },

    // Hide loading
    hideLoading() {
        const loader = document.getElementById('adminLoader');
        if (loader) {
            loader.style.display = 'none';
        }
        AdminState.loading = false;
    },

    // Show toast notification
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `admin-toast admin-toast-${type}`;
        toast.innerHTML = `
            <div class="admin-toast-content">
                <i class="fas fa-${this.getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="admin-toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        const container = document.getElementById('adminToastContainer') || this.createToastContainer();
        container.appendChild(toast);

        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    },

    getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    },

    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'adminToastContainer';
        container.className = 'admin-toast-container';
        document.body.appendChild(container);
        return container;
    },

    // Confirm dialog
    confirm(message, callback) {
        if (confirm(message)) {
            callback();
        }
    },

    // Format date
    formatDate(date) {
        return new Date(date).toLocaleString('th-TH');
    },

    // Format number
    formatNumber(num) {
        return num.toLocaleString('th-TH');
    }
};

// Admin API Functions
const AdminAPI = {
    baseUrl: '/api',

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Admin API Error:', error);
            AdminUtils.showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
            throw error;
        }
    },

    // Get all movies
    async getMovies() {
        return this.request('/movies');
    },

    // Create movie
    async createMovie(movieData) {
        return this.request('/movies', {
            method: 'POST',
            body: JSON.stringify(movieData)
        });
    },

    // Update movie
    async updateMovie(id, movieData) {
        return this.request(`/movies/${id}`, {
            method: 'PUT',
            body: JSON.stringify(movieData)
        });
    },

    // Delete movie
    async deleteMovie(id) {
        return this.request(`/movies/${id}`, {
            method: 'DELETE'
        });
    },

    // Get stats
    async getStats() {
        return this.request('/admin/stats');
    },

    // Get users
    async getUsers() {
        return this.request('/admin/users');
    },

    // AI Process YouTube URL
    async processYouTube(url) {
        return this.request('/ai/process-youtube', {
            method: 'POST',
            body: JSON.stringify({
                youtubeUrl: url,
                adminEmail: 'duy.kan1234@gmail.com'
            })
        });
    }
};

// Admin UI Functions
const AdminUI = {
    // Initialize admin panel
    init() {
        this.initSidebar();
        this.initModals();
        this.initForms();
        this.loadInitialData();
    },

    // Initialize sidebar
    initSidebar() {
        const sidebarItems = document.querySelectorAll('.admin-sidebar-link');
        sidebarItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = item.dataset.view || 'dashboard';
                this.switchView(view);

                // Update active state
                sidebarItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });
    },

    // Switch view
    switchView(view) {
        AdminState.currentView = view;

        // Hide all views
        const views = document.querySelectorAll('.admin-view');
        views.forEach(v => v.style.display = 'none');

        // Show selected view
        const selectedView = document.getElementById(`${view}View`);
        if (selectedView) {
            selectedView.style.display = 'block';
        }

        // Load view-specific data
        this.loadViewData(view);
    },

    // Load view-specific data
    async loadViewData(view) {
        AdminUtils.showLoading();

        try {
            switch (view) {
                case 'dashboard':
                    await this.loadDashboard();
                    break;
                case 'movies':
                    await this.loadMovies();
                    break;
                case 'users':
                    await this.loadUsers();
                    break;
                case 'ai-processor':
                    // AI processor doesn't need initial data
                    break;
            }
        } catch (error) {
            AdminUtils.showToast('โหลดข้อมูลล้มเหลว', 'error');
        } finally {
            AdminUtils.hideLoading();
        }
    },

    // Load dashboard
    async loadDashboard() {
        const stats = await AdminAPI.getStats();
        AdminState.stats = stats.data || {};
        this.renderStats();
    },

    // Render stats
    renderStats() {
        const stats = AdminState.stats;

        document.getElementById('totalMovies').textContent = AdminUtils.formatNumber(stats.totalMovies || 0);
        document.getElementById('totalUsers').textContent = AdminUtils.formatNumber(stats.totalUsers || 0);
        document.getElementById('totalViews').textContent = AdminUtils.formatNumber(stats.totalViews || 0);
        document.getElementById('totalRevenue').textContent = AdminUtils.formatNumber(stats.totalRevenue || 0);
    },

    // Load movies
    async loadMovies() {
        const movies = await AdminAPI.getMovies();
        AdminState.movies = movies.data || [];
        this.renderMoviesTable();
    },

    // Render movies table
    renderMoviesTable() {
        const tbody = document.getElementById('moviesTableBody');
        if (!tbody) return;

        if (AdminState.movies.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">ไม่มีข้อมูลซีรีส์</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = AdminState.movies.map(movie => `
            <tr>
                <td>
                    <img src="${movie.poster || '/assets/images/default-poster.jpg'}" 
                         alt="${movie.title}" 
                         class="movie-thumbnail">
                </td>
                <td>
                    <div class="movie-info">
                        <h4>${movie.title}</h4>
                        <p>${movie.description || ''}</p>
                    </div>
                </td>
                <td>${movie.year || 'N/A'}</td>
                <td>
                    <span class="badge badge-${movie.status || 'active'}">
                        ${movie.status || 'active'}
                    </span>
                </td>
                <td>${AdminUtils.formatDate(movie.createdAt || new Date())}</td>
                <td>
                    <div class="action-buttons">
                        <button class="admin-btn admin-btn-sm admin-btn-primary" 
                                onclick="AdminUI.editMovie('${movie.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="admin-btn admin-btn-sm admin-btn-danger" 
                                onclick="AdminUI.deleteMovie('${movie.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    // Edit movie
    editMovie(id) {
        const movie = AdminState.movies.find(m => m.id === id);
        if (movie) {
            AdminState.selectedMovie = movie;
            this.showMovieModal(movie);
        }
    },

    // Delete movie
    deleteMovie(id) {
        AdminUtils.confirm('คุณต้องการลบซีรีส์นี้ใช่หรือ?', async () => {
            try {
                await AdminAPI.deleteMovie(id);
                AdminUtils.showToast('ลบซีรีส์สำเร็จ', 'success');
                await this.loadMovies();
            } catch (error) {
                AdminUtils.showToast('ลบซีรีส์ล้มเหลว', 'error');
            }
        });
    },

    // Show movie modal
    showMovieModal(movie = null) {
        const modal = document.getElementById('movieModal');
        if (!modal) return;

        const isEdit = movie !== null;
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('movieForm');

        if (title) {
            title.textContent = isEdit ? 'แก้ไขซีรีส์' : 'เพิ่มซีรีส์ใหม่';
        }

        if (form) {
            if (isEdit) {
                form.title.value = movie.title || '';
                form.description.value = movie.description || '';
                form.year.value = movie.year || '';
                form.status.value = movie.status || 'active';
            } else {
                form.reset();
            }
        }

        modal.style.display = 'flex';
    },

    // Hide movie modal
    hideMovieModal() {
        const modal = document.getElementById('movieModal');
        if (modal) {
            modal.style.display = 'none';
        }
        AdminState.selectedMovie = null;
    },

    // Save movie
    async saveMovie() {
        const form = document.getElementById('movieForm');
        if (!form) return;

        const formData = {
            title: form.title.value,
            description: form.description.value,
            year: form.year.value,
            status: form.status.value
        };

        try {
            if (AdminState.selectedMovie) {
                await AdminAPI.updateMovie(AdminState.selectedMovie.id, formData);
                AdminUtils.showToast('อัปเดตซีรีส์สำเร็จ', 'success');
            } else {
                await AdminAPI.createMovie(formData);
                AdminUtils.showToast('เพิ่มซีรีส์สำเร็จ', 'success');
            }

            this.hideMovieModal();
            await this.loadMovies();
        } catch (error) {
            AdminUtils.showToast('บันทึกซีรีส์ล้มเหลว', 'error');
        }
    },

    // Initialize modals
    initModals() {
        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('admin-modal')) {
                e.target.style.display = 'none';
            }
        });

        // Close modal buttons
        document.querySelectorAll('.admin-modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.admin-modal');
                if (modal) {
                    modal.style.display = 'none';
                }
            });
        });
    },

    // Initialize forms
    initForms() {
        const movieForm = document.getElementById('movieForm');
        if (movieForm) {
            movieForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveMovie();
            });
        }

        // AI Processor form
        const aiForm = document.getElementById('aiProcessorForm');
        if (aiForm) {
            aiForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.processAI();
            });
        }
    },

    // Process AI
    async processAI() {
        const urlInput = document.getElementById('youtubeUrl');
        if (!urlInput) return;

        const url = urlInput.value.trim();
        if (!url) {
            AdminUtils.showToast('กรุณาใส่ YouTube URL', 'error');
            return;
        }

        try {
            AdminUtils.showLoading();
            const result = await AdminAPI.processYouTube(url);

            if (result.success) {
                AdminUtils.showToast('ประมวลอง YouTube URL สำเร็จ', 'success');
                urlInput.value = '';
                await this.loadMovies();
            } else {
                AdminUtils.showToast(result.error || 'ประมวลองล้มเหลว', 'error');
            }
        } catch (error) {
            AdminUtils.showToast('ประมวลองล้มเหลว', 'error');
        } finally {
            AdminUtils.hideLoading();
        }
    },

    // Load users
    async loadUsers() {
        try {
            const users = await AdminAPI.getUsers();
            AdminState.users = users.data || [];
            this.renderUsersTable();
        } catch (error) {
            console.error('Error loading users:', error);
            AdminUtils.showToast('โหลดผู้ใช้ล้มเหลว', 'error');
        }
    },

    // Render users table
    renderUsersTable() {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        if (AdminState.users.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">ไม่มีข้อมูลผู้ใช้</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = AdminState.users.map(user => `
            <tr>
                <td>
                    <img src="${user.avatar || '/build/assets/images/default-avatar.jpg'}" 
                         alt="${user.displayName}" 
                         class="user-thumbnail">
                </td>
                <td>
                    <div class="user-info">
                        <h4>${user.displayName}</h4>
                        <p>${user.email}</p>
                    </div>
                </td>
                <td>
                    <span class="badge badge-${user.role || 'user'}">
                        ${user.role || 'user'}
                    </span>
                </td>
                <td>
                    <span class="badge badge-${user.status || 'active'}">
                        ${user.status || 'active'}
                    </span>
                </td>
                <td>${AdminUtils.formatDate(user.createdAt || new Date())}</td>
                <td>
                    <div class="action-buttons">
                        <button class="admin-btn admin-btn-sm admin-btn-primary" 
                                onclick="AdminUI.editUser('${user.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="admin-btn admin-btn-sm admin-btn-danger" 
                                onclick="AdminUI.deleteUser('${user.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    // Edit user
    editUser(id) {
        const user = AdminState.users.find(u => u.id === id);
        if (user) {
            AdminUtils.showToast('แก้ไขผู้ใช้: ' + user.displayName, 'info');
        }
    },

    // Delete user
    deleteUser(id) {
        AdminUtils.confirm('คุณต้องการลบผู้ใช้นี้ใช่หรือ?', async () => {
            try {
                // Mock delete user API
                AdminState.users = AdminState.users.filter(u => u.id !== id);
                this.renderUsersTable();
                AdminUtils.showToast('ลบผู้ใช้สำเร็จ', 'success');
            } catch (error) {
                AdminUtils.showToast('ลบผู้ใช้ล้มเหลว', 'error');
            }
        });
    },

    // Load initial data
    async loadInitialData() {
        try {
            AdminUtils.showLoading();
            await this.loadDashboard();
        } catch (error) {
            AdminUtils.showToast('โหลดข้อมูลเริ่มต้นล้มเหลว', 'error');
        } finally {
            AdminUtils.hideLoading();
        }
    }
};

// Initialize Admin Panel
document.addEventListener('DOMContentLoaded', () => {
    console.log('🛠️ DUYDODEE Admin Panel initialized');
    AdminUI.init();
});

// Global functions for inline event handlers
window.AdminUI = AdminUI;
window.AdminUtils = AdminUtils;
window.AdminAPI = AdminAPI;
