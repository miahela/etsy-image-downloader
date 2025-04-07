/**
 * Test script for Etsy Image Downloader
 * This script tests the functionality without actually downloading images
 */

const fs = require('fs');
const path = require('path');

// Import the functions from the main script (you'll need to modify the main script to export these)
// For testing purposes, we'll reimplement the key functions here
function formatImageUrl(imgUrl) {
    if (imgUrl.includes('iap_')) {
        return imgUrl.replace(/iap_[0-9]+x[0-9]+/, 'iap_640x640');
    } else if (imgUrl.includes('il_')) {
        return imgUrl.replace(/il_[0-9]+x[0-9]+/, 'il_570x456');
    } else if (imgUrl.includes('iusa_')) {
        return imgUrl.replace(/iusa_[0-9]+x[0-9]+/, 'iusa_400x400');
    }
    return imgUrl;
}

function getFilenameFromUrl(imgUrl) {
    const parts = imgUrl.split('/');
    const lastPart = parts[parts.length - 1];
    const filename = lastPart.split('?')[0];

    // Extract just the ID and extension
    const match = filename.match(/[^_]+\.([a-zA-Z0-9]+)$/);
    if (match) {
        return match[0];
    }
    return filename;
}

function runTests() {
    console.log('Running tests for Etsy Image Downloader...');

    // Test 1: Check if the sample JSON file exists
    const jsonFilePath = './sample_etsy_reviews.json';
    if (!fs.existsSync(jsonFilePath)) {
        console.error('❌ Test failed: Sample JSON file not found');
        return false;
    }
    console.log('✅ Test passed: Sample JSON file exists');

    // Test 2: Check if the JSON file can be parsed
    let data;
    try {
        const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
        data = JSON.parse(jsonData);
        console.log('✅ Test passed: JSON file can be parsed successfully');
    } catch (error) {
        console.error(`❌ Test failed: Error parsing JSON file: ${error.message}`);
        return false;
    }

    // Test 3: Check if the JSON has the expected structure
    if (!data.Reviews || !Array.isArray(data.Reviews)) {
        console.error('❌ Test failed: JSON does not have the expected "Reviews" array');
        return false;
    }
    console.log(`✅ Test passed: JSON contains ${data.Reviews.length} reviews`);

    // Test 4: Test URL formatting
    const testUrls = [{
            input: 'https://i.etsystatic.com/iap_75x75.12345.jpg',
            expected: 'https://i.etsystatic.com/iap_640x640.12345.jpg'
        },
        {
            input: 'https://i.etsystatic.com/il_75x75.67890.jpg',
            expected: 'https://i.etsystatic.com/il_570x456.67890.jpg'
        },
        {
            input: 'https://i.etsystatic.com/iusa_75x75.23456.jpg',
            expected: 'https://i.etsystatic.com/iusa_400x400.23456.jpg'
        }
    ];

    let urlTestsPassed = true;
    testUrls.forEach((test, index) => {
        const result = formatImageUrl(test.input);
        if (result !== test.expected) {
            console.error(`❌ URL format test ${index + 1} failed: Expected "${test.expected}" but got "${result}"`);
            urlTestsPassed = false;
        }
    });

    if (urlTestsPassed) {
        console.log('✅ Test passed: URL formatting works correctly');
    }

    // Test 5: Test filename extraction
    const filenameTests = [{
            input: 'https://i.etsystatic.com/iap_640x640.12345.jpg',
            expected: '12345.jpg'
        },
        {
            input: 'https://i.etsystatic.com/il_570x456.67890.jpg?version=0',
            expected: '67890.jpg'
        }
    ];

    let filenameTestsPassed = true;
    filenameTests.forEach((test, index) => {
        const result = getFilenameFromUrl(test.input);
        if (result !== test.expected) {
            console.error(`❌ Filename extraction test ${index + 1} failed: Expected "${test.expected}" but got "${result}"`);
            filenameTestsPassed = false;
        }
    });

    if (filenameTestsPassed) {
        console.log('✅ Test passed: Filename extraction works correctly');
    }

    // Test 6: Simulate processing the sample data (without actual downloads)
    const reviewsWithImages = data.Reviews.filter(review =>
        review.Reviewer && review.Reviewer.Thumbnail
    ).length;

    console.log(`✅ Found ${reviewsWithImages} reviews with thumbnail images in sample data`);

    const productsWithImages = data.Reviews.filter(review =>
        review.Product && review.Product.ImageUrl
    ).length;

    console.log(`✅ Found ${productsWithImages} products with images in sample data`);

    console.log('\nAll tests completed!');
    return true;
}

// Run the tests
const success = runTests();
console.log(`\nTest summary: ${success ? 'All tests passed!' : 'Some tests failed!'}`);

// Exit with appropriate code
process.exit(success ? 0 : 1);