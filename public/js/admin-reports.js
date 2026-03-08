// Import Firebase auth service from the initialization file
// Note the path is different because we are in a subdirectory
import { auth } from '../../js/firebase-init.js'; 
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ========================================
// DOM ELEMENTS
// ========================================
const DOMElements = {
    reportListBody: document.getElementById('reportListBody'),
    searchInput: document.getElementById('searchInput'),
    loadingIndicator: document.getElementById('loadingIndicator')
};

// ========================================
// APPLICATION STATE
// ========================================
const AppState = {
    currentUser: null,
    allReports: [],
    filteredReports: []
};

// ========================================
// UTILITY FUNCTIONS
// ========================================
const Utils = {
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        // Using the dashboard toast classes for consistency
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            toast.addEventListener('animationend', () => toast.remove());
        }, 3000);
    }
};

// ========================================
// API FUNCTIONS
// ========================================
const API = {
    async fetchReports() {
        UI.showLoading(true);
        try {
            // NOTE: This API endpoint might need to be created
            const response = await fetch('/api/reports'); 
            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }
            const result = await response.json();
            if (result.success) {
                AppState.allReports = result.reports || [];
                AppState.filteredReports = AppState.allReports;
                UI.renderTable();
            } else {
                throw new Error(result.message || "Failed to load reports.");
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
            Utils.showToast(error.message, 'error');
            UI.showError('ไม่สามารถโหลดข้อมูลรายงานได้');
        } finally {
            UI.showLoading(false);
        }
    },

    async updateReportStatus(reportId, status) {
        try {
            const response = await fetch(`/api/reports/${reportId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            const result = await response.json();
            if (result.success) {
                Utils.showToast('อัปเดตสถานะเรียบร้อย', 'success');
                await this.fetchReports(); // Refresh data
            } else {
                throw new Error(result.message || "Failed to update status.");
            }
        } catch (error) {
            console.error('Error updating report status:', error);
            Utils.showToast(error.message, 'error');
        }
    },
    
    async deleteReport(reportId) {
        try {
            const response = await fetch(`/api/reports/${reportId}`, { method: 'DELETE' });
            const result = await response.json();
             if (result.success) {
                Utils.showToast('ลบรายงานเรียบร้อย', 'success');
                await this.fetchReports(); // Refresh data
            } else {
                throw new Error(result.message || "Failed to delete report.");
            }
        } catch (error) {
            console.error('Error deleting report:', error);
            Utils.showToast(error.message, 'error');
        }
    }
};

// ========================================
// UI FUNCTIONS
// ========================================
const UI = {
    renderTable() {
        const tbody = DOMElements.reportListBody;
        if (AppState.filteredReports.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 40px;">ไม่พบรายการแจ้งปัญหา</td></tr>';
            return;
        }

        tbody.innerHTML = AppState.filteredReports.map(report => {
            const isFixed = report.status === 'fixed';
            return `
                <tr>
                    <td>${new Date(report.createdAt).toLocaleDateString('th-TH')}</td>
                    <td>${report.movieTitle || 'N/A'}</td>
                    <td>${report.episode || '-'}</td>
                    <td style="color: #ff9999;">${report.reason || 'ไม่มี'}</td>
                    <td>${report.reportedBy || 'ไม่ระบุ'}</td>
                    <td><span class="status-badge status-${isFixed ? 'active' : 'inactive'}">${isFixed ? 'แก้ไขแล้ว' : 'รอดำเนินการ'}</span></td>
                    <td>
                        <div class="table-actions">
                            ${!isFixed ? `<button class="action-btn edit" data-id="${report.id}" aria-label="Mark as Fixed"><i class="fas fa-check"></i></button>` : ''}
                            <button class="action-btn delete" data-id="${report.id}" aria-label="Delete Report"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>`;
        }).join('');
    },
    
    showLoading(isLoading) {
        DOMElements.loadingIndicator.style.display = isLoading ? 'table-row' : 'none';
        if(isLoading) {
            DOMElements.reportListBody.innerHTML = '';
        }
    },

    showError(message) {
        DOMElements.reportListBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 40px; color: var(--error);">${message}</td></tr>`;
    },

    handleSearch(e) {
        const term = e.target.value.toLowerCase();
        AppState.filteredReports = AppState.allReports.filter(r =>
            (r.movieTitle && r.movieTitle.toLowerCase().includes(term)) ||
            (r.reportedBy && r.reportedBy.toLowerCase().includes(term)) ||
            (r.reason && r.reason.toLowerCase().includes(term))
        );
        UI.renderTable();
    },

    handleTableActions(e) {
        const button = e.target.closest('button.action-btn');
        if (!button) return;

        const reportId = button.dataset.id;
        if (button.classList.contains('edit')) {
            if (confirm('ยืนยันว่าได้แก้ไขปัญหานี้แล้ว?')) {
                API.updateReportStatus(reportId, 'fixed');
            }
        } else if (button.classList.contains('delete')) {
            if (confirm('ยืนยันการลบรายการนี้? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
                API.deleteReport(reportId);
            }
        }
    }
};

// ========================================
// SECURITY & AUTHENTICATION
// ========================================
function checkAdminAccess(user) {
    const ADMIN_EMAIL = "duy.kan1234@gmail.com";
    if (!user || user.email !== ADMIN_EMAIL) {
        Utils.showToast('คุณไม่มีสิทธิ์เข้าถึงหน้านี้ กำลังนำทางกลับ...', 'error');
        setTimeout(() => window.location.href = '../../index.html', 2000);
        return false;
    }
    return true;
}

// ========================================
// APPLICATION INITIALIZATION
// ========================================
function init() {
    // Attach event listeners
    DOMElements.searchInput.addEventListener('input', UI.handleSearch);
    DOMElements.reportListBody.addEventListener('click', UI.handleTableActions);
    
    // Auth state listener
    onAuthStateChanged(auth, (user) => {
        AppState.currentUser = user;
        if (checkAdminAccess(user)) {
            API.fetchReports();
        } else {
            // Hide page content if not authorized
            document.body.style.display = 'none';
        }
    });

    console.log('[INFO] Admin Reports page initialized');
}

document.addEventListener('DOMContentLoaded', init);
