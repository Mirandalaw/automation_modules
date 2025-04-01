import app from './index';

const port = Number(process.env.SERVICE_PORT) || 3000;
app.listen(port, '0.0.0.0',() => {
  console.log(`Auth service running at http://localhost:${port}`);
});