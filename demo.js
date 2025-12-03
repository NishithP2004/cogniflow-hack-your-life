// Demo script to simulate CogniFlow in action
const mongoose = require('mongoose');
const Activity = require('./models/Activity'); // We'll create this

// Sample activities for demo
const demoActivities = [
  {
    context: "Coding in VS Code - working on JavaScript functions",
    actions: ["typing code", "opening files", "debugging", "reading documentation"],
    productivityScore: 9,
    focusMode: true
  },
  {
    context: "Watching YouTube videos - entertainment content",
    actions: ["scrolling through videos", "clicking play", "pausing video", "checking comments"],
    productivityScore: 2,
    focusMode: true
  },
  {
    context: "Reading documentation - studying React components",
    actions: ["scrolling documentation", "highlighting text", "taking notes", "bookmarking pages"],
    productivityScore: 8,
    focusMode: true
  },
  {
    context: "Social media browsing - checking Twitter/X",
    actions: ["scrolling timeline", "liking posts", "reading tweets", "opening links"],
    productivityScore: 1,
    focusMode: true
  },
  {
    context: "Working on project - writing unit tests",
    actions: ["writing test cases", "running tests", "fixing bugs", "committing code"],
    productivityScore: 10,
    focusMode: true
  }
];

async function runDemo() {
  console.log('🧠 CogniFlow Demo Starting...');
  
  // Connect to MongoDB
  try {
    await mongoose.connect('mongodb://localhost:27017/cogniflow');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.log('❌ MongoDB connection failed:', error.message);
    console.log('💡 Make sure MongoDB is running: docker run -d -p 27017:27017 mongo');
    return;
  }

  // Clear existing activities
  await Activity.deleteMany({});
  console.log('🗑️ Cleared existing activities');

  // Simulate activities over time
  for (let i = 0; i < demoActivities.length; i++) {
    const activity = demoActivities[i];
    const activityRecord = new Activity(activity);
    await activityRecord.save();
    
    console.log(`📊 Activity ${i + 1}: ${activity.context}`);
    console.log(`   Productivity: ${activity.productivityScore}/10`);
    console.log(`   Actions: ${activity.actions.join(', ')}`);
    
    if (activity.productivityScore < 5 && activity.focusMode) {
      console.log('🚨 NUDGE: Focus alert! You seem to be off-task.');
    }
    
    console.log('---');
    
    // Wait 2 seconds between activities
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Show final stats
  const totalActivities = await Activity.countDocuments();
  const avgProductivity = await Activity.aggregate([
    { $group: { _id: null, avg: { $avg: "$productivityScore" } } }
  ]);
  
  console.log('\n📈 Demo Complete!');
  console.log(`Total Activities: ${totalActivities}`);
  console.log(`Average Productivity: ${avgProductivity[0]?.avg?.toFixed(1) || 0}/10`);
  console.log('\n🚀 Start the server with: npm start');
  console.log('📊 View dashboard at: http://localhost:3000');
  
  await mongoose.disconnect();
}

// Run demo if called directly
if (require.main === module) {
  runDemo().catch(console.error);
}

module.exports = { runDemo };
