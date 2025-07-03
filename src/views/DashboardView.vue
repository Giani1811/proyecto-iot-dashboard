<template>
  <div class="dashboard-container">
    <!-- Header -->
    <header class="dashboard-header">
      <div class="header-content">
        <div class="header-title">
          <h1>
            <span class="header-icon">📊</span>
            Dashboard IoT
          </h1>
          <p class="header-subtitle">
            Sistema de Monitoreo de Temperatura y Humedad para Frutos Secos
          </p>
        </div>
        
        <div class="header-actions">
          <div class="user-info">
            <div class="user-avatar">
              <span>{{ userInitials }}</span>
            </div>
            <div class="user-details">
              <span class="user-name">{{ currentUser?.name }}</span>
              <span class="user-role">Conectado</span>
            </div>
          </div>
          
          <button @click="logout" class="btn btn-secondary">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Salir
          </button>
        </div>
      </div>
    </header>

    <!-- Estado general del sistema -->
    <div class="system-status" :class="`status-${overallStatus}`">
      <div class="status-content">
        <div class="status-icon">
          <span v-if="overallStatus === 'optimal'">✅</span>
          <span v-else-if="overallStatus === 'warning'">⚠️</span>
          <span v-else-if="overallStatus === 'critical'">🚨</span>
          <span v-else>🔍</span>
        </div>
        <div class="status-text">
          <h3>{{ statusMessage }}</h3>
          <p v-if="!isLoading">
            Última actualización: {{ lastUpdateFormatted }}
          </p>
          <p v-else>Conectando con sensores...</p>
        </div>
        <div class="connection-indicator">
          <div class="status-dot" :class="isOnline ? 'optimal' : 'critical'"></div>
          <span>{{ isOnline ? 'En línea' : 'Desconectado' }}</span>
        </div>
      </div>
    </div>

    <!-- Grid principal -->
    <div class="dashboard-grid">
      <!-- Tarjetas de sensores -->
      <div class="sensors-section">
        <h2 class="section-title">Sensores en Tiempo Real</h2>
        <div class="sensors-grid">
          <SensorCard
            type="temperature"
            :value="temperature"
            :status="temperatureStatus"
            :is-loading="isLoading"
          />
          <SensorCard
            type="humidity"
            :value="humidity" 
            :status="humidityStatus"
            :is-loading="isLoading"
          />
        </div>
      </div>

      <!-- Gráficos históricos -->
      <div class="charts-section">
        <h2 class="section-title">Tendencias Históricas</h2>
        <ChartComponent
          :temperature-data="temperatureHistory"
          :humidity-data="humidityHistory"
          :is-loading="isLoading"
        />
      </div>

      <!-- Panel de gestión -->
      <div class="management-section">
        <h2 class="section-title">Gestión del Sistema</h2>
        <div class="management-cards">
          <router-link to="/users" class="management-card">
            <div class="card-icon users">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197V9a3 3 0 00-3-3m3 12a3 3 0 01-3-3"/>
              </svg>
            </div>
            <div class="card-content">
              <h3>Gestión de Usuarios</h3>
              <p>{{ totalUsers }} usuarios registrados</p>
            </div>
            <div class="card-arrow">→</div>
          </router-link>

          <div class="management-card info-card">
            <div class="card-icon info">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="card-content">
              <h3>Información del Sistema</h3>
              <p>ESP32 + DHT11 activo</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Rangos de referencia -->
      <div class="reference-section">
        <h2 class="section-title">Rangos de Referencia - Frutos Secos</h2>
        <div class="reference-grid">
          <div class="reference-card optimal">
            <div class="reference-header">
              <span class="reference-icon">🟢</span>
              <h3>Óptimo</h3>
            </div>
            <div class="reference-values">
              <p><strong>Temperatura:</strong> 18-22°C</p>
              <p><strong>Humedad:</strong> 55-65%</p>
            </div>
          </div>

          <div class="reference-card warning">
            <div class="reference-header">
              <span class="reference-icon">🟡</span>
              <h3>Precaución</h3>
            </div>
            <div class="reference-values">
              <p><strong>Temperatura:</strong> 22-26°C</p>
              <p><strong>Humedad:</strong> 65-70%</p>
            </div>
          </div>

          <div class="reference-card critical">
            <div class="reference-header">
              <span class="reference-icon">🔴</span>
              <h3>Crítico</h3>
            </div>
            <div class="reference-values">
              <p><strong>Temperatura:</strong> >26°C o <18°C</p>
              <p><strong>Humedad:</strong> >70% o <55%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useSensorsStore } from '../stores/sensors'
import SensorCard from '../components/SensorCard.vue'
import ChartComponent from '../components/ChartComponent.vue'

