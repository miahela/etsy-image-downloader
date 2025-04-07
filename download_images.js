/**
 * Etsy Shop Image Downloader
 * 
 * Downloads product and review images from an Etsy shop JSON export.
 * This script handles various Etsy image URL formats and prevents duplicate downloads.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

/**
 * Formats an Etsy image URL to use a consistent size
 * 
 * @param {string} imgUrl - The original image URL
 * @returns {string} The formatted image URL
 */
function formatImageUrl(imgUrl) {
    if (imgUrl.includes('/iap/')) {
        return imgUrl.replace(/iap_[0-9]+x[0-9]+/, 'iap_640x640');
    } else if (imgUrl.includes('/il/')) {
        return imgUrl.replace(/il_[0-9]+x[0-9]+/, 'il_570x456');
    } else if (imgUrl.includes('/iusa/')) {
        return imgUrl.replace(/iusa_[0-9]+x[0-9]+/, 'iusa_400x400');
    }
    return imgUrl;
}

/**
 * Extracts a filename from an Etsy image URL
 * 
 * @param {string} imgUrl - The image URL
 * @returns {string} The extracted filename
 */
function getFilenameFromUrl(imgUrl) {
    const parts = imgUrl.split('/');
    const lastPart = parts[parts.length - 1];
    return lastPart.split('?')[0];
}

/**
 * Ensures a directory exists, creating it if necessary
 * 
 * @param {string} dir - The directory path
 */
function ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {
            recursive: true
        });
        console.log(`Created directory: ${dir}`);
    }
}

/**
 * Downloads an image from a URL to a local file
 * 
 * @param {string} url - The image URL
 * @param {string} filepath - The local file path
 * @returns {Promise} A promise that resolves when the download is complete
 */
async function downloadImage(url, filepath) {
    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer'
        });
        fs.writeFileSync(filepath, Buffer.from(response.data));
        return true;
    } catch (error) {
        console.error(`Failed to download ${url}: ${error.message}`);
        return false;
    }
}

/**
 * Downloads images from a JSON file containing Etsy shop reviews
 * 
 * @param {string} jsonFilePath - Path to the JSON file
 * @param {string} outputFolder - Folder to save the downloaded images
 * @param {string} objectKey - The key for the object containing image URLs (e.g., 'Reviewer', 'Product')
 * @param {string} imageKey - The key for the image URL (e.g., 'Thumbnail', 'ImageUrl')
 */
async function downloadProductImages(jsonFilePath, outputFolder, objectKey, imageKey) {
    console.log(`Reading data from ${jsonFilePath}...`);

    // Read and parse the JSON file
    let data;
    try {
        const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
        data = JSON.parse(jsonData);
    } catch (error) {
        console.error(`Error reading or parsing JSON file: ${error.message}`);
        return;
    }

    // Create the output folder if it doesn't exist
    ensureDirectoryExists(outputFolder);

    // Track downloaded files to prevent duplicates
    const visited = {};
    const totalReviews = data['Reviews'].length;
    let downloadCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    console.log(`Found ${totalReviews} reviews. Starting download...`);

    // Download images
    for (let i = 0; i < totalReviews; i++) {
        const review = data['Reviews'][i];

        // Skip if the required object or image doesn't exist
        if (!review[objectKey] || !review[objectKey][imageKey]) {
            skipCount++;
            continue;
        }

        let imgUrl = review[objectKey][imageKey];
        imgUrl = formatImageUrl(imgUrl);

        const filename = getFilenameFromUrl(imgUrl);
        const filepath = path.join(outputFolder, filename);

        // Skip if already downloaded
        if (visited[filename]) {
            skipCount++;
            continue;
        }

        visited[filename] = true;
        console.log(`[${i+1}/${totalReviews}] Downloading image ${filename}...`);

        const success = await downloadImage(imgUrl, filepath);
        if (success) {
            downloadCount++;
        } else {
            errorCount++;
        }
    }

    console.log(`\nDownload Summary:`);
    console.log(`- Total reviews processed: ${totalReviews}`);
    console.log(`- Images downloaded: ${downloadCount}`);
    console.log(`- Images skipped (missing or duplicates): ${skipCount}`);
    console.log(`- Download errors: ${errorCount}`);
}

/**
 * Main execution function
 */
async function main() {
    // Get command line arguments
    const args = process.argv.slice(2);
    const jsonFilePath = args[0] || './total_etsy_shop_reviews.json';
    const baseOutputFolder = args[1] || './Result/Images';

    // Define output folders
    const outputReviewsFolder = path.join(baseOutputFolder, 'Reviews');
    const outputProductsFolder = path.join(baseOutputFolder, 'Products');
    const outputContentFolder = path.join(baseOutputFolder, 'Content');

    console.log('Etsy Shop Image Downloader');
    console.log('=========================');
    console.log(`JSON data file: ${jsonFilePath}`);
    console.log(`Output base folder: ${baseOutputFolder}`);

    // Download the different types of images
    await downloadProductImages(jsonFilePath, outputReviewsFolder, 'Reviewer', 'Thumbnail');

    // Uncomment these lines if you want to download additional image types
    // await downloadProductImages(jsonFilePath, outputProductsFolder, 'Product', 'ImageUrl');
    // await downloadProductImages(jsonFilePath, outputContentFolder, 'Content', 'ImageUrl');

    console.log('Download process completed!');
}

// Execute the script
main().catch(error => {
    console.error('Unhandled error:', error.message);
    process.exit(1);
});