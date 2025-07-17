// server/routes/api.js

const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const util = require('minecraft-server-util');
const multer = require('multer');
const JSZip = require('jszip');

const router = express.Router();

// --- Configuration ---
const dataPath = path.join(__dirname, '..', 'data');
const metadataFilePath = path.join(dataPath, 'metadata.json');
const modpacksPath = path.join(dataPath, 'modpacks');
const MINECRAFT_SERVER_PATH = 'D:/DONT_DELETE/minecraft-servers/1.21.1_server'; 
const userCachePath = path.join(MINECRAFT_SERVER_PATH, 'usercache.json');
const playerStatsPath = path.join(MINECRAFT_SERVER_PATH, 'world/stats');

// --- Multer Setup ---
const upload = multer({ storage: multer.memoryStorage() });

// --- Helper Functions ---
const readMetadata = async () => { return JSON.parse(await fs.readFile(metadataFilePath, 'utf-8')); };
const writeMetadata = async (data) => { await fs.writeFile(metadataFilePath, JSON.stringify(data, null, 2), 'utf-8'); };

// =================================================================
// === PUBLIC API ENDPOINTS ========================================
// =================================================================

// --- Modpack Routes ---
router.get('/modpacks', async (req, res) => {
  try {
    const metadataObject = await readMetadata();
    const metadataArray = Object.entries(metadataObject).map(([filename, packData]) => ({
      ...packData,
      filename: filename,
      name: filename.replace('.mrpack', '').replace(/_/g, ' '),
    }));
    res.json(metadataArray);
  } catch (error) { res.status(500).json({ message: 'Failed to retrieve modpack data' }); }
});

router.get('/modpacks/:filename', async (req, res) => {
  try {
    const metadataObject = await readMetadata();
    const packData = metadataObject[req.params.filename];
    if (packData) {
      res.json({
        ...packData,
        filename: req.params.filename,
        name: req.params.filename.replace('.mrpack', '').replace(/_/g, ' '),
      });
    } else {
      res.status(404).json({ message: 'Modpack not found' });
    }
  } catch (error) { res.status(500).json({ message: 'Failed to retrieve modpack data' }); }
});

// --- Player Gallery & Stats Routes ---
router.get('/players', async (req, res) => {
  try {
    const userCacheData = await fs.readFile(userCachePath, 'utf-8');
    const userCache = JSON.parse(userCacheData);
    if (!Array.isArray(userCache)) throw new Error('usercache.json is not in the expected format.');
    const players = userCache.map(player => ({ name: player.name, uuid: player.uuid }));
    players.sort((a, b) => a.name.localeCompare(b.name));
    res.json(players);
  } catch (error) {
    if (error.code === 'ENOENT') return res.status(500).json({ message: `Server file usercache.json not found. Please check the path.` });
    res.status(500).json({ message: 'Failed to retrieve player data.' });
  }
});

router.get('/player-stats/:uuid', async (req, res) => {
  const { uuid } = req.params;
  const statFilePath = path.join(playerStatsPath, `${uuid}.json`);
  try {
    const statFileContent = await fs.readFile(statFilePath, 'utf-8');
    const allStats = JSON.parse(statFileContent);
    const customStats = allStats.stats['minecraft:custom'] || {};
    const killedStats = allStats.stats['minecraft:killed'] || {};
    const topKilled = Object.entries(killedStats)
      .sort(([, countA], [, countB]) => countB - countA).slice(0, 5)
      .map(([mob, count]) => ({ name: mob.replace('minecraft:', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), count, }));
    const finalStats = {
      deaths: customStats['minecraft:deaths'] || 0,
      player_kills: customStats['minecraft:player_kills'] || 0,
      play_time_hours: customStats['minecraft:play_time'] ? Math.floor(customStats['minecraft:play_time'] / 20 / 3600) : 0,
      top_mob_kills: topKilled,
    };
    res.json(finalStats);
  } catch (error) {
    if (error.code === 'ENOENT') return res.status(404).json({ message: 'Player has no recorded stats yet.' });
    res.status(500).json({ message: 'Failed to retrieve player stats.' });
  }
});

// --- Server Status Route ---
let cachedStatus = null; let lastFetchTime = 0;
const CACHE_DURATION = 30 * 1000;
router.get('/server-status', async (req, res) => {
  const now = Date.now();
  if (cachedStatus && cachedStatus.online && (now - lastFetchTime < CACHE_DURATION)) {
    return res.json(cachedStatus);
  }
  try {
    const status = await util.status('172.24.215.119', 25565, { timeout: 5000 });
    cachedStatus = { online: true, ...status };
    lastFetchTime = now;
    res.json(cachedStatus);
  } catch (error) {
    res.json({ online: false });
  }
});

// =================================================================
// === ADMIN API ENDPOINTS =========================================
// =================================================================

router.post('/modpacks', upload.single('modpackFile'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No modpack file uploaded.' });
  const filename = req.file.originalname;
  try {
    const metadata = await readMetadata();
    if (metadata[filename]) return res.status(409).json({ message: `A modpack with the filename '${filename}' already exists.` });
    
    const zip = await JSZip.loadAsync(req.file.buffer);
    const indexFile = zip.file('modrinth.index.json');
    if (!indexFile) throw new Error('modrinth.index.json not found in the .mrpack file.');

    const indexContent = await indexFile.async('string');
    const modrinthIndex = JSON.parse(indexContent);
    const dependencies = modrinthIndex.dependencies || {};
    const minecraftVersion = dependencies['minecraft'] || 'Unknown';
    const loaderId = Object.keys(dependencies).find(key => ['forge', 'fabric', 'quilt', 'neoforge'].some(l => key.includes(l)));
    let loaderName = loaderId ? (loaderId.split('-')[0].charAt(0).toUpperCase() + loaderId.split('-')[0].slice(1)) : 'Vanilla';
    const mods = modrinthIndex.files.map(file => {
      const jarName = file.path.split('/').pop();
      return jarName.replace(/\.jar$/, '').replace(/[-_]/g, ' ').replace(/\s?\d+(\.\d+)*\s?/, '').trim().replace(/\b\w/g, l => l.toUpperCase());
    });

    await fs.writeFile(path.join(modpacksPath, filename), req.file.buffer);

    metadata[filename] = {
      version: modrinthIndex.versionId, minecraftVersion, loader: loaderName, modlist: mods,
      java_args: '', notes: '',
    };
    await writeMetadata(metadata);
    res.status(201).json({ message: `Successfully uploaded and processed ${filename}` });
  } catch (error) {
    console.error('Error processing .mrpack file:', error);
    res.status(500).json({ message: error.message });
  }
});

router.put('/modpacks/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const updatedData = req.body;
    const metadata = await readMetadata();
    if (!metadata[filename]) return res.status(404).json({ message: 'Modpack not found' });
    metadata[filename].java_args = updatedData.java_args;
    metadata[filename].notes = updatedData.notes;
    await writeMetadata(metadata);
    res.json({ message: 'Modpack updated successfully!' });
  } catch (error) { res.status(500).json({ message: 'Failed to update modpack' }); }
});

router.delete('/modpacks/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const metadata = await readMetadata();
    if (!metadata[filename]) return res.status(404).json({ message: 'Modpack not found in metadata.' });
    await fs.unlink(path.join(modpacksPath, filename)).catch(err => console.log(err.message));
    delete metadata[filename];
    await writeMetadata(metadata);
    res.json({ message: 'Modpack deleted successfully' });
  } catch (error) { res.status(500).json({ message: 'Failed to delete modpack' }); }
});

module.exports = router;