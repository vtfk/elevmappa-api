const axios = require('axios')
const { logger } = require('@vtfk/logger')
const generateToken = require('./generate-token')
const config = require('../config')

module.exports = async (userId, endpoint) => {
  logger('info', ['get-tjommi-data', userId, endpoint])

  const settings = {
    secret: config.tjommi.jwtSecret,
    userId: userId
  }

  const url = `${config.tjommi.url}/${endpoint}`
  const token = generateToken(settings)
  axios.defaults.headers.common.Authorization = token

  const { data } = await axios(url)
  return data
}
