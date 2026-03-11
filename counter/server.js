const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const COUNTERS_FILE = path.join(DATA_DIR, 'counters.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readCounters() {
  ensureDataDir();
  try {
    const data = fs.readFileSync(COUNTERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    if (e.code === 'ENOENT') return {};
    throw e;
  }
}

function writeCounters(obj) {
  ensureDataDir();
  fs.writeFileSync(COUNTERS_FILE, JSON.stringify(obj, null, 2), 'utf8');
}

app.get('/counter/:bookId', (req, res) => {
  const { bookId } = req.params;
  const counters = readCounters();
  const count = Number(counters[bookId]) || 0;
  res.json({ count });
});

app.post('/counter/:bookId/incr', (req, res) => {
  const { bookId } = req.params;
  const counters = readCounters();
  counters[bookId] = (Number(counters[bookId]) || 0) + 1;
  writeCounters(counters);
  res.json({ count: counters[bookId] });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Counter service is running on port ${PORT}`);
});
