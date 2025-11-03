const getUrl = () => {
  return process.env.NODE_ENV === 'development' ? process.env.DEV_DOMAIN : process.env.DOMAIN
}

let cachedAccessToken = null
let cachedTokenExpiry = 0
const generatePaypalAccessToken = async () => {
  if (cachedAccessToken && Date.now() < cachedTokenExpiry) {
    return cachedAccessToken
  }
  const response = await fetch(`${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
    }),
  })
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`PayPal token request failed: ${response.status} ${error}`)
  }
  const data = await response.json()
  cachedAccessToken = data.access_token
  cachedTokenExpiry = Date.now() + (data.expires_in - 60) * 1000 // expires_in ~600s
  return cachedAccessToken
}

module.exports = { getUrl, generatePaypalAccessToken }