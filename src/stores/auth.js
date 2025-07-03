import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    currentUser: null,
    users: []
  }),

  getters: {
    isAuthenticated: (state) => !!state.currentUser,
    allUsers: (state) => state.users
  },

  actions: {
    // Inicializar usuarios por defecto
    initializeUsers() {
      const defaultUsers = [
        {
          id: '1',
          username: 'admin',
          password: 'admin123',
          name: 'Administrador',
          email: 'admin@iot.com',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          username: 'operador',
          password: 'operador123',
          name: 'Operador Sistema',
          email: 'operador@iot.com',
          createdAt: new Date().toISOString()
        }
      ]

      // Cargar usuarios desde localStorage o usar defaults
      const savedUsers = localStorage.getItem('iot-users')
      this.users = savedUsers ? JSON.parse(savedUsers) : defaultUsers
      
      // Guardar users por defecto si no existen
      if (!savedUsers) {
        this.saveUsersToStorage()
      }

      // Verificar si hay usuario logueado
      const savedCurrentUser = localStorage.getItem('iot-current-user')
      if (savedCurrentUser) {
        this.currentUser = JSON.parse(savedCurrentUser)
      }
    },

    // Login
    login(username, password) {
      const user = this.users.find(u => 
        u.username === username && u.password === password
      )
      
      if (user) {
        this.currentUser = { ...user }
        this.currentUser.lastLogin = new Date().toISOString()
        
        // Actualizar usuario en la lista
        const userIndex = this.users.findIndex(u => u.id === user.id)
        if (userIndex !== -1) {
          this.users[userIndex].lastLogin = this.currentUser.lastLogin
        }
        
        // Guardar en localStorage
        localStorage.setItem('iot-current-user', JSON.stringify(this.currentUser))
        this.saveUsersToStorage()
        
        return { success: true }
      }
      
      return { success: false, message: 'Credenciales incorrectas' }
    },

    // Logout
    logout() {
      this.currentUser = null
      localStorage.removeItem('iot-current-user')
    },

    // Crear usuario
    createUser(userData) {
      // Verificar que username no exista
      if (this.users.find(u => u.username === userData.username)) {
        return { success: false, message: 'El nombre de usuario ya existe' }
      }

      const newUser = {
        id: Date.now().toString(),
        ...userData,
        createdAt: new Date().toISOString()
      }

      this.users.push(newUser)
      this.saveUsersToStorage()
      
      return { success: true, user: newUser }
    },

    // Actualizar usuario
    updateUser(id, userData) {
      const userIndex = this.users.findIndex(u => u.id === id)
      
      if (userIndex === -1) {
        return { success: false, message: 'Usuario no encontrado' }
      }

      // Verificar username único (excepto el mismo usuario)
      const existingUser = this.users.find(u => 
        u.username === userData.username && u.id !== id
      )
      
      if (existingUser) {
        return { success: false, message: 'El nombre de usuario ya existe' }
      }

      this.users[userIndex] = { ...this.users[userIndex], ...userData }
      
      // Si es el usuario actual, actualizar
      if (this.currentUser && this.currentUser.id === id) {
        this.currentUser = { ...this.users[userIndex] }
        localStorage.setItem('iot-current-user', JSON.stringify(this.currentUser))
      }
      
      this.saveUsersToStorage()
      return { success: true, user: this.users[userIndex] }
    },

    // Eliminar usuario
    deleteUser(id) {
      // No permitir eliminar el usuario actual
      if (this.currentUser && this.currentUser.id === id) {
        return { success: false, message: 'No puedes eliminar tu propio usuario' }
      }

      const userIndex = this.users.findIndex(u => u.id === id)
      
      if (userIndex === -1) {
        return { success: false, message: 'Usuario no encontrado' }
      }

      this.users.splice(userIndex, 1)
      this.saveUsersToStorage()
      
      return { success: true }
    },

    // Guardar en localStorage
    saveUsersToStorage() {
      localStorage.setItem('iot-users', JSON.stringify(this.users))
    }
  }
})