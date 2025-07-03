<template>
  <div class="chart-container">
    <div v-if="isLoading" class="chart-loading">
      <div class="loading-spinner"></div>
      <p>Cargando datos históricos...</p>
    </div>
    
    <div v-else-if="hasData" class="chart-content">
      <canvas ref="chartCanvas"></canvas>
    </div>
    
    <div v-else class="chart-empty">
      <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
      </svg>
      <h3>Sin datos históricos</h3>
      <p>Los gráficos aparecerán cuando haya suficientes datos del sensor</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { Chart } from 'chart.js/auto'
import 'chartjs-adapter-date-fns'

export default {
  name: 'ChartComponent',
  props: {
    temperatureData: {
      type: Array,
      default: () => []
    },
    humidityData: {
      type: Array,
      default: () => []
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  
  setup(props) {
    const chartCanvas = ref(null)
    let chartInstance = null
    
    const hasData = computed(() => {
      return props.temperatureData.length > 0 || props.humidityData.length > 0
    })
    
    const chartData = computed(() => {
      const tempData = (props.temperatureData || []).map(item => ({
        x: item.timestamp instanceof Date ? item.timestamp : new Date(item.timestamp),
        y: parseFloat(item.value) || 0
      })).filter(item => !isNaN(item.y) && item.x instanceof Date && !isNaN(item.x.getTime()))
      
      const humData = (props.humidityData || []).map(item => ({
        x: item.timestamp instanceof Date ? item.timestamp : new Date(item.timestamp),
        y: parseFloat(item.value) || 0
      })).filter(item => !isNaN(item.y) && item.x instanceof Date && !isNaN(item.x.getTime()))
      
      return {
        datasets: [
          {
            label: 'Temperatura (°C)',
            data: tempData,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 3,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: 'rgb(59, 130, 246)',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            tension: 0.4,
            fill: false,
            yAxisID: 'y'
          },
          {
            label: 'Humedad (%)',
            data: humData,
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 3,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: 'rgb(16, 185, 129)',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            tension: 0.4,
            fill: false,
            yAxisID: 'y1'
          }
        ]
      }
    })
    
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        title: {
          display: true,
          text: 'Tendencias Históricas de Sensores',
          font: {
            size: 16,
            weight: 'bold'
          },
          color: '#1f2937'
        },
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: '#374151',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
          callbacks: {
            title: function(context) {
              const date = new Date(context[0].parsed.x)
              return date.toLocaleString('es-PE', {
                timeZone: 'America/Lima',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
            },
            label: function(context) {
              const label = context.dataset.label
              const value = context.parsed.y
              const unit = label.includes('Temperatura') ? '°C' : '%'
              return `${label}: ${value.toFixed(1)}${unit}`
            }
          }
        }
      },
      scales: {
        x: {
          type: 'time',
          display: true,
          time: {
            tooltipFormat: 'dd/MM/yyyy HH:mm:ss',
            displayFormats: {
              hour: 'HH:mm',
              day: 'dd/MM',
              week: 'dd/MM',
              month: 'MM/yyyy'
            }
          },
          title: {
            display: true,
            text: 'Tiempo',
            font: {
              weight: 'bold'
            }
          },
          grid: {
            color: 'rgba(156, 163, 175, 0.2)'
          },
          ticks: {
            maxTicksLimit: 8,
            color: '#6b7280',
            autoSkip: true
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Temperatura (°C)',
            color: 'rgb(59, 130, 246)',
            font: {
              weight: 'bold'
            }
          },
          grid: {
            color: 'rgba(156, 163, 175, 0.2)'
          },
          ticks: {
            color: 'rgb(59, 130, 246)',
            callback: function(value) {
              return value.toFixed(1) + '°C'
            }
          },
          min: 0,
          max: 40
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Humedad (%)',
            color: 'rgb(16, 185, 129)',
            font: {
              weight: 'bold'
            }
          },
          grid: {
            drawOnChartArea: false,
          },
          ticks: {
            color: 'rgb(16, 185, 129)',
            callback: function(value) {
              return value.toFixed(0) + '%'
            }
          },
          min: 0,
          max: 100
        }
      },
      elements: {
        line: {
          borderJoinStyle: 'round'
        },
        point: {
          hoverBorderWidth: 3
        }
      },
      animation: {
        duration: 750,
        easing: 'easeInOutQuart'
      }
    }
    
    const createChart = async () => {
      if (!chartCanvas.value || !hasData.value) return
      
      await nextTick()
      
      // Destruir gráfico existente de forma segura
      destroyChart()
      
      try {
        const ctx = chartCanvas.value.getContext('2d')
        
        chartInstance = new Chart(ctx, {
          type: 'line',
          data: chartData.value,
          options: chartOptions
        })
      } catch (error) {
        console.error('Error creando gráfico:', error)
      }
    }
    
    const updateChart = () => {
      if (!hasData.value) return
      
      if (!chartInstance) {
        createChart()
      } else {
        try {
          chartInstance.data = chartData.value
          chartInstance.update('none')
        } catch (error) {
          console.error('Error actualizando gráfico:', error)
          createChart()
        }
      }
    }
    
    const destroyChart = () => {
      if (chartInstance) {
        try {
          chartInstance.destroy()
          chartInstance = null
        } catch (error) {
          console.error('Error destruyendo gráfico:', error)
        }
      }
    }
    
    // Watchers con debounce
    let updateTimer = null
    
    watch([() => props.temperatureData, () => props.humidityData], () => {
      clearTimeout(updateTimer)
      updateTimer = setTimeout(() => {
        updateChart()
      }, 300)
    }, { deep: true })
    
    watch(() => props.isLoading, async (newValue, oldValue) => {
      if (oldValue === true && newValue === false && hasData.value) {
        await nextTick()
        createChart()
      }
    })
    
    // Lifecycle
    onMounted(() => {
      if (!props.isLoading && hasData.value) {
        createChart()
      }
    })
    
    onUnmounted(() => {
      clearTimeout(updateTimer)
      destroyChart()
    })
    
    return {
      chartCanvas,
      hasData
    }
  }
}
</script>

<style scoped>
.chart-container {
  height: 400px;
  width: 100%;
  position: relative;
  background: var(--bg-card);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--gray-200);
}

.chart-loading {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  color: var(--gray-500);
}

.chart-loading p {
  font-size: 0.875rem;
  font-weight: 500;
}

.chart-content {
  height: 100%;
  width: 100%;
  padding: var(--space-md);
}

.chart-empty {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  color: var(--gray-500);
  text-align: center;
  padding: var(--space-xl);
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: var(--gray-400);
}

.chart-empty h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--gray-700);
}

.chart-empty p {
  font-size: 0.875rem;
  max-width: 300px;
  line-height: 1.5;
}

/* Responsive */
@media (max-width: 768px) {
  .chart-container {
    height: 300px;
  }
  
  .chart-content {
    padding: var(--space-sm);
  }
}

@media (max-width: 480px) {
  .chart-container {
    height: 250px;
  }
}
</style>