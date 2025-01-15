/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_REACT_APP_BACKEND_HOST: string
  readonly VITE_REACT_APP_FRONTEND_HOST: string
  readonly FIRE_BASE_CONFIG: FireBaseConfig
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface FireBaseConfig {
  readonly apiKey: string
  readonly authDomain: string
  readonly projectId: string
  readonly storageBucket: string
  readonly messagingSenderId: string
  readonly appId: string
  readonly measurementId: string
}
