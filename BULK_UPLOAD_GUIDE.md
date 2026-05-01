# Bulk Upload CSV Formats

This guide explains how to use the bulk upload feature for products, banners, and carousel items in the admin dashboard.

## Sample Files

Download these sample CSV files to understand the required format:

- [sample-products.csv](sample-products.csv) - Product bulk upload format
- [sample-banners.csv](sample-banners.csv) - Banner bulk upload format
- [sample-carousel.csv](sample-carousel.csv) - Carousel item bulk upload format

## Products CSV Format

Required columns (case-insensitive):

| Column | Required | Description | Example |
|--------|----------|-------------|---------|
| title | Yes | Product name | iPhone 15 Pro Max |
| description | No | Product description | The latest iPhone with advanced camera system |
| price | Yes | Product price (number) | 1199 |
| category | No | Category slug or title | smartphones |
| thumbnail | No | Image URL | https://example.com/image.jpg |
| stock | No | Stock quantity (number) | 50 |
| brand | No | Product brand | Apple |
| sku | No | Stock Keeping Unit | IPH15PM-128GB |
| isActive | No | Show/hide product (true/false) | true |

### Notes:
- Categories are automatically created if they don't exist
- Price and stock must be valid numbers
- Use Excel or Google Sheets, then export as CSV
- Empty cells are allowed for optional fields

## Banners CSV Format

Required columns:

| Column | Required | Description | Example |
|--------|----------|-------------|---------|
| title | Yes | Banner title | Summer Sale 2024 |
| subtitle | No | Banner subtitle | Up to 70% off |
| image | Yes | Banner image URL | https://example.com/banner.jpg |
| link | No | Click destination URL | /products?sale |
| buttonText | No | Button text | Shop Now |
| order | No | Display order (number) | 1 |
| isActive | No | Active status (true/false) | true |

## Carousel Items CSV Format

Required columns:

| Column | Required | Description | Example |
|--------|----------|-------------|---------|
| title | Yes | Slide title | Premium Smartphones |
| description | No | Slide description | Discover the latest flagship phones |
| image | Yes | Slide image URL | https://example.com/slide.jpg |
| link | No | Click destination URL | /category/smartphones |
| buttonText | No | Button text | Shop Phones |
| order | No | Display order (number) | 1 |
| isActive | No | Active status (true/false) | true |

## How to Use

1. Open Excel, Google Sheets, or any CSV editor
2. Copy the format from the sample files
3. Fill in your data
4. Export/save as CSV file
5. Go to the admin dashboard for the respective section (Products/Banners/Carousel)
6. Click "Choose CSV file" and select your file
7. Click "Upload Bulk" to process the data
8. Review any validation errors and fix them if needed

## Validation Rules

- **Products**: Title and price are required. Price must be a valid number.
- **Banners**: Title and image are required.
- **Carousel**: Title and image are required.

## Managing Active/Inactive Status

All items (products, banners, carousel slides) have an `isActive` field that controls their visibility on the frontend:

- **Active items** (`isActive: true`): Visible to customers on the website
- **Inactive items** (`isActive: false`): Hidden from customers but still accessible in admin

### How to Toggle Status

1. **Bulk Upload**: Set the `isActive` column to `true` or `false` in your CSV file
2. **Individual Toggle**: In the admin dashboard, click the "Activate"/"Deactivate" button next to each item
3. **Form Creation**: When creating new items, check/uncheck the "Active" checkbox

### Frontend Behavior

- Only active products appear in product listings and search results
- Only active banners are displayed in banner sections
- Only active carousel slides appear in the homepage carousel
- Inactive items remain in the database for easy reactivation

## Tips

- Use relative URLs for images if they're hosted on the same domain
- Category names in products will be automatically converted to URL-friendly slugs
- Order numbers determine display sequence (lower numbers appear first)
- Set isActive to "false" to hide items without deleting them
- Use the toggle buttons for quick on/off switching without editing the entire item
