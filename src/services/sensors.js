import { database } from './firebase'
import { ref, onValue, off } from 'firebase/database'

class SensorService {
  constructor() {
    // Referencias para sensores ambientales (DHT)
    this.dht11TempRef = ref(database, 'sensor/dht11/temperature')
    this.dht11HumRef = ref(database, 'sensor/dht11/humidity')
    this.dht22TempRef = ref(database, 'sensor/dht22/temperature')
    this.dht22HumRef = ref(database, 'sensor/dht22/humidity')

    // Referencias para sensores de temperatura del suelo (DS18B20)
    this.ds18b20AzulRef = ref(database, 'sensor/ds18b20/azul/temperature')
    this.ds18b20NegroRef = ref(database, 'sensor/ds18b20/negro/temperature')
    this.ds18b20BlancoRef = ref(database, 'sensor/ds18b20/blanco/temperature')

    // Referencias para sensores de humedad del suelo
    this.soilAzulHumRef = ref(database, 'sensor/soil/azul/humidity')
    this.soilAzulRawRef = ref(database, 'sensor/soil/azul/raw')
    this.soilNegroHumRef = ref(database, 'sensor/soil/negro/humidity')
    this.soilNegroRawRef = ref(database, 'sensor/soil/negro/raw')
    this.soilBlancoHumRef = ref(database, 'sensor/soil/blanco/humidity')
    this.soilBlancoRawRef = ref(database, 'sensor/soil/blanco/raw')

    // Timestamp
    this.timestampRef = ref(database, 'sensor/timestamp')

    this.listeners = []
  }

  // Inicializar servicio
  async initialize() {
    try {
      console.log('🔥 Conectando con Firebase...')
      console.log('📡 Suscribiéndose a 8 sensores (3 plantas + 2 sensores ambientales)')
      return Promise.resolve()
    } catch (error) {
      console.error('❌ Error conectando con Firebase:', error)
      throw error
    }
  }

  // Suscribirse a datos de sensores en tiempo real
  subscribeToSensorData(callback) {
    let sensorData = {
      // Sensores ambientales
      dht11: { temperature: null, humidity: null },
      dht22: { temperature: null, humidity: null },

      // Plantas (cada una con temp y humedad del suelo)
      plantaAzul: { temperaturaSuelo: null, humedadSuelo: null, humedadRaw: null },
      plantaNegra: { temperaturaSuelo: null, humedadSuelo: null, humedadRaw: null },
      plantaBlanca: { temperaturaSuelo: null, humedadSuelo: null, humedadRaw: null },

      timestamp: null
    }

    // ===== SENSORES AMBIENTALES DHT =====

    // DHT11 Temperatura
    onValue(this.dht11TempRef, (snapshot) => {
      const value = snapshot.val()
      if (value !== null && value !== 999.0) {
        sensorData.dht11.temperature = value
        console.log('🌡️ DHT11 Temp:', value)
        callback({ ...sensorData })
      }
    })

    // DHT11 Humedad
    onValue(this.dht11HumRef, (snapshot) => {
      const value = snapshot.val()
      if (value !== null && value !== 999.0) {
        sensorData.dht11.humidity = value
        console.log('💧 DHT11 Hum:', value)
        callback({ ...sensorData })
      }
    })

    // DHT22 Temperatura
    onValue(this.dht22TempRef, (snapshot) => {
      const value = snapshot.val()
      if (value !== null && value !== 999.0) {
        sensorData.dht22.temperature = value
        console.log('🌡️ DHT22 Temp:', value)
        callback({ ...sensorData })
      }
    })

    // DHT22 Humedad
    onValue(this.dht22HumRef, (snapshot) => {
      const value = snapshot.val()
      if (value !== null && value !== 999.0) {
        sensorData.dht22.humidity = value
        console.log('💧 DHT22 Hum:', value)
        callback({ ...sensorData })
      }
    })

    // ===== PLANTA AZUL =====

    // Temperatura suelo azul
    onValue(this.ds18b20AzulRef, (snapshot) => {
      const value = snapshot.val()
      if (value !== null && value !== -99.0) {
        sensorData.plantaAzul.temperaturaSuelo = value
        console.log('🔵 Temp Suelo Azul:', value)
        callback({ ...sensorData })
      }
    })

    // Humedad suelo azul
    onValue(this.soilAzulHumRef, (snapshot) => {
      const value = snapshot.val()
      if (value !== null) {
        sensorData.plantaAzul.humedadSuelo = value
        console.log('🔵 Hum Suelo Azul:', value)
        callback({ ...sensorData })
      }
    })

    // Raw suelo azul
    onValue(this.soilAzulRawRef, (snapshot) => {
      const value = snapshot.val()
      if (value !== null) {
        sensorData.plantaAzul.humedadRaw = value
        callback({ ...sensorData })
      }
    })

    // ===== PLANTA NEGRA =====

    // Temperatura suelo negro
    onValue(this.ds18b20NegroRef, (snapshot) => {
      const value = snapshot.val()
      if (value !== null && value !== -99.0) {
        sensorData.plantaNegra.temperaturaSuelo = value
        console.log('⚫ Temp Suelo Negro:', value)
        callback({ ...sensorData })
      }
    })

    // Humedad suelo negro
    onValue(this.soilNegroHumRef, (snapshot) => {
      const value = snapshot.val()
      if (value !== null) {
        sensorData.plantaNegra.humedadSuelo = value
        console.log('⚫ Hum Suelo Negro:', value)
        callback({ ...sensorData })
      }
    })

    // Raw suelo negro
    onValue(this.soilNegroRawRef, (snapshot) => {
      const value = snapshot.val()
      if (value !== null) {
        sensorData.plantaNegra.humedadRaw = value
        callback({ ...sensorData })
      }
    })

    // ===== PLANTA BLANCA =====

    // Temperatura suelo blanco
    onValue(this.ds18b20BlancoRef, (snapshot) => {
      const value = snapshot.val()
      if (value !== null && value !== -99.0) {
        sensorData.plantaBlanca.temperaturaSuelo = value
        console.log('⚪ Temp Suelo Blanco:', value)
        callback({ ...sensorData })
      }
    })

    // Humedad suelo blanco
    onValue(this.soilBlancoHumRef, (snapshot) => {
      const value = snapshot.val()
      if (value !== null) {
        sensorData.plantaBlanca.humedadSuelo = value
        console.log('⚪ Hum Suelo Blanco:', value)
        callback({ ...sensorData })
      }
    })

    // Raw suelo blanco
    onValue(this.soilBlancoRawRef, (snapshot) => {
      const value = snapshot.val()
      if (value !== null) {
        sensorData.plantaBlanca.humedadRaw = value
        callback({ ...sensorData })
      }
    })

    // ===== TIMESTAMP =====
    onValue(this.timestampRef, (snapshot) => {
      const timestamp = snapshot.val()

      // Usar timestamp actual
      const now = Date.now()
      sensorData.timestamp = now

      console.log('⏰ Última actualización:', new Date(now).toLocaleTimeString('es-PE'))

      if (timestamp !== null) {
        callback({ ...sensorData })
      }
    })
  }

  // Desuscribirse de datos
  unsubscribe() {
    if (this.listeners.length > 0) {
      this.listeners = []
      console.log('🔇 Desconectado de Firebase')
    }
  }

  // Obtener datos históricos (simulado por ahora)
  async getHistoricalData(hours = 24) {
    return {
      plantas: {
        azul: [],
        negra: [],
        blanca: []
      },
      timestamps: []
    }
  }

  // Verificar estado de conexión
  isConnected() {
    return database && database.app
  }
}

export const sensorService = new SensorService()