export default {
  name: 'DashboardView',
  components: {
    SensorCard,
    ChartComponent
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const sensorsStore = useSensorsStore()

    // Computadas
    const currentUser = computed(() => authStore.currentUser)
    const totalUsers = computed(() => authStore.allUsers.length)
    
    const userInitials = computed(() => {
      if (!currentUser.value?.name) return 'U'
      return currentUser.value.name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    })

    // Datos de sensores
    const temperature = computed(() => sensorsStore.temperature)
    const humidity = computed(() => sensorsStore.humidity)
    const temperatureStatus = computed(() => sensorsStore.temperatureStatus)
    const humidityStatus = computed(() => sensorsStore.humidityStatus)
    const overallStatus = computed(() => sensorsStore.overallStatus)
    const statusMessage = computed(() => sensorsStore.statusMessage)
    const isOnline = computed(() => sensorsStore.isOnline)
    const isLoading = computed(() => sensorsStore.isLoading)
    const temperatureHistory = computed(() => sensorsStore.temperatureHistory)
    const humidityHistory = computed(() => sensorsStore.humidityHistory)

    const lastUpdateFormatted = computed(() => {
      if (!sensorsStore.lastUpdate) return 'Nunca'
      
      const lastUpdate = new Date(sensorsStore.lastUpdate)
      
      // Siempre mostrar fecha y hora completa en zona horaria de Lima, Perú
      return lastUpdate.toLocaleString('es-PE', {
        timeZone: 'America/Lima',
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    })

    // Métodos
    const logout = () => {
      authStore.logout()
      router.push('/login')
    }

    // Lifecycle hooks
    onMounted(async () => {
      console.log('🚀 Inicializando dashboard...')
      
      // Inicializar sensores
      await sensorsStore.initializeSensors()
      
      // Iniciar verificación de conexión
      sensorsStore.startConnectionCheck()
    })

    onUnmounted(() => {
      console.log('🔌 Limpiando dashboard...')
      // Aquí podrías limpiar listeners si fuera necesario
    })

    return {
      // Usuario
      currentUser,
      totalUsers,
      userInitials,
      logout,
      
      // Sensores
      temperature,
      humidity,
      temperatureStatus,
      humidityStatus,
      overallStatus,
      statusMessage,
      isOnline,
      isLoading,
      temperatureHistory,
      humidityHistory,
      lastUpdateFormatted
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: var(--bg-secondary);
  padding: var(--space-lg);
}

/* Header */
.dashboard-header {
  background: var(--bg-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-lg);
  margin-bottom: var(--space-lg);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-lg);
}

.header-title h1 {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: var(--space-xs);
}

.header-icon {
  font-size: 2rem;
}

.header-subtitle {
  color: var(--gray-600);
  font-size: 0.875rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.user-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primary-blue), var(--primary-dark));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  color: var(--gray-900);
  font-size: 0.875rem;
}

.user-role {
  color: var(--gray-500);
  font-size: 0.75rem;
}

/* Estado del sistema */
.system-status {
  border-radius: var(--border-radius-lg);
  padding: var(--space-lg);
  margin-bottom: var(--space-lg);
  border-left: 4px solid;
}

.system-status.status-optimal {
  background: rgba(16, 185, 129, 0.1);
  border-color: var(--success-green);
}

.system-status.status-warning {
  background: rgba(245, 158, 11, 0.1);
  border-color: var(--warning-yellow);
}

.system-status.status-critical {
  background: rgba(239, 68, 68, 0.1);
  border-color: var(--danger-red);
}

.system-status.status-unknown {
  background: rgba(107, 114, 128, 0.1);
  border-color: var(--gray-400);
}

.status-content {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

.status-icon {
  font-size: 2rem;
}

.status-text {
  flex: 1;
}

.status-text h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: var(--space-xs);
}

.status-text p {
  color: var(--gray-600);
  font-size: 0.875rem;
}

.connection-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 0.875rem;
  font-weight: 500;
}

/* Grid del dashboard */
.dashboard-grid {
  display: grid;
  gap: var(--space-lg);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: var(--space-lg);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

/* Sección de sensores */
.sensors-section {
  background: var(--bg-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-lg);
}

.sensors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-lg);
}

/* Sección de gráficos */
.charts-section {
  background: var(--bg-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-lg);
}

/* Sección de gestión */
.management-section {
  background: var(--bg-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-lg);
}

.management-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-lg);
}

.management-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg);
  background: var(--gray-50);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--gray-200);
  transition: all 0.2s ease;
  text-decoration: none;
  color: inherit;
}

.management-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-blue);
}

.management-card.info-card {
  cursor: default;
}

.management-card.info-card:hover {
  transform: none;
  box-shadow: var(--shadow-md);
  border-color: var(--gray-200);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.card-icon.users {
  background: linear-gradient(135deg, var(--primary-blue), var(--primary-dark));
}

.card-icon.info {
  background: linear-gradient(135deg, var(--gray-500), var(--gray-600));
}

.card-content {
  flex: 1;
}

.card-content h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: var(--space-xs);
}

.card-content p {
  color: var(--gray-600);
  font-size: 0.875rem;
}

.card-arrow {
  font-size: 1.25rem;
  color: var(--gray-400);
}

/* Sección de referencia */
.reference-section {
  background: var(--bg-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-lg);
}

.reference-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-lg);
}

.reference-card {
  border-radius: var(--border-radius-lg);
  padding: var(--space-lg);
  border: 2px solid;
}

.reference-card.optimal {
  background: rgba(16, 185, 129, 0.05);
  border-color: var(--success-green);
}

.reference-card.warning {
  background: rgba(245, 158, 11, 0.05);
  border-color: var(--warning-yellow);
}

.reference-card.critical {
  background: rgba(239, 68, 68, 0.05);
  border-color: var(--danger-red);
}

.reference-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.reference-icon {
  font-size: 1.5rem;
}

.reference-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
}

.reference-values p {
  margin-bottom: var(--space-xs);
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-container {
    padding: var(--space-md);
  }
  
  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-md);
  }
  
  .header-actions {
    justify-content: space-between;
  }
  
  .status-content {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-md);
  }
  
  .management-cards,
  .reference-grid,
  .sensors-grid {
    grid-template-columns: 1fr;
  }
}
</style>