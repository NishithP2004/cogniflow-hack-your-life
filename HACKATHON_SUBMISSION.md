# 🏆 CogniFlow - Hackathon Submission

## 🎯 Project Overview

**CogniFlow** is an AI-powered productivity monitoring system that intelligently analyzes your screen activity and provides smart nudges to keep you focused on productive tasks.

## ⚡ Key Innovation

Unlike traditional focus apps that block entire applications, CogniFlow uses **AI vision analysis** to understand the *context* of your activity, allowing productive use of apps like YouTube (for tutorials) while still detecting when you're off-task.

## 🚀 Core Features Implemented

### 1. **Real-time Screen Analysis**
- Captures screenshots every 30 seconds
- Uses Ollama with Gemma 3B for local AI processing
- Analyzes activity context and productivity score

### 2. **Smart Focus Mode**
- Detects when you're off-task vs. productive
- Provides gentle nudges when productivity drops
- Context-aware (allows productive YouTube, blocks entertainment)

### 3. **Real-time Dashboard**
- Beautiful web interface with Socket.IO
- Live activity feed
- Productivity statistics and trends
- Visual status indicators

### 4. **Data Persistence**
- MongoDB storage for all activity logs
- Historical productivity tracking
- Ready for future ML training

## 🛠️ Technical Stack

- **Backend**: Node.js + Express
- **AI Model**: Ollama + Gemma 3B (local, private)
- **Database**: MongoDB
- **Real-time**: Socket.IO
- **Frontend**: Vanilla HTML/CSS/JS
- **Screenshots**: Cross-platform desktop capture

## 📊 Demo Capabilities

1. **Start/Stop Monitoring**: Toggle real-time screen analysis
2. **Focus Mode**: Enable smart productivity nudges
3. **Live Activity Feed**: See what you're doing every 30s
4. **Productivity Scoring**: AI rates your focus 1-10
5. **Smart Nudges**: Get alerted when off-task
6. **Statistics Dashboard**: Daily productivity metrics

## 🎮 How to Demo

### Quick Start (5 minutes):
```bash
# 1. Start MongoDB
docker run -d -p 27017:27017 mongo

# 2. Install Ollama & pull model
ollama pull gemma2:2b

# 3. Install & run CogniFlow
npm install
npm start

# 4. Open dashboard
# Visit: http://localhost:3000
```

### Demo Flow:
1. **Open dashboard** → See clean interface
2. **Start Monitoring** → Watch activity feed populate
3. **Enable Focus Mode** → Get nudges when off-task
4. **Browse different sites** → See AI analysis in real-time
5. **View statistics** → Check productivity trends

## 💡 Unique Value Propositions

### 1. **Context-Aware Blocking**
- Allows productive YouTube (tutorials)
- Blocks entertainment YouTube
- Smart detection vs. blanket blocking

### 2. **Privacy-First**
- All processing happens locally
- No cloud uploads
- Your data stays on your machine

### 3. **Real-time Intelligence**
- Immediate feedback
- Live productivity scoring
- Instant nudges when needed

### 4. **Future-Ready Architecture**
- Digital Twin foundation
- ML training data collection
- Extensible for advanced features

## 🚀 Future Roadmap

- **Digital Twin**: Fine-tune personal AI model
- **Weekly Reports**: Automated productivity insights
- **Voice Chat**: Natural language interaction
- **Advanced Analytics**: ML-powered insights
- **Multi-platform**: Mobile app integration

## 📈 Impact Potential

- **Students**: Better study focus and productivity
- **Remote Workers**: Enhanced work-from-home efficiency
- **Developers**: Reduced distraction during coding
- **General Users**: Improved digital wellness

## 🏗️ Architecture Highlights

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Screenshot    │───▶│   Ollama AI      │───▶│   MongoDB       │
│   Capture       │    │   Analysis       │    │   Storage       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Socket.IO     │    │   Smart Nudges   │    │   Dashboard     │
│   Real-time     │    │   & Alerts       │    │   Interface     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🎉 Submission Ready!

**CogniFlow** is a complete, working AI-powered productivity solution built in under 1 hour for this hackathon. It demonstrates:

✅ **Working AI Integration**  
✅ **Real-time Processing**  
✅ **Beautiful UI/UX**  
✅ **Smart Nudging System**  
✅ **Data Persistence**  
✅ **Production-Ready Code**  

**Ready to demo and deploy!** 🚀

---

*Built with ❤️ for the hackathon - demonstrating the power of AI in productivity enhancement*
