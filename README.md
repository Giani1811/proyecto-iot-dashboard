# 🌰 Sistema IoT Vue.js - Dashboard de Monitoreo

Sistema completo de monitoreo IoT desarrollado en Vue.js para visualizar datos de temperatura y humedad enviados por ESP32 con sensor DHT11, especializado en el almacenamiento óptimo de frutos secos.

## 🚀 Características

- ✅ **Autenticación local** con gestión CRUD de usuarios
- 📊 **Dashboard en tiempo real** con datos del ESP32
- 📈 **Gráficos históricos** con Chart.js
- 🎨 **Interfaz moderna** y responsive
- 🟢🟡🔴 **Estados visuales** sin alertas sonoras
- 🔥 **Integración Firebase** para datos IoT
- 👥 **Gestión colaborativa** de usuarios

## 🏗️ Tecnologías Utilizadas

- **Vue.js 3** (Composition API)
- **Vite** (Build tool)
- **Pinia** (State management)
- **Vue Router 4** (Routing)
- **Firebase** (Realtime Database)
- **Chart.js** (Gráficos)
- **CSS3** (Diseño moderno)

## 📦 Instalación

### Prerrequisitos

- Node.js 16+ 
- npm o yarn

### Pasos de instalación

1. **Clonar/descargar el proyecto**
   ```bash
   cd vue-iot-dashboard
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Verificar configuración Firebase**
   - El archivo `src/services/firebase.js` ya está configurado
   - Usar la configuración existente del ESP32

4. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

5. **Acceder a la aplicación**
   - Abrir http://localhost:3000
   - Usar credenciales de demo

## 🔐 Credenciales de Acceso

### Usuarios por defecto:
- **Admin**: `admin` / `admin123`
- **Operador**: `operador` / `operador123`

## 📱 Uso de la Aplicación

### 1. Login
- Ingresa credenciales en la pantalla de login
- Sistema valida contra localStorage
- Redirección automática al dashboard

### 2. Dashboard Principal
- **Tarjetas de sensores**: Muestran temperatura y humedad actuales
- **Estados visuales**: 
  - 🟢 Óptimo (Temp: 10-15°C, Humedad: 50-60%)
  - 🟡 Precaución (Temp: 15-20°C, Humedad: 60-65%)  
  - 🔴 Crítico (Temp: >20°C o <10°C, Humedad: >65% o <50%)
- **Gráficos históricos**: Tendencias en tiempo real
- **Estado de conexión**: Indicador del ESP32

### 3. Gestión de Usuarios
- **Ver usuarios**: Lista con información completa
- **Crear usuario**: Formulario con validación
- **Editar usuario**: Modificar datos existentes
- **Eliminar usuario**: Confirmación de seguridad
- **Buscar**: Filtro por nombre, usuario o email

## 🌡️ Rangos para Frutos Secos

### Condiciones Óptimas:
- **Temperatura**: 10-15°C
- **Humedad**: 50-60%

### Justificación:
- **< 50% humedad**: Los frutos se resecan
- **> 65% humedad**: Riesgo de moho y hongos
- **> 20°C**: Acelera la rancidez de aceites
- **< 10°C**: Puede causar condensación

## 🔧 Configuración Firebase

La aplicación está configurada para usar:

```javascript
// src/services/firebase.js
const firebaseConfig = {
  apiKey: "AIzaSyAmIVNKvQWuiAih8F_HJZ9GivYQtk3UmEc",
  authDomain: "monitor-iot-esp32.firebaseapp.com",
  databaseURL: "https://monitor-iot-esp32-default-rtdb.firebaseio.com",
  projectId: "monitor-iot-esp32",
  storageBucket: "monitor-iot-esp32.firebasestorage.app",
  messagingSenderId: "1068157465434",
  appId: "1:1068157465434:web:1d7375144d8849d22e3963"
}
```

### Endpoints esperados:
- `sensor/temperature` - Temperatura actual
- `sensor/humidity` - Humedad actual
- `sensor/timestamp` - Timestamp de última actualización

## 📂 Estructura del Proyecto

```
vue-iot-dashboard/
├── src/
│   ├── components/
│   │   ├── SensorCard.vue       # Tarjeta individual de sensor
│   │   └── ChartComponent.vue   # Gráficos con Chart.js
│   ├── views/
│   │   ├── LoginView.vue        # Página de autenticación
│   │   ├── DashboardView.vue    # Dashboard principal
│   │   └── UsersView.vue        # Gestión de usuarios
│   ├── stores/
│   │   ├── auth.js              # Store de autenticación
│   │   └── sensors.js           # Store de sensores
│   ├── services/
│   │   ├── firebase.js          # Configuración Firebase
│   │   └── sensors.js           # Servicio de sensores
│   ├── router/
│   │   └── index.js             # Configuración de rutas
│   ├── assets/
│   │   └── styles/
│   │       └── main.css         # Estilos principales
│   ├── App.vue                  # Componente raíz
│   └── main.js                  # Punto de entrada
├── package.json
├── vite.config.js
└── README.md
```

## 🎨 Características de Diseño

### Paleta de Colores:
- **Primario**: #3b82f6 (Azul)
- **Éxito**: #10b981 (Verde)
- **Advertencia**: #f59e0b (Amarillo)
- **Peligro**: #ef4444 (Rojo)

### Principios:
- **Minimalista**: Interfaz limpia
- **Responsivo**: Adaptable a móviles
- **Moderno**: Sombras y efectos suaves
- **Accesible**: Colores con buen contraste

## 🔄 Flujo de Datos

```
ESP32 → Firebase → Vue.js Store → Componentes → UI
```

1. **ESP32** envía datos cada 15 segundos
2. **Firebase** almacena en tiempo real
3. **Stores** (Pinia) manejan estado global
4. **Componentes** reaccionan a cambios
5. **UI** actualiza automáticamente

## 📊 Gestión de Estado

### Auth Store (`stores/auth.js`):
- Usuarios locales (localStorage)
- Login/logout
- CRUD de usuarios
- Persistencia de sesión

### Sensors Store (`stores/sensors.js`):
- Datos de sensores en tiempo real
- Historial para gráficos
- Estados de alerta
- Conexión con Firebase

## 🚨 Sistema de Alertas

### Solo Visuales (Sin Sonido):
- **Tarjetas de sensores**: Cambian de color
- **Indicadores de estado**: Puntos de colores
- **Mensajes de estado**: Texto descriptivo
- **Animaciones suaves**: Para estados críticos

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Construcción
npm run build

# Vista previa de build
npm run preview
```

## 🐛 Resolución de Problemas

### El dashboard no muestra datos:
1. Verificar que el ESP32 esté enviando datos
2. Revisar la consola de Firebase
3. Comprobar la configuración en `firebase.js`

### Error de autenticación:
1. Borrar localStorage del navegador
2. Usar credenciales correctas
3. Verificar que los usuarios estén inicializados

### Gráficos no aparecen:
1. Esperar a que lleguen datos del sensor
2. Verificar que Chart.js esté instalado
3. Revisar la consola por errores

## 🤝 Contribución

Este es un proyecto de demostración. Para contribuir:

1. Fork del repositorio
2. Crear rama de feature
3. Commit de cambios
4. Push a la rama
5. Crear Pull Request

## 📄 Licencia

MIT License - Ver archivo LICENSE para detalles

## 📞 Soporte

- **Documentación**: Ver `DOCUMENTACION_PROYECTO_VUE_IOT.md`
- **Issues**: Crear issue en el repositorio
- **Email**: desarrollo@iot-project.com

---

**Desarrollado con ❤️ para el monitoreo inteligente de frutos secos**