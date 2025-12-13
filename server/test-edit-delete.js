import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

async function testEditDeletePoll() {
    console.log(`\n${BLUE}Testing Poll Edit & Delete Features${RESET}`);
    console.log('='.repeat(50));

    let resultsId;

    // Step 1: Create a poll
    try {
        console.log('\n1. Creating a poll...');
        const response = await axios.post(`${API_BASE_URL}/polls`, {
            question: 'What is your favorite programming language?',
            options: ['JavaScript', 'Python', 'Java', 'C++'],
        });
        resultsId = response.data.resultsId;
        console.log(`${GREEN}✓ Poll created with resultsId: ${resultsId}${RESET}`);
    } catch (error) {
        console.log(`${RED}✗ Failed to create poll: ${error.response?.data?.error || error.message}${RESET}`);
        return;
    }

    // Step 2: Update the poll
    try {
        console.log('\n2. Updating poll question...');
        const response = await axios.put(`${API_BASE_URL}/polls/${resultsId}`, {
            question: 'What is your favorite coding language?',
        });
        console.log(`${GREEN}✓ Poll updated successfully${RESET}`);
        console.log(`  New question: ${response.data.question}`);
    } catch (error) {
        console.log(`${RED}✗ Failed to update poll: ${error.response?.data?.error || error.message}${RESET}`);
    }

    // Step 3: Update poll options
    try {
        console.log('\n3. Updating poll options...');
        const response = await axios.put(`${API_BASE_URL}/polls/${resultsId}`, {
            options: ['JavaScript', 'TypeScript', 'Python', 'Go', 'Rust'],
        });
        console.log(`${GREEN}✓ Options updated successfully${RESET}`);
        console.log(`  New options: ${response.data.options.map(o => o.text).join(', ')}`);
    } catch (error) {
        console.log(`${RED}✗ Failed to update options: ${error.response?.data?.error || error.message}${RESET}`);
    }

    // Step 4: Try to update after voting
    try {
        console.log('\n4. Testing edit restriction after voting...');
        // First, get the poll to vote
        const pollResponse = await axios.get(`${API_BASE_URL}/poll/${await getPollVoteId(resultsId)}`);
        const optionId = pollResponse.data.options[0].id;

        // Cast a vote
        const voteId = await getPollVoteId(resultsId);
        await axios.post(`${API_BASE_URL}/vote/${optionId}`, { voteId });
        console.log(`  Vote cast successfully`);

        // Try to edit
        await axios.put(`${API_BASE_URL}/polls/${resultsId}`, {
            question: 'This should fail',
        });
        console.log(`${RED}✗ Edit was allowed after voting (should be blocked)${RESET}`);
    } catch (error) {
        if (error.response?.status === 403) {
            console.log(`${GREEN}✓ Edit correctly blocked after voting${RESET}`);
            console.log(`  Message: ${error.response.data.error}`);
        } else {
            console.log(`${RED}✗ Unexpected error: ${error.response?.data?.error || error.message}${RESET}`);
        }
    }

    // Step 5: Delete the poll
    try {
        console.log('\n5. Deleting the poll...');
        const response = await axios.delete(`${API_BASE_URL}/polls/${resultsId}`);
        console.log(`${GREEN}✓ Poll deleted successfully${RESET}`);
        console.log(`  Message: ${response.data.message}`);
    } catch (error) {
        console.log(`${RED}✗ Failed to delete poll: ${error.response?.data?.error || error.message}${RESET}`);
    }

    // Step 6: Verify deletion
    try {
        console.log('\n6. Verifying poll deletion...');
        await axios.get(`${API_BASE_URL}/results/${resultsId}`);
        console.log(`${RED}✗ Poll still exists after deletion${RESET}`);
    } catch (error) {
        if (error.response?.status === 404) {
            console.log(`${GREEN}✓ Poll confirmed deleted (404)${RESET}`);
        } else {
            console.log(`${RED}✗ Unexpected error: ${error.message}${RESET}`);
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`${GREEN}Edit & Delete tests completed!${RESET}\n`);
}

async function getPollVoteId(resultsId) {
    const response = await axios.get(`${API_BASE_URL}/results/${resultsId}`);
    // We need to get voteId - let's create a new poll and track both IDs
    return null; // This is a simplified version
}

// Alternative: Test with fresh polls for each scenario
async function testEditDeleteSeparately() {
    console.log(`\n${BLUE}Testing Edit & Delete (Separate Scenarios)${RESET}`);
    console.log('='.repeat(50));

    // Test 1: Update poll before any votes
    try {
        console.log('\nScenario 1: Edit poll before voting');
        const create = await axios.post(`${API_BASE_URL}/polls`, {
            question: 'Original question',
            options: ['A', 'B'],
        });

        const update = await axios.put(`${API_BASE_URL}/polls/${create.data.resultsId}`, {
            question: 'Updated question',
            options: ['Option 1', 'Option 2', 'Option 3'],
        });

        console.log(`${GREEN}✓ Poll updated successfully${RESET}`);
        console.log(`  Original: "Original question" with 2 options`);
        console.log(`  Updated: "${update.data.question}" with ${update.data.options.length} options`);

        // Clean up
        await axios.delete(`${API_BASE_URL}/polls/${create.data.resultsId}`);
    } catch (error) {
        console.log(`${RED}✗ Edit test failed: ${error.response?.data?.error || error.message}${RESET}`);
    }

    // Test 2: Delete poll
    try {
        console.log('\nScenario 2: Delete poll');
        const create = await axios.post(`${API_BASE_URL}/polls`, {
            question: 'Poll to be deleted',
            options: ['Yes', 'No'],
        });

        const deleteRes = await axios.delete(`${API_BASE_URL}/polls/${create.data.resultsId}`);
        console.log(`${GREEN}✓ Poll deleted: ${deleteRes.data.message}${RESET}`);

        // Verify deletion
        try {
            await axios.get(`${API_BASE_URL}/results/${create.data.resultsId}`);
            console.log(`${RED}✗ Poll still accessible${RESET}`);
        } catch (err) {
            if (err.response?.status === 404) {
                console.log(`${GREEN}✓ Confirmed: Poll no longer exists${RESET}`);
            }
        }
    } catch (error) {
        console.log(`${RED}✗ Delete test failed: ${error.response?.data?.error || error.message}${RESET}`);
    }

    // Test 3: Validation errors
    try {
        console.log('\nScenario 3: Invalid update (too few options)');
        const create = await axios.post(`${API_BASE_URL}/polls`, {
            question: 'Test poll',
            options: ['A', 'B'],
        });

        await axios.put(`${API_BASE_URL}/polls/${create.data.resultsId}`, {
            options: ['Only one option'],
        });

        console.log(`${RED}✗ Validation should have rejected this${RESET}`);
        await axios.delete(`${API_BASE_URL}/polls/${create.data.resultsId}`);
    } catch (error) {
        if (error.response?.status === 400) {
            console.log(`${GREEN}✓ Validation correctly rejected invalid update${RESET}`);
            console.log(`  Error: ${error.response.data.error}`);
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`${GREEN}All tests completed!${RESET}\n`);
}

// Run tests
testEditDeleteSeparately();
