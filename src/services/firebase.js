import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

// Configuración Firebase existente del proyecto
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAmIVNKvQWuiAih8F_HJZ9GivYQtk3UmEc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "monitor-iot-esp32.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://monitor-iot-esp32-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "monitor-iot-esp32",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "monitor-iot-esp32.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1068157465434",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1068157465434:web:1d7375144d8849d22e3963"
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)

// Inicializar Database
const database = getDatabase(app)

export { database }