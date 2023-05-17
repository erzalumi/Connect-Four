import express from 'express';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname is not available in ES modules natively, so we must define it
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Ensure that we serve the correct index.html path depending upon the environment/context
const indexPath = process.env.NODE_ENV === 'production'
  ? path.join(path.dirname(__dirname), 'dist', 'index.html')
  : path.join(path.dirname(__dirname), 'index.html');

// Transform page HTML using both EJS and Vite
async function transformHtml(vite, req, res, htmlPath, params) {
  res.render(htmlPath, params, async (err, html) => {
    if (err) {
      console.log(err);
      res.status(500);
      res.send('');
      return;
    }
    if (vite) {
      html = await vite.transformIndexHtml(req.originalUrl, html);
    }
    res.status(200);
    res.send(html);
  });
}

// Express server
async function createExpressServer() {

  const app = express();

  // Use EJS as view engine, regardless of file extension (i.e. we need
  // index.html instead of index.ejs so Vite can recognize entry point)
  app.set('view engine', 'html');
  app.engine('html', (await import('ejs')).renderFile);

  let vite = null;
  if (process.env.NODE_ENV !== 'production') {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    });
    app.use(vite.middlewares);
  }

  app.get(['/', '/index.html'], async (req, res) => {
    await transformHtml(vite, req, res, indexPath, {
      pageTitle: 'Grupi4'
    });
  });
  const server = http.Server(app);
  // Warning: app.listen(8080) will not work here; see
  // <https://github.com/socketio/socket.io/issues/2075>
  server.listen(8080, () => {
    console.log(`Server started. Listening on port ${server.address().port}`);
  });

  return server;
}

export default createExpressServer;
