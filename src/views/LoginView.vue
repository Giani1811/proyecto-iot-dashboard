<template>
  <div class="login-container">
    <!-- Fondo con patrón de hojas -->
    <div class="leaves-pattern"></div>

    <!-- Elementos decorativos de fondo -->
    <div class="bg-decoration">
      <!-- Planta grande de fondo -->
      <div class="plant-illustration">
        <div class="plant-pot"></div>
        <div class="plant-stem"></div>
        <div class="plant-leaf left"></div>
        <div class="plant-leaf right"></div>
        <div class="plant-leaf top"></div>
        <!-- Sensores conectados -->
        <div class="sensor-indicator temp">
          <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C10.34 2 9 3.34 9 5v6.26c-1.19.65-2 1.89-2 3.34 0 2.21 1.79 4 4 4s4-1.79 4-4c0-1.45-.81-2.69-2-3.34V5c0-1.66-1.34-3-3-3zm1 14.6c0 .55-.45 1-1 1s-1-.45-1-1v-4.6c0-.55.45-1 1-1s1 .45 1 1v4.6z"/>
          </svg>
        </div>
        <div class="sensor-indicator humid">
          <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Formulario de login -->
    <div class="login-card">
      <div class="login-header">
        <div class="login-icon">
          <!-- Logo profesional: Planta con circuito IoT -->
          <svg width="52" height="52" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <!-- Gradientes para efecto moderno -->
              <linearGradient id="leafGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#74c69d;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#2d6a4f;stop-opacity:1" />
              </linearGradient>
              <linearGradient id="leafGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#95d5b2;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#52b788;stop-opacity:1" />
              </linearGradient>
              <linearGradient id="stemGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#52b788;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#2d6a4f;stop-opacity:1" />
              </linearGradient>
            </defs>

            <!-- Hoja principal izquierda (estilo monstera) -->
            <path d="M25 40 Q15 35 12 25 Q10 18 15 12 Q18 8 23 10 Q28 12 30 20 Q32 28 28 35 Q26 38 25 40 Z"
                  fill="url(#leafGradient1)" stroke="#1b4332" stroke-width="0.5" opacity="0.95"/>
            <!-- Nervadura hoja izquierda -->
            <path d="M18 16 Q22 22 24 32" stroke="#1b4332" stroke-width="0.8" opacity="0.4" stroke-linecap="round"/>

            <!-- Hoja principal derecha (estilo monstera) -->
            <path d="M55 40 Q65 35 68 25 Q70 18 65 12 Q62 8 57 10 Q52 12 50 20 Q48 28 52 35 Q54 38 55 40 Z"
                  fill="url(#leafGradient1)" stroke="#1b4332" stroke-width="0.5" opacity="0.95"/>
            <!-- Nervadura hoja derecha -->
            <path d="M62 16 Q58 22 56 32" stroke="#1b4332" stroke-width="0.8" opacity="0.4" stroke-linecap="round"/>

            <!-- Tallo central elegante -->
            <path d="M40 65 Q39 50 40 35 Q40 25 40 15"
                  stroke="url(#stemGradient)" stroke-width="2.5" stroke-linecap="round" fill="none"/>

            <!-- Hoja superior central (brote nuevo - más claro) -->
            <path d="M40 15 Q35 10 32 8 Q30 6 32 4 Q34 2 37 4 Q40 6 40 10 Z"
                  fill="url(#leafGradient2)" stroke="#2d6a4f" stroke-width="0.5"/>
            <path d="M40 15 Q45 10 48 8 Q50 6 48 4 Q46 2 43 4 Q40 6 40 10 Z"
                  fill="url(#leafGradient2)" stroke="#2d6a4f" stroke-width="0.5"/>

            <!-- Elementos IoT: Nodos de sensor -->
            <circle cx="25" cy="30" r="3" fill="#ffffff" opacity="0.9" stroke="#2d6a4f" stroke-width="1.5"/>
            <circle cx="25" cy="30" r="1.5" fill="#52b788"/>

            <circle cx="55" cy="30" r="3" fill="#ffffff" opacity="0.9" stroke="#2d6a4f" stroke-width="1.5"/>
            <circle cx="55" cy="30" r="1.5" fill="#52b788"/>

            <!-- Conexiones IoT (líneas de datos) -->
            <path d="M25 30 Q30 32 40 35" stroke="#52b788" stroke-width="1" stroke-dasharray="2,2" opacity="0.6"/>
            <path d="M55 30 Q50 32 40 35" stroke="#52b788" stroke-width="1" stroke-dasharray="2,2" opacity="0.6"/>

            <!-- Maceta moderna minimalista -->
            <path d="M30 65 L28 72 Q28 74 30 74 L50 74 Q52 74 52 72 L50 65 Z"
                  fill="#8b6f47" opacity="0.3" stroke="#6b5435" stroke-width="1"/>
          </svg>
          <div class="sensor-dots">
            <span class="dot temp-dot"></span>
            <span class="dot humid-dot"></span>
          </div>
        </div>
        <h1>PlantGuard IoT</h1>
        <p class="subtitle">Monitoreo Inteligente de Plantas</p>
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
  background: linear-gradient(135deg, #1a4d2e 0%, #2d6a4f 50%, #52b788 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
}

