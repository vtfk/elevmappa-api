const retrieveDocuments = require('./retrieve-documents')
const getTjommiData = require('./get-tjommi-data')
const { logger } = require('@vtfk/logger')

module.exports = async (userId, studentUsername) => {
  logger('info', ['retrieve-student', userId, studentUsername, 'lookup students'])
  const students = await getTjommiData(userId, `/students/${studentUsername}`)

  if (students.length > 0) {
    logger('info', ['retrieve-student', userId, studentUsername, 'got students', students.length])
    const student = students[0]

    logger('info', ['retrieve-student', userId, studentUsername, 'lookup documents'])
    const { documents } = await retrieveDocuments(student.personalIdNumber, userId, studentUsername)
    logger('info', ['retrieve-student', userId, studentUsername, 'got documents', documents.length])

    student.documents = documents
    return student
  } else {
    logger('warn', ['retrieve-student', userId, studentUsername, 'no students found'])
    return false
  }
}
