import app from './index';

const port = process.env.SERVICE_PORT || 3000;
app.listen(port, () => {
  console.log(`Auth service running at http://localhost:${port}`);
});