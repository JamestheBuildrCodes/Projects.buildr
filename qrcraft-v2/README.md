# QRCraft - Advanced QR Code Generator 🎨

A beautiful, feature-rich QR code generator that works offline. Built as a Progressive Web App (PWA) with privacy-first design.

## ✨ Features

### 🎯 Multiple QR Types
- **URL** - Website links
- **Text** - Plain text content
- **WiFi** - Network credentials (auto-connect)
- **vCard** - Digital business cards
- **Payment** - Bitcoin, Ethereum, PayPal

### 🎨 Custom Styling
- **Colors** - Custom foreground and background colors
- **Patterns** - Square, dots, or rounded corners
- **Logos** - Embed your logo/image in the center
- **Sizes** - 200px to 800px

### ⚡ Advanced Features
- **Batch Generation** - Upload CSV to create multiple QR codes at once
- **History** - Auto-saves your last 50 QR codes locally
- **Multiple Formats** - Download as PNG, SVG, or PDF
- **Offline Support** - Works without internet after first load
- **Privacy-First** - All processing happens in your browser

## 🚀 Deployment Instructions

### Option 1: Netlify (Recommended)

1. **Drag & Drop Deploy:**
   - Go to [app.netlify.com/drop](https://app.netlify.com/drop)
   - Drag the entire folder onto the page
   - Your site will be live in seconds!

2. **Connect to Git (Optional):**
   - Push files to GitHub
   - Connect repository in Netlify
   - Auto-deploy on every push

### Option 2: Cloudflare Pages

1. **Direct Upload:**
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Navigate to Pages
   - Click "Create a project" → "Upload assets"
   - Drag files or select folder
   - Deploy!

2. **Git Integration:**
   - Connect your GitHub/GitLab
   - Select repository
   - Deploy automatically

### Option 3: GitHub Pages

1. **Setup:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```

2. **Enable GitHub Pages:**
   - Go to repository Settings
   - Navigate to Pages
   - Select "main" branch
   - Save and wait for deployment

### Option 4: Vercel

1. **Deploy:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your Git repository
   - Click "Deploy"

## 📦 What's Included

```
qrcraft/
├── index.html          # Main HTML file
├── app.js             # JavaScript functionality
├── manifest.json      # PWA manifest
├── sw.js             # Service worker for offline support
└── README.md         # This file
```

## 🎯 Usage

### Basic QR Code
1. Select type (URL, Text, etc.)
2. Enter content
3. Click "Generate QR Code"
4. Download in your preferred format

### Batch Generation
1. Click "Batch" tab
2. Upload CSV file with format:
   ```
   https://example1.com,Example 1
   https://example2.com,Example 2
   ```
3. All QR codes generated instantly
4. Download individually

### Custom Styling
1. Generate your QR code
2. Change colors using color pickers
3. Select pattern style (square/dots/rounded)
4. Adjust size slider
5. Upload optional logo
6. Regenerate to see changes

## 🔧 Customization

### Change Colors
Edit the CSS variables in `index.html`:
```css
:root {
    --bg-primary: #0f172a;
    --accent-primary: #f59e0b;
    /* ... */
}
```

### Add More QR Types
Add a new tab in `index.html` and handle it in `app.js` `generateQRCode()` function.

### Modify History Limit
Change `MAX_HISTORY` in `app.js`:
```javascript
const MAX_HISTORY = 50; // Change to your preferred number
```

## 🌐 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 📱 PWA Features

- **Installable** - Add to home screen on mobile/desktop
- **Offline** - Works without internet after first load
- **Fast** - All assets cached locally
- **Privacy** - No data sent to servers

## 🛠️ Technologies Used

- **Vanilla JavaScript** - No framework needed
- **QRCode.js** - QR code generation
- **jsPDF** - PDF export
- **CSS Grid & Flexbox** - Modern layouts
- **Service Workers** - Offline functionality

## 📝 CSV Format for Batch

Create a CSV file with URLs and names:

```csv
https://github.com,GitHub
https://google.com,Google
https://example.com,Example Site
```

Or just URLs:
```csv
https://github.com
https://google.com
https://example.com
```

## 🔒 Privacy

- **No tracking** - Zero analytics or tracking scripts
- **Local storage** - History saved only on your device
- **No server** - All processing happens in your browser
- **No data sent** - Nothing transmitted over the network (except CDN assets)

## 💡 Tips

- Use **high contrast** colors for better scanning
- Keep QR codes **at least 200px** for printing
- Add a **logo** for branding (keeps it scannable)
- Test QR codes on different scanners
- **WiFi QR codes** work on most modern phones (Android/iOS)

## 🐛 Troubleshooting

**QR code not scanning?**
- Increase contrast between colors
- Remove the logo or make it smaller
- Increase size to 400px+

**Offline mode not working?**
- Visit the site once while online
- Refresh the page
- Check browser supports service workers

**CSV not uploading?**
- Ensure file ends with `.csv`
- Check format: `url,name` per line
- Remove empty lines

## 📄 License

Free to use for personal and commercial projects. No attribution required.

## 🙏 Credits

Built with passion using open-source libraries:
- QRCode.js
- jsPDF
- Google Fonts (Crimson Pro, DM Sans)

---

**Enjoy creating beautiful QR codes! 🎨✨**
