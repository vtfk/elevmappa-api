const repackFiles = require('./repack-files')

module.exports = (documentItem, contacts, files) => {
  return {
    id: escape(documentItem.DocumentNumber),
    sortId: documentItem.DocumentNumber.match(/\d/g).join(''),
    docId: documentItem.DocumentNumber,
    title: documentItem.Title,
    files: files.map(file => repackFiles(documentItem, contacts, file))
  }
}
