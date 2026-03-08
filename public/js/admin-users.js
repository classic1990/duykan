import { showToast, formatDate } from './common.js';

// ========================================
// APPLICATION STATE
// ========================================
const AppState = {
    users: [],
    filteredUsers: [],
    isLoading: false,
    currentPage: 1,
    itemsPerPage: 10,
    currentUserToEdit: null
};

// ========================================
// DOM ELEMENTS
// ========================================
const DOMElements = {
    usersTableBody: document.getElementById('usersTableBody'),
    searchInput: document.querySelector('.search-input'),
    refreshBtn: document.getElementById('refreshBtn'),
    addUserBtn: document.getElementById('addUserBtn'),
    paginationContainer: document.getElementById('paginationContainer'),
    statusFilter: document.getElementById('statusFilter'),
    // Modal elements
    userModal: document.getElementById('userModal'),
    userForm: document.getElementById('userForm'),
    userModalTitle: document.getElementById('userModalTitle'),
    closeUserModalBtn: document.getElementById('closeUserModalBtn'),
    cancelUserModalBtn: document.getElementById('cancelUserModalBtn'),
    userDisplayName: document.getElementById('userDisplayName'),
    userEmail: document.getElementById('userEmail'),
    userStatus: document.getElementById('userStatus'),
};

