const axios = require('axios')

module.exports = async (transactionId, transactionTag, message, status) => {
  const requestBody = {
    transactionId: transactionId,
    transactionTag: transactionTag,
    transactionType: process.env.ARCHEO_TRANSACTIONTYPE || 'Elevmappa',
    processed: new Date().toISOString(),
    description: message,
    status: status
  }

  const options = {
    method: 'POST',
    headers: {
      apikey: process.env.ARCHEO_TOKEN,
      'cache-control': 'no-cache',
      'content-type': 'application/json'
    },
    data: [requestBody],
    url: process.env.ARCHEO_URL
  }

  const { status: httpStatus } = await axios(options)
  return httpStatus === 200
}
