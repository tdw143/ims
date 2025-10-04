// 声明CSS模块类型
declare module '*.css' {
  const classes: { [key: string]: string };
  export default classes;
}

// 可选：声明其他静态资源类型（如图片、字体等）
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';
declare module '*.woff';
declare module '*.woff2';
