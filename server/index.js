require('dotenv').config({ path: '/etc/app.env', quiet: true })
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

// API routes ONLY
app.use('/api', router)

// Error handler for API routes ONLY
app.use('/api', errorHandler)

// --- Serve React frontend ---
const frontendPath = path.resolve(__dirname, 'public')
app.use(express.static(frontendPath))

// Fallback for React Router - serves HTML for any non-API route
app.get('*', (req, res) => {
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