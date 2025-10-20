// server/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const util = require('minecraft-server-util');
const si = require('systeminformation');

// --- Global State for Live Data ---
let liveStatus = {
  online: false,
  history: { cpu: [], memory: [] }
};
const HISTORY_LENGTH = 30; // Keep the last 30 data points

// --- Background Polling Function ---
const pollServerStatus = async () => {
  try {
    const [mcStatus, cpuLoad, mem] = await Promise.all([
      util.status('join.chisato04.com', 60524, { timeout: 1000 }),
      si.currentLoad(),
      si.mem(),
    ]);

    const cpuHistory = liveStatus.history.cpu;
    cpuHistory.push({ name: Date.now(), usage: parseFloat(cpuLoad.currentLoad.toFixed(2)) });
    if (cpuHistory.length > HISTORY_LENGTH) cpuHistory.shift();

    const memHistory = liveStatus.history.memory;
    const memUsage = parseFloat(((mem.used / mem.total) * 100).toFixed(2));
    memHistory.push({ name: Date.now(), usage: memUsage });
    if (memHistory.length > HISTORY_LENGTH) memHistory.shift();

    liveStatus = {
      online: true,
      ...mcStatus,
      system: {
        cpuUsage: cpuLoad.currentLoad,
        memory: { total: mem.total, used: mem.used },
        uptime: si.time().uptime,
      },
      history: { cpu: cpuHistory, memory: memHistory },
    };

  } catch (error) {
    liveStatus = { ...liveStatus, online: false };
    console.error(`Ping failed (this is normal if server is offline): ${error.message}`);
  }
};

// =================================================================
// === THE MISSING FUNCTION DEFINITION IS NOW HERE =================
// =================================================================
const initializeDataDirectories = async () => {
  console.log('Verifying data directories...');
  const dataPath = path.join(__dirname, 'data');
  const modpacksPath = path.join(dataPath, 'modpacks');
  const metadataFilePath = path.join(dataPath, 'metadata.json');

  try {
    await fs.mkdir(modpacksPath, { recursive: true });
    console.log(`Directory ensured: ${modpacksPath}`);
    
    // Check if metadata.json exists, create it with an empty object if not.
    await fs.access(metadataFilePath);
    console.log('metadata.json found.');
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log("metadata.json not found, creating a new one with '{}'.");
      await fs.writeFile(metadataFilePath, '{}', 'utf-8');
    } else {
      console.error("FATAL ERROR: Could not create or access necessary data directories.", error);
      process.exit(1); // Exit if we can't create essential folders.
    }
  }
};


// --- Initial Setup and Express App ---
const apiRoutes = require('./routes/api');
const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// This middleware makes the liveStatus object available to all API routes
app.use((req, res, next) => {
  req.liveStatus = liveStatus;
  next();
});

// --- Static File Serving ---
app.use('/downloads/modpacks', express.static(path.join(path.join(__dirname, 'data', 'modpacks'))));

// --- API Routes ---
app.use('/api', apiRoutes);

// --- Start Everything ---
const startServer = async () => {
  // We call the function AFTER it has been defined.
  await initializeDataDirectories();
  
  app.listen(PORT, '0.0.0.0',() => {
    console.log(`Express server is listening on http://localhost:${PORT}`);
    // Start the background polling AFTER the server starts
    setInterval(pollServerStatus, 1000); // Poll every 5 seconds
    pollServerStatus(); // Run once immediately to get initial data
  });
};

startServer();