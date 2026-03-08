const fetch = require('node-fetch');

const BASE_URL = process.argv[2] || 'http://localhost:3000';

const log = (message, status) => {
    const color = status === 'PASS' ? '\x1b[32m' : status === 'FAIL' ? '\x1b[31m' : '\x1b[34m';
    console.log(`${color}[${status}]\x1b[0m ${message}`);
};

async function runTest(name, url) {
    try {
        log(`Testing: ${name}...`, 'RUN');
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok && data.success) {
            log(`✅ ${name} - Status: ${response.status}`, 'PASS');
            return true;
        } else {
            log(`❌ ${name} - Status: ${response.status}, Message: ${data.message || 'No message'}`, 'FAIL');
            return false;
        }
    } catch (error) {
        log(`❌ ${name} - Error: ${error.message}`, 'FAIL');
        return false;
    }
}

async function main() {
    console.log(`\n🧪 Starting API tests for: ${BASE_URL}\n`);

    const tests = [
        { name: 'Health Check', url: `${BASE_URL}/health` },
        { name: 'Get All Movies', url: `${BASE_URL}/api/movies` },
        { name: 'Get Single Movie', url: `${BASE_URL}/api/movies?id=1` },
        { name: 'Get All Users', url: `${BASE_URL}/api/users` },
        { name: 'Get Comments', url: `${BASE_URL}/api/comments?movieId=1` },
        { name: 'Get Announcement', url: `${BASE_URL}/api/announcement` },
    ];

    let passed = 0;
    for (const test of tests) {
        if (await runTest(test.name, test.url)) {
            passed++;
        }
    }

    console.log('\n-----------------------------------');
    if (passed === tests.length) {
        log(`🎉 All ${tests.length} tests passed!`, 'PASS');
    } else {
        log(`🔥 ${tests.length - passed} out of ${tests.length} tests failed.`, 'FAIL');
    }
    console.log('-----------------------------------\n');

    if (passed !== tests.length) {
        process.exit(1); // Exit with error code if any test fails
    }
}

main();