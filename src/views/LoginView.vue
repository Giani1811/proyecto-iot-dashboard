<template>
  <div class="login-container">
    <!-- Fondo con patrón de circuitos -->
    <div class="circuit-pattern"></div>
    
    <!-- Logo IoT de fondo -->
    <div class="logo-background">
      <div class="logo-icon">
        <div class="circuit-node"></div>
        <div class="circuit-node small"></div>
        <div class="circuit-line"></div>
        <div class="chip-box">
          <span class="chip-pins">⬚ ⬚</span>
        </div>
      </div>
      <span class="logo-text">IoT</span>
    </div>
    
    <!-- Formulario de login -->
    <div class="login-card">
      <div class="login-header">
        <div class="login-icon">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h1>Sistema IoT</h1>
        <p class="subtitle">Monitoreo de Temperatura y Humedad</p>
      </div>
      
      <!-- Mensaje de error -->
      <div v-if="errorMessage" class="error-message slide-in">
        {{ errorMessage }}
      </div>
      
      <!-- Formulario -->
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username" class="label">Usuario</label>
          <input
            id="username"
            v-model="credentials.username"
            type="text"
            class="input"
            :class="{ 'input-error': hasError }"
            placeholder="Ingresa tu usuario"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password" class="label">Contraseña</label>
          <input
            id="password"
            v-model="credentials.password"
            type="password"
            class="input"
            :class="{ 'input-error': hasError }"
            placeholder="Ingresa tu contraseña"
            required
          />
        </div>
        
        <button 
          type="submit" 
          class="btn btn-primary btn-lg login-btn"
          :disabled="isLoading"
        >
          <div v-if="isLoading" class="loading-spinner"></div>
          <span v-else>Iniciar Sesión</span>
        </button>
      </form>
      
      <!-- Credenciales de demo -->
      <div class="demo-credentials">
        <p class="text-sm text-gray-500 text-center">
          <strong>Credenciales de demo:</strong><br>
          Usuario: <code>admin</code> | Contraseña: <code>admin123</code><br>
          Usuario: <code>operador</code> | Contraseña: <code>operador123</code>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'LoginView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const isLoading = ref(false)
    const errorMessage = ref('')
    const hasError = ref(false)
    
    const credentials = reactive({
      username: '',
      password: ''
    })
    
    // Inicializar usuarios al cargar la vista
    authStore.initializeUsers()
    
    const handleLogin = async () => {
      try {
        isLoading.value = true
        hasError.value = false
        errorMessage.value = ''
        
        // Validación básica
        if (!credentials.username || !credentials.password) {
          throw new Error('Por favor completa todos los campos')
        }
        
        // Simular delay de autenticación
        await new Promise(resolve => setTimeout(resolve, 800))
        
        const result = authStore.login(credentials.username, credentials.password)
        
        if (result.success) {
          // Login exitoso
          console.log('✅ Login exitoso')
          router.push('/dashboard')
        } else {
          // Login fallido
          throw new Error(result.message)
        }
        
      } catch (error) {
        hasError.value = true
        errorMessage.value = error.message
        console.error('❌ Error en login:', error.message)
      } finally {
        isLoading.value = false
      }
    }
    
    return {
      credentials,
      isLoading,
      errorMessage,
      hasError,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
}

/* Fondo con patrón de circuitos */
.circuit-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
    linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: drift 20s linear infinite;
  opacity: 0.3;
}

@keyframes drift {
  from { transform: translate(0, 0); }
  to { transform: translate(50px, 50px); }
}

/* Logo IoT de fondo */
.logo-background {
  position: absolute;
  left: 8%;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 2rem;
  opacity: 0.08;
  z-index: 1;
}

.logo-icon {
  width: 200px;
  height: 200px;
  position: relative;
}

.circuit-node {
  position: absolute;
  background: white;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  top: 20px;
  left: 20px;
}

.circuit-node.small {
  width: 40px;
  height: 40px;
  bottom: 40px;
  right: 40px;
  top: auto;
  left: auto;
}

.circuit-line {
  position: absolute;
  width: 120px;
  height: 4px;
  background: white;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
}

.chip-box {
  position: absolute;
  width: 80px;
  height: 60px;
  background: white;
  border-radius: 10px;
  bottom: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chip-pins {
  color: #0f172a;
  font-size: 20px;
  font-weight: bold;
}

.logo-text {
  font-size: 12rem;
  font-weight: bold;
  color: white;
  user-select: none;
}

/* Tarjeta de login */
.login-card {
  background: rgba(255, 255, 255, 0.95);
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  width: 400px;
  max-width: 90%;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 10;
  position: relative;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--primary-blue), var(--primary-dark));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: white;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
}

.login-header h1 {
  color: var(--gray-900);
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--gray-600);
  font-size: 0.875rem;
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger-red);
  padding: 0.75rem;
  border-radius: var(--border-radius);
  border: 1px solid rgba(239, 68, 68, 0.2);
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  text-align: center;
}

.login-form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.login-btn {
  width: 100%;
  font-size: 1rem;
  font-weight: 600;
  min-height: 48px;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.demo-credentials {
  text-align: center;
  padding: 1rem;
  background: var(--gray-50);
  border-radius: var(--border-radius);
  border: 1px solid var(--gray-200);
}

.demo-credentials code {
  background: var(--gray-200);
  padding: 0.125rem 0.25rem;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  color: var(--gray-800);
}

/* Responsive */
@media (max-width: 480px) {
  .login-card {
    padding: 2rem 1.5rem;
    margin: 1rem;
  }
  
  .logo-background {
    display: none;
  }
}
</style>