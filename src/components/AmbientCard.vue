<template>
  <div class="ambient-section">
    <div class="section-header">
      <h2>🌡️ Condiciones Ambientales</h2>
      <div class="status-indicator" :class="`status-${ambienteStatus}`">
        <span class="status-dot"></span>
        <span class="status-text">{{ getStatusText }}</span>
      </div>
    </div>

    <div class="sensors-grid">
      <!-- DHT11 -->
      <div class="sensor-card" :class="{ 'sensor-disconnected': !isDHT11Connected }">
        <div class="sensor-header">
          <div class="sensor-icon">🌡️</div>
          <div class="sensor-info">
            <h3 class="sensor-name">DHT11</h3>
            <span class="sensor-description">Sensor 1 - Pin 13</span>
          </div>
          <div v-if="!isDHT11Connected" class="sensor-status-badge disconnected">
            🔌❌
          </div>
        </div>

        <div v-if="!isDHT11Connected" class="disconnection-message">
          <span class="disconnect-icon">⚠️</span>
          <span class="disconnect-text">Sensor desconectado</span>
        </div>

        <div v-else class="sensor-readings">
          <div class="reading">
            <span class="reading-icon">🌡️</span>
            <div class="reading-data">
              <span class="reading-label">Temperatura</span>
              <span class="reading-value">
                {{ formatValue(sensorsStore.ambiente.dht11.temperature, '°C') }}
              </span>
            </div>
          </div>

          <div class="reading">
            <span class="reading-icon">💧</span>
            <div class="reading-data">
              <span class="reading-label">Humedad</span>
              <span class="reading-value">
                {{ formatValue(sensorsStore.ambiente.dht11.humidity, '%') }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- DHT22 -->
      <div class="sensor-card" :class="{ 'sensor-disconnected': !isDHT22Connected }">
        <div class="sensor-header">
          <div class="sensor-icon">🌡️</div>
          <div class="sensor-info">
            <h3 class="sensor-name">DHT22</h3>
            <span class="sensor-description">Sensor 2 - Pin 12</span>
          </div>
          <div v-if="!isDHT22Connected" class="sensor-status-badge disconnected">
            🔌❌
          </div>
        </div>

        <div v-if="!isDHT22Connected" class="disconnection-message">
          <span class="disconnect-icon">⚠️</span>
          <span class="disconnect-text">Sensor desconectado</span>
        </div>

        <div v-else class="sensor-readings">
          <div class="reading">
            <span class="reading-icon">🌡️</span>
            <div class="reading-data">
              <span class="reading-label">Temperatura</span>
              <span class="reading-value">
                {{ formatValue(sensorsStore.ambiente.dht22.temperature, '°C') }}
              </span>
            </div>
          </div>

          <div class="reading">
            <span class="reading-icon">💧</span>
            <div class="reading-data">
              <span class="reading-label">Humedad</span>
              <span class="reading-value">
                {{ formatValue(sensorsStore.ambiente.dht22.humidity, '%') }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Promedios -->
    <div class="ambient-summary" :class="`status-${ambienteStatus}`">
      <div class="summary-item">
        <span class="summary-label">Temperatura Promedio</span>
        <span class="summary-value">{{ promedioTemperatura }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Humedad Promedio</span>
        <span class="summary-value">{{ promedioHumedad }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSensorsStore } from '../stores/sensors'

const sensorsStore = useSensorsStore()

// Estado del ambiente
const ambienteStatus = computed(() => {
  return sensorsStore.ambienteStatus
})

// Verificar si DHT11 está conectado
const isDHT11Connected = computed(() => {
  const temp = sensorsStore.ambiente.dht11.temperature
  const hum = sensorsStore.ambiente.dht11.humidity
  return temp !== null && hum !== null
})

// Verificar si DHT22 está conectado
const isDHT22Connected = computed(() => {
  const temp = sensorsStore.ambiente.dht22.temperature
  const hum = sensorsStore.ambiente.dht22.humidity
  return temp !== null && hum !== null
})

// Texto del estado
const getStatusText = computed(() => {
  switch (ambienteStatus.value) {
    case 'optimal':
      return 'Óptimo'
    case 'warning':
      return 'Precaución'
    case 'critical':
      return 'Crítico'
    default:
      return 'Conectando...'
  }
})

// Promedio de temperatura
const promedioTemperatura = computed(() => {
  const temp1 = sensorsStore.ambiente.dht11.temperature
  const temp2 = sensorsStore.ambiente.dht22.temperature

  if (!temp1 || !temp2) return '--'

  const avg = (temp1 + temp2) / 2
  return `${avg.toFixed(1)}°C`
})

// Promedio de humedad
const promedioHumedad = computed(() => {
  const hum1 = sensorsStore.ambiente.dht11.humidity
  const hum2 = sensorsStore.ambiente.dht22.humidity

  if (!hum1 || !hum2) return '--'

  const avg = (hum1 + hum2) / 2
  return `${avg.toFixed(1)}%`
})

// Formatear valores
const formatValue = (value, unit) => {
  if (value === null || value === undefined) return '--'
  return `${value.toFixed(1)}${unit}`
}
</script>

<style scoped>
.ambient-section {
  background: white;
  border-radius: 20px;
  padding: 28px;
  color: #1f2937;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1f2937;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f3f4f6;
  border-radius: 20px;
  border: 1px solid #e5e7eb;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  animation: pulse-dot 2s infinite;
}

.status-indicator.status-optimal .status-dot {
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
}

.status-indicator.status-warning .status-dot {
  background: #f59e0b;
  box-shadow: 0 0 8px #f59e0b;
}

.status-indicator.status-critical .status-dot {
  background: #ef4444;
  box-shadow: 0 0 8px #ef4444;
}

.status-indicator.status-unknown .status-dot {
  background: #9ca3af;
}

@keyframes pulse-dot {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

.status-text {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

/* Sensores Grid */
.sensors-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.sensor-card {
  background: #f9fafb;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.sensor-card:hover {
  background: #f3f4f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.sensor-card.sensor-disconnected {
  border-color: #f97316;
  opacity: 0.8;
}

.sensor-card.sensor-disconnected:hover {
  opacity: 0.9;
}

/* Sensor Header */
.sensor-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.sensor-icon {
  font-size: 32px;
  line-height: 1;
}

.sensor-info {
  flex: 1;
}

.sensor-name {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}

.sensor-description {
  font-size: 12px;
  color: #6b7280;
}

.sensor-status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1;
}

.sensor-status-badge.disconnected {
  background: #fff7ed;
  border: 2px solid #f97316;
}

/* Sensor Readings */
.sensor-readings {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reading {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

.reading-icon {
  font-size: 24px;
}

.reading-data {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.reading-label {
  font-size: 11px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.reading-value {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

/* Mensaje de desconexión */
.disconnection-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  background: #fff7ed;
  border-radius: 10px;
  border: 1px solid #fdba74;
  color: #ea580c;
  font-weight: 600;
  font-size: 14px;
}

.disconnect-icon {
  font-size: 20px;
}

.disconnect-text {
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Summary */
.ambient-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 16px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.ambient-summary.status-optimal {
  border-color: rgba(16, 185, 129, 0.5);
  background: rgba(16, 185, 129, 0.1);
}

.ambient-summary.status-warning {
  border-color: rgba(245, 158, 11, 0.5);
  background: rgba(245, 158, 11, 0.1);
}

.ambient-summary.status-critical {
  border-color: rgba(239, 68, 68, 0.5);
  background: rgba(239, 68, 68, 0.1);
  animation: pulse-summary 2s infinite;
}

@keyframes pulse-summary {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: center;
}

.summary-label {
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.summary-value {
  font-size: 28px;
  font-weight: 800;
  color: #1f2937;
}

/* Responsive */
@media (max-width: 768px) {
  .ambient-section {
    padding: 20px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .sensors-grid {
    grid-template-columns: 1fr;
  }

  .ambient-summary {
    grid-template-columns: 1fr;
  }
}
</style>
