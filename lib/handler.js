const { join } = require('path')
const md = require('markdown-it')()
const { send } = require('micro')
const { readFileSync } = require('fs')
const NodeCache = require('node-cache')
const cache = new NodeCache({ stdTTL: 900 })
const { getSchoolStudents, getTeacherStudents } = require('./retrieve-students')
const { getSchoolStudent, getTeacherStudent } = require('./retrieve-student')
const retrieveFile = require('./retrieve-file')
const { logger } = require('@vtfk/logger')
const mongoLogger = require('./log-to-mongo')

const hasGroups = groups => Array.isArray(groups) && groups.length > 0

const getStudents = async (teacher, groups) => {
  return hasGroups(groups) ? await getSchoolStudents(teacher, groups) : await getTeacherStudents(teacher)
}

const getStudent = async (username, id, groups) => {
  const student = hasGroups(groups) ? await getSchoolStudent(username, id, cache.get(username)) : await getTeacherStudent(username, id)
  student.accessType = hasGroups(groups) ? 'groupAccess' : 'pifuAccess'
  return student
}

async function verifyStudentRelation (teacher, student, groups) {
  // Return teacher student relation from cache
  const cachedInfo = cache.get(teacher)
  if (cachedInfo) {
    logger('info', ['handler', 'verifyStudentRelation-from-cache', teacher, student])
    return cachedInfo.find(({ userName }) => userName === student)
  }

  // Return if not in cache
  const students = await getStudents(teacher, groups)
  cache.set(teacher, students)
  logger('info', ['handler', 'verifyStudentRelation', teacher, student])
  return students.find(({ userName }) => userName === student)
}

async function verifyDocumentRelation (teacherId, studentId, documentId, recno, groups) {
  // Get student documents from cache
  let student = cache.get(teacherId + studentId)
  if (!student) {
    // Not found in cache - get from tjommi and cache
    student = await getStudent(teacherId, studentId, groups)
    cache.set(teacherId + studentId, student)
  }

  const documentMatch = student.documents.find(doc => doc.docId === documentId)
  const fileMatch = documentMatch.files.find(file => file.recno === recno)
  return {
    documents: fileMatch,
    accessType: student.accessType
  }
}

module.exports.getStudents = async (request, response) => {
  const { username, groups } = request
  if (!username) {
    send(response, 500, 'Username not found')
    return
  }

  logger('info', ['handler', 'getStudents', username])

  // Return students from cache
  const cachedInfo = cache.get(username)
  if (cachedInfo) {
    logger('info', ['handler', 'getStudents-from-cache', username])
    send(response, 200, cachedInfo)
    return
  }

  // Return students if not in cache
  try {
    const students = await getStudents(username, groups)
    cache.set(username, students)
    send(response, 200, students || [])
  } catch (error) {
    send(response, 500, error.message)
  }
}

module.exports.getStudent = async (request, response) => {
  const { username, groups } = request
  const { id } = request.params

  if (!username) {
    send(response, 500, 'Username not found')
    return
  }

  // Return student from cache
  const cachedInfo = cache.get(username + id)
  if (cachedInfo) {
    logger('info', ['getStudent', username, id, `get ${cachedInfo.accessType} data`, 'from-cache'])
    send(response, 200, cachedInfo)
    return
  }

  // Return student if not in cache
  try {
    const checkRelation = await verifyStudentRelation(username, id, groups)
    if (!checkRelation) {
      throw Error('Ingen tilgang. Rådgiverrelasjon og Lærer/Elev-relasjon finnes ikke i Visma InSchool')
    }
  } catch (error) {
    logger('error', ['getStudent', username, id, error])
    send(response, 500, error.message)
  }

  const student = await getStudent(username, id, groups)
  logger('info', ['getStudent', username, id, `return ${student.accessType} data`, student])

  try {
    const result = await mongoLogger(username, id, 'getStudent', `${username} opened ${id}'s archive folder`, student.accessType)
    logger('info', ['getStudent', username, id, 'log to mongo', result.insertedCount || result])
  } catch (error) {
    logger('error', ['getStudent', username, id, 'log to mongo failed', error])
  }

  cache.set(username + id, student)
  send(response, student ? 200 : 404, student || { message: 'not found' })
}

module.exports.getFile = async (request, response) => {
  const { source, fileId: documentId, recno, studentId } = request.body
  const { username, groups } = request

  try {
    const checkRelation = await verifyStudentRelation(username, studentId, groups)
    if (!checkRelation) {
      send(response, 401, { message: `access to student '${studentId}' is denied` })
      throw Error('Ingen tilgang. Rådgiverrelasjon og Lærer/Elev-relasjon finnes ikke i Visma InSchool')
    }

    const { documents: checkDocumentRelation, accessType } = await verifyDocumentRelation(username, studentId, documentId, recno, groups)
    if (!checkDocumentRelation) {
      send(response, 401, { message: `access to document '${documentId}' is denied` })
      throw Error('Ingen tilgang. Dokument- eller filnummeret tilhører ikke denne eleven.')
    }

    try {
      const result = await mongoLogger(username, studentId, 'getFile', `${username} viewed file with ID ${documentId} and recno ${recno} from source ${source}!`, accessType)
      logger('info', ['getFile', username, studentId, 'log to mongo', result.insertedCount || result])
    } catch (error) {
      logger('error', ['getFile', username, studentId, 'log to mongo failed', error])
    }

    const file = await retrieveFile(source, documentId, recno)
    if (file && file.file) logger('info', ['getFile', username, studentId, `return ${accessType} data`, documentId, recno])
    else logger('warn', ['getFile', username, studentId, `${accessType} data - not found`, source, documentId, recno])
    send(response, file && file.file ? 200 : 404, file && file.file ? file : { message: 'not found' })
  } catch (error) {
    send(response, 500, error.message)
  }
}

module.exports.getFrontpage = async (request, response) => {
  const readmePath = join(__dirname, '/../README.md')
  const readme = readFileSync(readmePath, 'utf-8')
  send(response, 200, md.render(readme))
}

module.exports.getFavicon = async (request, response) => ''
