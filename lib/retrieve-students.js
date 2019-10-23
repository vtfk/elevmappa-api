const getTjommiData = require('./get-tjommi-data')
const { logger } = require('@vtfk/logger')

module.exports = async userId => {
  try {
    logger('info', ['retrieve-students', userId])
    const data = await getTjommiData(userId, '/students?name=*')
    logger('info', ['retrieve-students', userId, 'got data', data.length])

    return !data.statusKode ? data : false
  } catch (error) {
    logger('error', ['retrieve-students', userId, error])
    return false
  }
}
