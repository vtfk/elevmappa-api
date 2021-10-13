const getTjommiData = require('./get-tjommi-data')
const { logger } = require('@vtfk/logger')

module.exports = async (userId, groups) => {
  try {
    if (!groups) {
      logger('info', ['retrieve-students', userId])
      const data = await getTjommiData(userId, 'students?name=*')
      logger('info', ['retrieve-students', userId, 'got data', data.length])

      return !data.statusKode ? data : false
    } else {
      logger('info', ['retrieve-students', userId, 'by group access', groups])
      const students = []
      for (const group of groups) {
        const shortName = group.split('-')[0]
        const data = await getTjommiData(userId, `schools/${shortName}/students`)
        if (!data.statusKode) {
          students.push(...data)
        }
      }
      logger('info', ['retrieve-students', userId, 'by group access', 'got data', students.length])
      return students.length > 0 ? students : false
    }
  } catch (error) {
    logger('error', ['retrieve-students', userId, error])
    return false
  }
}
