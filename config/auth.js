// Authentication Configuration
const auth = {
    development: {
        mock: true,
        adminEmail: 'duy.kan1234@gmail.com',
        sessionSecret: 'development-secret-key'
    },
    production: {
        mock: true,
        adminEmail: process.env.ADMIN_EMAIL || 'duy.kan1234@gmail.com',
        sessionSecret: process.env.SESSION_SECRET || 'production-secret-key'
    },
    test: {
        mock: true,
        adminEmail: 'test@example.com',
        sessionSecret: 'test-secret-key'
    }
};

module.exports = auth[process.env.NODE_ENV || 'development'];
