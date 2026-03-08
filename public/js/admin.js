// Import Firebase auth service from the initialization file
import { auth } from './firebase-init.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ========================================
// DOM ELEMENTS
// ========================================
const DOMElements = {
    navbar: document.getElementById('navbar'),
    userAvatar: document.getElementById('userAvatar'),
    userName: document.getElementById('userName')
};

// ========================================
// UTILITY FUNCTIONS
// ========================================
const Utils = {
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Animate out and remove
        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 3100);
    }
};

// ========================================
// UI FUNCTIONS
// ========================================
const UI = {
    updateUserInfo(user) {
        if (user) {
            DOMElements.userName.textContent = user.displayName || user.email || 'User';
            DOMElements.userAvatar.textContent = (user.displayName || user.email || 'U').charAt(0).toUpperCase();
        } else {
            DOMElements.userName.textContent = 'Guest';
            DOMElements.userAvatar.textContent = 'G';
        }
    },
    handleScroll() {
        if (window.scrollY > 50) {
            DOMElements.navbar.classList.add('scrolled');
        } else {
            DOMElements.navbar.classList.remove('scrolled');
        }
    }
};

// ========================================
// SECURITY & AUTHENTICATION
// ========================================
function checkAdminAccess(user) {
    // IMPORTANT: This is a simple client-side check. 
    // Real security should be enforced on the server-side for any sensitive data or operations.
    const ADMIN_EMAIL = "duy.kan1234@gmail.com"; // Replace with your actual admin email

    if (!user) {
        Utils.showToast('กรุณาเข้าสู่ระบบก่อน', 'error');
        setTimeout(() => window.location.href = '/index.html', 2000);
        return false;
    }

    if (user.email !== ADMIN_EMAIL) {
        Utils.showToast('คุณไม่มีสิทธิ์เข้าถึงหน้านี้', 'error');
        setTimeout(() => window.location.href = '/index.html', 2000);
        return false;
    }
    
    return true;
};

// ========================================
// APPLICATION INITIALIZATION
// ========================================
function init() {
    // Add event listeners
    window.addEventListener('scroll', UI.handleScroll);

    // Listen for authentication state changes
    onAuthStateChanged(auth, (user) => {
        UI.updateUserInfo(user);
        
        // Perform the access check only after auth state is confirmed
        if (checkAdminAccess(user)) {
             Utils.showToast('ยินดีต้อนรับสู่หน้าแอดมิน', 'success');
        }
    });

    console.log('[INFO] Admin hub initialized.');
}

// Start the application
document.addEventListener('DOMContentLoaded', init);
