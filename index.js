const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }).then(()=>{
  console.log("Conected to database")
}).catch((err)=>{
  console.log(err)
});
const { Schema } = mongoose;


// User schema
const userSchema = new Schema({
  username: String
});

// Exercise schema
const exerciseSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  description: String,
  duration: Number,
  date: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Exercise = mongoose.model('Exercise', exerciseSchema)

// Create a New User
app.post('/api/users', async (req, res) => {
  try {
    const { username } = req.body;
    const user = new User({ username });
    await user.save();
    res.json({ username: user.username, _id: user._id });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get List of All Users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, 'username _id');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


// Log Exercise for a User
app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    const { description, duration, date } = req.body;
    const userId = req.params._id;
    const exercise = new Exercise({ userId, description, duration, date });
    await exercise.save();
    res.json({ 
      username: exercise.username,
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString(),
      _id: exercise._id 
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


// Retrieve Full Exercise Log of a User
app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const userId = req.params._id;
    let { from, to, limit } = req.query;

    const query = { userId };

    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    let exercises = await Exercise.find(query).limit(parseInt(limit));

    res.json({
      _id: userId,
      count: exercises.length,
      log: exercises.map(exercise => ({
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date.toDateString()
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Log Exercise for a User
app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    const { description, duration, date } = req.body;
    const userId = req.params._id;
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create new exercise
    const exercise = new Exercise({ userId, description, duration, date });
    await exercise.save();

    // Update user's exercise log
    user.exercises.push(exercise._id);
    await user.save();

    res.json({ 
      username: user.username,
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString(),
      _id: exercise._id 
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
