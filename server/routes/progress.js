const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const progressFile = path.join(__dirname, '..', '..', 'progress.json');

// Default starting progress
const defaultProgress = {
  skillsExplored: 0,
  starsCollected: 0,
  dayStreak: 0,
  activitiesDone: 0,
  lastActive: null,
  recentActivity: [], // Array of { emoji, title, desc, time }
  skillProgress: {},  // map of skillId -> completed count
  weeklyActivity: {}, // map of YYYY-MM-DD -> count
};

// Helper to read progress
function readProgress() {
  if (!fs.existsSync(progressFile)) return defaultProgress;
  try {
    const data = fs.readFileSync(progressFile, 'utf8');
    return { ...defaultProgress, ...JSON.parse(data) };
  } catch (err) {
    return defaultProgress;
  }
}

// Helper to write progress
function writeProgress(data) {
  fs.writeFileSync(progressFile, JSON.stringify(data, null, 2));
}

router.get('/', (req, res) => {
  res.json(readProgress());
});

router.post('/', (req, res) => {
  try {
    const current = readProgress();
    const updates = req.body;
    
    // Update simple counters
    if (updates.skillsExplored) current.skillsExplored += updates.skillsExplored;
    if (updates.starsCollected) current.starsCollected += updates.starsCollected;
    if (updates.activitiesDone) current.activitiesDone += updates.activitiesDone;
    
    // Update streak tracking
    const today = new Date().toISOString().split('T')[0];
    if (current.lastActive !== today) {
      if (current.lastActive) {
        const last = new Date(current.lastActive);
        const diff = (new Date(today) - last) / (1000 * 60 * 60 * 24);
        if (diff === 1) current.dayStreak += 1;
        else if (diff > 1) current.dayStreak = 1; // broken streak
      } else {
        current.dayStreak = 1;
      }
      current.lastActive = today;
    }

    // Update specific skill completion
    if (updates.skillId && updates.completedCount !== undefined) {
      if (!current.skillProgress[updates.skillId] || updates.completedCount > current.skillProgress[updates.skillId]) {
         current.skillProgress[updates.skillId] = updates.completedCount;
      }
    }

    // Add recent activity & weekly chart data
    if (updates.activity) {
      current.recentActivity.unshift({
        emoji: updates.activity.emoji || '📝',
        title: updates.activity.title || 'Activity Logged',
        desc: updates.activity.desc || '',
        time: new Date().toISOString()
      });
      if (current.recentActivity.length > 5) current.recentActivity.pop(); // keep last 5
      
      // Update weekly activity chart data
      if (!current.weeklyActivity) current.weeklyActivity = {};
      current.weeklyActivity[today] = (current.weeklyActivity[today] || 0) + 1;
    }

    writeProgress(current);
    res.json(current);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save progress' });
  }
});

module.exports = router;
