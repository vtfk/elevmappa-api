const getStudents = require('./get-students-tjommi')
const { logger } = require('@vtfk/logger')

module.exports = async userId => {
  try {
    logger('info', ['retrieve-students', userId])
    const data = await getStudents(userId)
    logger('info', ['retrieve-students', userId, 'got data', data.length])

    return !data.statusKode ? data : false
  } catch (error) {
    logger('error', ['retrieve-students', userId, error])
    return false
  }
}
