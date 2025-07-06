
import path from 'path'
import { fileURLToPath } from 'url'
import cookieParser  from 'cookie-parser'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
import express       from 'express'
import cors          from 'cors'
import mongoose from 'mongoose'
import authRoutes    from './routes/auth.js'
import resourceRoutes from './routes/resources.js'
import questionRoutes from './routes/questions.js'
import dontenv from 'dotenv'

dontenv.config()



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
app.use('/api/resources', resourceRoutes)
app.use('/api/auth', authRoutes)


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
  console.log(`server running on http://localhost:${PORT}`)
})