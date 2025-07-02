const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()
const cookieParser = require('cookie-parser')

const authRoutes = require('./routes/auth')

const app = express()
const PORT = process.env.PORT || 5001


app.use(cookieParser())

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