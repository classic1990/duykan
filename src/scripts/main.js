// ========================================
// MAIN JAVASCRIPT - DUYDODEE Streaming Platform
// ========================================

// Application State
const AppState = {
    user: null,
    movies: [],
    series: [],
    loading: false,
    searchQuery: '',
    currentFilter: 'all'
};

// Utility Functions
const Utils = {
    // Show loading spinner
    showLoading() {
        const loader = document.getElementById('loadingSpinner');
        if (loader) {
            loader.style.display = 'flex';
        }
        AppState.loading = true;
    },

    // Hide loading spinner
    hideLoading() {
        const loader = document.getElementById('loadingSpinner');
        if (loader) {
            loader.style.display = 'none';
        }
        AppState.loading = false;
    },

    // Show toast notification
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${this.getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        const container = document.getElementById('toastContainer') || this.createToastContainer();
        container.appendChild(toast);

        // Auto remove after 5 seconds
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
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    },

    // Format date
    formatDate(date) {
        return new Date(date).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    // Format duration
    formatDuration(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}ชม ${mins}นาที` : `${mins}นาที`;
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// API Functions
const API = {
    // Base URL
    baseUrl: '/api',

    // Generic request method
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
            console.error('API Error:', error);
            Utils.showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
            throw error;
        }
    },

    // Get movies
    async getMovies(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/movies?${queryString}` : '/movies';
        return this.request(endpoint);
    },

    // Get movie by ID
    async getMovie(id) {
        return this.request(`/movies/${id}`);
    },

    // Get series
    async getSeries(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/series?${queryString}` : '/series';
        return this.request(endpoint);
    },

    // Get series by ID
    async getSerie(id) {
        return this.request(`/series/${id}`);
    },

    // Search
    async search(query) {
        return this.request(`/search?q=${encodeURIComponent(query)}`);
    }
};

// UI Functions
const UI = {
    // Render movies grid
    renderMoviesGrid(movies) {
        const container = document.getElementById('moviesGrid');
        if (!container) return;

        if (movies.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-film"></i>
                    <h3>ไม่พบซีรีส์</h3>
                    <p>ลองค้นหาด้วยคำอื่นๆ ดูสิ</p>
                </div>
            `;
            return;
        }

        container.innerHTML = movies.map(movie => `
            <div class="movie-card" data-id="${movie.id}">
                <div class="movie-poster">
                    <img src="${movie.poster || '/assets/images/default-poster.jpg'}" 
                         alt="${movie.title}" 
                         loading="lazy">
                    <div class="movie-overlay">
                        <button class="play-btn" onclick="UI.playMovie('${movie.id}')">
                            <i class="fas fa-play"></i>
                        </button>
                        <button class="info-btn" onclick="UI.showMovieInfo('${movie.id}')">
                            <i class="fas fa-info-circle"></i>
                        </button>
                    </div>
                </div>
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title}</h3>
                    <p class="movie-meta">
                        <span class="year">${movie.year || 'N/A'}</span>
                        <span class="rating">
                            <i class="fas fa-star"></i>
                            ${movie.rating || 'N/A'}
                        </span>
                    </p>
                    <p class="movie-description">${movie.description || ''}</p>
                </div>
            </div>
        `).join('');
    },

    // Play movie
    playMovie(id) {
        window.location.href = `/watch-enhanced.html?id=${id}`;
    },

    // Show movie info
    showMovieInfo(id) {
        // Implementation for movie info modal
        console.log('Show movie info:', id);
    },

    // Initialize search
    initSearch() {
        const searchInput = document.getElementById('searchInput');
        const searchToggle = document.getElementById('searchToggle');
        const searchBar = document.getElementById('searchBar');
        const searchClose = document.getElementById('searchClose');

        if (searchToggle) {
            searchToggle.addEventListener('click', () => {
                searchBar.classList.toggle('active');
                if (searchInput) {
                    searchInput.focus();
                }
            });
        }

        if (searchClose) {
            searchClose.addEventListener('click', () => {
                searchBar.classList.remove('active');
                if (searchInput) {
                    searchInput.value = '';
                }
            });
        }

        if (searchInput) {
            const debouncedSearch = Utils.debounce(async (query) => {
                if (query.trim()) {
                    Utils.showLoading();
                    try {
                        const results = await API.search(query);
                        AppState.searchResults = results.data || [];
                        this.renderSearchResults(AppState.searchResults);
                    } catch (error) {
                        Utils.showToast('ค้นหาล้มเหลว', 'error');
                    } finally {
                        Utils.hideLoading();
                    }
                }
            }, 300);

            searchInput.addEventListener('input', (e) => {
                debouncedSearch(e.target.value);
            });
        }
    },

    // Render search results
    renderSearchResults(results) {
        const container = document.getElementById('searchResults');
        if (!container) return;

        if (results.length === 0) {
            container.innerHTML = `
                <div class="search-empty">
                    <i class="fas fa-search"></i>
                    <p>ไม่พบผลลัพธ์</p>
                </div>
            `;
            return;
        }

        container.innerHTML = results.map(item => `
            <div class="search-result-item" onclick="UI.goToItem('${item.id}', '${item.type}')">
                <img src="${item.poster || '/assets/images/default-poster.jpg'}" alt="${item.title}">
                <div class="search-result-info">
                    <h4>${item.title}</h4>
                    <p>${item.description || ''}</p>
                    <span class="search-result-type">${item.type}</span>
                </div>
            </div>
        `).join('');
    },

    // Go to item
    goToItem(id, type) {
        if (type === 'movie') {
            window.location.href = `/watch-enhanced.html?id=${id}`;
        } else {
            window.location.href = `/watch-enhanced.html?id=${id}`;
        }
    }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎬 DUYDODEE Streaming Platform initialized');
    
    // Initialize search
    UI.initSearch();
    
    // Load initial data
    try {
        Utils.showLoading();
        const movies = await API.getMovies();
        AppState.movies = movies.data || [];
        UI.renderMoviesGrid(AppState.movies);
    } catch (error) {
        Utils.showToast('โหลดข้อมูลล้มเหลว', 'error');
    } finally {
        Utils.hideLoading();
    }
});

// Global functions for inline event handlers
window.UI = UI;
window.Utils = Utils;
window.API = API;
