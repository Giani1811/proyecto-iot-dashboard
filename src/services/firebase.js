import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

// Configuración Firebase existente del proyecto
const firebaseConfig = {
  apiKey: "AIzaSyAmIVNKvQWuiAih8F_HJZ9GivYQtk3UmEc",
  authDomain: "monitor-iot-esp32.firebaseapp.com",
  databaseURL: "https://monitor-iot-esp32-default-rtdb.firebaseio.com",
  projectId: "monitor-iot-esp32",
  storageBucket: "monitor-iot-esp32.firebasestorage.app",
  messagingSenderId: "1068157465434",
  appId: "1:1068157465434:web:1d7375144d8849d22e3963"
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)

// Inicializar Database
const database = getDatabase(app)

export { database }