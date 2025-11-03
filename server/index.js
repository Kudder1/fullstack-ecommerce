require('dotenv').config({ path: process.env.NODE_ENV !== 'development' ? '/etc/app.env' : undefined, quiet: true })
const express = require('express')
const sequelize = require('./db')
const cors = require('cors')
const fileupload = require('express-fileupload')
const router = require('./routes/index')
const errorHandler = require('./middleware/errorHandlingMiddleware')
const path = require('path')
const cookieParser = require('cookie-parser')
const { getUrl } = require('./utils')
const paymentWebhookController = require('./controllers/paymentWebhookController')

const PORT = process.env.PORT || 5000

const app = express()

app.post('/api/stripe-webhook', 
  express.raw({ type: 'application/json' }), 
  paymentWebhookController.stripeCheckoutResult
)

app.use(cors({ origin: getUrl(), credentials: true }))
app.use(express.json({ limit: '50mb' }))
app.use(cookieParser())
app.use(express.static(path.resolve(__dirname, 'static')))
app.use(fileupload({}))


app.post('/api/paypal-webhook', 
  express.raw({ type: 'application/json' }), 
  paymentWebhookController.paypalCheckoutResult
)
app.use('/api', router)

app.use('/api', errorHandler)

// --- Serve React frontend only in production ---
if (process.env.NODE_ENV !== 'development') {
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
}

const start = async () => {
  try {
    await sequelize.authenticate()
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true })
    }
  } catch (e) {
    console.error('Unable to connect to the database:', e)
  }
}

start()

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})