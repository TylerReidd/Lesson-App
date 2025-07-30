
import dotenv from 'dotenv'
dotenv.config()
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
import uploadsRoutes from './routes/uploads.js'


const app = express()
app.use(cookieParser())
app.use(express.json())
const PORT = process.env.PORT || 5001

const corsOptions = {
  origin: 'http://tylerreidd.github.io', 
  credentials:true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', "OPTIONS"],
  allowedHeaders: ["Content-type, 'Authorization"]
}

app.use(cors({
  origin: 'http://tylerreidd.github.io', 
  credentials:true,
  }
));

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))
  
  
  // Route mounting
app.use('/uploads',      express.static(path.join(__dirname, 'uploads')))
app.use('/api/uploads', uploadsRoutes)
// app.post('/uploads/pdf', formData)
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
  console.log(`server running on http://localhost:${PORT}`)
})