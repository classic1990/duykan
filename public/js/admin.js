// Import Firebase auth service from the initialization file
import { auth } from './firebase-init.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { showToast, checkAdminAccess } from './common.js';

// ========================================
// DOM ELEMENTS
// ========================================
const DOMElements = {
    navbar: document.getElementById('navbar'),
    userAvatar: document.getElementById('userAvatar'),
    userName: document.getElementById('userName'),
    userMenu: document.getElementById('userMenu')
};

// ========================================
// UTILITY FUNCTIONS
// ========================================
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
// ========================================
// APPLICATION INITIALIZATION
// ========================================
function init() {
    // Add event listeners
    window.addEventListener('scroll', UI.handleScroll);
    DOMElements.userMenu.addEventListener('click', () => {
        if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
            signOut(auth).then(() => {
                showToast('ออกจากระบบสำเร็จ กำลังกลับไปหน้าแรก...', 'success');
                setTimeout(() => {
                    window.location.href = '/index.html';
                }, 1500);
            }).catch((error) => {
                showToast(`เกิดข้อผิดพลาด: ${error.message}`, 'error');
            });
        }
    });

    // Listen for authentication state changes
    onAuthStateChanged(auth, (user) => {
        UI.updateUserInfo(user);
        
        // Perform the access check only after auth state is confirmed
        if (checkAdminAccess(user)) {
             showToast('ยินดีต้อนรับสู่หน้าแอดมิน', 'success');
        }
    });

    console.log('[INFO] Admin hub initialized.');
}

// Start the application
document.addEventListener('DOMContentLoaded', init);
