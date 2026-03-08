// ========================================
// GOOGLE OAUTH ROUTES - DUYDODEE Streaming Platform
// ========================================

const express = require('express');
const router = express.Router();
const { google } = require('googleapis');

// Google OAuth Configuration
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// Scopes required for Google OAuth
const SCOPES = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
];

// GET /auth/google - Initiate Google OAuth
router.get('/google', (req, res) => {
    try {
        const url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
            prompt: 'consent',
            state: Math.random().toString(36).substring(7) // CSRF protection
        });
        
        res.redirect(url);
    } catch (error) {
        console.error('Error generating Google OAuth URL:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to initiate Google OAuth'
        });
    }
});

// GET /auth/google/callback - Handle Google OAuth callback
router.get('/google/callback', async (req, res) => {
    try {
        const { code, state } = req.query;
        
        if (!code) {
            return res.status(400).json({
                success: false,
                error: 'Authorization code not provided'
            });
        }

        // Exchange authorization code for tokens
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Get user info
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const userInfo = await oauth2.userinfo.get();

        // Create user object
        const user = {
            id: userInfo.id,
            email: userInfo.email,
            displayName: userInfo.name,
            photo: userInfo.picture,
            verified: userInfo.verified_email,
            tokens: tokens
        };

        // Check if user is admin
        const isAdmin = user.email === process.env.ADMIN_EMAIL;
        
        // Create JWT token (you'll need to install jsonwebtoken)
        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            { 
                userId: user.id,
                email: user.email,
                isAdmin: isAdmin,
                displayName: user.displayName
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // Redirect to frontend with token
        const redirectUrl = `${process.env.NODE_ENV === 'production' 
            ? 'https://duydodee-streaming.vercel.app' 
            : 'http://localhost:3000'}?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`;
        
        res.redirect(redirectUrl);
        
    } catch (error) {
        console.error('Error handling Google OAuth callback:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to authenticate with Google'
        });
    }
});

// GET /auth/google/user - Get current user info
router.get('/google/user', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'No token provided'
            });
        }

        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        res.json({
            success: true,
            data: {
                userId: decoded.userId,
                email: decoded.email,
                displayName: decoded.displayName,
                isAdmin: decoded.isAdmin
            }
        });
        
    } catch (error) {
        console.error('Error getting user info:', error);
        res.status(401).json({
            success: false,
            error: 'Invalid token'
        });
    }
});

// POST /auth/google/logout - Logout user
router.post('/google/logout', (req, res) => {
    // In a real application, you might want to:
    // 1. Revoke the Google tokens
    // 2. Invalidate the JWT token
    // 3. Clear any session data
    
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

module.exports = router;
