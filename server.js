const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

// Import routes
const moviesRoutes = require('./routes/movies');
const authRoutes = require('./routes/auth');
const authGoogleRoutes = require('./routes/auth-google');

const app = express();
const PORT = process.env.PORT || 3000;

// Production configuration
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? ['https://duydodee-streaming.vercel.app', 'https://localhost:3000']
        : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
    credentials: true
};

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:", "http:"],
            "style-src": ["'self'", "'unsafe-inline'", "https:", "http:"],
            "img-src": ["'self'", "data:", "https:", "http:"],
            "connect-src": ["'self'", "https:", "http:"],
            "font-src": ["'self'", "https:", "http:"],
            "object-src": ["'none'"],
            "media-src": ["'self'", "https:", "http:"],
            "frame-src": ["'none'"],
        },
    },
}));

app.use(cors(corsOptions));
app.use(compression());
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/build', express.static(path.join(__dirname, 'public', 'build')));

// API Routes
app.use('/api/movies', moviesRoutes);
app.use('/api/auth', authRoutes);
app.use('/auth', authGoogleRoutes);

// Mock AI routes
app.post('/api/ai/process-youtube', (req, res) => {
    try {
        const { youtubeUrl, adminEmail } = req.body;

        // Mock AI processing
        setTimeout(() => {
            res.json({
                success: true,
                data: {
                    id: Date.now(),
                    title: 'Mock Movie from YouTube',
                    description: 'This is a mock movie generated from YouTube URL',
                    year: new Date().getFullYear(),
                    poster: '/assets/images/default-poster.jpg',
                    rating: 8.5,
                    status: 'active',
                    createdAt: new Date()
                },
                message: 'YouTube URL processed successfully'
            });
        }, 1000);
    } catch (error) {
        console.error('Error processing YouTube URL:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process YouTube URL'
        });
    }
});

app.post('/api/ai/batch-process', (req, res) => {
    try {
        const { urls, adminEmail } = req.body;

        // Mock batch processing
        setTimeout(() => {
            const results = urls.map((url, index) => ({
                success: true,
                movieData: {
                    id: Date.now() + index,
                    title: `Mock Movie ${index + 1}`,
                    description: 'Mock movie from batch processing',
                    year: new Date().getFullYear(),
                    poster: '/assets/images/default-poster.jpg',
                    rating: 8.0,
                    status: 'active',
                    createdAt: new Date()
                }
            }));

            res.json({
                success: true,
                data: {
                    results,
                    total: results.length,
                    processed: results.length,
                    failed: 0
                },
                message: 'Batch processing completed successfully'
            });
        }, 2000);
    } catch (error) {
        console.error('Error batch processing:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to batch process URLs'
        });
    }
});

// Admin routes
app.get('/api/admin/stats', (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                totalMovies: 5,
                totalUsers: 2,
                totalViews: 15420,
                totalRevenue: 0
            }
        });
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get stats'
        });
    }
});

app.get('/api/admin/users', (req, res) => {
    try {
        res.json({
            success: true,
            data: [
                {
                    id: 1,
                    email: 'duy.kan1234@gmail.com',
                    displayName: 'DUYDOO Admin',
                    role: 'admin',
                    avatar: '/assets/images/admin-avatar.jpg',
                    status: 'active',
                    createdAt: new Date('2023-01-01')
                },
                {
                    id: 2,
                    email: 'user@example.com',
                    displayName: 'Test User',
                    role: 'user',
                    avatar: '/assets/images/default-avatar.jpg',
                    status: 'active',
                    createdAt: new Date('2023-06-15')
                }
            ]
        });
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get users'
        });
    }
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'Server is working!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Health check endpoint for production
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/admin-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html'));
});

app.get('/admin-ai-processor', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-ai-processor.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/watch-enhanced', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'watch-enhanced.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);

    if (res.headersSent) {
        return next(err);
    }

    res.status(err.status || 500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log('==========================================');
    console.log('🚀 DUYDODEE Streaming Platform');
    console.log('==========================================');
    console.log(`� Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Server running on: http://localhost:${PORT}`);
    console.log(`� Admin Panel: http://localhost:${PORT}/admin`);
    console.log(`🤖 AI Processor: http://localhost:${PORT}/admin-ai-processor`);
    console.log(`📊 Health Check: http://localhost:${PORT}/health`);
    console.log('==========================================');
});

module.exports = app;
