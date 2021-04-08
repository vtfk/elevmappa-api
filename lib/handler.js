const md = require('markdown-it')()
const { send } = require('micro')
const { readFileSync } = require('fs')
const NodeCache = require('node-cache')
const cache = new NodeCache({ stdTTL: 900 })
const retrieveStudents = require('./retrieve-students')
const retrieveStudent = require('./retrieve-student')
const retrieveFile = require('./retrieve-file')
const { logger } = require('@vtfk/logger')
const archeoLogger = require('./log-to-archeo')
const mongoLogger = require('./log-to-mongo')

async function verifyStudentTeacherRelation (teacher, student) {
  // Return teacher student relation from cache
  const cachedInfo = cache.get(teacher)
  if (cachedInfo) {
    logger('info', ['handler', 'validateStudentTeacherRelation-from-cache', teacher, student])
    return cachedInfo.find(({ userName }) => userName === student)
  }

  // Return if not in cache
  const students = await retrieveStudents(teacher)
  cache.set(teacher, students)
  logger('info', ['handler', 'validateStudentTeacherRelation', teacher, student])
  return students.find(({ userName }) => userName === student)
}

async function verifyDocumentRelation (teacherId, studentId, documentId, recno) {
  // Get student documents from cache
  let student = cache.get(teacherId + studentId)
  if (!student) {
    // Not found in cache - get from tjommi and cache
    student = await retrieveStudent(teacherId, studentId)
    cache.set(teacherId + studentId, student)
  }

  const documentMatch = student.documents.find(doc => doc.docId === documentId)
  const fileMatch = documentMatch.files.find(file => file.recno === recno)
  return fileMatch
}

module.exports.getStudents = async (request, response) => {
  const { username } = request
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
    const students = await retrieveStudents(username)
    cache.set(username, students)
    send(response, 200, students || [])
  } catch (error) {
    send(response, 500, error.message)
  }
}

module.exports.getStudent = async (request, response) => {
  const { username } = request
  const { id } = request.params

  if (!username) {
    send(response, 500, 'Username not found')
    return
  }

  // Return student from cache
  const cachedInfo = cache.get(username + id)
  if (cachedInfo) {
    logger('info', ['getStudent', username, id, 'get tjommi data', 'from-cache', cachedInfo.length])
    send(response, 200, cachedInfo)
    return
  }

  // Return student if not in cache
  try {
    const checkRelation = await verifyStudentTeacherRelation(username, id)
    if (!checkRelation) {
      throw Error('Ingen tilgang. Lærer/Elev relasjon finnes ikke i Extens.')
    }

    const result = await archeoLogger(`${username}-${id}`, `${id}`, `${username} opened ${id}'s archive folder`, 'Success')
    logger('info', ['getStudent', username, id, 'log to archeo', result.status])
    try {
      const resultMongo = await mongoLogger(username, id, `${username} opened ${id}'s archive folder`)
      logger('info', ['getStudent', username, id, 'log to mongo', resultMongo.insertedCount])
    } catch (error) {
      logger('error', ['getStudent', username, id, 'log to mongo failed', error])
    }

    const student = await retrieveStudent(username, id)
    logger('info', ['getStudent', username, id, 'return tjommi data', student])

    cache.set(username + id, student)
    send(response, student ? 200 : 404, student || { message: 'not found' })
  } catch (error) {
    send(response, 500, error.message)
  }
}

module.exports.getFile = async (request, response) => {
  const { source, fileId: documentId, recno, studentId } = request.body
  const { username } = request

  try {
    const checkRelation = await verifyStudentTeacherRelation(username, studentId)
    if (!checkRelation) {
      send(response, 401, { message: `access to student '${studentId}' is denied` })
      throw Error('Ingen tilgang. Lærer/Elev relasjon finnes ikke i Extens.')
    }

    const checkDocumentRelation = await verifyDocumentRelation(username, studentId, documentId, recno)
    if (!checkDocumentRelation) {
      send(response, 401, { message: `access to document '${documentId}' is denied` })
      throw Error('Ingen tilgang. Dokument- eller filnummeret tilhører ikke denne eleven.')
    }

    const result = await archeoLogger(`${username}-${studentId}`, `${studentId}`, `${username} viewed file with ID ${documentId} and recno ${recno} from source ${source}.`, 'Success')
    logger('info', ['getFile', username, studentId, 'log to archeo', result.status])
    try {
      const resultMongo = await mongoLogger(username, studentId, `${username} viewed file with ID ${documentId} and recno ${recno} from source ${source}!`)
      logger('info', ['getFile', username, studentId, 'log to mongo', resultMongo.insertedCount])
    } catch (error) {
      logger('error', ['getStudent', username, studentId, 'log to mongo failed', error])
    }

    const file = await retrieveFile(source, documentId, recno)
    send(response, file ? 200 : 404, file || { message: 'not found' })
  } catch (error) {
    send(response, 500, error.message)
  }
}

module.exports.getFrontpage = async (request, response) => {
  const readme = readFileSync(`${__dirname}/../README.md`, 'utf-8')
  send(response, 200, md.render(readme))
}

module.exports.getFavicon = async (request, response) => ''
