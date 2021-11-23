const mongo = require('./get-mongo')
const { DEMO, DEMO_SKIP_DB } = require('../config')

module.exports = async (teacher, student, route, message, accessType) => {
  if (DEMO && DEMO_SKIP_DB) return `disabled (${accessType})`

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
