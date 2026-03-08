// Import Firebase auth service from the initialization file
import { auth } from './firebase-init.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ========================================
// DOM ELEMENTS
// ========================================
const DOMElements = {
    // Inputs
    youtubeUrlInput: document.getElementById('youtubeUrl'),
    youtubeUrlsTextarea: document.getElementById('youtubeUrls'),
    
    // Buttons
    processSingleBtn: document.getElementById('processSingleBtn'),
    processBatchBtn: document.getElementById('processBatchBtn'),

    // Results
    resultsSection: document.getElementById('aiResults'),
    resultsGrid: document.getElementById('resultsGrid'),
    
    // Loading
    loadingOverlay: document.getElementById('loadingOverlay')
};

// ========================================
// APPLICATION STATE
// ========================================
const AppState = {
    currentUser: null,
    isLoading: false,
};

// ========================================
// UTILITY FUNCTIONS
// ========================================
const Utils = {
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            toast.addEventListener('animationend', () => toast.remove());
        }, 3000);
    },
    
    showLoading() {
        if(DOMElements.loadingOverlay) DOMElements.loadingOverlay.style.display = 'flex';
        AppState.isLoading = true;
    },

    hideLoading() {
        if(DOMElements.loadingOverlay) DOMElements.loadingOverlay.style.display = 'none';
        AppState.isLoading = false;
    },

    isValidYouTubeUrl(url) {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/;
        return youtubeRegex.test(url);
    }
};

// ========================================
// UI FUNCTIONS
// ========================================
const UI = {
    showResults(results) {
        if (results && results.length > 0) {
            DOMElements.resultsSection.style.display = 'block';
            DOMElements.resultsGrid.innerHTML = results.map(result => {
                const data = result.movieData || result.data || {};
                const isSuccess = result.success;
                return `
                <div class="result-item ${isSuccess ? 'success' : 'error'}">
                    <h3 class="result-title">${data.title || 'Processing...'}</h3>
                    <div class="result-meta">
                        <span class="result-status ${isSuccess ? 'success' : 'error'}">${isSuccess ? '✅ สำเร็จ' : '❌ ผิดพลาด'}</span>
                        ${isSuccess ? `<span class="result-id">ID: ${data.id || 'N/A'}</span>` : ''}
                    </div>
                    ${isSuccess ? `
                        <div class="result-details">
                            <p><strong>คำอธิบาย:</strong> ${data.description || 'ไม่มีคำอธิบาย'}</p>
                            <p><strong>Category:</strong> ${data.category || 'N/A'}</p>
                        </div>
                    ` : `
                        <div class="result-error">
                            <p><strong>ข้อผิดพลาด:</strong> ${result.error || 'Unknown error'}</p>
                        </div>
                    `}
                </div>`;
            }).join('');
        } else {
            DOMElements.resultsSection.style.display = 'none';
        }
    }
};


// ========================================
// API & PROCESSING FUNCTIONS
// ========================================
const Processor = {
    async processUrls(urls) {
        if (AppState.isLoading) {
            Utils.showToast('AI กำลังทำงานอยู่ กรุณารอสักครู่', 'warning');
            return;
        }

        const endpoint = urls.length > 1 ? '/api/ai/batch-process' : '/api/ai/process-youtube';
        const body = {
            adminEmail: AppState.currentUser?.email || 'duy.kan1234@gmail.com' // Fallback email
        };
        if (urls.length > 1) {
            body.urls = urls;
        } else {
            body.youtubeUrl = urls[0];
        }
        
        Utils.showLoading();

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                 const errorText = await response.text();
                 throw new Error(`Server responded with ${response.status}: ${errorText}`);
            }

            const result = await response.json();

            if (result.success) {
                Utils.showToast(`ประมวลผลสำเร็จ ${urls.length} URL`, 'success');
                const resultsToShow = urls.length > 1 ? result.data.results || result.data : [{ success: true, data: result.data }];
                UI.showResults(resultsToShow);
            } else {
                throw new Error(result.error || 'An unknown error occurred during processing');
            }
        } catch (error) {
            console.error('Error processing URL(s):', error);
            Utils.showToast(`เกิดข้อผิดพลาด: ${error.message}`, 'error');
            UI.showResults([{ success: false, error: error.message }]);
        } finally {
            Utils.hideLoading();
        }
    },

    handleSingleProcess() {
        const url = DOMElements.youtubeUrlInput.value.trim();
        if (!url) {
            Utils.showToast('กรุณาใส่ YouTube URL', 'error');
            return;
        }
        if (!Utils.isValidYouTubeUrl(url)) {
            Utils.showToast('YouTube URL ไม่ถูกต้อง', 'error');
            return;
        }
        DOMElements.youtubeUrlInput.value = '';
        Processor.processUrls([url]);
    },

    handleBatchProcess() {
        const urlsText = DOMElements.youtubeUrlsTextarea.value.trim();
        const urls = urlsText.split('
').filter(url => url.trim() && Utils.isValidYouTubeUrl(url));
        
        if (urls.length === 0) {
            Utils.showToast('กรุณาใส่ YouTube URLs ที่ถูกต้องอย่างน้อยหนึ่งรายการ', 'error');
            return;
        }
        
        DOMElements.youtubeUrlsTextarea.value = '';
        Processor.processUrls(urls);
    }
};

// ========================================
// SECURITY & AUTHENTICATION
// ========================================
function checkAdminAccess(user) {
    const ADMIN_EMAIL = "duy.kan1234@gmail.com";
    if (!user || user.email !== ADMIN_EMAIL) {
        Utils.showToast('คุณไม่มีสิทธิ์เข้าถึงหน้านี้ กำลังนำทางกลับ...', 'error');
        setTimeout(() => window.location.href = '/index.html', 2000);
        return false;
    }
    return true;
}

// ========================================
// APPLICATION INITIALIZATION
// ========================================
function init() {
    // Attach event listeners
    DOMElements.processSingleBtn.addEventListener('click', Processor.handleSingleProcess);
    DOMElements.processBatchBtn.addEventListener('click', Processor.handleBatchProcess);
    
    // Auth state listener
    onAuthStateChanged(auth, (user) => {
        AppState.currentUser = user;
        // Hide page content if not authorized
        if (!checkAdminAccess(user)) {
             document.body.style.display = 'none';
        }
    });

    console.log('[INFO] AI Processor page initialized');
}

document.addEventListener('DOMContentLoaded', init);
