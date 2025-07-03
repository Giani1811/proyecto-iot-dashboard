<template>
  <div class="sensor-card" :class="`sensor-${type} status-${status}`">
    <div class="sensor-header">
      <div class="sensor-icon">
        <span v-if="type === 'temperature'">🌡️</span>
        <span v-else-if="type === 'humidity'">💧</span>
      </div>
      <div class="sensor-info">
        <h3 class="sensor-title">
          {{ type === 'temperature' ? 'Temperatura' : 'Humedad' }}
        </h3>
        <div class="sensor-status">
          <div class="status-dot" :class="status"></div>
          <span class="status-text">{{ statusText }}</span>
        </div>
      </div>
    </div>
    
    <div class="sensor-value-container">
      <div v-if="isLoading" class="sensor-loading">
        <div class="loading-spinner"></div>
        <span>Conectando...</span>
      </div>
      <div v-else class="sensor-value">
        <span class="value-number">{{ displayValue }}</span>
        <span class="value-unit">{{ unit }}</span>
      </div>
    </div>
    
    <div class="sensor-ranges">
      <div class="range-item">
        <span class="range-label">Óptimo:</span>
        <span class="range-value">{{ optimalRange }}</span>
      </div>
      <div class="range-item">
        <span class="range-label">Actual:</span>
        <span class="range-value" :class="`text-${status}`">{{ currentStatus }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'SensorCard',
  props: {
    type: {
      type: String,
      required: true,
      validator: (value) => ['temperature', 'humidity'].includes(value)
    },
    value: {
      type: Number,
      default: null
    },
    status: {
      type: String,
      default: 'unknown',
      validator: (value) => ['optimal', 'warning', 'critical', 'unknown'].includes(value)
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  
  setup(props) {
    const unit = computed(() => {
      return props.type === 'temperature' ? '°C' : '%'
    })
    
    const displayValue = computed(() => {
      if (props.value === null) return '--'
      
      if (props.type === 'temperature') {
        return props.value.toFixed(1)
      } else {
        return Math.round(props.value)
      }
    })
    
    const statusText = computed(() => {
      switch (props.status) {
        case 'optimal':
          return '🟢 Óptimo'
        case 'warning':
          return '🟡 Precaución'
        case 'critical':
          return '🔴 Crítico'
        default:
          return '⚪ Desconocido'
      }
    })
    
    const optimalRange = computed(() => {
      if (props.type === 'temperature') {
        return '18-22°C'
      } else {
        return '55-65%'
      }
    })
    
    const currentStatus = computed(() => {
      if (props.value === null) return 'Sin datos'
      
      const value = props.value
      
      if (props.type === 'temperature') {
        if (value >= 18 && value <= 22) {
          return 'En rango óptimo'
        } else if (value > 22 && value <= 26) {
          return 'Temperatura elevada'
        } else if (value > 26) {
          return 'Muy alta - Riesgo'
        } else {
          return 'Muy baja - Riesgo'
        }
      } else {
        if (value >= 55 && value <= 65) {
          return 'En rango óptimo'
        } else if (value > 65 && value <= 70) {
          return 'Humedad elevada'
        } else if (value > 70) {
          return 'Muy alta - Riesgo moho'
        } else {
          return 'Muy baja - Resecamiento'
        }
      }
    })
    
    return {
      unit,
      displayValue,
      statusText,
      optimalRange,
      currentStatus
    }
  }
}
</script>

<style scoped>
.sensor-card {
  background: var(--bg-card);
  border-radius: var(--border-radius-xl);
  padding: var(--space-lg);
  box-shadow: var(--shadow-lg);
  border: 2px solid transparent;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.sensor-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  transition: background 0.3s ease;
}

.sensor-card.status-optimal::before {
  background: var(--success-green);
}

.sensor-card.status-warning::before {
  background: var(--warning-yellow);
}

.sensor-card.status-critical::before {
  background: var(--danger-red);
}

.sensor-card.status-unknown::before {
  background: var(--gray-400);
}

.sensor-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

.sensor-header {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.sensor-icon {
  font-size: 3rem;
  line-height: 1;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.sensor-info {
  flex: 1;
}

.sensor-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: var(--space-sm);
}

.sensor-status {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.status-text {
  font-size: 0.875rem;
  font-weight: 500;
}

.sensor-value-container {
  margin-bottom: var(--space-lg);
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sensor-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  color: var(--gray-500);
}

.sensor-loading span {
  font-size: 0.875rem;
}

.sensor-value {
  text-align: center;
}

.value-number {
  font-size: 3.5rem;
  font-weight: bold;
  line-height: 1;
  background: linear-gradient(135deg, var(--primary-blue), var(--primary-dark));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.value-unit {
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--gray-600);
  margin-left: var(--space-sm);
}

.sensor-ranges {
  border-top: 1px solid var(--gray-200);
  padding-top: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.range-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.range-label {
  color: var(--gray-600);
  font-weight: 500;
}

.range-value {
  font-weight: 600;
}

.text-optimal {
  color: var(--success-green);
}

.text-warning {
  color: var(--warning-yellow);
}

.text-critical {
  color: var(--danger-red);
}

.text-unknown {
  color: var(--gray-500);
}

/* Variaciones por tipo de sensor */
.sensor-card.sensor-temperature {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(147, 197, 253, 0.05));
}

.sensor-card.sensor-humidity {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(110, 231, 183, 0.05));
}

/* Animaciones para estados críticos */
.sensor-card.status-critical {
  animation: pulseAlert 2s infinite;
}

@keyframes pulseAlert {
  0%, 100% {
    box-shadow: var(--shadow-lg);
  }
  50% {
    box-shadow: var(--shadow-xl), 0 0 0 4px rgba(239, 68, 68, 0.2);
  }
}

/* Responsive */
@media (max-width: 480px) {
  .sensor-card {
    padding: var(--space-md);
  }
  
  .sensor-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--space-sm);
  }
  
  .value-number {
    font-size: 2.5rem;
  }
  
  .value-unit {
    font-size: 1.25rem;
  }
}
</style>