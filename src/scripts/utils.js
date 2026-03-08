// ========================================
// UTILITY FUNCTIONS - DUYDODEE Streaming Platform
// ========================================

/**
 * Utility functions for the DUYDODEE Streaming Platform
 */

// String utilities
const StringUtils = {
    // Capitalize first letter
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    // Truncate string
    truncate(str, length = 100) {
        return str.length > length ? str.substring(0, length) + '...' : str;
    },

    // Slugify string
    slugify(str) {
        return str
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    },

    // Escape HTML
    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};

// Array utilities
const ArrayUtils = {
    // Shuffle array
    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    // Unique array
    unique(array) {
        return [...new Set(array)];
    },

    // Group by
    groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = item[key];
            groups[group] = groups[group] || [];
            groups[group].push(item);
            return groups;
        }, {});
    },

    // Sort by
    sortBy(array, key, order = 'asc') {
        return [...array].sort((a, b) => {
            if (order === 'desc') {
                return b[key] > a[key] ? 1 : -1;
            }
            return a[key] > b[key] ? 1 : -1;
        });
    }
};

// Date utilities
const DateUtils = {
    // Format date
    format(date, format = 'short') {
        const d = new Date(date);
        
        switch (format) {
            case 'short':
                return d.toLocaleDateString('th-TH');
            case 'long':
                return d.toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            case 'time':
                return d.toLocaleTimeString('th-TH');
            case 'datetime':
                return d.toLocaleString('th-TH');
            default:
                return d.toLocaleDateString('th-TH');
        }
    },

    // Relative time
    timeAgo(date) {
        const now = new Date();
        const past = new Date(date);
        const diffInSeconds = Math.floor((now - past) / 1000);

        if (diffInSeconds < 60) {
            return 'เมื่อสักครู่';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} นาทีที่แล้ว`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} ชั่วโมงที่แล้ว`;
        } else if (diffInSeconds < 2592000) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} วันที่แล้ว`;
        } else {
            const months = Math.floor(diffInSeconds / 2592000);
            return `${months} เดือนที่แล้ว`;
        }
    },

    // Add days
    addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    },

    // Is today
    isToday(date) {
        const today = new Date();
        const checkDate = new Date(date);
        return checkDate.toDateString() === today.toDateString();
    }
};

// Number utilities
const NumberUtils = {
    // Format number
    format(num, options = {}) {
        return new Intl.NumberFormat('th-TH', options).format(num);
    },

    // Format currency
    currency(num, currency = 'THB') {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: currency
        }).format(num);
    },

    // Format bytes
    bytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },

    // Random between
    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Percentage
    percentage(value, total) {
        return total > 0 ? (value / total) * 100 : 0;
    }
};

// URL utilities
const URLUtils = {
    // Get query params
    getParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    },

    // Get single param
    getParam(name) {
        return new URLSearchParams(window.location.search).get(name);
    },

    // Set param
    setParam(name, value) {
        const url = new URL(window.location);
        url.searchParams.set(name, value);
        window.history.replaceState({}, '', url);
    },

    // Remove param
    removeParam(name) {
        const url = new URL(window.location);
        url.searchParams.delete(name);
        window.history.replaceState({}, '', url);
    },

    // Build URL
    build(base, params = {}) {
        const url = new URL(base);
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                url.searchParams.set(key, value);
            }
        });
        return url.toString();
    }
};

// Storage utilities
const StorageUtils = {
    // Set item
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Storage set error:', error);
        }
    },

    // Get item
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Storage get error:', error);
            return defaultValue;
        }
    },

    // Remove item
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Storage remove error:', error);
        }
    },

    // Clear all
    clear() {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Storage clear error:', error);
        }
    },

    // Check if exists
    exists(key) {
        return localStorage.getItem(key) !== null;
    }
};

// Validation utilities
const ValidationUtils = {
    // Email validation
    isEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // URL validation
    isURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },

    // YouTube URL validation
    isYouTubeURL(url) {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
        return youtubeRegex.test(url);
    },

    // Phone validation (Thai)
    isPhone(phone) {
        const phoneRegex = /^0[689]\d{8}$/;
        return phoneRegex.test(phone.replace(/[-\s]/g, ''));
    },

    // Required field
    required(value) {
        return value !== null && value !== undefined && value.toString().trim() !== '';
    },

    // Min length
    minLength(value, min) {
        return value && value.length >= min;
    },

    // Max length
    maxLength(value, max) {
        return !value || value.length <= max;
    }
};

// Device utilities
const DeviceUtils = {
    // Is mobile
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    // Is tablet
    isTablet() {
        return /iPad|Android/i.test(navigator.userAgent) && window.innerWidth > 768;
    },

    // Is desktop
    isDesktop() {
        return !this.isMobile() && !this.isTablet();
    },

    // Get screen size
    getScreenSize() {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        };
    },

    // Is landscape
    isLandscape() {
        return window.innerWidth > window.innerHeight;
    }
};

// Export all utilities
window.Utils = {
    ...StringUtils,
    ...ArrayUtils,
    ...DateUtils,
    ...NumberUtils,
    ...URLUtils,
    ...StorageUtils,
    ...ValidationUtils,
    ...DeviceUtils
};

// Export individual utility objects
window.StringUtils = StringUtils;
window.ArrayUtils = ArrayUtils;
window.DateUtils = DateUtils;
window.NumberUtils = NumberUtils;
window.URLUtils = URLUtils;
window.StorageUtils = StorageUtils;
window.ValidationUtils = ValidationUtils;
window.DeviceUtils = DeviceUtils;
