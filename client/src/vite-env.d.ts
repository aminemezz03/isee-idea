/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Used at Netlify build time to configure API proxy in dist/_redirects */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
