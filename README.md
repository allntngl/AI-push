# 🚀 Yotpo Dashboard - Complete Setup Guide

## What This Is

A complete **Yotpo API Management Dashboard** with a Node.js proxy server that eliminates CORS issues. You can now use the dashboard directly in your browser without needing to copy/paste cURL commands!

## 📦 What's Included

1. **yotpo-dashboard.html** - The main dashboard interface
2. **yotpo-proxy-server.js** - Node.js proxy server (eliminates CORS)
3. **package.json** - Dependencies configuration

## 🎯 Features

### Authentication
- Generate U-Token with Store ID and Secret
- **NEW**: Prominent token display with one-click copy
- Auto-fills token to Products and Orders tabs

### Products Management
- Create new products
- Update existing products
- Retrieve products (single or all with pagination)
- Export products to CSV

### Orders Management
- Create single orders
- **NEW**: Bulk order creation - add multiple orders to a queue and submit all at once
- Retrieve orders (single or all with pagination)
- Export orders to CSV

## 🛠️ Setup Instructions

### Step 1: Install Node.js
If you don't have Node.js installed:
1. Download from: https://nodejs.org/
2. Install the LTS version (recommended)

### Step 2: Install Dependencies
Open PowerShell or Command Prompt in this folder and run:

```bash
npm install
```

This will install:
- express (web server)
- cors (handles cross-origin requests)
- node-fetch (makes API calls to Yotpo)

### Step 3: Start the Server
```bash
npm start
```

You should see:
```
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🚀 Yotpo Proxy Server Running                         ║
║                                                          ║
║   Local:   http://localhost:3000                        ║
║   Status:  http://localhost:3000/health                 ║
║                                                          ║
║   📂 Open: http://localhost:3000/yotpo-dashboard.html   ║
║                                                          ║
║   Press Ctrl+C to stop                                   ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```

### Step 4: Open the Dashboard
Open your browser and go to:
```
http://localhost:3000/yotpo-dashboard.html
```

## ✅ Usage

### 1. Get Your U-Token
1. Go to the **Auth** tab
2. Enter your Store ID and Secret Key
3. Click **"Generate U-Token"**
4. ✨ **NEW**: Token appears in a green highlighted box with a copy button
5. Token is automatically filled into Products and Orders tabs

### 2. Manage Products
- Click **Products** tab
- Create, update, or retrieve products
- Export to CSV with one click

### 3. Manage Orders (Including Bulk!)
- Click **Orders** tab
- **Single Order**: Fill form → Click "Create Single Order"
- **Bulk Orders**:
  1. Fill form → Click "Add to Queue"
  2. Form clears automatically
  3. Repeat for all orders
  4. Click "Create All Orders" to submit everything at once

## 🔧 Troubleshooting

### Port Already in Use
If port 3000 is already taken, edit `yotpo-proxy-server.js` and change:
```javascript
const PORT = 3000;  // Change to 3001, 3002, etc.
```

### CORS Errors
Make sure you're accessing the dashboard through the proxy server:
- ✅ Correct: `http://localhost:3000/yotpo-dashboard.html`
- ❌ Wrong: Opening the HTML file directly

### Cannot Find Module
Run `npm install` again to ensure all dependencies are installed.

## 📝 Notes

- Keep the server running while using the dashboard (Ctrl+C to stop)
- The dashboard works ONLY when accessed through the proxy server
- All API calls go through the proxy to avoid CORS issues
- Your credentials are never stored - they're only used for API requests

## 🎉 Success!

You now have a fully functional Yotpo management dashboard that works directly in your browser - no more cURL commands needed!

---

**Need Help?**
- Check the server console for error messages
- Make sure Node.js is installed correctly
- Ensure all dependencies are installed with `npm install`
