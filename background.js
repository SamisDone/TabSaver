/* ================================================================
   TABSAVER - BACKGROUND SERVICE WORKER
   ================================================================
   
   What is a Service Worker?
   -------------------------
   A service worker is a script that runs in the background, separate
   from the popup UI. It continues running even when the popup is closed.
   
   In Manifest V3 (the latest Chrome extension standard), service workers
   replace the old "background pages" from Manifest V2.
   
   Why do we need this file?
   -------------------------
   - Manifest V3 requires a service worker to be declared
   - It allows future features that need to run in the background
   - Currently it's mostly a placeholder with basic initialization
   
   Current Features:
   -----------------
   1. Detects when extension is first installed
   2. Initializes storage with empty sessions array
   3. Logs version updates to console
   
   Potential Future Features:
   --------------------------
   - Automatic session backups
   - Scheduled cleanup of old sessions
   - Context menu integration (right-click menu)
   - Keyboard shortcuts
   - Notifications for saved sessions
   
   Author: Samonwita
   Date: 2025
   ================================================================ */

// ================================================================
// EXTENSION INSTALLATION HANDLER
// ================================================================
// This code runs ONCE when the extension is first installed
// or updated to a new version

// chrome.runtime.onInstalled is a special event that Chrome triggers
chrome.runtime.onInstalled.addListener((details) => {
  // 'details' object contains info about why this event fired
  // details.reason can be: 'install', 'update', or 'chrome_update'
  
  // ---- Handle First Installation ----
  if (details.reason === 'install') {
    // Log to console for debugging
    // View this in chrome://extensions/ → Service Worker → Console
    console.log('TabSaver installed successfully!');
    
    // Initialize storage with empty sessions array
    // This ensures storage structure exists from the start
    // chrome.storage.local.get() retrieves data from storage
    chrome.storage.local.get(['sessions'], (result) => {
      // If 'sessions' doesn't exist yet, create it
      if (!result.sessions) {
        // chrome.storage.local.set() saves data to storage
        // This creates: { sessions: [] }
        chrome.storage.local.set({ sessions: [] });
        console.log('Initialized empty sessions array in storage');
      }
    });
  } 
  
  // ---- Handle Updates ----
  else if (details.reason === 'update') {
    // Get the current version number from manifest.json
    const version = chrome.runtime.getManifest().version;
    console.log('TabSaver updated to version', version);
    
    // Here we could add migration code if storage structure changes
    // For example: converting old data format to new format
  }
});

// ================================================================
// MESSAGE LISTENER
// ================================================================
// This allows the popup (popup.js) to send messages to the background worker
// Currently not used, but set up for future features

// chrome.runtime.onMessage listens for messages from other parts of extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 'request' - the message data sent from popup
  // 'sender' - info about who sent the message
  // 'sendResponse' - function to send a response back
  
  // Example future use:
  // if (request.action === 'backup') {
  //   // Perform automatic backup
  //   sendResponse({ success: true });
  // }
  
  // return true keeps the message channel open for async responses
  // Required if sendResponse will be called asynchronously (with await/promises)
  return true;
});

/* ================================================================
   NOTES FOR STUDENTS
   ================================================================
   
   Service Worker Lifecycle:
   -------------------------
   - Service workers can be stopped by Chrome to save resources
   - They automatically restart when needed (on events/messages)
   - Don't rely on global variables persisting between events
   - Use chrome.storage for persistent data
   
   Debugging:
   ----------
   1. Go to chrome://extensions/
   2. Find TabSaver extension
   3. Click "Service Worker" to open DevTools
   4. View console logs and errors there
   
   Common Gotchas:
   ---------------
   - Service workers can't access DOM (no document or window)
   - Can't use alert(), confirm(), or prompt()
   - Must use chrome.storage instead of localStorage
   - All Chrome API calls are asynchronous (use async/await)
   
   ================================================================ */
