/* ================================================================
   TABSAVER - MAIN JAVASCRIPT FILE
   ================================================================
   
   This file handles all the functionality of the TabSaver extension.
   It uses Chrome Extension APIs to save and restore browser tabs.
   
   Key Concepts Used:
   - Chrome Storage API: To save data persistently
   - Chrome Tabs API: To get and create browser tabs
   - DOM Manipulation: To update the UI dynamically
   - Event Listeners: To respond to user actions
   - Async/Await: For handling asynchronous operations
   
   Main Features:
   1. Save current tabs as a named session
   2. Display all saved sessions in a list
   3. Reopen tabs from a saved session
   4. Rename sessions
   5. Delete sessions
   6. Dark mode toggle
   
   Author: Samonwita
   Date: 2025
   ================================================================ */

// ================================================================
// GLOBAL VARIABLES
// ================================================================
// These variables store data that needs to be accessed throughout the file

// Array to store all saved sessions
// Each session is an object with: name, tabs, timestamp, tabCount
let sessions = [];

// Stores the timestamp of the session being renamed
// Used to identify which session to update when user confirms rename
let currentRenameTimestamp = null;

// ================================================================
// INITIALIZATION
// ================================================================
// This code runs when the popup HTML is fully loaded

// DOMContentLoaded event fires when HTML is parsed and ready
document.addEventListener('DOMContentLoaded', () => {
  // Call initialization functions in order
  loadSessions();              // Load saved sessions from storage
  initializeEventListeners();  // Set up button click handlers
  initializeDarkMode();        // Apply dark mode preference
});

// ================================================================
// EVENT LISTENERS SETUP
// ================================================================
// This function attaches event listeners to all interactive elements
// Event listeners wait for user actions (clicks, key presses, etc.)

function initializeEventListeners() {
  // ---- Save Button ----
  // When user clicks "Save Current Tabs" button
  document.getElementById('saveTabsBtn').addEventListener('click', saveCurrentTabs);
  
  // ---- Session Name Input ----
  // Allow users to press Enter key instead of clicking button
  // 'keypress' event fires when a key is pressed
  document.getElementById('sessionNameInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {  // Check if Enter key was pressed
      saveCurrentTabs();       // Trigger save function
    }
  });

  // ---- Dark Mode Toggle ----
  // When user clicks the sun/moon icon
  document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);

  // ---- Rename Modal Buttons ----
  // Cancel button closes the modal without saving
  document.getElementById('cancelRenameBtn').addEventListener('click', closeRenameModal);
  
  // Confirm button saves the new name
  document.getElementById('confirmRenameBtn').addEventListener('click', confirmRename);
  
  // ---- Rename Input (Enter Key) ----
  // Allow Enter key to confirm rename instead of clicking button
  document.getElementById('renameInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      confirmRename();
    }
  });

  // ---- Modal Background Click ----
  // Close modal if user clicks outside the modal content (on dark background)
  // e.target is the element that was clicked
  document.getElementById('renameModal').addEventListener('click', (e) => {
    if (e.target.id === 'renameModal') {  // Only if clicking the background
      closeRenameModal();
    }
  });
}

// =======================
// Dark Mode Functions
// =======================
function initializeDarkMode() {
  // Check if dark mode preference exists
  chrome.storage.local.get(['darkMode'], (result) => {
    const isDark = result.darkMode || false;
    if (isDark) {
      document.documentElement.classList.add('dark');
      updateDarkModeIcon(true);
    }
  });
}

function toggleDarkMode() {
  const isDark = document.documentElement.classList.toggle('dark');
  chrome.storage.local.set({ darkMode: isDark });
  updateDarkModeIcon(isDark);
}

function updateDarkModeIcon(isDark) {
  const sunIcon = document.getElementById('sunIcon');
  const moonIcon = document.getElementById('moonIcon');
  
  if (isDark) {
    sunIcon.classList.remove('hidden');
    moonIcon.classList.add('hidden');
  } else {
    sunIcon.classList.add('hidden');
    moonIcon.classList.remove('hidden');
  }
}

// ================================================================
// SAVE CURRENT TABS
// ================================================================
// This is the main function that saves all open tabs as a session
// It uses Chrome's Tabs API to get tab information