// ========================================
// API FUNCTIONS
// ========================================
const API = {
    async fetchUsers() {
        AppState.isLoading = true;
        UI.renderLoading();
        try {
            const response = await fetch('/api/users');
            const result = await response.json();
            if (result.success) {
                AppState.users = result.data;
                AppState.filteredUsers = result.data;
                UI.renderUsersTable();
            } else {
                throw new Error(result.message || 'Failed to load users.');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            UI.renderError(error.message);
        } finally {
            AppState.isLoading = false;
        }
    },
    async updateUser(userId, updateData) {
        // This is a mock function. In a real app, this would be an API call.
        console.log(`Updating user ${userId} with data:`, updateData);
        const user = AppState.users.find(u => u.id === userId);
        if (user) {
            Object.assign(user, updateData); // Merge new data
            UI.applyFilters(); // Re-render with all filters
            showToast('อัปเดตข้อมูลผู้ใช้เรียบร้อยแล้ว', 'success');
        }
    },
    async createUser(userData) {
        console.log('Creating user:', userData);
        // Mock creation
        const newUser = {
            id: 'user-' + Date.now(),
            ...userData,
            photoURL: null,
            lastLogin: new Date().toISOString()
        };
        AppState.users.unshift(newUser);
        UI.applyFilters();
        showToast('เพิ่มผู้ใช้เรียบร้อยแล้ว', 'success');
    },
    async deleteUser(userId) {
        console.log(`Deleting user ${userId}`);
        const index = AppState.users.findIndex(u => u.id === userId);
        if (index !== -1) {
            AppState.users.splice(index, 1);
            UI.applyFilters();
            showToast('ลบผู้ใช้เรียบร้อยแล้ว', 'success');
        } else {
            showToast('ไม่พบผู้ใช้ที่ต้องการลบ', 'error');
        }
    }
};

// ========================================
// UI FUNCTIONS
// ========================================
const UI = {
    renderLoading() {
        DOMElements.usersTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 40px;">กำลังโหลดข้อมูลผู้ใช้...</td></tr>`;
    },
    renderError(message) {
        DOMElements.usersTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 40px; color: var(--error);">${message}</td></tr>`;
    },
    renderUsersTable() {
        const tbody = DOMElements.usersTableBody;
        const { currentPage, itemsPerPage, filteredUsers } = AppState;
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

        if (filteredUsers.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 40px;">ไม่พบข้อมูลผู้ใช้</td></tr>`;
            DOMElements.paginationContainer.innerHTML = '';
            return;
        }

        tbody.innerHTML = paginatedUsers.map(user => `
            <tr>
                <td>
                    <div class="movie-info"> <!-- Re-using class for style -->
                        <img src="${user.photoURL || 'https://placehold.co/40x40/e50914/ffffff?text=' + user.displayName.charAt(0)}" alt="${user.displayName}" class="user-profile-pic">
                        <div class="movie-details">
                            <h4 class="user-name-clickable" data-id="${user.id}">${user.displayName || 'No Name'} ${user.email === 'duy.kan1234@gmail.com' ? '<span class="badge badge-admin">Admin</span>' : ''}</h4>
                        </div>
                    </div>
                </td>
                <td>${user.email}</td>
                <td>${formatDate(user.lastLogin)}</td>
                <td><span class="status-badge ${user.status}">${user.status === 'active' ? 'ใช้งาน' : 'ถูกแบน'}</span></td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn ${user.status === 'active' ? 'ban' : 'unban'}" data-id="${user.id}" data-status="${user.status === 'active' ? 'banned' : 'active'}" aria-label="${user.status === 'active' ? 'Ban User' : 'Unban User'}">
                            <i class="fas fa-${user.status === 'active' ? 'ban' : 'check-circle'}"></i>
                        </button>
                        <button class="action-btn delete" data-id="${user.id}" aria-label="Delete User"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
        this.renderPagination();
    },
    renderPagination() {
        const { currentPage, itemsPerPage, filteredUsers } = AppState;
        const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
        const container = DOMElements.paginationContainer;

        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let paginationHTML = '<div class="pagination-controls">';
        paginationHTML += `<button class="pagination-btn" data-page="prev" ${currentPage === 1 ? 'disabled' : ''}>ก่อนหน้า</button>`;
        paginationHTML += `<span class="pagination-info">หน้า ${currentPage} / ${totalPages}</span>`;
        paginationHTML += `<button class="pagination-btn" data-page="next" ${currentPage === totalPages ? 'disabled' : ''}>ถัดไป</button>`;
        paginationHTML += '</div>';
        container.innerHTML = paginationHTML;
    },
    applyFilters() {
        AppState.currentPage = 1;
        const searchTerm = DOMElements.searchInput.value.toLowerCase();
        const statusFilter = DOMElements.statusFilter.value;

        let tempUsers = [...AppState.users];

        // Filter by status
        if (statusFilter) {
            tempUsers = tempUsers.filter(user => user.status === statusFilter);
        }

        // Filter by search term
        if (searchTerm) {
            tempUsers = tempUsers.filter(user =>
                (user.displayName && user.displayName.toLowerCase().includes(searchTerm)) ||
                (user.email && user.email.toLowerCase().includes(searchTerm))
            );
        }

        AppState.filteredUsers = tempUsers;
        UI.renderUsersTable();
    },
    openEditModal(user) {
        AppState.currentUserToEdit = user;
        DOMElements.userModalTitle.textContent = 'แก้ไขข้อมูลผู้ใช้';
        DOMElements.userDisplayName.value = user.displayName || '';
        DOMElements.userEmail.value = user.email || '';
        DOMElements.userEmail.disabled = true;
        DOMElements.userStatus.value = user.status || 'active';
        DOMElements.userModal.classList.add('active');
    },

    openAddModal() {
        AppState.currentUserToEdit = null;
        DOMElements.userModalTitle.textContent = 'เพิ่มผู้ใช้ใหม่';
        DOMElements.userForm.reset();
        DOMElements.userEmail.disabled = false;
        DOMElements.userModal.classList.add('active');
    },

    closeEditModal() {
        DOMElements.userModal.classList.remove('active');
        AppState.currentUserToEdit = null;
        DOMElements.userForm.reset();
    },
};

// ========================================
// EVENT HANDLERS
// ========================================
function handleTableActions(e) {
    const button = e.target.closest('button.action-btn');
    const userName = e.target.closest('.user-name-clickable');

    if (button) {
        const userId = button.dataset.id;
        if (button.classList.contains('ban') || button.classList.contains('unban')) {
            const newStatus = button.dataset.status;
            const actionText = newStatus === 'banned' ? 'แบน' : 'ปลดแบน';
            if (confirm(`คุณต้องการ ${actionText} ผู้ใช้นี้ใช่หรือไม่?`)) {
                API.updateUser(userId, { status: newStatus });
            }
        } else if (button.classList.contains('delete')) {
            if (confirm('คุณต้องการลบผู้ใช้นี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
                API.deleteUser(userId);
            }
        }
    } else if (userName) {
        const userId = userName.dataset.id;
        const user = AppState.users.find(u => u.id === userId);
        if (user) {
            UI.openEditModal(user);
        }
    }


}

function handlePagination(e) {
    const button = e.target.closest('.pagination-btn');
    if (!button || button.disabled) return;

    const pageAction = button.dataset.page;
    const totalPages = Math.ceil(AppState.filteredUsers.length / AppState.itemsPerPage);

    if (pageAction === 'prev' && AppState.currentPage > 1) {
        AppState.currentPage--;
    } else if (pageAction === 'next' && AppState.currentPage < totalPages) {
        AppState.currentPage++;
    }
    
    UI.renderUsersTable();
}

async function handleUserFormSubmit(e) {
    e.preventDefault();

    const formData = {
        displayName: DOMElements.userDisplayName.value,
        email: DOMElements.userEmail.value,
        status: DOMElements.userStatus.value
    };

    if (AppState.currentUserToEdit) {
        await API.updateUser(AppState.currentUserToEdit.id, {
            displayName: formData.displayName,
            status: formData.status
        });
    } else {
        if (!formData.email || !formData.displayName) {
            showToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
            return;
        }
        await API.createUser(formData);
    }
    UI.closeEditModal();
}

// ========================================
// INITIALIZATION
// ========================================
function init() {
    DOMElements.searchInput.addEventListener('input', UI.applyFilters);
    DOMElements.statusFilter.addEventListener('change', UI.applyFilters);
    DOMElements.usersTableBody.addEventListener('click', handleTableActions);
    DOMElements.paginationContainer.addEventListener('click', handlePagination);
    DOMElements.refreshBtn.addEventListener('click', () => API.fetchUsers());
    DOMElements.addUserBtn.addEventListener('click', UI.openAddModal);

    // Modal listeners
    DOMElements.userForm.addEventListener('submit', handleUserFormSubmit);
    DOMElements.closeUserModalBtn.addEventListener('click', UI.closeEditModal);
    DOMElements.cancelUserModalBtn.addEventListener('click', UI.closeEditModal);
    DOMElements.userModal.addEventListener('click', (e) => { if (e.target === e.currentTarget) UI.closeEditModal(); });

    API.fetchUsers();
    console.log('[INFO] Admin Users page initialized');
}

document.addEventListener('DOMContentLoaded', init);