const { logger } = require('@vtfk/logger')
const p360 = require('./p360')
const config = require('../config')

module.exports = async (fnr, userId, studentUsername) => {
  logger('info', ['retrieve-documents', userId, studentUsername, 'start'])

  const documents = []

  // Loop and gather documents from all P360 environments
  config.P360.forEach(source => {
    logger('info', ['retrieve-documents', userId, studentUsername, source.name])

    try {
      const client = p360(config)
      const documents = client.getDocuments(fnr)
      logger('info', ['retrieve-documents', userId, studentUsername, source.name, 'documents', documents.documents.length])

      // Append source system to the document
      documents.push(documents.documents.map(doc => ({ source: this.source.name, ...doc })))
    } catch (error) {
      logger('error', ['retrieve-documents', userId, studentUsername, source.name, error])
    }
  })

  if (documents && documents.length === 0) {
    logger('warn', ['retrieve-documents', userId, studentUsername, 'documents', documents.length])
  } else {
    logger('info', ['retrieve-documents', userId, studentUsername, 'documents', documents.length])
  }

  return documents
}
