import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// ANSI color codes
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const BLUE = '\x1b[34m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

/**
 * Test: Create a poll
 */
async function testCreatePoll() {
    console.log(`\n${BLUE}Test 1: Create Poll${RESET}`);
    console.log('='.repeat(50));

    try {
        const response = await axios.post(`${API_BASE_URL}/polls`, {
            question: 'Where should we get food?',
            options: ['Pizza', 'Sushi', 'Burgers', 'Tacos'],
        });

        console.log(`${GREEN}✓ Status: ${response.status}${RESET}`);
        console.log('Response:', JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.log(`${RED}✗ Error: ${error.response?.status} - ${error.response?.data?.error || error.message}${RESET}`);
        return null;
    }
}

/**
 * Test: Get poll by voteId
 */
async function testGetPoll(voteId) {
    console.log(`\n${BLUE}Test 2: Get Poll by VoteId${RESET}`);
    console.log('='.repeat(50));

    try {
        const response = await axios.get(`${API_BASE_URL}/poll/${voteId}`);

        console.log(`${GREEN}✓ Status: ${response.status}${RESET}`);
        console.log('Response:', JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.log(`${RED}✗ Error: ${error.response?.status} - ${error.response?.data?.error || error.message}${RESET}`);
        return null;
    }
}

/**
 * Test: Invalid poll creation (missing question)
 */
async function testInvalidPoll() {
    console.log(`\n${BLUE}Test 3: Invalid Poll (Missing Question)${RESET}`);
    console.log('='.repeat(50));

    try {
        const response = await axios.post(`${API_BASE_URL}/polls`, {
            options: ['Option 1', 'Option 2'],
        });

        console.log(`${RED}✗ Should have failed but got: ${response.status}${RESET}`);
    } catch (error) {
        console.log(`${GREEN}✓ Correctly rejected: ${error.response?.status} - ${error.response?.data?.error}${RESET}`);
    }
}

/**
 * Test: Invalid poll creation (only one option)
 */
async function testOneOption() {
    console.log(`\n${BLUE}Test 4: Invalid Poll (Only One Option)${RESET}`);
    console.log('='.repeat(50));

    try {
        const response = await axios.post(`${API_BASE_URL}/polls`, {
            question: 'Test question?',
            options: ['Only one'],
        });

        console.log(`${RED}✗ Should have failed but got: ${response.status}${RESET}`);
    } catch (error) {
        console.log(`${GREEN}✓ Correctly rejected: ${error.response?.status} - ${error.response?.data?.error}${RESET}`);
    }
}

/**
 * Test: Invalid voteId
 */
async function testInvalidVoteId() {
    console.log(`\n${BLUE}Test 5: Invalid VoteId${RESET}`);
    console.log('='.repeat(50));

    try {
        const response = await axios.get(`${API_BASE_URL}/poll/invalid123`);

        console.log(`${RED}✗ Should have failed but got: ${response.status}${RESET}`);
    } catch (error) {
        console.log(`${GREEN}✓ Correctly rejected: ${error.response?.status} - ${error.response?.data?.error}${RESET}`);
    }
}

/**
 * Test: Duplicate options
 */
async function testDuplicateOptions() {
    console.log(`\n${BLUE}Test 6: Duplicate Options${RESET}`);
    console.log('='.repeat(50));

    try {
        const response = await axios.post(`${API_BASE_URL}/polls`, {
            question: 'Pick a food',
            options: ['Pizza', 'pizza', 'Sushi'],
        });

        console.log(`${RED}✗ Should have failed but got: ${response.status}${RESET}`);
    } catch (error) {
        console.log(`${GREEN}✓ Correctly rejected: ${error.response?.status} - ${error.response?.data?.error}${RESET}`);
    }
}

/**
 * Run all tests
 */
async function runTests() {
    console.log(`\n${YELLOW}${'*'.repeat(50)}`);
    console.log('Campus Poll API Tests');
    console.log(`${'*'.repeat(50)}${RESET}`);

    // Test valid poll creation
    const pollData = await testCreatePoll();

    // Test get poll if creation succeeded
    if (pollData && pollData.voteId) {
        await testGetPoll(pollData.voteId);
    }

    // Test error cases
    await testInvalidPoll();
    await testOneOption();
    await testInvalidVoteId();
    await testDuplicateOptions();

    console.log(`\n${YELLOW}${'*'.repeat(50)}`);
    console.log('All tests completed!');
    console.log(`${'*'.repeat(50)}${RESET}\n`);
}

// Run tests
runTests().catch(error => {
    console.error(`${RED}Fatal error:${RESET}`, error.message);
    process.exit(1);
});
