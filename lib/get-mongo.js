const { MongoClient } = require('mongodb')
const { logger } = require('@vtfk/logger')
const { MONGODB_CONNECTION, MONGODB_COLLECTION, MONGODB_NAME } = require('../config')

let client = null

module.exports = () => {
  if (!MONGODB_CONNECTION) {
    logger('error', ['get-mongo', 'missing MONGODB_CONNECTION'])
    throw new Error('Missing MONGODB_CONNECTION')
  }

  if (client && !client.isConnected) {
    client = null
    logger('warn', ['get-mongo', 'mongo connection lost', 'client discarded'])
  }

  if (client === null) {
    client = new MongoClient(MONGODB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true })
  } else if (client.isConnected) {
    try {
      return client.db(MONGODB_NAME).collection(MONGODB_COLLECTION)
    } catch (error) {
      logger('error', ['get-mongo', 'client was connected but failed', 'new client created', error])
      client = new MongoClient(MONGODB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true })
    }
  }

  return new Promise((resolve, reject) => {
    client.connect(error => {
      if (error) {
        client = null
        logger('error', ['get-mongo', 'client connect error', error])
        return reject(error)
      }

      return resolve(client.db(MONGODB_NAME).collection(MONGODB_COLLECTION))
    })
  })
}
