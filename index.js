const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const screenshot = require('screenshot-desktop');
const { Ollama } = require('ollama');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const Activity = require('./models/Activity');
require('dotenv').config();

// Initialize Ollama client
const ollama = new Ollama({
    host: "https://dominant-usually-oyster.ngrok-free.app"
});

// Create screenshots directory
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
  console.log('📁 Created screenshots directory:', screenshotsDir);
}

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/screenshots', express.static(screenshotsDir));

// MongoDB Schema is now imported from models/Activity.js

// Task Schema
const taskSchema = new mongoose.Schema({
  text: String,
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  completedAt: Date
});

const Task = mongoose.model('Task', taskSchema);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/cogniflow', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Global state
let isFocusMode = false;
let isMonitoring = false;
let monitoringInterval;
let isProcessing = false; // Flag to prevent overlapping captures

// Screenshot management settings
const MAX_SCREENSHOTS = 50; // Maximum number of screenshots to keep

// Function to clean up old screenshots
async function cleanupOldScreenshots() {
  try {
    console.log('🧹 Cleaning up old screenshots...');
    
    // Get all screenshot files sorted by creation time (newest first)
    const files = fs.readdirSync(screenshotsDir)
      .filter(file => file.startsWith('screenshot-') && file.endsWith('.png'))
      .map(file => ({
        name: file,
        path: path.join(screenshotsDir, file),
        stats: fs.statSync(path.join(screenshotsDir, file))
      }))
      .sort((a, b) => b.stats.birthtime - a.stats.birthtime);

    // Keep only the most recent MAX_SCREENSHOTS files
    if (files.length > MAX_SCREENSHOTS) {
      const filesToDelete = files.slice(MAX_SCREENSHOTS);
      
      console.log(`🗑️ Deleting ${filesToDelete.length} old screenshots`);
      
      for (const file of filesToDelete) {
        try {
          fs.unlinkSync(file.path);
          console.log(`✅ Deleted: ${file.name}`);
          
          // Also remove from database if exists (update to remove screenshot path)
          await Activity.updateMany(
            { screenshotPath: file.name }, 
            { $unset: { screenshotPath: 1 } }
          );
        } catch (error) {
          console.error(`❌ Error deleting ${file.name}:`, error.message);
        }
      }
      
      console.log(`✅ Screenshot cleanup complete. Kept ${MAX_SCREENSHOTS} most recent files.`);
    } else {
      console.log(`✅ No cleanup needed. Current screenshot count: ${files.length}`);
    }
  } catch (error) {
    console.error('❌ Error during screenshot cleanup:', error);
  }
}

// Screenshot and AI Analysis Function
async function captureAndAnalyze() {
  // Prevent overlapping captures
  if (isProcessing) {
    console.log('⏳ Previous analysis still in progress, skipping this iteration');
    return;
  }
  
  isProcessing = true;
  console.log('🚀 Starting new analysis cycle...');
  
  try {
    console.log('📸 Capturing screenshot...');
    const img = await screenshot({ format: 'png' });
    console.log(`✅ Screenshot captured, size: ${img.length} bytes`);
    
    // Save screenshot locally for debugging
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `screenshot-${timestamp}.png`;
    const filepath = path.join(screenshotsDir, filename);
    
    fs.writeFileSync(filepath, img);
    console.log(`💾 Screenshot saved locally: ${filepath}`);
    
    // Clean up old screenshots if needed
    await cleanupOldScreenshots();
    
    // Convert image to base64 for Ollama
    const base64Image = img.toString('base64');
    console.log(`🔄 Converted to base64, length: ${base64Image.length} characters`);
    
    console.log('🤖 Sending to Ollama for analysis...');
    console.log(`📋 Model: gemma3:4b`);
    
    // Analyze with Ollama Gemma 3B
    const analysis = await ollama.generate({
      model: 'gemma3:4b',
      prompt: `Analyze this screenshot and provide:
1. What activity is the user performing? (study, work, entertainment, social media, etc.)
2. What specific actions are visible? (list 3-5 actions)
3. Productivity score from 1-10 (10 being highly productive)
4. Whether this appears to be focused work/study time

Respond in JSON format:
{
  "activity": "description",
  "actions": ["action1", "action2", "action3"],
  "productivityScore": number,
  "isFocusedWork": boolean
}`,
      images: [base64Image],
      stream: false,
      format: "json"
    });

    let result;
    try {
      result = JSON.parse(analysis.response);
      console.log('✅ Successfully parsed JSON response:', JSON.stringify(result, null, 2));
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError.message);
      console.log('🔧 Attempting to clean response...');
      
      // Try to extract JSON from response
      const jsonMatch = analysis.response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          result = JSON.parse(jsonMatch[0]);
          console.log('✅ Successfully parsed cleaned JSON:', JSON.stringify(result, null, 2));
        } catch (cleanError) {
          console.error('❌ Cleaned JSON parsing also failed:', cleanError.message);
          throw cleanError;
        }
      } else {
        throw new Error('No JSON found in response');
      }
    }
    
    // Create activity record
    console.log('💾 Creating activity record...');
    const activity = new Activity({
      context: result.activity,
      actions: result.actions,
      productivityScore: result.productivityScore,
      focusMode: isFocusMode,
      screenshotPath: filename
    });
    console.log('📋 Activity data:', {
      context: result.activity,
      actions: result.actions,
      productivityScore: result.productivityScore,
      focusMode: isFocusMode,
      screenshotPath: filename
    });

    await activity.save();
    console.log('✅ Activity saved to database');

    // Emit to frontend
    const emitData = {
      timestamp: new Date(),
      context: result.activity,
      actions: result.actions,
      productivityScore: result.productivityScore,
      isFocusedWork: result.isFocusedWork,
      focusMode: isFocusMode,
      screenshotPath: `/screenshots/${filename}`
    };
    console.log('📡 Emitting to frontend:', JSON.stringify(emitData, null, 2));
    io.emit('activityUpdate', emitData);

    // Check if user needs a nudge
    console.log(`🎯 Checking nudge conditions: FocusMode=${isFocusMode}, isFocusedWork=${result.isFocusedWork}, productivityScore=${result.productivityScore}`);
    if (isFocusMode && !result.isFocusedWork && result.productivityScore < 5) {
      const nudgeMessage = `Focus Alert! You seem to be ${result.activity.toLowerCase()}. Time to get back to work! 💪`;
      console.log('🚨 Sending nudge:', nudgeMessage);
      io.emit('nudge', {
        message: nudgeMessage,
        severity: 'warning'
      });
    } else {
      console.log('✅ No nudge needed');
    }

    console.log('🎉 Analysis complete successfully');
    return result;

  } catch (error) {
    console.error('❌ Error in capture and analyze:', error.message);
    console.error('📋 Full error details:', error);
    console.error('🔍 Error stack:', error.stack);
    
    // Fallback analysis without image
    const fallbackResult = {
      activity: "Unable to analyze - using fallback",
      actions: ["Screenshot capture failed"],
      productivityScore: 5,
      isFocusedWork: false
    };

    console.log('🆘 Using fallback result:', JSON.stringify(fallbackResult, null, 2));
    io.emit('activityUpdate', fallbackResult);
    return fallbackResult;
  } finally {
    // Always reset the processing flag
    isProcessing = false;
    console.log('✅ Analysis cycle completed, ready for next iteration');
  }
}

