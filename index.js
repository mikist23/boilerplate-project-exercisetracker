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




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
