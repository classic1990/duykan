// ========================================
// APPLICATION STATE
// ========================================
const AppState = {
    movies: [],
    filteredMovies: [],
    currentMovie: null,
    isLoading: false
};

// ========================================
// DOM ELEMENTS
// ========================================
const DOMElements = {
    moviesTableBody: document.getElementById('moviesTableBody'),
    movieModal: document.getElementById('movieModal'),
    movieForm: document.getElementById('movieForm'),
    modalTitle: document.querySelector('#movieModal .modal-title'),
    addMovieBtn: document.getElementById('addMovieBtn'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    cancelModalBtn: document.getElementById('cancelModalBtn'),
    searchInput: document.querySelector('.search-input'),
    aiProcessorSection: document.getElementById('aiProcessorSection'),
    toggleAIProcessorBtn: document.getElementById('toggleAIProcessorBtn'),
    processSingleBtn: document.getElementById('processSingleBtn'),
    processBatchBtn: document.getElementById('processBatchBtn'),
    youtubeUrlInput: document.getElementById('youtubeUrl'),
    youtubeUrlsTextarea: document.getElementById('youtubeUrls'),
    aiResultsSection: document.getElementById('aiResults'),
    resultsGrid: document.getElementById('resultsGrid'),
    // Form fields
    movieTitle: document.getElementById('movieTitle'),
    movieDescription: document.getElementById('movieDescription'),
    movieYear: document.getElementById('movieYear'),
    movieCategory: document.getElementById('movieCategory'),
    moviePoster: document.getElementById('moviePoster'),
    movieYoutube: document.getElementById('movieYoutube'),
    movieStatus: document.getElementById('movieStatus')
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

    formatNumber(num) {
        return new Intl.NumberFormat('th-TH').format(num);
    },

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('th-TH');
    }
};

// ========================================
// AI PROCESSOR FUNCTIONS
// ========================================
const AIProcessor = {
    async processSingle() {
        const url = DOMElements.youtubeUrlInput.value.trim();
        if (!url) {
            Utils.showToast('กรุณาใส่ YouTube URL', 'error');
            return;
        }
        if (!this.isValidYouTubeUrl(url)) {
            Utils.showToast('YouTube URL ไม่ถูกต้อง', 'error');
            return;
        }
        this.processUrls([url]);
    },

    async processBatch() {
        const urlsText = DOMElements.youtubeUrlsTextarea.value.trim();
        const urls = urlsText.split('
').filter(url => url.trim());
        if (urls.length === 0) {
            Utils.showToast('กรุณาใส่ YouTube URLs', 'error');
            return;
        }
        const invalidUrls = urls.filter(url => !this.isValidYouTubeUrl(url.trim()));
        if (invalidUrls.length > 0) {
            Utils.showToast(`พบ YouTube URLs ไม่ถูกต้อง ${invalidUrls.length} รายการ`, 'error');
            return;
        }
        this.processUrls(urls);
    },

    async processUrls(urls) {
        const endpoint = urls.length > 1 ? '/api/ai/batch-process' : '/api/ai/process-youtube';
        const body = urls.length > 1 ? { urls, adminEmail: 'duy.kan1234@gmail.com' } : { youtubeUrl: urls[0], adminEmail: 'duy.kan1234@gmail.com' };
        
        Utils.showToast(`กำลังประมวลผล ${urls.length} URL...`, 'info');

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
                DOMElements.youtubeUrlInput.value = '';
                DOMElements.youtubeUrlsTextarea.value = '';
                
                const resultsToShow = urls.length > 1 ? result.data.results || result.data : [{ success: true, movieData: result.data, data: result.data }];
                this.showResults(resultsToShow);

                await API.loadMovies();
            } else {
                throw new Error(result.error || 'An unknown error occurred');
            }
        } catch (error) {
            console.error('Error processing URL(s):', error);
            Utils.showToast(`เกิดข้อผิดพลาด: ${error.message}`, 'error');
        }
    },

    isValidYouTubeUrl(url) {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/;
        return youtubeRegex.test(url);
    },

    showResults(results) {
        if (results && results.length > 0) {
            DOMElements.aiResultsSection.style.display = 'block';
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
                            <p><strong>Platform:</strong> ${data.platform || 'N/A'}</p>
                            <p><strong>YouTube ID:</strong> ${data.ytId || 'N/A'}</p>
                        </div>
                    ` : `
                        <div class="result-error">
                            <p><strong>ข้อผิดพลาด:</strong> ${result.error || 'Unknown error'}</p>
                        </div>
                    `}
                </div>`;
            }).join('');
        } else {
            DOMElements.aiResultsSection.style.display = 'none';
        }
    }
};


// ========================================
// API FUNCTIONS
// ========================================
const API = {
    async loadMovies() {
        AppState.isLoading = true;
        try {
            const response = await fetch('/api/movies');
            const result = await response.json();
            if (result.success) {
                AppState.movies = result.data;
                AppState.filteredMovies = result.data;
                UI.renderMoviesTable();
            }
        } catch (error) {
            console.error('Error loading movies:', error);
            Utils.showToast('ไม่สามารถโหลดข้อมูลหนังได้', 'error');
        } finally {
            AppState.isLoading = false;
        }
    },

    async saveMovie(movieData) {
        const isEditing = !!AppState.currentMovie;
        const url = isEditing ? `/api/movies/${AppState.currentMovie.id}` : '/api/movies';
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(movieData)
            });
            const result = await response.json();
            if (result.success) {
                Utils.showToast('บันทึกหนังสำเร็จ', 'success');
                await API.loadMovies();
                UI.closeModal();
            } else {
                throw new Error(result.message || 'ไม่สามารถบันทึกหนังได้');
            }
        } catch (error) {
            console.error('Error saving movie:', error);
            Utils.showToast(error.message, 'error');
        }
    },

    async deleteMovie(movieId) {
        try {
            const response = await fetch(`/api/movies/${movieId}`, { method: 'DELETE' });
            const result = await response.json();
            if (result.success) {
                Utils.showToast('ลบหนังสำเร็จ', 'success');
                await API.loadMovies();
            } else {
                throw new Error(result.message || 'ไม่สามารถลบหนังได้');
            }
        } catch (error) {
            console.error('Error deleting movie:', error);
            Utils.showToast(error.message, 'error');
        }
    }
};

