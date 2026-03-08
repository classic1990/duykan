// ========================================
// AUTH ROUTES - DUYDODEE Streaming Platform
// ========================================

const express = require('express');
const router = express.Router();
const auth = require('../config/auth');

// Mock users data
const mockUsers = [
    {
        id: 1,
        email: 'duy.kan1234@gmail.com',
        displayName: 'DUYDOO Admin',
        role: 'admin',
        avatar: '/assets/images/admin-avatar.jpg',
        createdAt: new Date('2023-01-01')
    },
    {
        id: 2,
        email: 'user@example.com',
        displayName: 'Test User',
        role: 'user',
        avatar: '/assets/images/default-avatar.jpg',
        createdAt: new Date('2023-06-15')
    }
];

// POST /api/auth/login - Login user
router.post('/login', (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }
        
        // Find user
        const user = mockUsers.find(u => u.email === email);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }
        
        // Mock authentication (always success for demo)
        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    displayName: user.displayName,
                    role: user.role,
                    avatar: user.avatar
                },
                token: 'mock-jwt-token-' + Date.now()
            },
            message: 'Login successful'
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to login'
        });
    }
});

// POST /api/auth/register - Register new user
router.post('/register', (req, res) => {
    try {
        const { email, displayName, password } = req.body;
        
        // Validation
        if (!email || !displayName || !password) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required'
            });
        }
        
        // Check if user already exists
        const existingUser = mockUsers.find(u => u.email === email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: 'User already exists'
            });
        }
        
        // Create new user
        const newUser = {
            id: mockUsers.length + 1,
            email,
            displayName,
            role: 'user',
            avatar: '/assets/images/default-avatar.jpg',
            createdAt: new Date()
        };
        
        mockUsers.push(newUser);
        
        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    displayName: newUser.displayName,
                    role: newUser.role,
                    avatar: newUser.avatar
                },
                token: 'mock-jwt-token-' + Date.now()
            },
            message: 'Registration successful'
        });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to register'
        });
    }
});

// POST /api/auth/google - Google OAuth (Mock)
router.post('/google', (req, res) => {
    try {
        const { token } = req.body;
        
        // Mock Google authentication
        const mockGoogleUser = {
            id: 1,
            email: 'duy.kan1234@gmail.com',
            displayName: 'DUYDOO Admin',
            role: 'admin',
            avatar: 'https://lh3.googleusercontent.com/a-/default-user',
            createdAt: new Date()
        };
        
        res.json({
            success: true,
            data: {
                user: mockGoogleUser,
                token: 'mock-google-token-' + Date.now()
            },
            message: 'Google authentication successful'
        });
    } catch (error) {
        console.error('Error during Google auth:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to authenticate with Google'
        });
    }
});

// GET /api/auth/me - Get current user
router.get('/me', (req, res) => {
    try {
        // Mock authentication check
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'No token provided'
            });
        }
        
        // Mock user data
        const mockUser = {
            id: 1,
            email: 'duy.kan1234@gmail.com',
            displayName: 'DUYDOO Admin',
            role: 'admin',
            avatar: '/assets/images/admin-avatar.jpg',
            createdAt: new Date()
        };
        
        res.json({
            success: true,
            data: mockUser
        });
    } catch (error) {
        console.error('Error getting current user:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get current user'
        });
    }
});

// POST /api/auth/logout - Logout user
router.post('/logout', (req, res) => {
    try {
        // Mock logout (always success)
        res.json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to logout'
        });
    }
});

// POST /api/auth/refresh - Refresh token
router.post('/refresh', (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                error: 'Refresh token is required'
            });
        }
        
        // Mock token refresh
        res.json({
            success: true,
            data: {
                token: 'mock-jwt-token-' + Date.now(),
                refreshToken: 'mock-refresh-token-' + Date.now()
            },
            message: 'Token refreshed successfully'
        });
    } catch (error) {
        console.error('Error refreshing token:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to refresh token'
        });
    }
});

module.exports = router;