// Start/Stop monitoring functions
function startMonitoring() {
  if (isMonitoring) return;
  
  isMonitoring = true;
  monitoringInterval = setInterval(captureAndAnalyze, 25000); // Every 30 seconds
  console.log('Monitoring started - capturing every 60 seconds');
  
  // Initial capture
  captureAndAnalyze();
}

function stopMonitoring() {
  if (!isMonitoring) return;
  
  isMonitoring = false;
  clearInterval(monitoringInterval);
  console.log('Monitoring stopped');
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('toggleFocus', (data) => {
    isFocusMode = data.enabled;
    console.log('Focus mode:', isFocusMode ? 'ON' : 'OFF');
    
    socket.emit('focusToggled', { enabled: isFocusMode });
    io.emit('focusModeUpdate', { enabled: isFocusMode });
  });

  socket.on('toggleMonitoring', (data) => {
    if (data.enabled) {
      startMonitoring();
    } else {
      stopMonitoring();
    }
    
    socket.emit('monitoringToggled', { enabled: isMonitoring });
  });

  // Task management events
  socket.on('addTask', async (data) => {
    try {
      const task = new Task({
        text: data.text,
        completed: false
      });
      await task.save();
      
      io.emit('taskAdded', {
        id: task._id,
        text: task.text,
        completed: task.completed,
        createdAt: task.createdAt
      });
    } catch (error) {
      console.error('Error adding task:', error);
    }
  });

  socket.on('toggleTask', async (data) => {
    try {
      const task = await Task.findById(data.taskId);
      if (task) {
        task.completed = !task.completed;
        if (task.completed) {
          task.completedAt = new Date();
        } else {
          task.completedAt = null;
        }
        await task.save();
        
        io.emit('taskToggled', {
          id: task._id,
          completed: task.completed,
          completedAt: task.completedAt
        });
      }
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  });

  socket.on('deleteTask', async (data) => {
    try {
      await Task.findByIdAndDelete(data.taskId);
      io.emit('taskDeleted', { id: data.taskId });
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// API Routes
app.get('/api/activities', async (req, res) => {
  try {
    const activities = await Activity.find().sort({ timestamp: -1 }).limit(50);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayActivities = await Activity.find({
      timestamp: { $gte: today }
    });
    
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ completed: true });
    
    const avgProductivity = todayActivities.reduce((sum, act) => sum + act.productivityScore, 0) / todayActivities.length || 0;
    const focusTime = todayActivities.filter(act => act.focusMode).length * 1; // 60 seconds per activity
    
    res.json({
      totalActivities: todayActivities.length,
      averageProductivity: Math.round(avgProductivity * 10) / 10,
      focusTimeMinutes: Math.round(focusTime),
      focusMode: isFocusMode,
      isMonitoring: isMonitoring,
      totalTasks: totalTasks,
      completedTasks: completedTasks
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Screenshot management endpoints
app.get('/api/screenshots/stats', (req, res) => {
  try {
    const files = fs.readdirSync(screenshotsDir)
      .filter(file => file.startsWith('screenshot-') && file.endsWith('.png'));
    
    const totalSize = files.reduce((total, file) => {
      const stats = fs.statSync(path.join(screenshotsDir, file));
      return total + stats.size;
    }, 0);
    
    res.json({
      count: files.length,
      maxAllowed: MAX_SCREENSHOTS,
      totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100,
      directory: screenshotsDir
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/screenshots/cleanup', async (req, res) => {
  try {
    await cleanupOldScreenshots();
    res.json({ message: 'Screenshot cleanup completed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 CogniFlow server running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log('💡 Make sure Ollama is running with gemma2:2b model');
  console.log('🐳 Make sure MongoDB is running (docker run -d -p 27017:27017 mongo)');
});
