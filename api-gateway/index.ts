// 용도 : API Gateway는 여러 개의 마이크로서비스를 클라이언트가 하나의 엔드포인트로 접근

import express from "express";
import {createProxyMiddleware} from "http-proxy-middleware";

const app = express();

app.use("/auth",createProxyMiddleware({target : "http://localhost:5001", changeOrigin : true}));
app.use("/users",createProxyMiddleware({target : "http://localhost:5002", changeOrigin : true}));
app.use("/chat",createProxyMiddleware({target : "http://localhost:5003", changeOrigin : true}));

app.listen(4000, () => {
    console.log('🚀 API Gateway running on http://localhost:4000');
});