async function saveCurrentTabs() {
  // ---- Step 1: Get the session name from input field ----
  const sessionNameInput = document.getElementById('sessionNameInput');
  let sessionName = sessionNameInput.value.trim();  // .trim() removes extra spaces
  
  // ---- Step 2: Generate default name if user didn't enter one ----
  if (!sessionName) {
    // Create a timestamp string like "10/11/2025, 1:30 PM"
    const timestamp = new Date().toLocaleString();
    sessionName = `Session ${timestamp}`;  // e.g., "Session 10/11/2025, 1:30 PM"
  }

  try {
    // ---- Step 3: Get all open tabs in current window ----
    // chrome.tabs.query() is a Chrome API function
    // { currentWindow: true } means only tabs in this window, not all windows
    // await waits for the promise to complete before continuing
    const tabs = await chrome.tabs.query({ currentWindow: true });
    
    // ---- Step 4: Extract only the data we need from each tab ----
    // .map() creates a new array by transforming each element
    // We only save title and URL, not the entire tab object
    const tabData = tabs.map(tab => ({
      title: tab.title,  // Tab title (page name)
      url: tab.url       // URL of the page
    }));

    // ---- Step 5: Create a session object ----
    // This object contains all the information about the session
    const newSession = {
      name: sessionName,           // User's custom name
      tabs: tabData,               // Array of tab objects
      timestamp: Date.now(),       // Current time in milliseconds (unique ID)
      tabCount: tabData.length     // Number of tabs saved
    };

    // ---- Step 6: Add new session to our sessions array ----
    sessions.push(newSession);

    // ---- Step 7: Save to Chrome's local storage ----
    // chrome.storage.local persists data even after closing the browser
    // The data is stored as { sessions: [array of session objects] }
    await chrome.storage.local.set({ sessions: sessions });

    // ---- Step 8: Clear the input field ----
    // Ready for the next session name
    sessionNameInput.value = '';

    // ---- Step 9: Update the UI to show the new session ----
    renderSessions();  // Re-draws the sessions list

    // ---- Step 10: Show success message to user ----
    showFeedback('Session saved successfully!', 'success');

  } catch (error) {
    // If anything goes wrong, log the error and show message
    console.error('Error saving tabs:', error);
    showFeedback('Error saving session', 'error');
  }
}

// =======================
// Load Sessions from Storage
// =======================
async function loadSessions() {
  try {
    const result = await chrome.storage.local.get(['sessions']);
    sessions = result.sessions || [];
    renderSessions();
  } catch (error) {
    console.error('Error loading sessions:', error);
  }
}

// ================================================================
// RENDER SESSIONS LIST
// ================================================================
// This function updates the UI to display all saved sessions
// It's called whenever sessions are loaded, added, renamed, or deleted

function renderSessions() {
  // ---- Get the DOM elements we'll work with ----
  const sessionsList = document.getElementById('sessionsList');
  const emptyState = document.getElementById('emptyState');

  // ---- Step 1: Clear existing session cards ----
  // .querySelectorAll() finds all elements with class 'session-card'
  // We remove old cards before adding new ones to avoid duplicates
  const existingCards = sessionsList.querySelectorAll('.session-card');
  existingCards.forEach(card => card.remove());

  // ---- Step 2: Handle empty state ----
  // If no sessions exist, show the "No saved sessions" message
  if (sessions.length === 0) {
    emptyState.classList.remove('hidden');  // Make empty state visible
    return;  // Exit function early, nothing else to render
  }

  // ---- Step 3: Hide empty state if we have sessions ----
  emptyState.classList.add('hidden');

  // ---- Step 4: Create and display each session card ----
  // .slice() creates a copy of the array (doesn't modify original)
  // .reverse() reverses it so newest sessions appear first
  // .forEach() loops through each session
  sessions.slice().reverse().forEach((session, reverseIndex) => {
    // Calculate the original array index
    // (needed because we reversed the array for display)
    const actualIndex = sessions.length - 1 - reverseIndex;
    
    // Create a card element for this session
    const sessionCard = createSessionCard(session, actualIndex);
    
    // Insert the card before the empty state element
    // This adds it to the list in the correct position
    sessionsList.insertBefore(sessionCard, emptyState);
  });
}

// ================================================================
// CREATE SESSION CARD ELEMENT
// ================================================================
// This function dynamically creates an HTML element for each session
// It's called by renderSessions() for every saved session
//
// Why create elements with JavaScript instead of HTML?
// - We don't know how many sessions exist until runtime
// - Each session needs unique data (name, tab count, timestamp)
// - We need to attach event listeners to buttons dynamically
//
// DOM Manipulation Methods Used:
// - createElement(): Creates a new HTML element
// - className: Sets the CSS class
// - dataset: Stores custom data on the element
// - innerHTML: Sets the inner HTML content
// - appendChild(): Adds a child element
// - onclick: Attaches a click event handler