// ========================================
// UI FUNCTIONS (Modal, Table, etc.)
// ========================================
const UI = {
    renderMoviesTable() {
        const tbody = DOMElements.moviesTableBody;
        if (AppState.filteredMovies.length === 0) {
            tbody.innerHTML = `
                <tr><td colspan="6" style="text-align: center; padding: 40px; color: var(--text-muted);">
                    <i class="fas fa-film" style="font-size: 3rem; margin-bottom: 15px; display: block;"></i>
                    <p>ไม่พบข้อมูลหนัง</p>
                </td></tr>`;
            return;
        }
        tbody.innerHTML = AppState.filteredMovies.map(movie => `
            <tr>
                <td>
                    <div class="movie-info">
                        <img src="${movie.poster || 'https://placehold.co/60x90?text=No+Image'}" alt="${movie.title}" class="movie-poster">
                        <div class="movie-details">
                            <h4>${movie.title}</h4>
                            <p>${movie.description || 'ไม่มีคำอธิบาย'}</p>
                        </div>
                    </div>
                </td>
                <td>${movie.category || 'N/A'}</td>
                <td>${movie.year || 'N/A'}</td>
                <td>${Utils.formatNumber(movie.viewCount || 0)}</td>
                <td><span class="status-badge ${movie.status || 'active'}">${movie.status === 'active' ? 'ใช้งาน' : 'ไม่ใช้งาน'}</span></td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn edit" data-id="${movie.id}" aria-label="แก้ไข"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete" data-id="${movie.id}" aria-label="ลบ"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    },
    
    openModalForEdit(movie) {
        AppState.currentMovie = movie;
        DOMElements.modalTitle.textContent = 'แก้ไขหนัง';
        DOMElements.movieTitle.value = movie.title || '';
        DOMElements.movieDescription.value = movie.description || '';
        DOMElements.movieYear.value = movie.year || '';
        DOMElements.movieCategory.value = movie.category || '';
        DOMElements.moviePoster.value = movie.poster || '';
        DOMElements.movieYoutube.value = movie.youtube || '';
        DOMElements.movieStatus.value = movie.status || 'active';
        DOMElements.movieModal.classList.add('active');
    },

    openModalForAdd() {
        AppState.currentMovie = null;
        DOMElements.modalTitle.textContent = 'เพิ่มหนังใหม่';
        DOMElements.movieForm.reset();
        DOMElements.movieModal.classList.add('active');
    },

    closeModal() {
        DOMElements.movieModal.classList.remove('active');
    },

    toggleAIProcessor() {
        const section = DOMElements.aiProcessorSection;
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
    }
};

// ========================================
// EVENT HANDLERS
// ========================================
function handleTableActions(e) {
    const target = e.target.closest('button');
    if (!target) return;

    const movieId = target.dataset.id;
    if (target.classList.contains('edit')) {
        const movie = AppState.movies.find(m => m.id === movieId);
        if (movie) UI.openModalForEdit(movie);
    } else if (target.classList.contains('delete')) {
        if (confirm('คุณต้องการลบหนังนี้ใช่หรือไม่?')) {
            API.deleteMovie(movieId);
        }
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const movieData = {
        title: DOMElements.movieTitle.value,
        description: DOMElements.movieDescription.value,
        year: parseInt(DOMElements.movieYear.value),
        category: DOMElements.movieCategory.value,
        poster: DOMElements.moviePoster.value,
        youtube: DOMElements.movieYoutube.value,
        status: DOMElements.movieStatus.value
    };
    await API.saveMovie(movieData);
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    if (searchTerm === '') {
        AppState.filteredMovies = AppState.movies;
    } else {
        AppState.filteredMovies = AppState.movies.filter(movie =>
            movie.title.toLowerCase().includes(searchTerm) ||
            (movie.description && movie.description.toLowerCase().includes(searchTerm)) ||
            movie.category.toLowerCase().includes(searchTerm)
        );
    }
    UI.renderMoviesTable();
}

// ========================================
// APPLICATION INITIALIZATION
// ========================================
async function initApp() {
    // Attach event listeners
    DOMElements.addMovieBtn.addEventListener('click', UI.openModalForAdd);
    DOMElements.closeModalBtn.addEventListener('click', UI.closeModal);
    DOMElements.cancelModalBtn.addEventListener('click', UI.closeModal);
    DOMElements.movieModal.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) UI.closeModal();
    });
    DOMElements.movieForm.addEventListener('submit', handleFormSubmit);
    DOMElements.searchInput.addEventListener('input', handleSearch);
    DOMElements.moviesTableBody.addEventListener('click', handleTableActions);
    DOMElements.toggleAIProcessorBtn.addEventListener('click', UI.toggleAIProcessor);
    DOMElements.processSingleBtn.addEventListener('click', () => AIProcessor.processSingle());
    DOMElements.processBatchBtn.addEventListener('click', () => AIProcessor.processBatch());
    
    // Load initial data
    await API.loadMovies();

    console.log('[INFO] Admin dashboard initialized');
}

document.addEventListener('DOMContentLoaded', initApp);
