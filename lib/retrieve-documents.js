const { logger } = require('@vtfk/logger')
const p360 = require('./p360')
const config = require('../config')

module.exports = async (fnr, userId, studentUsername) => {
  logger('info', ['retrieve-documents', userId, studentUsername, 'start'])

  // Loop and gather documents from all P360 environments
  const documentList = []
  await Promise.all(config.P360.map(async (source) => {
    logger('info', ['retrieve-documents', userId, studentUsername, source.name, source.type])

    try {
      const client = p360(source)
      const { documents } = await client.getDocuments(fnr)
      if (!documents) {
        logger('info', ['retrieve-documents', userId, studentUsername, source.name, source.type, 'no documents found'])
        return
      }

      logger('info', ['retrieve-documents', userId, studentUsername, source.name, source.type, 'documents', documents.length])

      // Append source system to the document
      documents.forEach(doc => {
        documentList.push({ source: source.name, ...doc })
      })
    } catch (error) {
      logger('error', ['retrieve-documents', userId, studentUsername, source.name, source.type, error])
    }
  }))

  if (documentList && documentList.length === 0) {
    logger('warn', ['retrieve-documents', userId, studentUsername, 'no documents found'])
  } else {
    logger('info', ['retrieve-documents', userId, studentUsername, 'documents', documentList.length])
  }

  return documentList
}
