const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()
const cookieParser = require('cookie-parser')
const path = require('path')
const uploadRoute = require('./routes/uploads')
const questionRoutes = require('./routes/questions')
const authRoutes = require('./routes/auth')
const resourceRoutes = require('./routes/resources')

const app = express()
const PORT = process.env.PORT || 5001

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials:true
  }
));
  
  app.use(cookieParser())
  
  app.use(express.json())
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Route mounting
app.use('/api/questions', questionRoutes)
app.use('/api/resources/videos/upload', uploadRoute)
app.use('/api/resources', resourceRoutes)
app.use('/api/auth', authRoutes)



mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err))


app.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}`)
})