/* Fondo con patrón de hojas */
.leaves-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(82, 183, 136, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(45, 106, 79, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(116, 198, 157, 0.1) 0%, transparent 60%);
  animation: float 15s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

/* Decoración de fondo - Planta */
.bg-decoration {
  position: absolute;
  left: 10%;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  opacity: 0.12;
}

.plant-illustration {
  position: relative;
  width: 300px;
  height: 400px;
}

.plant-pot {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 80px;
  background: linear-gradient(180deg, #8b6f47 0%, #6b5435 100%);
  border-radius: 0 0 20px 20px;
  clip-path: polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%);
}

.plant-stem {
  position: absolute;
  bottom: 70px;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 150px;
  background: linear-gradient(90deg, #2d5016 0%, #4a7c30 50%, #2d5016 100%);
  border-radius: 6px;
}

.plant-leaf {
  position: absolute;
  width: 80px;
  height: 100px;
  background: linear-gradient(135deg, #52b788 0%, #2d6a4f 100%);
  border-radius: 50% 0%;
  animation: sway 4s ease-in-out infinite;
}

.plant-leaf.left {
  bottom: 150px;
  left: 40px;
  transform: rotate(-45deg);
  animation-delay: 0s;
}

.plant-leaf.right {
  bottom: 150px;
  right: 40px;
  transform: rotate(135deg);
  animation-delay: 1s;
}

.plant-leaf.top {
  bottom: 230px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  animation-delay: 2s;
}

@keyframes sway {
  0%, 100% { transform: translateX(-50%) rotate(45deg); }
  50% { transform: translateX(-50%) rotate(50deg); }
}

.sensor-indicator {
  position: absolute;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  animation: pulse 2s ease-in-out infinite;
}

.sensor-indicator.temp {
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  bottom: 120px;
  left: 20px;
}

.sensor-indicator.humid {
  background: linear-gradient(135deg, #4a9eff 0%, #0077b6 100%);
  bottom: 180px;
  right: 30px;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

/* Tarjeta de login */
.login-card {
  background: rgba(255, 255, 255, 0.95);
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  width: 400px;
  max-width: 90%;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  z-index: 10;
  position: relative;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-icon {
  width: 90px;
  height: 90px;
  background: linear-gradient(135deg, #52b788 0%, #2d6a4f 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: white;
  box-shadow: 0 8px 24px rgba(45, 106, 79, 0.4);
  position: relative;
}

.sensor-dots {
  position: absolute;
  bottom: 5px;
  right: 5px;
  display: flex;
  gap: 4px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid white;
}

.temp-dot {
  background: #ff6b35;
  animation: blink 1.5s ease-in-out infinite;
}

.humid-dot {
  background: #4a9eff;
  animation: blink 1.5s ease-in-out infinite 0.75s;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
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