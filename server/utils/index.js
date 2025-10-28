const getUrl = () => {
  return process.env.NODE_ENV === 'development' ? process.env.DEV_DOMAIN : process.env.DOMAIN
}

module.exports = { getUrl }