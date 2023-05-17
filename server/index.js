import open from 'open';

import getExpressServer from './express-server.js';

async function createServer() {

  const httpServer = await getExpressServer();

  if (process.argv.includes('--open') || process.argv.includes('-o')) {
    await open(`http://localhost:${httpServer.address().port}`);
  }
}
createServer();
