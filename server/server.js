// server/server.js

const express = require('express');
const cors = require('cors');
const path = require('path');

// Import our API routes
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
app.use(cors({
  origin: 'http://localhost:5173' // Default Vite dev server port
}));
app.use(express.json());


// --- Static File Serving ---
// This makes the files in `data/modpacks` available under the URL path `/downloads/modpacks`
// Example: http://localhost:3001/downloads/modpacks/1.21.1%20Roots.mrpack
app.use('/downloads/modpacks', express.static(path.join(__dirname, 'data/modpacks')));

// This makes the files in `data/skins/uploads` available under `/downloads/skins`
// Example: http://localhost:3001/downloads/skins/chisato04.png
app.use('/downloads/skins', express.static(path.join(__dirname, 'data/skins/uploads')));


// --- API Routes ---
// All routes defined in `api.js` will be prefixed with `/api`
app.use('/api', apiRoutes);


// --- Test Route ---
app.get('/', (req, res) => {
  res.send('Chisato Hub API is running!');
});

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});