# 🚀 TabSaver - Quick Start Guide

## ⚡ Getting Started in 3 Steps

### Step 1: Generate the Icon 📁
The `icon-generator.html` file should have opened in your browser automatically.

If not, double-click `icon-generator.html` to open it.

1. Click the **"Download icon.png"** button
2. Save the file as `icon.png` in the `icons/` folder
3. Close the icon generator page

> **Note**: The extension won't load without this icon file!

---

### Step 2: Load Extension in Chrome 🌐

1. Open Chrome and go to: **chrome://extensions/**
2. Turn ON **"Developer mode"** (toggle in top-right corner)
3. Click **"Load unpacked"**
4. Select the **TabSaver** folder (this folder)
5. The TabSaver icon should appear in your toolbar!

---

### Step 3: Start Using TabSaver 🎉

1. Click the TabSaver icon in your toolbar
2. Enter a name for your session (optional)
3. Click **"Save Current Tabs"**
4. Your tabs are now saved!

---

## 💡 Quick Tips

### Save a Session
- Type a name or leave blank for auto-generated name
- Press Enter or click the button
- All open tabs in current window are saved

### Open a Session
- Click the green 📂 button
- All tabs open in new tabs

### Rename a Session
- Click the blue ✏️ button
- Enter new name
- Click "Rename"

### Delete a Session
- Click the red 🗑️ button
- Confirm deletion

### Toggle Dark Mode
- Click the moon/sun icon in the header

---

## ❓ Troubleshooting

### "Extension won't load"
- ✅ Make sure `icon.png` exists in the `icons/` folder
- ✅ Check all files are present
- ✅ Reload extension in chrome://extensions/

### "No sessions showing"
- Try saving a new session first
- Check browser console for errors (right-click popup → Inspect)

### "Dark mode not persisting"
- This is normal - it's per-session
- Will be remembered across popup opens

---

## 📂 Files You Should Have

```
TabSaver/
├── manifest.json          ✅ Extension config
├── popup.html            ✅ UI interface
├── popup.js              ✅ Core logic
├── popup.css             ✅ Custom styles
├── background.js         ✅ Service worker
├── icons/
│   ├── icon.png         ⚠️ GENERATE THIS!
│   └── icon.svg         ✅ SVG source
├── icon-generator.html   ✅ Icon generator
├── README.md            ✅ Full documentation
└── QUICK_START.md       ✅ This guide
```

---

## 🎨 Customization Ideas

Want to customize TabSaver?

**Change Colors**: Edit `popup.html` Tailwind classes
- Blue → Purple: `bg-blue-500` → `bg-purple-500`
- Green → Pink: `bg-green-500` → `bg-pink-500`

**Change Size**: Edit body class in `popup.html`
```html
<body class="w-[500px] min-h-[600px]">
```

**Add Features**: Check the code comments in `popup.js`

---

## 🔗 Useful Links

- Chrome Extensions: chrome://extensions/
- View Console: Right-click popup → Inspect
- Reload Extension: Click reload icon in chrome://extensions/

---

**Need Help?** Check the full README.md or inspect the code comments!

**Enjoy TabSaver! 🚀**
