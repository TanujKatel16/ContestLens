/// <reference types="vite/client" />

// Allow ?inline imports used for Shadow DOM style injection
declare module "*.css?inline" {
  const content: string;
  export default content;
}
