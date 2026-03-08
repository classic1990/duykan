const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

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
            "script-src-attr": ["'unsafe-inline'"],
            "style-src": ["'self'", "'unsafe-inline'", "https:", "http:"],
            "img-src": ["'self'", "data:", "https:", "http:"],
            "connect-src": ["'self'", "https:", "http:"],
            "font-src": ["'self'", "https:", "http:"],
            "object-src": ["'none'"],
            "media-src": ["'self'", "https:", "http:"],
            "frame-src": ["'self'", "https:", "http:"],
            "child-src": ["'self'", "https:", "http:"],
            "worker-src": ["'self'", "blob:"],
            "form-action": ["'self'"],
            "default-src": ["'self'"],
            "base-uri": ["'self'"],
            "manifest-src": ["'self'"],
            "upgrade-insecure-requests": []
        }
    }
}));
app.use(compression());
app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'Server is working!' });
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

// Movies endpoint with mock data
app.get('/api/movies', (req, res) => {
    const { id } = req.query;

    if (id) {
        // Return single movie (mock)
        const movie = {
            id: id,
            title: 'Sample Movie',
            description: 'This is a sample movie for testing',
            poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1925&auto=format&fit=crop',
            rating: 8.5,
            year: 2024,
            category: 'movie',
            youtube: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            link: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0',
            viewCount: 1000,
            isVip: false,
            platform: 'Movie',
            status: 'active'
        };
        return res.json({ success: true, data: movie });
    }

    // Return all movies (mock)
    const movies = [
        {
            id: '1',
            title: 'ซีรีส์สับประหลาดทะลุมิติ',
            description: 'ซีรีส์แฟนตาซีสุดมันส์',
            poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1925&auto=format&fit=crop',
            rating: 8.5,
            year: 2024,
            category: 'series',
            youtube: 'https://www.youtube.com/watch?v=example1',
            link: 'https://www.youtube.com/embed/example1?autoplay=1&rel=0',
            viewCount: 15420,
            isVip: false,
            platform: 'Series',
            status: 'active'
        },
        {
            id: '2',
            title: 'รักนี้ทะลุจอ',
            description: 'ซีรีส์รักโรแมนติก',
            poster: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=2000&auto=format&fit=crop',
            rating: 9.0,
            year: 2024,
            category: 'vertical',
            youtube: 'https://www.youtube.com/watch?v=example2',
            link: 'https://www.youtube.com/embed/example2?autoplay=1&rel=0',
            viewCount: 28950,
            isVip: true,
            platform: 'Vertical',
            status: 'active'
        }
    ];

    res.json({ success: true, data: movies });
});

// Auth endpoint (mock)
app.post('/api/auth/google', (req, res) => {
    const user = {
        uid: 'admin-user-id',
        email: 'duy.kan1234@gmail.com',
        displayName: 'DUYDOO Admin',
        photoURL: 'https://via.placeholder.com/100x100?text=Admin',
        isVip: true,
        role: 'admin'
    };
    res.json({ success: true, data: user, message: 'Login successful' });
});

// Comments endpoint (mock)
app.get('/api/comments', (req, res) => {
    const { movieId } = req.query;
    const comments = [
        {
            id: '1',
            movieId: movieId || '1',
            userId: 'user1@example.com',
            userName: 'User One',
            userPic: 'https://via.placeholder.com/40',
            text: 'ซีรีส์เรื่องนี้สุดยอดมาก!',
            createdAt: new Date()
        },
        {
            id: '2',
            movieId: movieId || '1',
            userId: 'user2@example.com',
            userName: 'User Two',
            userPic: 'https://via.placeholder.com/40',
            text: 'ชอบมาก รอตอนต่อไป',
            createdAt: new Date()
        }
    ];
    res.json({ success: true, data: comments });
});

// Announcement endpoint (mock)
app.get('/api/announcement', (req, res) => {
    res.json({
        success: true,
        announcement: {
            title: '🎉 อัปเดตซีรีส์ใหม่!',
            content: 'เพิ่มซีรีส์ใหม่ทุกวัน อย่าลืมมาดูกันนะครับ!',
            active: true
        }
    });
});

// Admin routes
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/admin-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html'));
});

// Favicon endpoint
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

// 404 handler - serve index.html for SPA routing
app.use('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log('==========================================');
    console.log('🚀 DUYDODEE Server Started Successfully!');
    console.log('==========================================');
    console.log(`📱 Frontend: http://localhost:${PORT}`);
    console.log(`🌐 Network Access: http://0.0.0.0:${PORT}`);
    console.log(`🔧 Admin Panel: http://localhost:${PORT}/admin`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('==========================================');
});

module.exports = app;
