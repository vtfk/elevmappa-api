module.exports = {
  P360: [

    /**
     * Types:
     *  - RPC, requires token
     *  - SIF, requires username and password
    */
    {
      name: 'TFK',
      type: process.env.P360_TFK_TYPE || 'SIF',
      username: process.env.P360_TFK_WS_USERNAME || 'domain/username',
      password: process.env.P360_TFK_WS_PASSWORD || 'password',
      baseUrl: process.env.P360_TFK_WS_BASE_URL || 'http://p360server.domain.no:8088/SI.WS.Core/SIF/'
    },
    {
      name: 'VTFK Intern',
      type: process.env.P360_VTFKINT_TYPE || 'RPC',
      token: process.env.P360_VTFKINT_WS_TOKEN || 'token',
      baseUrl: process.env.P360_VTFKINT_WS_BASE_URL || 'https://p360server.domain.no/'
    },
    {
      name: 'VTFK Sikker',
      type: process.env.P360_VTFKSIK_TYPE || 'RPC',
      token: process.env.P360_VTFKSIK_WS_TOKEN || 'token',
      baseUrl: process.env.P360_VTFKSIK_WS_BASE_URL || 'https://p360server.domain.no/'
    }
  ],
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
  }
}
