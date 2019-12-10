const p360 = require('@vtfk/p360')
const { unescape } = require('querystring')

const repackDocuments = require('./repack-documents')

async function getFiles (client, escapedDocumentNumber, recno) {
  const documentNumber = unescape(escapedDocumentNumber)
  const documentService = await client.DocumentService
  const documentQuery = {
    parameter: {
      DocumentNumber: documentNumber,
      IncludeFileData: true
    }
  }

  const { result: GetDocumentsResult } = await documentService.GetDocuments(documentQuery)

  if (!GetDocumentsResult || !GetDocumentsResult.Successful) {
    throw Error('Unknown error - query failed')
  }

  const documents = GetDocumentsResult.Documents ? GetDocumentsResult.Documents : []
  const file = Array.isArray(documents.Files)
    ? documents.Files.find(file => file.Recno === parseInt(recno))
    : documents.Files

  return { file: file.Base64Data }
}

async function getDocuments (client, fnr) {
  const caseService = await client.CaseService
  const documentService = await client.DocumentService

  // CaseService
  const caseQuery = {
    parameter: {
      Title: 'Elevmappe',
      ContactReferenceNumber: fnr
    }
  }
  const { result: GetCasesResult } = await caseService.GetCases(caseQuery)

  if (!GetCasesResult || !GetCasesResult.Successful) {
    throw Error('Unknown error - query failed')
  }

  const cases = GetCasesResult.Cases ? GetCasesResult.Cases : {}

  const { CaseNumber } = Array.isArray(cases)
    ? cases.find(caseItem => caseItem.Status === 'Under behandling')
    : cases

  if (!CaseNumber) {
    return []
  }

  // DocumentService
  const documentQuery = {
    parameter: {
      CaseNumber
    }
  }

  const { result: GetDocumentsResult } = await documentService.GetDocuments(documentQuery)

  if (!GetDocumentsResult || !GetDocumentsResult.Successful) {
    throw Error('Unknown error - query failed')
  }

  const documents = GetDocumentsResult.Documents ? GetDocumentsResult.Documents : []

  // Show only documents that has StatusCode J, E, or F
  const acceptedStatusCodes = ['J', 'E', 'F']
  const filterDocuments = documents.filter(item => acceptedStatusCodes.includes(item.StatusCode))

  const repackedDocuments = filterDocuments.map(documentItem => repackDocuments(documentItem, documentItem.Contacts, Array.isArray(documentItem.Files) ? documentItem.Files : [documentItem.Files]))

  return { caseNumber: CaseNumber, documents: repackedDocuments }
}

module.exports = options => {
  const client = p360(options)

  return {
    getDocuments: (fnr) => getDocuments(client, fnr),
    getFiles: (documentId, recno) => getFiles(client, documentId, recno)
  }
}
