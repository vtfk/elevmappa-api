const SIF = require('./p360-SIF')
const RPC = require('./p360-RPC')

module.exports = options => {
  const client = options.type === 'SIF' ? SIF(options) : RPC(options)

  return {
    getDocuments: (fnr) => client.getDocuments(client, fnr),
    getFiles: (documentId, recno) => client.getFiles(client, documentId, recno)
  }
}
