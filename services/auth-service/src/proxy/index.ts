import { createProxyMiddleware } from 'http-proxy-middleware';

export const createServiceProxy = (target: string) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (path, req) => {
      return path.replace(/^\/[^/]+/, ''); // /user/profile → /profile
    },
  });
