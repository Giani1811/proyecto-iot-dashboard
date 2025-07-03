<template>
  <div class="users-container">
    <!-- Header -->
    <header class="users-header">
      <div class="header-content">
        <div class="header-title">
          <router-link to="/dashboard" class="back-button">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Volver al Dashboard
          </router-link>
          <h1>
            <span class="header-icon">👥</span>
            Gestión de Usuarios
          </h1>
          <p class="header-subtitle">
            Administra las credenciales de acceso al sistema IoT
          </p>
        </div>
        
        <div class="header-actions">
          <button @click="openCreateModal" class="btn btn-primary">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Agregar Usuario
          </button>
        </div>
      </div>
    </header>

    <!-- Estadísticas -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">👤</div>
        <div class="stat-content">
          <div class="stat-value">{{ totalUsers }}</div>
          <div class="stat-label">Total Usuarios</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <div class="stat-value">{{ activeUsers }}</div>
          <div class="stat-label">Usuarios Activos</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">⚡</div>
        <div class="stat-content">
          <div class="stat-value">{{ currentUser?.name || 'N/A' }}</div>
          <div class="stat-label">Usuario Actual</div>
        </div>
      </div>
    </div>

    <!-- Lista de usuarios -->
    <div class="users-section">
      <div class="section-header">
        <h2>Lista de Usuarios</h2>
        <div class="search-box">
          <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar usuarios..."
            class="search-input"
          />
        </div>
      </div>
      
      <div class="users-grid">
        <div
          v-for="user in filteredUsers"
          :key="user.id"
          class="user-card"
          :class="{ 'current-user': user.id === currentUser?.id }"
        >
          <div class="user-avatar">
            <span>{{ getUserInitials(user.name) }}</span>
          </div>
          
          <div class="user-info">
            <h3 class="user-name">{{ user.name }}</h3>
            <p class="user-username">@{{ user.username }}</p>
            <p class="user-email">{{ user.email }}</p>
            <div class="user-meta">
              <span class="created-date">
                Creado: {{ formatDate(user.createdAt) }}
              </span>
              <span v-if="user.lastLogin" class="last-login">
                Último acceso: {{ formatDate(user.lastLogin) }}
              </span>
            </div>
          </div>
          
          <div class="user-actions">
            <button
              @click="openEditModal(user)"
              class="btn btn-sm btn-secondary"
              title="Editar usuario"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
            
            <button
              v-if="user.id !== currentUser?.id"
              @click="confirmDelete(user)"
              class="btn btn-sm btn-danger"
              title="Eliminar usuario"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
            
            <div v-else class="current-user-badge">
              <span>Tú</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para crear/editar usuario -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditing ? 'Editar Usuario' : 'Crear Usuario' }}</h3>
          <button @click="closeModal" class="modal-close">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="handleSubmit" class="modal-form">
          <div class="form-group">
            <label for="name" class="label">Nombre completo</label>
            <input
              id="name"
              v-model="userForm.name"
              type="text"
              class="input"
              :class="{ 'input-error': formErrors.name }"
              placeholder="Nombre completo del usuario"
              required
            />
            <span v-if="formErrors.name" class="error-text">{{ formErrors.name }}</span>
          </div>
          
          <div class="form-group">
            <label for="username" class="label">Nombre de usuario</label>
            <input
              id="username"
              v-model="userForm.username"
              type="text"
              class="input"
              :class="{ 'input-error': formErrors.username }"
              placeholder="Nombre único de usuario"
              required
            />
            <span v-if="formErrors.username" class="error-text">{{ formErrors.username }}</span>
          </div>
          
          <div class="form-group">
            <label for="email" class="label">Correo electrónico</label>
            <input
              id="email"
              v-model="userForm.email"
              type="email"
              class="input"
              :class="{ 'input-error': formErrors.email }"
              placeholder="correo@ejemplo.com"
              required
            />
            <span v-if="formErrors.email" class="error-text">{{ formErrors.email }}</span>
          </div>
          
          <div class="form-group">
            <label for="password" class="label">Contraseña</label>
            <input
              id="password"
              v-model="userForm.password"
              type="password"
              class="input"
              :class="{ 'input-error': formErrors.password }"
              :placeholder="isEditing ? 'Dejar vacío para mantener actual' : 'Contraseña del usuario'"
              :required="!isEditing"
            />
            <span v-if="formErrors.password" class="error-text">{{ formErrors.password }}</span>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              <div v-if="isSubmitting" class="loading-spinner"></div>
              <span v-else>{{ isEditing ? 'Actualizar' : 'Crear' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de confirmación para eliminar -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content delete-modal" @click.stop>
        <div class="modal-header">
          <h3>Confirmar Eliminación</h3>
        </div>
        
        <div class="modal-body">
          <p>¿Estás seguro de que quieres eliminar al usuario <strong>{{ userToDelete?.name }}</strong>?</p>
          <p class="text-sm text-gray-600">Esta acción no se puede deshacer.</p>
        </div>
        
        <div class="form-actions">
          <button @click="closeDeleteModal" class="btn btn-secondary">
            Cancelar
          </button>
          <button @click="deleteUser" class="btn btn-danger" :disabled="isDeleting">
            <div v-if="isDeleting" class="loading-spinner"></div>
            <span v-else>Eliminar</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Notificaciones -->
    <div v-if="notification" class="notification" :class="`notification-${notification.type}`">
      <span>{{ notification.message }}</span>
      <button @click="clearNotification" class="notification-close">×</button>
    </div>
  </div>
</template>

<script>
import { ref, computed, reactive, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'UsersView',
  setup() {
    const authStore = useAuthStore()
    
    // Estado reactivo
    const searchQuery = ref('')
    const showModal = ref(false)
    const showDeleteModal = ref(false)
    const isEditing = ref(false)
    const isSubmitting = ref(false)
    const isDeleting = ref(false)
    const editingUser = ref(null)
    const userToDelete = ref(null)
    const notification = ref(null)
    
    const userForm = reactive({
      name: '',
      username: '',
      email: '',
      password: ''
    })
    
    const formErrors = reactive({
      name: '',
      username: '',
      email: '',
      password: ''
    })
    
    // Computadas
    const currentUser = computed(() => authStore.currentUser)
    const allUsers = computed(() => authStore.allUsers)
    const totalUsers = computed(() => allUsers.value.length)
    const activeUsers = computed(() => allUsers.value.filter(user => user.lastLogin).length)
    
    const filteredUsers = computed(() => {
      if (!searchQuery.value) return allUsers.value
      
      const query = searchQuery.value.toLowerCase()
      return allUsers.value.filter(user => 
        user.name.toLowerCase().includes(query) ||
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      )
    })
    
    // Métodos
    const getUserInitials = (name) => {
      if (!name) return 'U'
      return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return 'Nunca'
      return new Date(dateString).toLocaleString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    const clearForm = () => {
      userForm.name = ''
      userForm.username = ''
      userForm.email = ''
      userForm.password = ''
      clearErrors()
    }
    
    const clearErrors = () => {
      formErrors.name = ''
      formErrors.username = ''
      formErrors.email = ''
      formErrors.password = ''
    }
    
    const validateForm = () => {
      clearErrors()
      let isValid = true
      
      if (!userForm.name.trim()) {
        formErrors.name = 'El nombre es requerido'
        isValid = false
      }
      
      if (!userForm.username.trim()) {
        formErrors.username = 'El nombre de usuario es requerido'
        isValid = false
      }
      
      if (!userForm.email.trim()) {
        formErrors.email = 'El correo electrónico es requerido'
        isValid = false
      }
      
      if (!isEditing.value && !userForm.password.trim()) {
        formErrors.password = 'La contraseña es requerida'
        isValid = false
      }
      
      if (userForm.password && userForm.password.length < 6) {
        formErrors.password = 'La contraseña debe tener al menos 6 caracteres'
        isValid = false
      }
      
      return isValid
    }
    
    const showNotification = (message, type = 'success') => {
      notification.value = { message, type }
      setTimeout(() => {
        notification.value = null
      }, 5000)
    }
    
    const clearNotification = () => {
      notification.value = null
    }
    
    const openCreateModal = () => {
      isEditing.value = false
      editingUser.value = null
      clearForm()
      showModal.value = true
    }
    
    const openEditModal = (user) => {
      isEditing.value = true
      editingUser.value = user
      userForm.name = user.name
      userForm.username = user.username
      userForm.email = user.email
      userForm.password = ''
      clearErrors()
      showModal.value = true
    }
    
    const closeModal = () => {
      showModal.value = false
      clearForm()
    }
    
    const confirmDelete = (user) => {
      userToDelete.value = user
      showDeleteModal.value = true
    }
    
    const closeDeleteModal = () => {
      showDeleteModal.value = false
      userToDelete.value = null
    }
    
    const handleSubmit = async () => {
      if (!validateForm()) return
      
      try {
        isSubmitting.value = true
        
        const userData = {
          name: userForm.name.trim(),
          username: userForm.username.trim(),
          email: userForm.email.trim()
        }
        
        if (userForm.password) {
          userData.password = userForm.password
        }
        
        let result
        
        if (isEditing.value) {
          result = authStore.updateUser(editingUser.value.id, userData)
        } else {
          userData.password = userForm.password
          result = authStore.createUser(userData)
        }
        
        if (result.success) {
          showNotification(
            isEditing.value ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente'
          )
          closeModal()
        } else {
          showNotification(result.message, 'error')
        }
        
      } catch (error) {
        showNotification('Error al procesar la solicitud', 'error')
      } finally {
        isSubmitting.value = false
      }
    }
    
    const deleteUser = async () => {
      if (!userToDelete.value) return
      
      try {
        isDeleting.value = true
        
        const result = authStore.deleteUser(userToDelete.value.id)
        
        if (result.success) {
          showNotification('Usuario eliminado correctamente')
          closeDeleteModal()
        } else {
          showNotification(result.message, 'error')
        }
        
      } catch (error) {
        showNotification('Error al eliminar el usuario', 'error')
      } finally {
        isDeleting.value = false
      }
    }
    
    // Lifecycle
    onMounted(() => {
      authStore.initializeUsers()
    })
    
    return {
      // Estado
      searchQuery,
      showModal,
      showDeleteModal,
      isEditing,
      isSubmitting,
      isDeleting,
      userForm,
      formErrors,
      userToDelete,
      notification,
      
      // Computadas
      currentUser,
      allUsers,
      totalUsers,
      activeUsers,
      filteredUsers,
      
      // Métodos
      getUserInitials,
      formatDate,
      openCreateModal,
      openEditModal,
      closeModal,
      confirmDelete,
      closeDeleteModal,
      handleSubmit,
      deleteUser,
      clearNotification
    }
  }
}
</script>

<style scoped>
.users-container {
  min-height: 100vh;
  background: var(--bg-secondary);
  padding: var(--space-lg);
}

/* Header */
.users-header {
  background: var(--bg-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-lg);
  margin-bottom: var(--space-lg);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: var(--space-lg);
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  color: var(--primary-blue);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: var(--space-sm);
  transition: color 0.2s ease;
}

.back-button:hover {
  color: var(--primary-dark);
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

/* Estadísticas */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-lg);
  margin-bottom: var(--space-lg);
}

.stat-card {
  background: var(--bg-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-lg);
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.stat-icon {
  font-size: 2.5rem;
  opacity: 0.8;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray-900);
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--gray-600);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Sección de usuarios */
.users-section {
  background: var(--bg-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-lg);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
  gap: var(--space-lg);
}

.section-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--gray-900);
}

