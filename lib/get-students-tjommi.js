const axios = require('axios')
const { logger } = require('@vtfk/logger')
const generateToken = require('./generate-token')
const config = require('../config')

module.exports = async (userId, search) => {
  logger('info', ['retrieve-student', userId, search, 'start'])

  const settings = {
    secret: config.tjommi.jwtSecret,
    userId: userId
  }

  const url = `${config.tjommi.url}/students` + (search ? `/${search}` : '?name=*')
  const token = generateToken(settings)
  axios.defaults.headers.common.Authorization = token

  logger('info', ['retrieve-student', userId, url, 'lookup students'])
  const { data } = await axios(url)
  return data
}
