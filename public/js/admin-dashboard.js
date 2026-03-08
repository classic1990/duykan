import { showToast, formatNumber, formatDate, debounce, highlightText } from './common.js';

// ========================================
// APPLICATION STATE
// ========================================
const AppState = {
    movies: [],
    filteredMovies: [],
    currentMovie: null,
    isLoading: false,
    currentPage: 1,
    itemsPerPage: 5
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
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    exportCsvBtn: document.getElementById('exportCsvBtn'),
    aiProcessorSection: document.getElementById('aiProcessorSection'),
    paginationContainer: document.getElementById('paginationContainer'),
    toggleAIProcessorBtn: document.getElementById('toggleAIProcessorBtn'),
    processSingleBtn: document.getElementById('processSingleBtn'),
    processBatchBtn: document.getElementById('processBatchBtn'),
    youtubeUrlInput: document.getElementById('youtubeUrl'),
    youtubeUrlsTextarea: document.getElementById('youtubeUrls'),
    aiResultsSection: document.getElementById('aiResults'),
    resultsGrid: document.getElementById('resultsGrid'),
    viewsChart: document.getElementById('viewsChart'),
    // Stats
    statTotalMovies: document.getElementById('statTotalMovies'),
    statTotalViews: document.getElementById('statTotalViews'),
    statActiveRate: document.getElementById('statActiveRate'),
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
// CHART MANAGER
// ========================================
const ChartManager = {
    chartInstance: null,

    createDoughnutChart(labels, data) {
        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        const ctx = DOMElements.viewsChart.getContext('2d');

        this.chartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'จำนวนหนัง',
                    data: data,
                    backgroundColor: [
                        'rgba(229, 9, 20, 0.8)',    // Primary Red
                        'rgba(54, 162, 235, 0.8)', // Blue
                        'rgba(255, 206, 86, 0.8)', // Yellow
                        'rgba(75, 192, 192, 0.8)',  // Teal
                        'rgba(153, 102, 255, 0.8)',// Purple
                        'rgba(255, 159, 64, 0.8)'  // Orange
                    ],
                    borderColor: 'var(--bg-card)',
                    borderWidth: 2,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: 'var(--text-muted)',
                            font: { family: 'Prompt' }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleFont: { family: 'Prompt', size: 14 },
                        bodyFont: { family: 'Prompt', size: 12 },
                        padding: 12,
                        cornerRadius: 8,
                        boxPadding: 4,
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed !== null) {
                                    label += context.parsed + ' เรื่อง';
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    },

    updateWithMovieData() {
        if (!AppState.movies || AppState.movies.length === 0) {
            return;
        }

        const categoryCounts = AppState.movies.reduce((acc, movie) => {
            const category = movie.category || 'ไม่ระบุ';
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {});

        const labels = Object.keys(categoryCounts);
        const data = Object.values(categoryCounts);

        this.createDoughnutChart(labels, data);
    }
};

// ========================================
// EXPORTER FUNCTIONS
// ========================================
const Exporter = {
    convertToCSV(data) {
        if (!data || data.length === 0) {
            return '';
        }

        const headers = ['id', 'title', 'description', 'category', 'year', 'rating', 'viewCount', 'status', 'youtube'];
        const csvRows = [];

        // Add headers
        csvRows.push(headers.join(','));

        // Add data rows
        for (const row of data) {
            const values = headers.map(header => {
                let value = row[header];
                if (value === null || value === undefined) {
                    value = '';
                } else {
                    value = String(value).replace(/(\r\n|\n|\r)/gm, " "); // Remove newlines
                }
                // Escape quotes and handle commas
                if (value.includes('"') || value.includes(',')) {
                    value = `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            });
            csvRows.push(values.join(','));
        }

        return csvRows.join('\n');
    },

    exportToCSV() {
        const dataToExport = AppState.filteredMovies;
        if (dataToExport.length === 0) {
            showToast('ไม่มีข้อมูลสำหรับส่งออก', 'warning');
            return;
        }
        const csvString = this.convertToCSV(dataToExport);
        const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = Object.assign(document.createElement('a'), { href: url, download: `duydodee-movies-${new Date().toISOString().slice(0, 10)}.csv` });
        document.body.appendChild(link).click();
        document.body.removeChild(link);
    }
};

// ========================================
// AI PROCESSOR FUNCTIONS
// ========================================
const AIProcessor = {
    async processSingle() {
        const url = DOMElements.youtubeUrlInput.value.trim();
        if (!url) {
            showToast('กรุณาใส่ YouTube URL', 'error');
            return;
        }
        if (!this.isValidYouTubeUrl(url)) {
            showToast('YouTube URL ไม่ถูกต้อง', 'error');
            return;
        }
        this.processUrls([url]);
    },

    async processBatch() {
        const urlsText = DOMElements.youtubeUrlsTextarea.value.trim();
        const urls = urlsText.split('
').filter(url => url.trim());
        if (urls.length === 0) {
            showToast('กรุณาใส่ YouTube URLs', 'error');
            return;
        }
        const invalidUrls = urls.filter(url => !this.isValidYouTubeUrl(url.trim()));
        if (invalidUrls.length > 0) {
            showToast(`พบ YouTube URLs ไม่ถูกต้อง ${invalidUrls.length} รายการ`, 'error');
            return;
        }
        this.processUrls(urls);
    },

    async processUrls(urls) {
        const endpoint = urls.length > 1 ? '/api/ai/batch-process' : '/api/ai/process-youtube';
        const body = urls.length > 1 ? { urls, adminEmail: 'duy.kan1234@gmail.com' } : { youtubeUrl: urls[0], adminEmail: 'duy.kan1234@gmail.com' };
        
        showToast(`กำลังประมวลผล ${urls.length} URL...`, 'info');

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
                showToast(`ประมวลผลสำเร็จ ${urls.length} URL`, 'success');
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
            showToast(`เกิดข้อผิดพลาด: ${error.message}`, 'error');
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
                UI.updateStats();
                ChartManager.updateWithMovieData();
            }
        } catch (error) {
            console.error('Error loading movies:', error);
            showToast('ไม่สามารถโหลดข้อมูลหนังได้', 'error');
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
                showToast('บันทึกหนังสำเร็จ', 'success');
                await API.loadMovies();
                UI.closeModal();
            } else {
                throw new Error(result.message || 'ไม่สามารถบันทึกหนังได้');
            }
        } catch (error) {
            console.error('Error saving movie:', error);
            showToast(error.message, 'error');
        }
    },

    async deleteMovie(movieId) {
        try {
            const response = await fetch(`/api/movies/${movieId}`, { method: 'DELETE' });
            const result = await response.json();
            if (result.success) {
                showToast('ลบหนังสำเร็จ', 'success');
                await API.loadMovies();
            } else {
                throw new Error(result.message || 'ไม่สามารถลบหนังได้');
            }
        } catch (error) {
            console.error('Error deleting movie:', error);
            showToast(error.message, 'error');
        }
    }
};

// ========================================
// UI FUNCTIONS (Modal, Table, etc.)
// ========================================
const UI = {
    renderMoviesTable(searchTerm = '') {
        const { currentPage, itemsPerPage, filteredMovies } = AppState;
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedMovies = filteredMovies.slice(startIndex, endIndex);

        const tbody = DOMElements.moviesTableBody;
        if (filteredMovies.length === 0) {
            tbody.innerHTML = `
                <tr><td colspan="6" style="text-align: center; padding: 40px; color: var(--text-muted);">
                    <i class="fas fa-film" style="font-size: 3rem; margin-bottom: 15px; display: block;"></i>
                    <p>ไม่พบข้อมูลหนัง</p>
                </td></tr>`;
            // Clear pagination if no results
            DOMElements.paginationContainer.innerHTML = '';
            return;
        }
        tbody.innerHTML = paginatedMovies.map(movie => `
            <tr>
                <td>
                    <div class="movie-info">
                        <img src="${movie.poster || 'https://placehold.co/60x90?text=No+Image'}" alt="${movie.title}" class="movie-poster">
                        <div class="movie-details">
                            <h4>${highlightText(movie.title, searchTerm)}</h4>
                            <p>${highlightText(movie.description || 'ไม่มีคำอธิบาย', searchTerm)}</p>
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
        this.renderPagination();
    },

    renderPagination() {
        const { currentPage, itemsPerPage, filteredMovies } = AppState;
        const totalPages = Math.ceil(filteredMovies.length / itemsPerPage);
        const container = DOMElements.paginationContainer;

        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let paginationHTML = '<div class="pagination-controls">';
        // Prev button
        paginationHTML += `<button class="pagination-btn" data-page="prev" ${currentPage === 1 ? 'disabled' : ''}>ก่อนหน้า</button>`;
        
        // Page info
        paginationHTML += `<span class="pagination-info">หน้า ${currentPage} / ${totalPages}</span>`;

        // Next button
        paginationHTML += `<button class="pagination-btn" data-page="next" ${currentPage === totalPages ? 'disabled' : ''}>ถัดไป</button>`;
        
        paginationHTML += '</div>';
        container.innerHTML = paginationHTML;
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
    },

    updateStats() {
        const { movies } = AppState;
        
        // 1. Total Movies
        const totalMovies = movies.length;
        if (DOMElements.statTotalMovies) {
            DOMElements.statTotalMovies.textContent = formatNumber(totalMovies);
        }

        // 2. Total Views
        const totalViews = movies.reduce((acc, movie) => acc + (parseInt(movie.viewCount) || 0), 0);
        if (DOMElements.statTotalViews) {
            DOMElements.statTotalViews.textContent = formatNumber(totalViews);
        }

        // 3. Active Rate (Movies active / Total)
        if (totalMovies > 0 && DOMElements.statActiveRate) {
            const activeMovies = movies.filter(m => m.status === 'active').length;
            const rate = (activeMovies / totalMovies) * 100;
            DOMElements.statActiveRate.textContent = rate.toFixed(1) + '%';
        }
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

function handlePagination(e) {
    const button = e.target.closest('.pagination-btn');
    if (!button || button.disabled) return;

    const pageAction = button.dataset.page;
    const totalPages = Math.ceil(AppState.filteredMovies.length / AppState.itemsPerPage);

    if (pageAction === 'prev' && AppState.currentPage > 1) {
        AppState.currentPage--;
    } else if (pageAction === 'next' && AppState.currentPage < totalPages) {
        AppState.currentPage++;
    }
    
    UI.renderMoviesTable();
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

function performSearch(searchTerm) {
    AppState.currentPage = 1; // Reset to first page on new search
    DOMElements.clearSearchBtn.style.display = searchTerm ? 'block' : 'none';

    if (searchTerm === '') {
        AppState.filteredMovies = AppState.movies;
    } else {
        const lowerCaseTerm = searchTerm.toLowerCase();
        AppState.filteredMovies = AppState.movies.filter(movie =>
            movie.title.toLowerCase().includes(lowerCaseTerm) ||
            (movie.description && movie.description.toLowerCase().includes(lowerCaseTerm)) ||
            movie.category.toLowerCase().includes(lowerCaseTerm)
        );
    }
    UI.renderMoviesTable(searchTerm);
}

const handleSearchInput = debounce((e) => {
    performSearch(e.target.value);
}, 300); // 300ms debounce delay

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
    DOMElements.searchInput.addEventListener('input', handleSearchInput);
    DOMElements.clearSearchBtn.addEventListener('click', () => {
        DOMElements.searchInput.value = '';
        performSearch('');
        DOMElements.searchInput.focus();
    });
    DOMElements.exportCsvBtn.addEventListener('click', Exporter.exportToCSV);
    DOMElements.moviesTableBody.addEventListener('click', handleTableActions);
    DOMElements.paginationContainer.addEventListener('click', handlePagination);
    DOMElements.toggleAIProcessorBtn.addEventListener('click', UI.toggleAIProcessor);
    DOMElements.processSingleBtn.addEventListener('click', () => AIProcessor.processSingle());
    DOMElements.processBatchBtn.addEventListener('click', () => AIProcessor.processBatch());
    
    // Load initial data
    await API.loadMovies();

    console.log('[INFO] Admin dashboard initialized');
}

document.addEventListener('DOMContentLoaded', initApp);
