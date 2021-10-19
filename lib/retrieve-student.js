const retrieveDocuments = require('./retrieve-documents')
const getTjommiData = require('./get-tjommi-data')
const { logger } = require('@vtfk/logger')

const getTeacherStudent = async (userId, studentUsername) => {
  logger('info', ['getTeacherStudent', userId, studentUsername, 'lookup students'])

  try {
    const students = await getTjommiData(userId, `students/${studentUsername}`)

    if (students.length > 0) {
      logger('info', ['getTeacherStudent', userId, studentUsername, 'got students', students.length])
      const student = students[0]
      const documents = await getStudentDocuments(student.personalIdNumber, userId, studentUsername)
      student.documents = documents
      return student
    } else {
      logger('warn', ['getTeacherStudent', userId, studentUsername, 'no students found'])
      return false
    }
  } catch (error) {
    logger('error', ['getTeacherStudent', userId, studentUsername, error])
    return false
  }
}

const getSchoolStudent = async (userId, studentUsername, students) => {
  logger('info', ['getSchoolStudent', userId, studentUsername, 'find student', students.length])

  const student = students.find(student => student.userName === studentUsername)
  if (!student) {
    logger('warn', ['getSchoolStudent', userId, studentUsername, 'no student found'])
    return false
  }

  const documents = await getStudentDocuments(student.personalIdNumber, userId, studentUsername)
  student.documents = documents
  return student
}

const getStudentDocuments = async (personalIdNumber, userId, studentUsername) => {
  try {
    logger('info', ['getStudentDocuments', userId, studentUsername, 'lookup documents'])
    const documents = await retrieveDocuments(personalIdNumber, userId, studentUsername)
    logger('info', ['getStudentDocuments', userId, studentUsername, 'got documents', documents.length])
    return documents
  } catch (error) {
    logger('error', ['getStudentDocuments', userId, studentUsername, error])
    return []
  }
}

module.exports = {
  getTeacherStudent,
  getSchoolStudent
}