.search-box {
  position: relative;
  max-width: 300px;
  flex: 1;
}

.search-icon {
  position: absolute;
  left: var(--space-md);
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--gray-400);
}

.search-input {
  width: 100%;
  padding: var(--space-sm) var(--space-sm) var(--space-sm) 2.5rem;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Grid de usuarios */
.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--space-lg);
}

.user-card {
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius-lg);
  padding: var(--space-lg);
  transition: all 0.2s ease;
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
}

.user-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-blue);
}

.user-card.current-user {
  border-color: var(--primary-blue);
  background: rgba(59, 130, 246, 0.02);
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
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: var(--space-xs);
}

.user-username {
  font-size: 0.875rem;
  color: var(--primary-blue);
  font-weight: 500;
  margin-bottom: var(--space-xs);
}

.user-email {
  font-size: 0.875rem;
  color: var(--gray-600);
  margin-bottom: var(--space-sm);
  word-break: break-word;
}

.user-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.created-date,
.last-login {
  font-size: 0.75rem;
  color: var(--gray-500);
}

.user-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  flex-shrink: 0;
}

.current-user-badge {
  background: var(--primary-blue);
  color: white;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--border-radius);
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
}

/* Modales */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-lg);
}

.modal-content {
  background: var(--bg-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-lg);
  border-bottom: 1px solid var(--gray-200);
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--gray-900);
}

