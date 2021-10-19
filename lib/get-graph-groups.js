const { logger } = require('@vtfk/logger')
const axios = require('axios')
const NodeCache = require('node-cache')
const { GRAPH: { URL }, ACCESS_GROUP_PREFIX, ACCESS_GROUP_POSTFIX } = require('../config')
const getGraphToken = require('./get-graph-token')

const cache = new NodeCache({ stdTTL: 900 })

module.exports = async username => {
  const cacheKey = `${username}_groups`
  const cachedGroups = cache.get(cacheKey)
  if (cachedGroups) {
    logger('info', ['get-graph-groups', 'from-cache', cachedGroups])
    return cachedGroups
  }

  const token = await getGraphToken()
  const options = {
    method: 'GET',
    headers: { Authorization: token },
    url: `${URL}/users/${username}/memberOf?$select=displayName`,
    params: {}
  }

  try {
    logger('info', ['get-graph-groups', 'start'])
    const { data } = await axios(options)
    const groups = data.value
    const filteredGroups = (groups && groups.filter(group => group['@odata.type'] === '#microsoft.graph.group' && group.displayName && group.displayName.includes(ACCESS_GROUP_POSTFIX))) || []
    const fixedGroups = filteredGroups.map(group => group.displayName.toUpperCase().replace(ACCESS_GROUP_PREFIX, ''))
    cache.set(cacheKey, fixedGroups)
    logger('info', ['get-graph-groups', 'finish', groups.length, fixedGroups.length])
    return fixedGroups
  } catch (error) {
    const { data } = error.response
    logger('error', ['get-graph-groups', 'error', data.error.message])
    throw new Error(data.error.message)
  }
}
