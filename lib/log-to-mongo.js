const mongo = require('./get-mongo')
const { DEMO } = require('../config')

module.exports = async (teacher, student, route, message) => {
  if (DEMO) return 'disabled'

  const data = {
    teacher,
    student,
    route,
    timestamp: new Date().getTime(),
    message
  }

  const db = await mongo()
  const result = await db.insertOne(data)
  return result
}
