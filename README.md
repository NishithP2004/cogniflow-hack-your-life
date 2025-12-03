# 🧠 CogniFlow - AI-Powered Productivity Monitor

CogniFlow is an intelligent productivity monitoring system that uses AI to analyze your screen activity and provide smart nudges to keep you focused on your tasks.

## 🚀 Features

- **Real-time Screen Monitoring**: Captures screenshots every 30 seconds
- **AI-Powered Analysis**: Uses Ollama with Gemma 3B model to analyze activity
- **Smart Focus Mode**: Detects when you're off-task and provides gentle nudges
- **MongoDB Logging**: Stores all activity data for analysis
- **Real-time Dashboard**: Beautiful web interface with Socket.IO
- **Productivity Scoring**: AI rates your productivity from 1-10
- **Activity Feed**: Live feed of detected activities

## 🛠️ Tech Stack

- **Backend**: Node.js, Express
- **AI Model**: Ollama with Gemma 3B (locally hosted)
- **Database**: MongoDB
- **Real-time Communication**: Socket.IO
- **Frontend**: HTML5, CSS3, JavaScript
- **Screenshots**: screenshot-desktop package

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **Ollama** with Gemma 3B model
3. **MongoDB** (via Docker or local installation)

## 🔧 Installation & Setup

### Option 1: Docker Setup (Recommended)

1. **Clone and setup**:
   ```bash
   git clone <your-repo>
   cd CogniFlow
   npm install
   ```

2. **Start MongoDB with Docker**:
   ```bash
   docker run -d -p 27017:27017 --name cogniflow-mongodb mongo:latest
   ```

3. **Install and setup Ollama**:
   ```bash
   # Install Ollama (visit https://ollama.ai for installation)
   ollama pull gemma2:2b
   ```

4. **Start the application**:
   ```bash
   npm start
   ```

### Option 2: Full Docker Compose

```bash
docker-compose up -d
```

## 🎯 Usage

1. **Open your browser** and go to `http://localhost:3000`

2. **Start Monitoring**: Click "Start Monitoring" to begin capturing screenshots

3. **Enable Focus Mode**: Toggle focus mode to receive productivity nudges

4. **View Dashboard**: Monitor your productivity stats and activity feed

## 📊 API Endpoints

- `GET /api/activities` - Get recent activity logs
- `GET /api/stats` - Get today's productivity statistics
- `GET /` - Serve the web dashboard

## 🔌 Socket.IO Events

### Client → Server
- `toggleMonitoring` - Start/stop screen monitoring
- `toggleFocus` - Enable/disable focus mode

### Server → Client
- `activityUpdate` - New activity detected
- `nudge` - Productivity alert/nudge
- `monitoringToggled` - Monitoring status changed
- `focusToggled` - Focus mode status changed

## 📱 Dashboard Features

- **Real-time Activity Feed**: See what you're doing every 30 seconds
- **Productivity Scoring**: AI rates your focus from 1-10
- **Focus Mode Toggle**: Enable smart nudges
- **Statistics**: Daily productivity metrics
- **Visual Indicators**: Status lights and progress bars

## 🎨 Customization

The system is designed to be easily customizable:

- **Analysis Prompts**: Modify the AI analysis prompt in `index.js`
- **Screenshot Interval**: Change the 30-second interval
- **Nudge Thresholds**: Adjust when nudges are triggered
- **UI Styling**: Customize the dashboard in `public/index.html`

## 🚨 Important Notes

- **Privacy**: All screenshots are processed locally with Ollama
- **Performance**: Gemma 3B model runs locally, requires adequate RAM
- **Permissions**: May require screen recording permissions on macOS
- **Network**: Make sure Ollama is accessible on localhost

## 🔮 Future Enhancements

- Digital Twin fine-tuning with user data
- Weekly productivity reports
- Multi-language support
- Advanced analytics and insights
- Integration with calendar and task management tools

## 📄 License

MIT License - feel free to use and modify for your projects!

---

**Built for hackathon submission** - A complete AI-powered productivity monitoring solution in under 1 hour! 🏆
