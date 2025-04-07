# Etsy Shop Image Downloader

A utility script to download product and review images from an Etsy shop JSON export.

## Features

- Downloads images from Etsy shop reviews JSON data
- Handles various Etsy image URL formats
- Prevents duplicate downloads
- Organizes images into separate folders by type (products, reviews, content)

## Installation

```bash
# Clone the repository
git clone https://github.com/miahela/etsy-image-downloader.git

# Navigate to the project directory
cd etsy-image-downloader

# Install dependencies
npm install
```

## Usage

```bash
# Basic usage with default settings
node download_images.js

# Custom usage with specific JSON file and output location
node download_images.js ./path/to/your-etsy-data.json ./custom/output/folder
```

### Configuration

Place your Etsy shop JSON export file in the project root or specify its location when running the script.

Default folders for downloaded images:
- Product images: `./Result/Images/Products`
- Review images: `./Result/Images/Reviews`
- Content images: `./Result/Images/Content`

## Requirements

- Node.js (v12 or higher recommended)
- NPM packages:
  - axios

## License

[MIT](LICENSE)

## Contribution

Contributions are welcome! Please feel free to submit a Pull Request.