.modal-close {
  background: none;
  border: none;
  color: var(--gray-400);
  cursor: pointer;
  padding: var(--space-xs);
  border-radius: var(--border-radius);
  transition: all 0.2s ease;
}

.modal-close:hover {
  color: var(--gray-600);
  background: var(--gray-100);
}

.modal-form {
  padding: var(--space-lg);
}

.modal-body {
  padding: var(--space-lg);
}

.form-group {
  margin-bottom: var(--space-lg);
}

.error-text {
  display: block;
  color: var(--danger-red);
  font-size: 0.75rem;
  margin-top: var(--space-xs);
}

.form-actions {
  display: flex;
  gap: var(--space-md);
  justify-content: flex-end;
  margin-top: var(--space-xl);
}

.delete-modal {
  max-width: 400px;
}

/* Notificaciones */
.notification {
  position: fixed;
  top: var(--space-lg);
  right: var(--space-lg);
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  display: flex;
  align-items: center;
  gap: var(--space-md);
  z-index: 1100;
  animation: slideIn 0.3s ease-out;
}

.notification-success {
  background: var(--success-green);
  color: white;
}

.notification-error {
  background: var(--danger-red);
  color: white;
}

.notification-close {
  background: none;
  border: none;
  color: currentColor;
  cursor: pointer;
  font-size: 1.25rem;
  line-height: 1;
  opacity: 0.8;
}

.notification-close:hover {
  opacity: 1;
}

/* Responsive */
@media (max-width: 768px) {
  .users-container {
    padding: var(--space-md);
  }
  
  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-md);
  }
  
  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-md);
  }
  
  .users-grid {
    grid-template-columns: 1fr;
  }
  
  .user-card {
    flex-direction: column;
    text-align: center;
  }
  
  .user-actions {
    flex-direction: row;
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: var(--space-sm);
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .notification {
    left: var(--space-sm);
    right: var(--space-sm);
    top: var(--space-sm);
  }
}
</style>