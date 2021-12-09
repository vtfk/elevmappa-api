const p360 = require('@vtfk/p360')
const { unescape } = require('querystring')

const repackDocuments = require('./repack-documents')

async function getFiles (client, escapedDocumentNumber, recno) {
  const documentNumber = unescape(escapedDocumentNumber)
  const { DocumentService } = client

  const documentQuery = {
    parameter: {
      DocumentNumber: documentNumber,
      IncludeFileData: true
    }
  }

  const GetDocumentsResult = await DocumentService.GetDocuments(documentQuery)

  if (!GetDocumentsResult || !GetDocumentsResult.Successful) {
    throw Error('Unknown error - query failed')
  }

  const documents = GetDocumentsResult.Documents && Array.isArray(GetDocumentsResult.Documents) ? GetDocumentsResult.Documents.find(doc => doc.DocumentNumber === documentNumber) : GetDocumentsResult.Documents && !Array.isArray(GetDocumentsResult.Documents) ? GetDocumentsResult.Documents : []
  const file = Array.isArray(documents.Files)
    ? documents.Files.find(file => file.Recno === parseInt(recno))
    : documents.Files

  return { file: file.Base64Data }
}

async function getDocuments (client, fnr) {
  const { CaseService, DocumentService } = client

  // CaseService
  const caseQuery = {
    parameter: {
      Title: 'Elevmappe',
      ContactReferenceNumber: fnr
    }
  }

  const GetCasesResult = await CaseService.GetCases(caseQuery)

  if (!GetCasesResult || !GetCasesResult.Successful) {
    throw Error('Unknown error - query failed')
  }

  const cases = GetCasesResult.Cases && GetCasesResult.Cases.length > 0 ? GetCasesResult.Cases : {}

  const { CaseNumber } = Array.isArray(cases) ? (cases.find(caseItem => caseItem.Status === 'Under behandling') || {}) : cases

  if (!CaseNumber) {
    return []
  }

  // DocumentService
  const documentQuery = {
    parameter: {
      CaseNumber
    }
  }

  const GetDocumentsResult = await DocumentService.GetDocuments(documentQuery)

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
