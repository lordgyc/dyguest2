// Preload script runs in renderer process before web content is loaded
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', 
  {
    sendMessage: (channel, data) => {
      // whitelist channels
      let validChannels = ['app-message'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    receive: (channel, func) => {
      let validChannels = ['app-reply', 'server-status'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Add database access methods
    database: {
      // Query for getting data
      query: async (sql, params = []) => {
        try {
          return await ipcRenderer.invoke('db-query', { sql, params });
        } catch (error) {
          console.error('Database query error:', error);
          throw error;
        }
      },
      // Run for inserting/updating/deleting data
      run: async (sql, params = []) => {
        try {
          return await ipcRenderer.invoke('db-run', { sql, params });
        } catch (error) {
          console.error('Database run error:', error);
          throw error;
        }
      }
    },
    // Add API methods for fetch
    api: {
      async get(endpoint) {
        try {
          const response = await fetch(`http://localhost:3000${endpoint}`);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
          }
          return await response.json();
        } catch (error) {
          console.error(`API GET error (${endpoint}):`, error);
          throw error;
        }
      },
      
      async post(endpoint, data) {
        try {
          const response = await fetch(`http://localhost:3000${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
          }
          
          return await response.json();
        } catch (error) {
          console.error(`API POST error (${endpoint}):`, error);
          throw error;
        }
      },
      
      async put(endpoint, data) {
        try {
          const response = await fetch(`http://localhost:3000${endpoint}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
          }
          
          return await response.json();
        } catch (error) {
          console.error(`API PUT error (${endpoint}):`, error);
          throw error;
        }
      },
      
      async delete(endpoint) {
        try {
          const response = await fetch(`http://localhost:3000${endpoint}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
          }
          
          return await response.json();
        } catch (error) {
          console.error(`API DELETE error (${endpoint}):`, error);
          throw error;
        }
      }
    }
  }
); 