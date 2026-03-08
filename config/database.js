// Database Configuration
const database = {
    development: {
        type: 'mock',
        data: 'mock-data'
    },
    production: {
        type: 'mock',
        data: 'mock-data'
    },
    test: {
        type: 'mock',
        data: 'mock-data'
    }
};

module.exports = database[process.env.NODE_ENV || 'development'];
