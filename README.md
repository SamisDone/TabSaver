# 📁 TabSaver - Chrome Extension

A modern Chrome extension for saving and restoring browser tab sessions with ease.

**Created by: Samonwita** 💙

## 🚀 Features

- **Save Current Tabs**: Capture all open tabs in the current window with a custom session name
- **Restore Sessions**: Reopen all tabs from a saved session with one click
- **Manage Sessions**: Rename or delete saved sessions
- **Dark Mode**: Toggle between light and dark themes
- **Modern UI**: Beautiful interface built with Tailwind CSS
- **Timestamps**: See when each session was saved
- **Session Details**: View tab count for each session

## 📦 Installation

1. **Generate Icon** (Important!):
   - Open `icon-generator.html` in your browser
   - Right-click the icon and save it as `icon.png` in the `icons/` folder
   - Or use any 128x128px PNG image as `icons/icon.png`

2. **Load Extension in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the `TabSaver` folder
   - The extension icon should appear in your toolbar

## 🎯 Usage

### Save a Session
1. Click the TabSaver icon in your browser toolbar
2. Enter a name for your session (or leave blank for auto-generated name)
3. Click "Save Current Tabs"
4. All open tabs in the current window will be saved

### Restore a Session
1. Click the TabSaver icon
2. Find the session you want to restore
3. Click the green "Open" button
4. All tabs from that session will open in new tabs

### Manage Sessions
- **Rename**: Click the blue pencil icon to rename a session
- **Delete**: Click the red trash icon to delete a session
- **Dark Mode**: Click the moon/sun icon in the header

## 🛠️ Technical Details

### Built With
- **Manifest V3**: Latest Chrome extension standard
- **Tailwind CSS**: Modern utility-first CSS framework
- **Vanilla JavaScript**: No frameworks, pure JS for performance

### Permissions
- `tabs`: Required to access and create browser tabs
- `storage`: Required to save sessions locally

### Files Structure
```
TabSaver/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup UI
├── popup.js              # Main logic and functionality
├── popup.css             # Custom styles
├── background.js         # Service worker (placeholder)
├── icons/
│   ├── icon.png         # Extension icon (128x128)
│   └── icon.svg         # SVG source
├── icon-generator.html   # Helper to generate PNG icon
└── README.md            # This file
```

## 📊 Data Storage

Sessions are stored locally using `chrome.storage.local` in the following format:

```javascript
{
  sessions: [
    {
      name: "Work Session",
      tabs: [
        { title: "Tab Title", url: "https://example.com" },
        // ... more tabs
      ],
      timestamp: 1633024800000,
      tabCount: 5
    }
    // ... more sessions
  ]
}
```

## 🎨 Customization

### Change Colors
Edit `popup.html` and modify Tailwind classes:
- Primary color: `bg-blue-500` → `bg-[color]-500`
- Gradient: `from-blue-600 to-indigo-600`

### Adjust Popup Size
In `popup.html`, change the body class:
```html
<body class="w-[400px] min-h-[500px]">
```

## 🔒 Privacy

- All data is stored locally on your device
- No data is sent to external servers
- No tracking or analytics
- Open source - inspect the code yourself

## 🐛 Troubleshooting

### Extension won't load
- Make sure `icon.png` exists in the `icons/` folder
- Check that all files are present
- Look for errors in `chrome://extensions/` with Developer mode enabled

### Sessions not saving
- Check if the extension has the required permissions
- Open the popup, right-click → "Inspect" to see console errors

### Dark mode not working
- Clear extension storage: Click extension icon → Right-click → "Inspect" → Console → Run:
  ```javascript
  chrome.storage.local.clear()
  ```

## 📝 License

Free to use and modify. Built as a coding demonstration project.

## 🤝 Contributing

Feel free to fork, modify, and improve! Suggestions for enhancements:
- Export/Import sessions
- Sync across devices
- Tab grouping support
- Search and filter sessions
- Session merging
- Scheduled auto-saves

## 📧 Support

For issues or questions, check the code comments or modify as needed.

---

**Version**: 1.0  
**Manifest**: V3  
**Last Updated**: 2025
