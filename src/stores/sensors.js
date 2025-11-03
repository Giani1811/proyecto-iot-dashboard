import { defineStore } from 'pinia'
import { sensorService } from '../services/sensors'

export const useSensorsStore = defineStore('sensors', {
  state: () => ({
    // Sensores ambientales (DHT)
    ambiente: {
      dht11: { temperature: null, humidity: null },
      dht22: { temperature: null, humidity: null }
    },

    // 3 Plantas con sus sensores individuales
    plantas: {
      azul: {
        id: 'azul',
        nombre: 'Planta Azul',
        color: '#3b82f6',
        icon: '🔵',
        temperaturaSuelo: null,
        humedadSuelo: null,
        humedadRaw: null,
        history: []
      },
      negra: {
        id: 'negra',
        nombre: 'Planta Negra',
        color: '#1f2937',
        icon: '⚫',
        temperaturaSuelo: null,
        humedadSuelo: null,
        humedadRaw: null,
        history: []
      },
      blanca: {
        id: 'blanca',
        nombre: 'Planta Blanca',
        color: '#6b7280',
        icon: '⚪',
        temperaturaSuelo: null,
        humedadSuelo: null,
        humedadRaw: null,
        history: []
      }
    },

    lastUpdate: null,
    isOnline: false,
    isLoading: true
  }),

  getters: {
    // Estado de ambiente (promedio de DHT11 y DHT22)
    ambienteStatus: (state) => {
      const temp1 = state.ambiente.dht11.temperature
      const temp2 = state.ambiente.dht22.temperature
      const hum1 = state.ambiente.dht11.humidity
      const hum2 = state.ambiente.dht22.humidity

      if (!temp1 || !temp2 || !hum1 || !hum2) return 'unknown'

      const avgTemp = (temp1 + temp2) / 2
      const avgHum = (hum1 + hum2) / 2

      // Rangos para plantas
      const tempOk = avgTemp >= 18 && avgTemp <= 25
      const tempWarning = (avgTemp >= 15 && avgTemp < 18) || (avgTemp > 25 && avgTemp <= 30)
      const humOk = avgHum >= 60 && avgHum <= 80
      const humWarning = (avgHum >= 50 && avgHum < 60) || (avgHum > 80 && avgHum <= 90)

      if (tempOk && humOk) return 'optimal'
      if (tempWarning || humWarning) return 'warning'
      return 'critical'
    },

    // Estado de cada planta
    getPlantaStatus: (state) => (plantaId) => {
      const planta = state.plantas[plantaId]
      if (!planta || planta.temperaturaSuelo === null || planta.humedadSuelo === null) {
        return {
          status: 'unknown',
          message: 'Esperando datos...',
          icon: '⏳'
        }
      }

      const temp = planta.temperaturaSuelo
      const hum = planta.humedadSuelo

      // Rangos óptimos para plantas
      const tempOptimal = temp >= 18 && temp <= 25
      const tempWarning = (temp >= 15 && temp < 18) || (temp > 25 && temp <= 30)
      const humOptimal = hum >= 60 && hum <= 80
      const humWarning = (hum >= 40 && hum < 60) || (hum > 80 && hum <= 90)

      if (tempOptimal && humOptimal) {
        return {
          status: 'optimal',
          message: 'Condiciones óptimas para crecimiento',
          icon: '✅'
        }
      }

      if (tempWarning || humWarning) {
        let message = ''
        if (hum < 60) message = 'Humedad baja - Considerar riego'
        else if (hum > 80) message = 'Humedad alta - Verificar drenaje'
        else if (temp < 18) message = 'Temperatura baja'
        else if (temp > 25) message = 'Temperatura alta'

        return {
          status: 'warning',
          message,
          icon: '⚠️'
        }
      }

      let criticalMsg = ''
      if (hum < 40) criticalMsg = '¡Planta necesita riego urgente!'
      else if (hum > 90) criticalMsg = '¡Exceso de humedad, riesgo de hongos!'
      else if (temp < 15) criticalMsg = '¡Temperatura muy baja!'
      else if (temp > 30) criticalMsg = '¡Temperatura crítica!'

      return {
        status: 'critical',
        message: criticalMsg,
        icon: '🚨'
      }
    },

    // Lista de plantas como array
    plantasArray: (state) => {
      return Object.values(state.plantas)
    }
  },

  actions: {
    // Inicializar conexión con Firebase
    async initializeSensors() {
      try {
        this.isLoading = true
        await sensorService.initialize()
        this.subscribeToSensorData()
        this.startConnectionCheck()
      } catch (error) {
        console.error('Error inicializando sensores:', error)
        this.isLoading = false
      }
    },

    // Suscribirse a datos en tiempo real
    subscribeToSensorData() {
      sensorService.subscribeToSensorData((data) => {
        // Actualizar sensores ambientales
        if (data.dht11) {
          this.ambiente.dht11 = { ...data.dht11 }
        }
        if (data.dht22) {
          this.ambiente.dht22 = { ...data.dht22 }
        }

        // Actualizar plantas
        if (data.plantaAzul) {
          this.plantas.azul.temperaturaSuelo = data.plantaAzul.temperaturaSuelo
          this.plantas.azul.humedadSuelo = data.plantaAzul.humedadSuelo
          this.plantas.azul.humedadRaw = data.plantaAzul.humedadRaw
          this.addToPlantHistory('azul', data.plantaAzul)
        }

        if (data.plantaNegra) {
          this.plantas.negra.temperaturaSuelo = data.plantaNegra.temperaturaSuelo
          this.plantas.negra.humedadSuelo = data.plantaNegra.humedadSuelo
          this.plantas.negra.humedadRaw = data.plantaNegra.humedadRaw
          this.addToPlantHistory('negra', data.plantaNegra)
        }

        if (data.plantaBlanca) {
          this.plantas.blanca.temperaturaSuelo = data.plantaBlanca.temperaturaSuelo
          this.plantas.blanca.humedadSuelo = data.plantaBlanca.humedadSuelo
          this.plantas.blanca.humedadRaw = data.plantaBlanca.humedadRaw
          this.addToPlantHistory('blanca', data.plantaBlanca)
        }

        // Actualizar timestamp
        if (data.timestamp) {
          this.lastUpdate = new Date(data.timestamp)
        }

        this.updateConnectionStatus()
        this.isLoading = false
      })
    },

    // Agregar datos al historial de una planta
    addToPlantHistory(plantaId, data) {
      const planta = this.plantas[plantaId]
      if (!planta) return

      const timestamp = this.lastUpdate || new Date()
      const dataPoint = {
        timestamp,
        temperaturaSuelo: data.temperaturaSuelo,
        humedadSuelo: data.humedadSuelo
      }

      planta.history.push(dataPoint)

      // Mantener solo las últimas 50 lecturas
      if (planta.history.length > 50) {
        planta.history.shift()
      }
    },

    // Actualizar estado de conexión
    updateConnectionStatus() {
      // Verificar si al menos una planta tiene datos
      const hasData = this.plantas.azul.temperaturaSuelo !== null ||
                      this.plantas.negra.temperaturaSuelo !== null ||
                      this.plantas.blanca.temperaturaSuelo !== null

      if (hasData) {
        this.isOnline = true

        // Marcar offline si no hay datos en 30 segundos
        if (this.lastUpdate) {
          const now = new Date()
          const diffInSeconds = (now - this.lastUpdate) / 1000
          if (diffInSeconds > 30) {
            this.isOnline = false
          }
        }
      } else {
        this.isOnline = false
      }
    },

    // Verificar conexión periódicamente
    startConnectionCheck() {
      setInterval(() => {
        this.updateConnectionStatus()
      }, 5000) // Verificar cada 5 segundos
    }
  }
})