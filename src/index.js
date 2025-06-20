const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')

const { PORT } = require('./config/server.config')
const apiRouter = require('./routes')
const errorMw = require('./middlewares/error.middleware')
const connectDB = require('./config/db.config')

const app = express()

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL
  credentials: true
}))

app.use(express.json())
app.use(express.text())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))

app.get('/ping', (req, res) => {
  res.status(200).json({
    message: 'Pong'
  })
})

app.use('/api', apiRouter)

app.use(errorMw)

app.listen(PORT, async () => {
  console.log(`Express app connected to http://localhost:${PORT} ✅`)
  await connectDB()
})