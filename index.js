const Router = require('router')
const finalhandler = require('finalhandler')
const cors = require('cors')
const bodyParser = require('body-parser')

const whitelist = ['/', '/favicon.ico']
const auth = require('./lib/token-auth')(whitelist)
// Utilities
const handler = require('./lib/handler')

// Initialize a new router
const router = Router()

// CORS
router.use(cors())

// AUTH
router.use(auth)

// JSON input
router.use(bodyParser.json())

// ROUTES
router.get('/', handler.getFrontpage)
router.get('/favicon.ico', handler.getFavicon)
router.get('/api/students/:id', handler.getStudent)
router.get('/api/students', handler.getStudents)
router.post('/api/files', handler.getFile)

module.exports = (request, response) => {
  router(request, response, finalhandler(request, response))
}
