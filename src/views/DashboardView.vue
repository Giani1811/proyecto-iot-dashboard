<template>
  <div class="dashboard-container">
    <!-- Header -->
    <header class="dashboard-header">
      <div class="header-content">
        <div class="header-title">
          <h1>
            <span class="header-icon">🌱</span>
            PlantGuard Dashboard
          </h1>
          <p class="header-subtitle">
            Sistema de Monitoreo Inteligente para 3 Plantas
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

    <!-- Estado de conexión -->
    <div class="connection-status" :class="isOnline ? 'online' : 'offline'">
      <div class="status-dot"></div>
      <span>{{ isOnline ? 'Sistema en línea' : 'Desconectado' }}</span>
      <span class="last-update" v-if="!isLoading">
        Última actualización: {{ lastUpdateFormatted }}
      </span>
      <span class="last-update" v-else>Conectando...</span>
    </div>

    <!-- Condiciones Ambientales -->
    <AmbientCard />

    <!-- Sección de Plantas -->
    <div class="plants-section">
      <div class="section-header">
        <h2>🌿 Monitoreo Individual de Plantas</h2>
        <p class="section-description">
          Cada planta cuenta con sensores dedicados de temperatura y humedad del suelo
        </p>
      </div>

      <div class="plants-grid" v-if="!isLoading">
        <PlantCard
          v-for="planta in plantasArray"
          :key="planta.id"
          :planta="planta"
        />
      </div>

      <div class="loading-state" v-else>
        <div class="spinner"></div>
        <p>Cargando datos de las plantas...</p>
      </div>
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
            <p>ESP32 + 8 sensores activos</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Rangos de referencia -->
    <div class="reference-section">
      <h2 class="section-title">🌿 Rangos Ideales para Plantas</h2>
      <div class="reference-grid">
        <div class="reference-card optimal">
          <div class="reference-header">
            <span class="reference-icon">🌱</span>
            <h3>Condiciones Óptimas</h3>
          </div>
          <div class="reference-values">
            <p><strong>Temp. Ambiente:</strong> 18-25°C</p>
            <p><strong>Humedad Ambiente:</strong> 60-80%</p>
            <p><strong>Humedad Suelo:</strong> 60-80%</p>
          </div>
        </div>

        <div class="reference-card warning">
          <div class="reference-header">
            <span class="reference-icon">⚠️</span>
            <h3>Requiere Atención</h3>
          </div>
          <div class="reference-values">
            <p><strong>Temp. Ambiente:</strong> 15-18°C o 25-30°C</p>
            <p><strong>Humedad Ambiente:</strong> 50-60% o 80-90%</p>
            <p><strong>Humedad Suelo:</strong> 40-60% o 80-90%</p>
          </div>
        </div>

        <div class="reference-card critical">
          <div class="reference-header">
            <span class="reference-icon">🚨</span>
            <h3>Riesgo Crítico</h3>
          </div>
          <div class="reference-values">
            <p><strong>Temp. Ambiente:</strong> &lt;15°C o &gt;30°C</p>
            <p><strong>Humedad Ambiente:</strong> &lt;50% o &gt;90%</p>
            <p><strong>Humedad Suelo:</strong> &lt;40% o &gt;90%</p>
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
import PlantCard from '../components/PlantCard.vue'
import AmbientCard from '../components/AmbientCard.vue'

export default {
  name: 'DashboardView',
  components: {
    PlantCard,
    AmbientCard
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

    // Datos de sensores y plantas
    const plantasArray = computed(() => sensorsStore.plantasArray)
    const isOnline = computed(() => sensorsStore.isOnline)
    const isLoading = computed(() => sensorsStore.isLoading)

    const lastUpdateFormatted = computed(() => {
      if (!sensorsStore.lastUpdate) return 'Nunca'

      const lastUpdate = new Date(sensorsStore.lastUpdate)

      // Mostrar fecha y hora completa en zona horaria de Lima, Perú
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
      console.log('🚀 Inicializando dashboard de plantas...')
      console.log('📡 Conectando con 8 sensores (3 plantas + 2 sensores ambientales)...')

      // Inicializar sensores
      await sensorsStore.initializeSensors()
    })

    onUnmounted(() => {
      console.log('🔌 Limpiando dashboard...')
    })

    return {
      // Usuario
      currentUser,
      totalUsers,
      userInitials,
      logout,

      // Plantas y sensores
      plantasArray,
      isOnline,
      isLoading,
      lastUpdateFormatted
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 24px;
}

/* Header */
.dashboard-header {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.header-title h1 {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.header-icon {
  font-size: 2rem;
}

.header-subtitle {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 24px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #52b788, #2d6a4f);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  box-shadow: 0 4px 12px rgba(45, 106, 79, 0.3);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
}

.user-role {
  color: #9ca3af;
  font-size: 0.75rem;
}

/* Connection Status */
.connection-status {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: white;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  font-size: 0.875rem;
  font-weight: 500;
}

.connection-status.online {
  border-left: 4px solid #10b981;
}

.connection-status.offline {
  border-left: 4px solid #ef4444;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  animation: pulse-dot 2s infinite;
}

.connection-status.online .status-dot {
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
}

.connection-status.offline .status-dot {
  background: #ef4444;
  box-shadow: 0 0 8px #ef4444;
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

.last-update {
  margin-left: auto;
  color: #6b7280;
  font-size: 0.8125rem;
}

/* Plants Section */
.plants-section {
  margin-bottom: 32px;
}

.section-header {
  margin-bottom: 24px;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.section-description {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

.plants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
  gap: 16px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

/* Management Section */
.management-section {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 20px 0;
}

.management-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.management-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
  text-decoration: none;
  color: inherit;
}

.management-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #52b788;
}

.management-card.info-card {
  cursor: default;
}

.management-card.info-card:hover {
  transform: none;
  box-shadow: none;
  border-color: #e5e7eb;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.card-icon.users {
  background: linear-gradient(135deg, #52b788, #2d6a4f);
  box-shadow: 0 4px 12px rgba(45, 106, 79, 0.3);
}

.card-icon.info {
  background: linear-gradient(135deg, #74c69d, #52b788);
  box-shadow: 0 4px 12px rgba(82, 183, 136, 0.3);
}

.card-content {
  flex: 1;
}

.card-content h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #1f2937;
}

.card-content p {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

.card-arrow {
  font-size: 1.25rem;
  color: #9ca3af;
}

/* Reference Section */
.reference-section {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.reference-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.reference-card {
  border-radius: 12px;
  padding: 20px;
  border: 2px solid;
  transition: all 0.2s ease;
}

.reference-card:hover {
  transform: translateY(-2px);
}

.reference-card.optimal {
  background: rgba(16, 185, 129, 0.05);
  border-color: #10b981;
}

.reference-card.warning {
  background: rgba(245, 158, 11, 0.05);
  border-color: #f59e0b;
}

.reference-card.critical {
  background: rgba(239, 68, 68, 0.05);
  border-color: #ef4444;
}

.reference-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.reference-icon {
  font-size: 1.5rem;
}

.reference-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: #1f2937;
}

.reference-values p {
  margin: 0 0 8px 0;
  font-size: 0.875rem;
  color: #374151;
}

.reference-values p:last-child {
  margin-bottom: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 16px;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .header-actions {
    justify-content: space-between;
  }

  .plants-grid {
    grid-template-columns: 1fr;
  }

  .management-cards,
  .reference-grid {
    grid-template-columns: 1fr;
  }

  .connection-status {
    flex-wrap: wrap;
  }

  .last-update {
    width: 100%;
    margin-left: 0;
    margin-top: 8px;
  }
}
</style>