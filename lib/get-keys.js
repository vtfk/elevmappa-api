const axios = require('axios')
const { logger } = require('@vtfk/logger')
const NodeCache = require('node-cache')
const cache = new NodeCache({ stdTTL: 900 })
const config = require('../config')
const cacheKey = 'jwks_keys'

const autodiscoverUrl = 'https://login.microsoftonline.com/' + config.auth.tenantId + '/.well-known/openid-configuration'

module.exports = async () => {
  const keys = cache.get(cacheKey)
  if (keys) {
    logger('info', ['get-keys', 'return-keys-from-cache', 'length', keys.length])
    return keys
  }

  try {
    logger('info', ['get-keys', 'start', autodiscoverUrl])
    const { data: metadata } = await axios.get(autodiscoverUrl)
    logger('info', ['get-keys', 'got metadata', autodiscoverUrl])

    logger('info', ['get-keys', 'request keys', metadata.jwks_uri])
    const { data: { keys: keyData } } = await axios.get(metadata.jwks_uri)
    logger('info', ['get-keys', 'got keys', metadata.jwks_uri, 'length', keyData.length])

    cache.set(cacheKey, keyData)
    return keyData
  } catch (error) {
    logger('error', error)
    throw error
  }
}
