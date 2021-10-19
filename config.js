const getActiveSources = sources => sources.filter(({ enabled }) => enabled)

module.exports = {
  P360: getActiveSources([
    /**
     * Types:
     *  - RPC, requires token
     *  - SOAP, requires username and password
    */
    {
      name: 'TFK',
      enabled: process.env.P360_TFK_ENABLED || false,
      type: process.env.P360_TFK_TYPE || 'SOAP',
      token: process.env.P360_TFK_TOKEN || '',
      username: process.env.P360_TFK_WS_USERNAME || 'domain/username',
      password: process.env.P360_TFK_WS_PASSWORD || 'password',
      baseUrl: process.env.P360_TFK_WS_BASE_URL || 'http://p360server.domain.no:8088/SI.WS.Core/SIF/'
    },
    {
      name: 'VTFK',
      enabled: process.env.P360_VTFK_ENABLED || false,
      type: process.env.P360_VTFK_TYPE || 'SOAP',
      token: process.env.P360_VTFK_TOKEN || '',
      username: process.env.P360_VTFK_WS_USERNAME || 'domain/username',
      password: process.env.P360_VTFK_WS_PASSWORD || 'password',
      baseUrl: process.env.P360_VTFK_WS_BASE_URL || 'http://p360server.domain.no:8088/SI.WS.Core/SIF/'
    },
    {
      name: 'VTFK Intern',
      enabled: process.env.P360_VTFKINT_ENABLED || false,
      type: process.env.P360_VTFKINT_TYPE || 'SOAP',
      token: process.env.P360_VTFKINT_TOKEN || '',
      username: process.env.P360_VTFKINT_WS_USERNAME || 'domain/username',
      password: process.env.P360_VTFKINT_WS_PASSWORD || 'password',
      baseUrl: process.env.P360_VTFKINT_WS_BASE_URL || 'http://p360server.domain.no:8088/SI.WS.Core/SIF/'
    },
    {
      name: 'VTFK Sikker',
      enabled: process.env.P360_VTFKSIK_ENABLED || false,
      type: process.env.P360_VTFKSIK_TYPE || 'SOAP',
      token: process.env.P360_VTFKSIK_TOKEN || '',
      username: process.env.P360_VTFKSIK_WS_USERNAME || 'domain/username',
      password: process.env.P360_VTFKSIK_WS_PASSWORD || 'password',
      baseUrl: process.env.P360_VTFKSIK_WS_BASE_URL || 'http://p360server.domain.no:8088/SI.WS.Core/SIF/'
    }
  ]),
  tjommi: {
    url: process.env.TJOMMI_SERVICE_URL || 'url-tjommi',
    jwtSecret: process.env.TJOMMI_JWT_SECRET || 'jwt-secret-tjommi'
  },
  auth: {
    /*
     * Find your Tenant ID for Azure in https://login.windows.net/<your-tenant-name>/.well-known/openid-configuration
     * Example: 08f3813c-0f00-000f-9aec-16ef7cbf477a
    */
    tenantId: process.env.MOA_TENANT_ID || 'tenant-id',
    /*
     * Your App ID for the registered app at https://portal.azure.com -> Azure
     * Active Directory -> App registrations
    */
    appId: process.env.MOA_APP_ID || 'your-app-id'
  },
  MONGODB_COLLECTION: process.env.MONGODB_COLLECTION || 'elev',
  MONGODB_CONNECTION: process.env.MONGODB_CONNECTION || 'conn',
  MONGODB_NAME: process.env.MONGODB_NAME || 'elev',
  DEMO: (process.env.DEMO === 'true') || false,
  DEMO_USER: process.env.DEMO_USER || undefined,
  DEMO_ACCESS_GROUPS: (process.env.DEMO_ACCESS_GROUPS && process.env.DEMO_ACCESS_GROUPS.toUpperCase().split(',')) || [],
  ACCESS_GROUP_PREFIX: process.env.ACCESS_GROUP_PREFIX || 'MGR-OF',
  ACCESS_GROUP_POSTFIX: process.env.ACCESS_GROUP_POSTFIX || 'TILGANGELEVMAPPA',
  GRAPH: {
    AUTH: {
      URL: process.env.GRAPH_AUTH_URL || 'https://login.microsoftonline.com/vtfk.onmicrosoft.com/oauth2/v2.0/token',
      CLIENT_ID: process.env.GRAPH_CLIENT_ID,
      CLIENT_SECRET: process.env.GRAPH_CLIENT_SECRET,
      GRANT_TYPE: process.env.GRAPH_GRANT_TYPE || 'client_credentials',
      SCOPE: process.env.GRAPH_SCOPE || 'https://graph.microsoft.com/.default'
    },
    URL: process.env.GRAPH_API || 'https://graph.microsoft.com/v1.0'
  }
}