function createSessionCard(session, index) {
  // ---- Create the main card container ----
  const card = document.createElement('div');  // <div></div>
  card.className = 'session-card';             // <div class="session-card"></div>
  
  // ---- Store timestamp as data attribute ----
  // data-timestamp="1234567890" - used to identify this specific session
  // This is better than using array index because timestamps don't change
  card.dataset.timestamp = session.timestamp;

  // Main content wrapper
  const content = document.createElement('div');
  content.className = 'session-content';

  // Left side: Session info
  const info = document.createElement('div');
  info.className = 'session-info';

  const name = document.createElement('h3');
  name.className = 'session-name';
  name.textContent = session.name;
  name.title = session.name;

  const meta = document.createElement('div');
  meta.className = 'session-meta';

  // Tab count badge
  const tabBadge = document.createElement('span');
  tabBadge.className = 'tab-badge';
  tabBadge.textContent = `${session.tabCount} tab${session.tabCount !== 1 ? 's' : ''}`;

  // Timestamp
  const timestamp = document.createElement('span');
  timestamp.textContent = formatTimestamp(session.timestamp);

  meta.appendChild(tabBadge);
  meta.appendChild(timestamp);

  info.appendChild(name);
  info.appendChild(meta);

  // Right side: Action buttons
  const actions = document.createElement('div');
  actions.className = 'session-actions';

  // Open button
  const openBtn = document.createElement('button');
  openBtn.className = 'action-btn always-visible';
  openBtn.title = 'Open session';
  openBtn.dataset.timestamp = session.timestamp; // Store timestamp as unique ID
  openBtn.innerHTML = `
    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
    </svg>
  `;
  openBtn.onclick = function(e) {
    e.stopPropagation();
    openSessionByTimestamp(parseInt(this.dataset.timestamp));
  };

  // Rename button
  const renameBtn = document.createElement('button');
  renameBtn.className = 'action-btn';
  renameBtn.title = 'Rename session';
  renameBtn.dataset.timestamp = session.timestamp; // Store timestamp as unique ID
  renameBtn.innerHTML = `
    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
    </svg>
  `;
  renameBtn.onclick = function(e) {
    e.stopPropagation();
    openRenameModalByTimestamp(parseInt(this.dataset.timestamp));
  };

  // Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'action-btn delete';
  deleteBtn.title = 'Delete session';
  deleteBtn.dataset.timestamp = session.timestamp; // Store timestamp as unique ID
  deleteBtn.innerHTML = `
    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
    </svg>
  `;
  deleteBtn.onclick = function(e) {
    e.stopPropagation();
    deleteSessionByTimestamp(parseInt(this.dataset.timestamp));
  };

  actions.appendChild(openBtn);
  actions.appendChild(renameBtn);
  actions.appendChild(deleteBtn);

  content.appendChild(info);
  content.appendChild(actions);
  card.appendChild(content);

  // Click card to open session
  card.onclick = function() {
    openSessionByTimestamp(parseInt(this.dataset.timestamp));
  };

  return card;
}


// =======================
// Open Session (Restore Tabs) - By Timestamp
// =======================
async function openSessionByTimestamp(timestamp) {
  const session = sessions.find(s => s.timestamp === timestamp);
  
  if (!session) {
    console.error('Session not found with timestamp:', timestamp);
    showFeedback('Error: Session not found', 'error');
    return;
  }
  
  try {
    // Open each tab from the session
    for (const tab of session.tabs) {
      await chrome.tabs.create({ url: tab.url, active: false });
    }
    
    showFeedback(`Opened ${session.tabs.length} tab${session.tabs.length !== 1 ? 's' : ''}`, 'success');
  } catch (error) {
    console.error('Error opening session:', error);
    showFeedback('Error opening session', 'error');
  }
}

// Legacy function kept for compatibility
async function openSession(index) {
  if (index < 0 || index >= sessions.length) return;
  const session = sessions[index];
  if (session) {
    await openSessionByTimestamp(session.timestamp);
  }
}

// ================================================================
// DELETE SESSION - BY TIMESTAMP
// ================================================================
// Deletes a session from storage
// We use timestamp instead of array index because:
// - Timestamps are unique and never change
// - Array indices change when we reverse the array for display
// - This prevents deleting the wrong session

