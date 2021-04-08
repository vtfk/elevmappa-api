const mongo = require('./get-mongo')

module.exports = async (teacher, student, message) => {
  const data = {
    teacher,
    student,
    message
  }

  const db = await mongo()
  const result = await db.insertOne(data)
  return result
}
