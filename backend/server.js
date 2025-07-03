const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()
const cookieParser = require('cookie-parser')


const questionRoutes = require('./routes/questions')

const authRoutes = require('./routes/auth')

const resourceRoutes = require('./routes/resources')


const app = express()
const PORT = process.env.PORT || 5001


app.use(cookieParser())
app.use('/api/questions', questionRoutes)
app.use('./api/resources', resourceRoutes)

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials:true}
  ))
app.use(express.json())

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err))

app.use('/api/auth', authRoutes)

app.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}`)
})