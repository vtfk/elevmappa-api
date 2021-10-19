const { logger, logConfig } = require('@vtfk/logger')
const NodeCache = require('node-cache')
const validateToken = require('./validate-token')
const { DEMO, DEMO_USER, DEMO_ACCESS_GROUPS, ACCESS_GROUP_PREFIX, ACCESS_GROUP_POSTFIX } = require('../config')
const getGraphGroups = require('./get-graph-groups')

const cache = new NodeCache({ stdTTL: 900 })

const getGroups = async username => {
  const cacheKey = `${username}_groups`
  const cachedGroups = cache.get(cacheKey)
  if (cachedGroups) {
    logger('info', ['token-auth', 'getGroups-from-cache', cachedGroups])
    return cachedGroups
  }
  const groups = await getGraphGroups(username)
  const filteredGroups = (groups && groups.filter(group => group['@odata.type'] === '#microsoft.graph.group' && group.displayName && group.displayName.includes(ACCESS_GROUP_POSTFIX))) || []
  const fixedGroups = filteredGroups.map(group => group.displayName.toUpperCase().replace(ACCESS_GROUP_PREFIX, ''))
  cache.set(cacheKey, fixedGroups)
  return fixedGroups
}

module.exports = whitelist => {
  return async (request, response, next) => {
    const { pathname } = request._parsedUrl
    const whitelisted = Array.isArray(whitelist) && whitelist.indexOf(pathname) >= 0

    if (whitelisted) {
      return next()
    }

    if (DEMO) {
      logConfig({
        prefix: 'DEMO'
      })

      request.token = { preferred_username: DEMO_USER, DEMO }
      request.username = DEMO_USER
      request.groups = DEMO_ACCESS_GROUPS.length > 0 ? DEMO_ACCESS_GROUPS.map(group => group.replace(ACCESS_GROUP_PREFIX, '')) : await getGroups(request.username)
      logger('info', ['token-auth', 'username', request.username])
      logger('info', ['token-auth', 'groups', request.groups])
      next()
    } else {
      const bearerToken = request.headers.authorization

      if (!bearerToken) {
        logger('error', ['token-auth', 'missing Authorization header'])
        response.writeHead(401)
        response.end('missing Authorization header')
        return
      }

      try {
        const token = bearerToken.replace('Bearer ', '')
        const validatedToken = await validateToken(token)
        request.token = validatedToken
        request.username = validatedToken.preferred_username
        request.groups = await getGroups(request.username)
        logger('info', ['token-auth', 'username', request.username])
        logger('info', ['token-auth', 'groups', request.groups])
        logger('info', ['token-auth', 'validated token'])
      } catch (error) {
        logger('error', ['token-auth', 'invalid token', error.message])
        response.writeHead(401)
        response.end('invalid token in Authorization header')
        return
      }
      next()
    }
  }
}
