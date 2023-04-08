require('dotenv').config();
const mongoose = require('mongoose');
const Challenge = require('./models/Challenge');

// Connect to the MongoDB database
const uri = process.env.MONGODB_URI || 'mongodb://localhost:5000/daily-challenges';
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

// Generate challenges
const challengeTitles = [
    'Do 100 squats',
    'Read 40 pages',
    'Drink 2 liters of water',
    'Take a 30-minute walk',
    'Write a letter to a friend',
    'Meditate for 20 minutes',
    'No sugar day',
    'Learn a new recipe',
    'Spend 30 minutes learning a new language',
    'Declutter your workspace',
    'Watch a documentary',
    'Practice yoga for 30 minutes',
    'Try a new exercise',
    'Call a family member',
    'Write a gratitude list',
    'Listen to a podcast',
    'Take a photo walk',
    'Perform a random act of kindness',
    'No social media day',
    'Plan a weekend getaway',
    'Draw or paint for 30 minutes',
    'Cook a healthy meal',
    'Write a short story',
    'Do a 10-minute stretch',
    'Set goals for the month',
    'Visit a local attraction',
    'Journal for 20 minutes',
    'Complete a puzzle',
    'Spend 30 minutes on a hobby',
    'Bake a treat',
  ];
  
  const challengeDescriptions = [
    'Complete 100 squats throughout the day.',
    'Choose a book and read 40 pages.',
    'Make sure you drink at least 2 liters of water today.',
    'Go outside and take a 30-minute walk.',
    'Write a thoughtful letter to a friend.',
    'Find a quiet space and meditate for 20 minutes.',
    'Avoid consuming any sugar for the whole day.',
    'Discover and learn a new recipe.',
    'Dedicate 30 minutes to learning a new language.',
    'Organize and declutter your workspace.',
    'Watch a documentary on a subject that interests you.',
    'Practice yoga for 30 minutes to improve flexibility and mindfulness.',
    'Try out a new exercise you have never done before.',
    'Call a family member and catch up on life.',
    'Write a list of things you are grateful for.',
    'Listen to a podcast on a topic that interests you.',
    'Take a walk with your camera and capture interesting moments.',
    'Perform a random act of kindness for a stranger.',
    'Avoid using social media for the entire day.',
    'Plan a weekend getaway to a nearby destination.',
    'Express your creativity by drawing or painting for 30 minutes.',
    'Cook a healthy and delicious meal.',
    'Write a short story on a topic of your choice.',
    'Take a 10-minute break to stretch your body.',
    'Set achievable goals for the upcoming month.',
    'Visit a local attraction or museum you have never been to.',
    'Spend 20 minutes journaling your thoughts and feelings.',
    'Complete a jigsaw puzzle or crossword puzzle.',
    'Spend 30 minutes working on a hobby or skill you enjoy.',
    'Bake a treat for yourself or someone else.',
  ];
  

const challenges = [];
const currentDate = new Date();
currentDate.setHours(0, 0, 0, 0);

for (let i = 0; i < 30; i++) {
  const challengeDate = new Date(currentDate.getTime() + i * 24 * 60 * 60 * 1000);
  const challengeIndex = i % challengeTitles.length;

  challenges.push({
    title: challengeTitles[challengeIndex],
    description: challengeDescriptions[challengeIndex],
    date: challengeDate,
  });
}

// Save challenges to the database
Challenge.insertMany(challenges)
  .then(() => {
    console.log('Challenges inserted successfully!');
    mongoose.connection.close();
  })
  .catch((error) => {
    console.error('Error inserting challenges:', error);
    mongoose.connection.close();
  });
