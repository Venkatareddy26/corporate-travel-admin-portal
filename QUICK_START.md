# 🚀 Quick Start Guide

Get your Corporate Travel Admin Portal up and running in minutes!

## Prerequisites

Before you begin, ensure you have:
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- A code editor (VS Code recommended)

## Installation Steps

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd ADMIN-employee
```

### 2. Install Dependencies
```bash
npm install
```
This will install all required packages including React, Vite, Tailwind CSS, and more.

### 3. Start Development Server
```bash
npm run dev
```

### 4. Open in Browser
Navigate to: `http://localhost:5173`

You should see the beautiful purple gradient admin portal! 🎉

## First Time Setup

### Default Pages Available:
- **Dashboard** (`/`) - Main overview with KPIs and charts
- **Analytics** (`/analytics`) - Detailed analytics and reports
- **Trips** (`/trips`) - Trip management interface
- **Policy** (`/policy`) - Travel policy builder

### Navigation
Use the purple gradient sidebar on the left to navigate between pages.

## Development Tips

### Hot Reload
Vite provides instant hot module replacement (HMR). Any changes you make to the code will instantly reflect in the browser.

### Building for Production
```bash
npm run build
```
This creates an optimized production build in the `dist/` folder.

### Preview Production Build
```bash
npm run preview
```
Test your production build locally before deployment.

## Customization

### Change Theme Colors
Edit `src/index.css` and modify the CSS variables:
```css
:root {
  --accent: #7c3aed;        /* Primary purple */
  --accent-hover: #6d28d9;  /* Darker purple */
}
```

### Add New Pages
1. Create a new component in `src/` (e.g., `src/newpage.jsx`)
2. Add route in `src/main.jsx`
3. Add navigation link in the sidebar

### Modify Data
Currently using mock data. Replace with your API endpoints in the component files.

## Common Issues

### Port Already in Use
If port 5173 is busy, Vite will automatically use the next available port.

### Dependencies Not Installing
Try:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
Ensure you're using Node.js v16 or higher:
```bash
node --version
```

## Project Structure Overview

```
src/
├── main.jsx          # App entry & routing
├── dashboard.jsx     # Dashboard page
├── analytics.jsx     # Analytics page
├── trips.jsx         # Trips page
├── policy.jsx        # Policy builder
└── index.css         # Global styles
```

## Next Steps

1. ✅ Explore all pages
2. ✅ Customize colors and branding
3. ✅ Connect to your backend API
4. ✅ Add authentication
5. ✅ Deploy to production

## Need Help?

- Check the main [README.md](./README.md) for detailed documentation
- Review the code comments in each component
- Open an issue on GitHub

---

**Happy Coding! 🎨✨**