async function deleteSessionByTimestamp(timestamp) {
  // ---- Step 1: Find the session in our array ----
  // .findIndex() searches for the first item that matches the condition
  // Returns the index if found, or -1 if not found
  // s => s.timestamp === timestamp  is an arrow function that checks each session
  const index = sessions.findIndex(s => s.timestamp === timestamp);
  
  // ---- Step 2: Check if session was found ----
  if (index === -1) {
    // Session not found - this shouldn't happen, but good to check
    console.error('Session not found with timestamp:', timestamp);
    showFeedback('Error: Session not found', 'error');
    return;  // Exit function early
  }

  // ---- Step 3: Get the session object ----
  const session = sessions[index];

  // ---- Step 4: Ask user to confirm deletion ----
  // confirm() shows a browser dialog with OK/Cancel buttons
  // Returns true if user clicks OK, false if Cancel
  if (!confirm(`Delete session "${session.name}"?`)) {
    return;  // User clicked Cancel, don't delete
  }

  try {
    // ---- Step 5: Remove session from array ----
    // .splice() removes items from an array
    // (index, 1) means: start at 'index', remove 1 item
    sessions.splice(index, 1);

    // ---- Step 6: Save updated array to storage ----
    // This persists the change so session stays deleted
    await chrome.storage.local.set({ sessions: sessions });

    // ---- Step 7: Update the UI ----
    // Re-render to remove the session card from display
    renderSessions();

    // ---- Step 8: Show success message ----
    showFeedback('Session deleted', 'success');
    
  } catch (error) {
    // If something goes wrong, log error and notify user
    console.error('Error deleting session:', error);
    showFeedback('Error deleting session', 'error');
  }
}

// Legacy function kept for compatibility
async function deleteSession(index) {
  if (index < 0 || index >= sessions.length) return;
  const session = sessions[index];
  if (session) {
    await deleteSessionByTimestamp(session.timestamp);
  }
}

// =======================
// Rename Session Modal Functions - By Timestamp
// =======================
function openRenameModalByTimestamp(timestamp) {
  const session = sessions.find(s => s.timestamp === timestamp);
  
  if (!session) {
    console.error('Session not found with timestamp:', timestamp);
    showFeedback('Error: Session not found', 'error');
    return;
  }

  currentRenameTimestamp = timestamp;
  
  const modal = document.getElementById('renameModal');
  const input = document.getElementById('renameInput');
  
  input.value = session.name;
  modal.classList.remove('hidden');
  
  // Focus input
  setTimeout(() => input.focus(), 100);
}

// Legacy function kept for compatibility
function openRenameModal(index) {
  if (index >= 0 && index < sessions.length) {
    const session = sessions[index];
    if (session) {
      openRenameModalByTimestamp(session.timestamp);
    }
  }
}

function closeRenameModal() {
  const modal = document.getElementById('renameModal');
  modal.classList.add('hidden');
  currentRenameTimestamp = null;
}

async function confirmRename() {
  if (currentRenameTimestamp === null) return;

  const newName = document.getElementById('renameInput').value.trim();
  
  if (!newName) {
    showFeedback('Please enter a name', 'error');
    return;
  }

  try {
    // Find session by timestamp
    const index = sessions.findIndex(s => s.timestamp === currentRenameTimestamp);
    
    if (index === -1) {
      showFeedback('Error: Session not found', 'error');
      return;
    }

    // Update session name
    sessions[index].name = newName;

    // Save to storage
    await chrome.storage.local.set({ sessions: sessions });

    // Re-render
    renderSessions();

    // Close modal
    closeRenameModal();

    showFeedback('Session renamed', 'success');
  } catch (error) {
    console.error('Error renaming session:', error);
    showFeedback('Error renaming session', 'error');
  }
}

// =======================
// Utility Functions
// =======================

// Format timestamp to human-readable format
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

// Show feedback message
function showFeedback(message, type = 'success') {
  // Create feedback element
  const feedback = document.createElement('div');
  feedback.className = `feedback-toast ${type}`;
  
  // Add icon based on type
  const icon = type === 'success' 
    ? `<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
       </svg>`
    : `<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
       </svg>`;
  
  feedback.innerHTML = `${icon}<span>${message}</span>`;
  document.body.appendChild(feedback);

  // Remove after 2.5 seconds
  setTimeout(() => {
    feedback.style.opacity = '0';
    feedback.style.transform = 'translateX(-50%) translateY(-10px)';
    setTimeout(() => feedback.remove(), 300);
  }, 2500);
}
