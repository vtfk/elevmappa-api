const getTjommiData = require('./get-tjommi-data')
const { logger } = require('@vtfk/logger')

const getTeacherStudents = async userId => {
  try {
    logger('info', ['getTeacherStudents', userId])
    const data = await getTjommiData(userId, 'students?name=*')
    logger('info', ['getTeacherStudents', userId, 'got data', data.length])
    return !data.statusKode ? data : false
  } catch (error) {
    logger('error', ['getTeacherStudents', userId, error])
    return false
  }
}

const getSchoolStudents = async (userId, groups) => {
  try {
    logger('info', ['getSchoolStudents', userId, 'by group access', groups])
    const students = []
    for (const group of groups) {
      const shortName = group.split('-')[0]
      const data = await getTjommiData(userId, `schools/${shortName}/students`)
      if (!data.statusKode) {
        students.push(...data)
      }
    }
    logger('info', ['getSchoolStudents', userId, 'by group access', 'got data', students.length])
    return students.length > 0 ? students : false
  } catch (error) {
    logger('error', ['getSchoolStudents', userId, 'by group access', error])
    return false
  }
}

module.exports = {
  getTeacherStudents,
  getSchoolStudents
}
