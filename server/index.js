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
app.use(express.static(path.resolve(__dirname, 'static')))
app.use(fileupload({}))

// API routes
app.use('/api', router)

// Error handler for API routes ONLY
app.use('/api', errorHandler)

// --- Serve React frontend with cache control ---
const frontendPath = path.resolve(__dirname, 'public')

// Serve static assets with long cache (hashed JS/CSS files)
app.use(express.static(frontendPath, {
  maxAge: '31536000000', // 1 year in milliseconds
  immutable: true,
  setHeaders: (res, filePath) => {
    // Don't cache HTML files
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
      res.setHeader('Pragma', 'no-cache')
      res.setHeader('Expires', '0')
    }
  }
}))

// Fallback for React Router - serve index.html with no-cache headers
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next()
  }

  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    return res.status(404).json({ error: 'File not found' })
  }

  // Serve index.html without caching
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
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