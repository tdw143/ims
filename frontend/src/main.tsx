// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// 渲染根组件
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement // 类型断言（确保元素存在）
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);