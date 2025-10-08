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
app.use('/api', router)

// --- Serve React frontend ---
const frontendPath = path.resolve(__dirname, 'public')
app.use(express.static(frontendPath))

// Fallback route for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'))
})

// Error handling, the last middleware
// As it is the last, we do not call next() inside it
app.use(errorHandler)

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