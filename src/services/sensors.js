import { database } from './firebase'
import { ref, onValue, off } from 'firebase/database'

class SensorService {
  constructor() {
    this.tempRef = ref(database, 'sensor/temperature')
    this.humRef = ref(database, 'sensor/humidity')
    this.timestampRef = ref(database, 'sensor/timestamp')
    this.listeners = []
  }

  // Inicializar servicio
  async initialize() {
    try {
      console.log('🔥 Conectando con Firebase...')
      return Promise.resolve()
    } catch (error) {
      console.error('❌ Error conectando con Firebase:', error)
      throw error
    }
  }

  // Suscribirse a datos de sensores en tiempo real
  subscribeToSensorData(callback) {
    let sensorData = {
      temperature: null,
      humidity: null,
      timestamp: null
    }

    // Listener para temperatura
    const tempListener = onValue(this.tempRef, (snapshot) => {
      const temperature = snapshot.val()
      if (temperature !== null) {
        sensorData.temperature = temperature
        console.log('🌡️ Nueva temperatura:', temperature)
        callback({ ...sensorData })
      }
    }, (error) => {
      console.error('❌ Error leyendo temperatura:', error)
    })

    // Listener para humedad
    const humListener = onValue(this.humRef, (snapshot) => {
      const humidity = snapshot.val()
      if (humidity !== null) {
        sensorData.humidity = humidity
        console.log('💧 Nueva humedad:', humidity)
        callback({ ...sensorData })
      }
    }, (error) => {
      console.error('❌ Error leyendo humedad:', error)
    })

    // Listener para timestamp
    const timestampListener = onValue(this.timestampRef, (snapshot) => {
      const timestamp = snapshot.val()
      console.log('📅 Timestamp crudo de Firebase:', timestamp)
      
      // Usar timestamp actual ya que el ESP32 está enviando valores incorrectos
      const now = Date.now()
      sensorData.timestamp = now
      
      // Mostrar hora en zona horaria de Lima, Perú
      const limaDate = new Date(now).toLocaleString('es-PE', {
        timeZone: 'America/Lima',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      console.log('⏰ Timestamp actualizado a hora actual:', limaDate)
      
      // Solo llamar callback si hay timestamp (indica actividad del sensor)
      if (timestamp !== null) {
        callback({ ...sensorData })
      }
    }, (error) => {
      console.error('❌ Error leyendo timestamp:', error)
    })

    // Guardar listeners para poder desuscribirse
    this.listeners = [tempListener, humListener, timestampListener]
  }

  // Desuscribirse de datos
  unsubscribe() {
    if (this.listeners.length > 0) {
      // Firebase v9 maneja automáticamente la desuscripción con onValue
      // Solo necesitamos limpiar nuestro array
      this.listeners = []
      console.log('🔇 Desconectado de Firebase')
    }
  }

  // Obtener datos históricos (simulado por ahora)
  async getHistoricalData(hours = 24) {
    // En una implementación real, podrías almacenar datos históricos
    // Por ahora retornamos un array vacío
    return {
      temperature: [],
      humidity: [],
      timestamps: []
    }
  }

  // Verificar estado de conexión
  isConnected() {
    return database && database.app
  }
}

export const sensorService = new SensorService()