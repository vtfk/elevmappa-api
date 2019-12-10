const getContacts = require('./get-contacts')

module.exports = (documentItem, contacts, file) => {
  return {
    from: getContacts(contacts, 'Avsender') || '',
    to: getContacts(contacts, 'Mottaker') || '',
    date: new Date(documentItem.DocumentDate).toISOString().split('T')[0],
    category: file.CategoryDescription,
    title: file.Title,
    file: escape(documentItem.DocumentNumber),
    recno: file.Recno
  }
}
