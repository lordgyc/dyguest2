const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Import the database connection and server functions from server.js
const { db, startServer, stopServer } = require('./server.js');

// Keep a global reference of the window object to prevent garbage collection
let mainWindow;
let serverRunning = false;

async function launchServer() {
  try {
    const port = await startServer();
    serverRunning = true;
    console.log(`Server started on port ${port}`);
    return port;
  } catch (err) {
    console.error('Failed to start server:', err);
    throw err;
  }
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true, // Changed to true for better security
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.png'), // Add an icon file to your project
    backgroundColor: '#f5f7fa', // Match your app's background color
  });

  // Load the index.html of the app
  mainWindow.loadFile('index.html');

  // Open DevTools in development mode
  // Uncomment this line if you want to open DevTools by default
  mainWindow.webContents.openDevTools();

  // Remove the default menu bar
  mainWindow.setMenuBarVisibility(false);

  // Emitted when the window is closed
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// Create window when Electron has finished initialization
app.whenReady().then(async () => {
  try {
    // Start the server first
    await launchServer();
    
    // Then create the window
    createWindow();
    
    if (mainWindow) {
      // Notify the renderer process that server is running
      mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('server-status', { running: true, port: 3000 });
      });
    }
  } catch (err) {
    console.error('Application startup failed:', err);
    if (db) {
      db.close();
    }
    app.quit();
  }

  app.on('activate', function () {
    // On macOS, re-create a window when the dock icon is clicked and no windows are open
    if (mainWindow === null) createWindow();
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Clean up before quitting
app.on('before-quit', async (event) => {
  if (serverRunning) {
    event.preventDefault(); // Prevent the app from quitting immediately
    
    try {
      await stopServer();
      serverRunning = false;
      
      // Close the database connection
      if (db) {
        console.log('Closing database connection...');
        db.close((err) => {
          if (err) {
            console.error('Error closing database:', err.message);
          } else {
            console.log('Database connection closed successfully.');
          }
          app.quit(); // Now we can quit
        });
      } else {
        app.quit();
      }
    } catch (err) {
      console.error('Error stopping server:', err);
      app.exit(1); // Force exit with error code
    }
  } else if (db) {
    event.preventDefault();
    console.log('Closing database connection...');
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed successfully.');
      }
      app.quit();
    });
  }
});

// Handle IPC messages from renderer process
ipcMain.on('app-message', (event, arg) => {
  console.log('Received message from renderer:', arg);
  
  // Example response back to renderer
  event.reply('app-reply', 'Message received by main process');
});

// Add database query handling via IPC
ipcMain.handle('db-query', async (event, { sql, params = [] }) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err.message);
      } else {
        resolve(rows);
      }
    });
  });
});

// Handle database insertions
ipcMain.handle('db-run', async (event, { sql, params = [] }) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err.message);
      } else {
        // Return last inserted ID and changes count
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
}); 