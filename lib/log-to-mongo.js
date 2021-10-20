const mongo = require('./get-mongo')
const { DEMO } = require('../config')

module.exports = async (teacher, student, route, message, accessType) => {
  if (DEMO) return `disabled (${accessType})`

  const data = {
    teacher,
    student,
    route,
    timestamp: new Date().getTime(),
    message,
    accessType
  }

  const db = await mongo()
  const result = await db.insertOne(data)
  return result
}
