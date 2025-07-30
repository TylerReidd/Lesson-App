
import dotenv from 'dotenv'
dotenv.config()
import path from 'path'
import { fileURLToPath } from 'url'
import cookieParser  from 'cookie-parser'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
import express       from 'express'
import mongoose from 'mongoose'
import authRoutes    from './routes/auth.js'
import resourceRoutes from './routes/resources.js'
import questionRoutes from './routes/questions.js'
import uploadsRoutes from './routes/uploads.js'


const app = express()

const PORT = process.env.PORT || 5001

app.use((req,res,next) => {
  res.header('Access-Control-Allow-Origin', 'https://tylerreidd.github.io')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization')

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204)
  }
  next()
})

app.use(cookieParser())
app.use(express.json())

  
  // Route mounting
app.use('/uploads',      express.static(path.join(__dirname, 'uploads')))
app.use('/api/uploads', uploadsRoutes)
app.use('/api/questions', questionRoutes)
app.use('/api/resources', resourceRoutes)
app.use('/api/auth', authRoutes)

app.use((err, req,res,next) => {
  console.error(err);
  res.status(err.status || 500).json({message: err.message})
})

const uri = process.env.MONGO_URI;
if(!uri) {
  console.error('MONGO_URI not set')
  process.exit(1)
}
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err))


app.listen(PORT, () => {
  console.log(`server running on https://localhost:${PORT}`)
})