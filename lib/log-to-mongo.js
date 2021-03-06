const mongo = require('./get-mongo')

module.exports = async (teacher, student, route, message) => {
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
