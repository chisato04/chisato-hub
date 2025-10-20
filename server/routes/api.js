// server/routes/api.js

const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const util = require('minecraft-server-util');
const si = require('systeminformation');
const multer = require('multer');
const JSZip = require('jszip');

const router = express.Router();

// --- Configuration ---
const dataPath = path.join(__dirname, '..', 'data');
const metadataFilePath = path.join(dataPath, 'metadata.json');
const modpacksPath = path.join(dataPath, 'modpacks');
const MINECRAFT_SERVER_PATH = '/home/chisato/Documents/1.21.1_October_LTS'; 
const userCachePath = path.join(MINECRAFT_SERVER_PATH, 'usercache.json');
const playerStatsPath = path.join(MINECRAFT_SERVER_PATH, 'world/stats');

// --- Middleware ---
const upload = multer({ storage: multer.memoryStorage() });

// --- Helper Functions ---
const readMetadata = async () => JSON.parse(await fs.readFile(metadataFilePath, 'utf-8'));
const writeMetadata = async (data) => await fs.writeFile(metadataFilePath, JSON.stringify(data, null, 2), 'utf-8');

// --- PUBLIC API ENDPOINTS ---

router.get('/modpacks', async (req, res) => {
  try {
    const metadataObject = await readMetadata();
    const metadataArray = Object.entries(metadataObject).map(([filename, packData]) => ({
      ...packData,
      filename,
      name: filename.replace('.mrpack', '').replace(/_/g, ' '),
    }));
    res.json(metadataArray);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve modpack data' });
  }
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
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve modpack data' });
  }
});

router.get('/players', async (req, res) => {
  try {
    const userCacheData = await fs.readFile(userCachePath, 'utf-8');
    const players = JSON.parse(userCacheData)
      .map(p => ({ name: p.name, uuid: p.uuid }))
      .sort((a, b) => a.name.localeCompare(b.name));
    res.json(players);
  } catch (error) {
    if (error.code === 'ENOENT') return res.status(500).json({ message: 'usercache.json not found. Please check server path.' });
    res.status(500).json({ message: 'Failed to retrieve player data.' });
  }
});

router.get('/player-stats/:uuid', async (req, res) => {
  const statFilePath = path.join(playerStatsPath, `${req.params.uuid}.json`);
  try {
    const fileContent = await fs.readFile(statFilePath, 'utf-8');
    const allStats = JSON.parse(fileContent);
    const custom = allStats.stats['minecraft:custom'] || {};
    const killed = allStats.stats['minecraft:killed'] || {};

    const topKills = Object.entries(killed)
      .sort(([, a], [, b]) => b - a).slice(0, 5)
      .map(([mob, count]) => ({ name: mob.replace('minecraft:', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), count }));
      
    res.json({
      deaths: custom['minecraft:deaths'] || 0,
      player_kills: custom['minecraft:player_kills'] || 0,
      play_time_hours: Math.floor((custom['minecraft:play_time'] || 0) / 72000), // Ticks to Hours
      top_mob_kills: topKills,
    });
  } catch (error) {
    if (error.code === 'ENOENT') return res.status(404).json({ message: 'Player has no recorded stats yet.' });
    res.status(500).json({ message: 'Failed to retrieve player stats.' });
  }
});

let cachedStatus = null;
let lastFetchTime = 0;
router.get('/server-status', (req, res) => {
  res.json(req.liveStatus);
});

router.get('/leaderboard', async (req, res) => {
  try {
    const userCacheData = await fs.readFile(userCachePath, 'utf-8');
    const userCache = JSON.parse(userCacheData);
    const allPlayerStats = [];
    for (const player of userCache) {
      const statFilePath = path.join(playerStatsPath, `${player.uuid}.json`);
      try {
        const stats = JSON.parse(await fs.readFile(statFilePath, 'utf-8'));
        allPlayerStats.push({ name: player.name, stats: stats.stats['minecraft:custom'] || {} });
      } catch (e) { /* Skip players with no stats file */ }
    }
    res.json({
      playTime: [...allPlayerStats].sort((a,b) => (b.stats['minecraft:play_time']||0) - (a.stats['minecraft:play_time']||0)).slice(0,5).map(p => ({name:p.name, value:Math.floor((p.stats['minecraft:play_time']||0)/72000)})),
      playerKills: [...allPlayerStats].sort((a,b) => (b.stats['minecraft:player_kills']||0) - (a.stats['minecraft:player_kills']||0)).slice(0,5).map(p => ({name:p.name, value:p.stats['minecraft:player_kills']||0})),
      deaths: [...allPlayerStats].sort((a,b) => (b.stats['minecraft:deaths']||0) - (a.stats['minecraft:deaths']||0)).slice(0,5).map(p => ({name:p.name, value:p.stats['minecraft:deaths']||0})),
    });
  } catch (error) { res.status(500).json({ message: 'Failed to generate leaderboards.' }); }
});

// --- ADMIN API ENDPOINTS ---

router.post('/modpacks', upload.single('modpackFile'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No modpack file uploaded.' });
  const filename = req.file.originalname;
  try {
    const metadata = await readMetadata();
    if (metadata[filename]) return res.status(409).json({ message: `A modpack with this filename already exists.` });
    
    const zip = await JSZip.loadAsync(req.file.buffer);
    const indexFile = zip.file('modrinth.index.json');
    if (!indexFile) throw new Error('modrinth.index.json not found in the .mrpack file.');

    const indexContent = await indexFile.async('string');
    const modrinthIndex = JSON.parse(indexContent);
    const dependencies = modrinthIndex.dependencies || {};
    const minecraftVersion = dependencies.minecraft || 'Unknown';
    const loaderId = Object.keys(dependencies).find(key => ['forge', 'fabric', 'quilt', 'neoforge'].some(l => key.includes(l)));
    const loaderName = loaderId ? (loaderId.split('-')[0].charAt(0).toUpperCase() + loaderId.split('-')[0].slice(1)) : 'Vanilla';
    const mods = modrinthIndex.files.map(file => file.path.split('/').pop().replace(/\.jar$/, '').replace(/[-_]/g, ' ').replace(/\s?\d+(\.\d+)*\s?/, '').trim().replace(/\b\w/g, l => l.toUpperCase()));

    await fs.writeFile(path.join(modpacksPath, filename), req.file.buffer);

    metadata[filename] = {
      version: modrinthIndex.versionId, minecraftVersion, loader: loaderName, modlist: mods,
      java_args: '', notes: '',
    };
    await writeMetadata(metadata);
    res.status(201).json({ message: `Successfully processed ${filename}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/modpacks/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const { java_args, notes } = req.body;
    const metadata = await readMetadata();
    if (!metadata[filename]) return res.status(404).json({ message: 'Modpack not found' });
    metadata[filename].java_args = java_args;
    metadata[filename].notes = notes;
    await writeMetadata(metadata);
    res.json({ message: 'Modpack updated successfully!' });
  } catch (error) { res.status(500).json({ message: 'Failed to update modpack' }); }
});

router.delete('/modpacks/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const metadata = await readMetadata();
    if (!metadata[filename]) return res.status(404).json({ message: 'Modpack not found.' });
    await fs.unlink(path.join(modpacksPath, filename)).catch(err => console.log(err.message));
    delete metadata[filename];
    await writeMetadata(metadata);
    res.json({ message: 'Modpack deleted successfully' });
  } catch (error) { res.status(500).json({ message: 'Failed to delete modpack' }); }
});

module.exports = router;