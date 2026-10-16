process.env.NETLIFY = 'true';

import serverless from 'serverless-http';

// Load compiled Express application
// eslint-disable-next-line @typescript-eslint/no-var-requires
const appModule = require('../../backend/dist/app');
const app = appModule.default || appModule;

// Wrap Express with serverless-http and declare binary media types for Excel export/upload
const serverlessHandler = serverless(app, {
  binary: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/octet-stream',
    'multipart/form-data',
    'image/*'
  ]
});

export const handler = async (event: any, context: any) => {
  // Normalize URL path if Netlify function routing forwards `/.netlify/functions/api`
  if (event.path && event.path.startsWith('/.netlify/functions/api')) {
    event.path = event.path.replace(/^\/\.netlify\/functions\/api/, '/api');
  }
  if (event.rawUrl && event.rawUrl.includes('/.netlify/functions/api')) {
    event.rawUrl = event.rawUrl.replace(/\/\.netlify\/functions\/api/, '/api');
  }

  return serverlessHandler(event, context);
};
