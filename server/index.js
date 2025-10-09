require('dotenv').config({ path: process.env.NODE_ENV !== 'development' ? '/etc/app.env' : undefined, quiet: true })
const express = require('express')
const sequelize = require('./db')
const models = require('./models/models')
const cors = require('cors')
const fileupload = require('express-fileupload')
const router = require('./routes/index')
const errorHandler = require('./middleware/ErrorHandlingMiddleware')
const path = require('path')

const PORT = process.env.PORT || 5000

const app = express()
app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(fileupload({}))

// Serve static files FIRST (images, etc.) - before any other routes
app.use((req, res, next) => {
  if (req.path.match(/\.(jpg|jpeg|png|gif|svg|ico)$/)) {
    console.log('=== IMAGE REQUEST DEBUG ===')
    console.log('Request path:', req.path)
    console.log('__dirname:', __dirname)
    console.log('Static path:', path.resolve(__dirname, 'static'))
    
    const fs = require('fs')
    const staticDir = path.resolve(__dirname, 'static')
    console.log('Static directory exists:', fs.existsSync(staticDir))
    
    // The file Express will look for (removing leading slash)
    const fileName = req.path.substring(1)
    const fullPath = path.join(staticDir, fileName)
    console.log('Looking for file:', fullPath)
    console.log('File exists:', fs.existsSync(fullPath))
    console.log('=========================')
  }
  next()
})
app.use(express.static(path.resolve(__dirname, 'static')))

// API routes
app.use('/api', router)

// Error handler for API routes ONLY
app.use('/api', errorHandler)

// --- Serve React frontend ---
const frontendPath = path.resolve(__dirname, 'public')
app.use(express.static(frontendPath))

// React Router fallback - serve React app for non-API, non-static routes
app.use((req, res) => {
  // Don't serve React app for API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' })
  }
  
  // For React Router routes, serve the React app
  res.sendFile(path.join(frontendPath, 'index.html'))
})

const start = async () => {
  try {
    await sequelize.authenticate()
    await sequelize.sync()
  } catch (e) {
    console.error('Unable to connect to the database:', e)
  }
}

start()

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})