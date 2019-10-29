const { logger } = require('@vtfk/logger')
const p360 = require('./p360')
const config = require('../config')

module.exports = async (fnr, userId, studentUsername) => {
  logger('info', ['retrieve-documents', userId, studentUsername, 'start'])

  // Loop and gather documents from all P360 environments
  const documentList = []
  await Promise.all(config.P360.map(async (source) => {
    logger('info', ['retrieve-documents', userId, studentUsername, source.name])

    try {
      const client = p360(source)
      const documents = await client.getDocuments(fnr)
      logger('info', ['retrieve-documents', userId, studentUsername, source.name, 'documents', documents.documents.length])

      // Append source system to the document
      documents.documents.forEach(doc => {
        documentList.push({ source: source.name, ...doc })
      })
    } catch (error) {
      logger('error', ['retrieve-documents', userId, studentUsername, source.name, error])
    }
  }))

  if (documentList && documentList.length === 0) {
    logger('warn', ['retrieve-documents', userId, studentUsername, 'documents', documentList.length])
  } else {
    logger('info', ['retrieve-documents', userId, studentUsername, 'documents', documentList.length])
  }

  return documentList
}
