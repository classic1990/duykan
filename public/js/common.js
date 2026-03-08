// ========================================
// SHARED UTILITY & AUTH FUNCTIONS
// ========================================

/**
 * Displays a toast notification.
 * @param {string} message The message to display.
 * @param {'info'|'success'|'warning'|'error'} type The type of toast.
 */
export function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    // Add styles for toast if they don't exist
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.innerHTML = `
            .toast { position: fixed; top: 20px; right: 20px; background: #333; color: white; padding: 15px 20px; border-radius: 8px; z-index: 3000; animation: slideIn 0.3s ease forwards; }
            .toast.toast-success { background-color: #46d369; }
            .toast.toast-error { background-color: #e50914; }
            .toast.toast-warning { background-color: #f9a825; }
            @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
        `;
        document.head.appendChild(style);
    }
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        toast.addEventListener('animationend', () => toast.remove());
    }, 3000);
}

export const ADMIN_EMAIL = 'duy.kan1234@gmail.com';

/**
 * Checks if the logged-in user is an admin. Redirects if not.
 * @param {object|null} user The Firebase user object.
 * @returns {boolean} True if the user is an admin, false otherwise.
 */
export function checkAdminAccess(user) {
    if (!user) {
        showToast('กรุณาเข้าสู่ระบบก่อน', 'error');
        setTimeout(() => window.location.href = '/login.html', 1500);
        return false;
    }
    if (user.email !== ADMIN_EMAIL) {
        showToast('คุณไม่มีสิทธิ์เข้าถึงส่วนนี้', 'error');
        setTimeout(() => window.location.href = '/index.html', 1500);
        return false;
    }
    return true;
}

export function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('th-TH', {
        dateStyle: 'medium',
        timeStyle: 'short'
    });
}

export function isValidYouTubeUrl(url) {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/;
    return youtubeRegex.test(url);
}

export function formatNumber(num) {
    return new Intl.NumberFormat('th-TH').format(num);
}

export function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

export function highlightText(text, highlight) {
    if (!highlight || !text) return text;
    const regex = new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="highlight">$1</mark>');
}