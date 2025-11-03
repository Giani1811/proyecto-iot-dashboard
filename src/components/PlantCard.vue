<template>
  <div class="plant-card" :class="[statusClass]">
    <!-- Header de la planta -->
    <div class="plant-header">
      <div class="plant-icon" :style="{ color: planta.color }">
        {{ planta.icon }}
      </div>
      <h3 class="plant-name">{{ planta.nombre }}</h3>
      <div class="status-badge" :class="statusClass">
        <span class="status-icon">{{ plantaStatus.icon }}</span>
      </div>
    </div>

    <!-- Métricas de la planta -->
    <div class="plant-metrics">
      <!-- Temperatura del suelo -->
      <div class="metric">
        <div class="metric-icon">🌡️</div>
        <div class="metric-content">
          <span class="metric-label">Temperatura Suelo</span>
          <span class="metric-value">
            {{ formatTemperature(planta.temperaturaSuelo) }}
          </span>
        </div>
      </div>

      <!-- Humedad del suelo -->
      <div class="metric">
        <div class="metric-icon">💧</div>
        <div class="metric-content">
          <span class="metric-label">Humedad Suelo</span>
          <span class="metric-value">
            {{ formatHumidity(planta.humedadSuelo) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Estado y mensaje -->
    <div class="plant-status" :class="statusClass">
      <span class="status-message">{{ plantaStatus.message }}</span>
    </div>

    <!-- Barra de progreso de humedad -->
    <div class="humidity-bar-container">
      <div
        class="humidity-bar"
        :class="statusClass"
        :style="{ width: planta.humedadSuelo ? `${planta.humedadSuelo}%` : '0%' }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSensorsStore } from '../stores/sensors'

const props = defineProps({
  planta: {
    type: Object,
    required: true
  }
})

const sensorsStore = useSensorsStore()

// Obtener estado de la planta
const plantaStatus = computed(() => {
  return sensorsStore.getPlantaStatus(props.planta.id)
})

// Clase CSS según el estado
const statusClass = computed(() => {
  return `status-${plantaStatus.value.status}`
})

// Formatear temperatura
const formatTemperature = (temp) => {
  if (temp === null || temp === undefined) return '--'
  return `${temp.toFixed(2)}°C`
}

// Formatear humedad
const formatHumidity = (hum) => {
  if (hum === null || hum === undefined) return '--'
  return `${hum}%`
}
</script>

<style scoped>
.plant-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 3px solid transparent;
}

.plant-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

/* Colores de borde según estado */
.plant-card.status-optimal {
  border-color: #10b981;
}

.plant-card.status-warning {
  border-color: #f59e0b;
}

.plant-card.status-critical {
  border-color: #ef4444;
  animation: pulse-border 2s infinite;
}

.plant-card.status-unknown {
  border-color: #9ca3af;
}

@keyframes pulse-border {
  0%, 100% {
    border-color: #ef4444;
  }
  50% {
    border-color: #fca5a5;
  }
}

/* Header */
.plant-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.plant-icon {
  font-size: 32px;
  line-height: 1;
}

.plant-name {
  flex: 1;
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.status-badge {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.status-badge.status-optimal {
  background: #d1fae5;
}

.status-badge.status-warning {
  background: #fef3c7;
}

.status-badge.status-critical {
  background: #fee2e2;
}

.status-badge.status-unknown {
  background: #f3f4f6;
}

/* Métricas */
.plant-metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.metric {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
}

.metric-icon {
  font-size: 28px;
  line-height: 1;
}

.metric-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.metric-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-value {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

/* Estado */
.plant-status {
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 12px;
  font-weight: 600;
  font-size: 14px;
}

.plant-status.status-optimal {
  background: #d1fae5;
  color: #065f46;
}

.plant-status.status-warning {
  background: #fef3c7;
  color: #92400e;
}

.plant-status.status-critical {
  background: #fee2e2;
  color: #991b1b;
}

.plant-status.status-unknown {
  background: #f3f4f6;
  color: #6b7280;
}

.status-message {
  display: block;
}

/* Barra de humedad */
.humidity-bar-container {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.humidity-bar {
  height: 100%;
  transition: width 0.5s ease, background-color 0.3s ease;
  border-radius: 4px;
}

.humidity-bar.status-optimal {
  background: linear-gradient(90deg, #10b981, #34d399);
}

.humidity-bar.status-warning {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.humidity-bar.status-critical {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.humidity-bar.status-unknown {
  background: #9ca3af;
}

/* Responsive */
@media (max-width: 768px) {
  .plant-metrics {
    grid-template-columns: 1fr;
  }

  .plant-card {
    padding: 16px;
  }

  .plant-name {
    font-size: 18px;
  }

  .metric-value {
    font-size: 18px;
  }
}
</style>
