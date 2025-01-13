import { validateContainerId } from '../scripts/utils.js';

/**
 * Run test cases for utility functions
 */
function runTests() {
    console.log('Running tests...');

    // Test: Valid container ID
    try {
        validateContainerId('map');
        console.log('Test Passed: Valid container ID');
    } catch (error) {
        console.error('Test Failed: Valid container ID', error.message);
    }

    // Test: Invalid container ID
    try {
        validateContainerId('');
    } catch (error) {
        if (error.message === 'Invalid container ID. It must be a non-empty string.') {
            console.log('Test Passed: Invalid container ID');
        } else {
            console.error('Test Failed: Invalid container ID', error.message);
        }
    }

    console.log('All tests completed.');
}

// Execute the tests
runTests();
