const p360 = require('./p360')
const config = require('../config')

module.exports = async (source, documentId, recno) => {
  const sourceConfig = config.P360.find(({ name }) => name === source)
  if (!sourceConfig) throw Error(`No config found for environment '${source}'`)

  const client = p360(sourceConfig)
  return client.getFiles(documentId, recno)
}
