const { logger } = require('@vtfk/logger')
const axios = require('axios')
const { GRAPH: { URL } } = require('../config')
const getGraphToken = require('./get-graph-token')

module.exports = async username => {
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
    logger('info', ['get-graph-groups', 'finish', groups.length])
    return data.value
  } catch (error) {
    const { data } = error.response
    logger('error', ['get-graph-groups', 'error', data.error.message])
    throw new Error(data.error.message)
  }
}
