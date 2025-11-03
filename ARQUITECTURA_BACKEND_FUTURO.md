# 🏗️ Arquitectura Backend Propio - Planificación Futura

**Documento de planificación para migración de Firebase a backend propio**
**Fecha:** Noviembre 2025
**Estado:** Pendiente de implementación - Prototipo actual usa Firebase

---

## 📋 Índice

1. [Arquitectura Actual](#arquitectura-actual)
2. [Arquitectura Propuesta (Backend Propio)](#arquitectura-propuesta)
3. [Comparación Detallada](#comparación-detallada)
4. [Implementación en Railway](#implementación-en-railway)
5. [Modificaciones Necesarias](#modificaciones-necesarias)
6. [Plan de Migración](#plan-de-migración)
7. [Costos y Recursos](#costos-y-recursos)

---

## 📊 Arquitectura Actual

### Flujo de Datos Actual (Firebase)

```
ESP32 (8 sensores)
      ↓ WiFi
      ↓ Firebase SDK
Firebase Realtime Database
      ↓ WebSocket Listener (onValue)
Vue.js Dashboard (Pinia Store)
      ↓
Usuario final
```

### Componentes Actuales

#### 1. Hardware IoT
- **ESP32** (Microcontrolador)
- **DHT11** (Pin 13) - Temperatura y humedad del aire
- **DHT22** (Pin 12) - Temperatura y humedad del aire
- **3x DS18B20** (Pin 4) - Temperatura del suelo (Azul, Negro, Blanco)
- **3x Sensores Capacitivos** (Pins 32, 34, 35) - Humedad del suelo

#### 2. Firebase (Solo Realtime Database)
- **Propósito:** Almacenamiento temporal de datos en tiempo real
- **NO se usa:** Firebase Authentication, Functions, Hosting
- **Estructura de datos:**
  ```
  sensor/
  ├── dht11/
  │   ├── temperature
  │   └── humidity
  ├── dht22/
  │   ├── temperature
  │   └── humidity
  ├── ds18b20/
  │   ├── azul/temperature
  │   ├── negro/temperature
  │   └── blanco/temperature
  ├── soil/
  │   ├── azul/ {humidity, raw}
  │   ├── negro/ {humidity, raw}
  │   └── blanco/ {humidity, raw}
  └── timestamp
  ```

#### 3. Frontend (Vue.js)
- **Autenticación:** LOCAL con localStorage (NO Firebase Auth)
- **Estado:** Pinia Store
- **Comunicación:** Firebase SDK (onValue listeners)
- **Despliegue:** Vercel

### Limitaciones Actuales

1. **Sin datos históricos persistentes** - Firebase Realtime DB solo guarda estado actual
2. **Sin análisis de tendencias** - No hay consultas complejas
3. **Dependencia de Firebase** - Cambios en precios o políticas afectan el proyecto
4. **Sin alertas automáticas** - No hay backend para procesar lógica
5. **Sin exportación de datos** - No se pueden generar reportes
6. **Escalabilidad limitada** - Difícil agregar funcionalidades complejas

---

## 🚀 Arquitectura Propuesta (Backend Propio)

### Flujo de Datos con Backend Propio

```
ESP32 (8 sensores)
      ↓ HTTP POST cada 15 segundos
      ↓ https://tu-app.railway.app/api/sensor-data
Backend Node.js (Railway)
      ├── API REST (Express.js)
      ├── Base de Datos (PostgreSQL)
      ├── WebSocket Server (Socket.io)
      ├── Servicios de Alertas
      └── Procesamiento de Datos
      ↓ WebSocket + API REST
Vue.js Dashboard
      ↓
Usuario final
```

### Stack Tecnológico Propuesto

#### Backend
- **Node.js** v20+
- **Express.js** - Framework web
- **Socket.io** - WebSockets para tiempo real
- **PostgreSQL** - Base de datos relacional
- **Prisma** - ORM para PostgreSQL
- **JWT** - Autenticación robusta
- **Node-cron** - Tareas programadas
- **Nodemailer** - Envío de alertas por email

#### Infraestructura
- **Railway** - Hosting del backend
- **PostgreSQL en Railway** - Base de datos
- **Vercel** - Frontend (sin cambios)

---

## 🔧 Implementación en Railway

### Paso 1: Estructura del Proyecto Backend

```
backend-iot/
├── src/
│   ├── server.js                 # Servidor principal
│   ├── config/
│   │   ├── database.js          # Configuración PostgreSQL
│   │   └── socket.js            # Configuración Socket.io
│   ├── routes/
│   │   ├── sensors.js           # POST /api/sensor-data
│   │   ├── history.js           # GET /api/history
│   │   └── auth.js              # Login, registro
│   ├── controllers/
│   │   ├── sensorController.js  # Lógica de sensores
│   │   └── authController.js    # Lógica de autenticación
│   ├── models/
│   │   ├── SensorReading.js     # Modelo de lectura
│   │   └── User.js              # Modelo de usuario
│   ├── services/
│   │   ├── socketService.js     # Emitir datos en tiempo real
│   │   ├── alertService.js      # Sistema de alertas
│   │   └── analyticsService.js  # Análisis de datos
│   └── middleware/
│       ├── auth.js              # Verificar JWT
│       └── validation.js        # Validar datos
├── prisma/
│   └── schema.prisma            # Esquema de base de datos
├── .env
├── package.json
└── README.md
```

### Paso 2: Código del Servidor Principal

```javascript
// src/server.js
const express = require('express')
const cors = require('cors')
const { createServer } = require('http')
const { Server } = require('socket.io')
const { PrismaClient } = require('@prisma/client')

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST']
  }
})

const prisma = new PrismaClient()

// Middleware
app.use(cors())
app.use(express.json())

// Rutas
app.use('/api/sensors', require('./routes/sensors'))
app.use('/api/history', require('./routes/history'))
app.use('/api/auth', require('./routes/auth'))

// Socket.io para tiempo real
io.on('connection', (socket) => {
  console.log('✅ Dashboard conectado:', socket.id)

  // Enviar últimos datos al conectarse
  socket.on('request-latest', async () => {
    const latest = await prisma.sensorReading.findFirst({
      orderBy: { timestamp: 'desc' }
    })
    socket.emit('latest-data', latest)
  })

  socket.on('disconnect', () => {
    console.log('❌ Dashboard desconectado:', socket.id)
  })
})

// Hacer io disponible para los controladores
app.set('io', io)

const PORT = process.env.PORT || 3000
httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`)
})
```

### Paso 3: Endpoint para Recibir Datos del ESP32

```javascript
// src/routes/sensors.js
const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// POST /api/sensor-data
// Este endpoint recibe los datos del ESP32
router.post('/sensor-data', async (req, res) => {
  try {
    const { dht11, dht22, ds18b20, soil, timestamp } = req.body

    // Validar datos
    if (!dht11 || !dht22 || !ds18b20 || !soil) {
      return res.status(400).json({ error: 'Datos incompletos' })
    }

    // Guardar en base de datos
    const reading = await prisma.sensorReading.create({
      data: {
        // Sensores de aire
        dht11_temperature: dht11.temperature,
        dht11_humidity: dht11.humidity,
        dht22_temperature: dht22.temperature,
        dht22_humidity: dht22.humidity,

        // Sensores de temperatura del suelo
        ds18b20_azul_temp: ds18b20.azul.temperature,
        ds18b20_negro_temp: ds18b20.negro.temperature,
        ds18b20_blanco_temp: ds18b20.blanco.temperature,

        // Sensores de humedad del suelo
        soil_azul_humidity: soil.azul.humidity,
        soil_azul_raw: soil.azul.raw,
        soil_negro_humidity: soil.negro.humidity,
        soil_negro_raw: soil.negro.raw,
        soil_blanco_humidity: soil.blanco.humidity,
        soil_blanco_raw: soil.blanco.raw,

        timestamp: new Date()
      }
    })

    // Emitir a todos los dashboards conectados en tiempo real
    const io = req.app.get('io')
    io.emit('sensor-update', reading)

    // Verificar si hay condiciones de alerta
    await checkAlerts(reading)

    res.json({ success: true, id: reading.id })

  } catch (error) {
    console.error('Error guardando datos:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Función para verificar alertas
async function checkAlerts(reading) {
  const alerts = []

  // Ejemplo: Temperatura muy alta
  if (reading.dht11_temperature > 30) {
    alerts.push({
      type: 'critical',
      sensor: 'DHT11',
      message: `Temperatura crítica: ${reading.dht11_temperature}°C`
    })
  }

  // Ejemplo: Humedad del suelo muy baja
  if (reading.soil_azul_humidity < 30) {
    alerts.push({
      type: 'warning',
      sensor: 'Suelo Azul',
      message: `Humedad baja: ${reading.soil_azul_humidity}%`
    })
  }

  // Enviar alertas por email si hay
  if (alerts.length > 0) {
    // Implementar envío de emails con Nodemailer
    console.log('🚨 Alertas detectadas:', alerts)
  }
}

module.exports = router
```

### Paso 4: Esquema de Base de Datos (Prisma)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model SensorReading {
  id        Int      @id @default(autoincrement())
  timestamp DateTime @default(now())

  // Sensores DHT (aire)
  dht11_temperature  Float
  dht11_humidity     Float
  dht22_temperature  Float
  dht22_humidity     Float

  // Sensores DS18B20 (temperatura suelo)
  ds18b20_azul_temp   Float
  ds18b20_negro_temp  Float
  ds18b20_blanco_temp Float

  // Sensores de humedad del suelo
  soil_azul_humidity   Int
  soil_azul_raw        Int
  soil_negro_humidity  Int
  soil_negro_raw       Int
  soil_blanco_humidity Int
  soil_blanco_raw      Int

  @@index([timestamp])
}

model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  email     String   @unique
  password  String   // Hasheado con bcrypt
  role      String   @default("operador")
  createdAt DateTime @default(now())
}

model Alert {
  id        Int      @id @default(autoincrement())
  type      String   // 'critical', 'warning', 'info'
  sensor    String
  message   String
  timestamp DateTime @default(now())
  resolved  Boolean  @default(false)
}
```

### Paso 5: Modificación del Código ESP32

```cpp
// Cambiar de Firebase a HTTP POST
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// URL del backend en Railway
#define BACKEND_URL "https://tu-app.railway.app/api/sensor-data"

void enviarDatosBackend() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(BACKEND_URL);
    http.addHeader("Content-Type", "application/json");

    // Crear JSON con los datos
    StaticJsonDocument<1024> doc;

    // DHT11
    JsonObject dht11 = doc.createNestedObject("dht11");
    dht11["temperature"] = t11;
    dht11["humidity"] = h11;

    // DHT22
    JsonObject dht22 = doc.createNestedObject("dht22");
    dht22["temperature"] = t22;
    dht22["humidity"] = h22;

    // DS18B20
    JsonObject ds18b20 = doc.createNestedObject("ds18b20");
    JsonObject azul = ds18b20.createNestedObject("azul");
    azul["temperature"] = tempAzul;
    JsonObject negro = ds18b20.createNestedObject("negro");
    negro["temperature"] = tempNegro;
    JsonObject blanco = ds18b20.createNestedObject("blanco");
    blanco["temperature"] = tempBlanco;

    // Sensores de suelo
    JsonObject soil = doc.createNestedObject("soil");
    JsonObject soilAzul = soil.createNestedObject("azul");
    soilAzul["humidity"] = humedadSueloAzul;
    soilAzul["raw"] = valorSueloAzul;
    JsonObject soilNegro = soil.createNestedObject("negro");
    soilNegro["humidity"] = humedadSueloNegro;
    soilNegro["raw"] = valorSueloNegro;
    JsonObject soilBlanco = soil.createNestedObject("blanco");
    soilBlanco["humidity"] = humedadSueloBlanco;
    soilBlanco["raw"] = valorSueloBlanco;

    doc["timestamp"] = millis();

    // Convertir a String
    String jsonString;
    serializeJson(doc, jsonString);

    // Enviar POST
    int httpCode = http.POST(jsonString);

    if (httpCode == 200) {
      Serial.println("✅ Datos enviados correctamente");
    } else {
      Serial.printf("❌ Error HTTP: %d\n", httpCode);
    }

    http.end();
  }
}
```

### Paso 6: Modificación del Frontend Vue.js

```javascript
// src/services/backendService.js (NUEVO)
import { io } from 'socket.io-client'
import axios from 'axios'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://tu-app.railway.app'

class BackendService {
  constructor() {
    this.socket = null
    this.apiClient = axios.create({
      baseURL: BACKEND_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  // Conectar WebSocket para datos en tiempo real
  connect() {
    this.socket = io(BACKEND_URL)

    this.socket.on('connect', () => {
      console.log('✅ Conectado al backend')
      // Solicitar últimos datos
      this.socket.emit('request-latest')
    })

    return this.socket
  }

  // Suscribirse a actualizaciones
  onSensorUpdate(callback) {
    if (this.socket) {
      this.socket.on('sensor-update', callback)
    }
  }

  // Obtener datos históricos
  async getHistory(hours = 24) {
    try {
      const response = await this.apiClient.get(`/api/history?hours=${hours}`)
      return response.data
    } catch (error) {
      console.error('Error obteniendo historial:', error)
      throw error
    }
  }

  // Login
  async login(username, password) {
    const response = await this.apiClient.post('/api/auth/login', {
      username,
      password
    })
    return response.data
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
    }
  }
}

export const backendService = new BackendService()
```

---

## 📊 Comparación Detallada

### Firebase vs Backend Propio

| Característica | Firebase (Actual) | Backend Propio (Propuesto) |
|----------------|-------------------|----------------------------|
| **Setup inicial** | 5 minutos | 1-2 horas |
| **Costo mensual** | Gratis (hasta 1GB) | ~$5-10/mes |
| **Datos históricos** | ❌ Solo estado actual | ✅ PostgreSQL ilimitado |
| **Consultas complejas** | ❌ Limitadas | ✅ SQL completo |
| **Control total** | ❌ Limitado por Google | ✅ 100% control |
| **Alertas automáticas** | ❌ No | ✅ Email, SMS, Push |
| **Exportar datos** | ❌ Manual | ✅ CSV, Excel, PDF |
| **Análisis avanzado** | ❌ No | ✅ Tendencias, ML |
| **Autenticación** | Firebase Auth | ✅ JWT, roles personalizados |
| **Escalabilidad** | Automática | Manual pero flexible |
| **Dependencia** | Google Firebase | Propia |
| **Modificar ESP32** | No necesario | Sí (cambiar a HTTP) |
| **Mantenimiento** | Mínimo | Medio |
| **Velocidad** | Muy rápida | Rápida |
| **Downtime** | Raro | Depende de Railway |

### Ventajas del Backend Propio

#### 1. Datos Históricos Persistentes
```sql
-- Consultar promedio de temperatura por día
SELECT
  DATE(timestamp) as fecha,
  AVG(dht11_temperature) as temp_promedio
FROM SensorReading
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY DATE(timestamp)
ORDER BY fecha DESC;
```

#### 2. Sistema de Alertas Automático
- Email cuando temperatura > 30°C
- SMS cuando humedad del suelo < 20%
- Push notifications en la app
- Integración con Telegram/WhatsApp

#### 3. Reportes y Exportación
- Generar PDF con datos del mes
- Exportar a CSV para análisis
- Gráficos avanzados con D3.js
- Dashboard de administrador

#### 4. API REST Completa
```javascript
// Endpoints adicionales
GET  /api/history?hours=24           // Historial
GET  /api/statistics                 // Estadísticas
GET  /api/alerts                     // Alertas activas
POST /api/alerts/:id/resolve         // Resolver alerta
GET  /api/export/csv?start=...&end=  // Exportar
POST /api/users                      // Crear usuario
```

#### 5. Autenticación Robusta
- JWT con refresh tokens
- Roles: admin, operador, viewer
- Permisos granulares
- Sesiones seguras

---

## 🗓️ Plan de Migración

### Fase 1: Preparación (Semana 1-2)
- [ ] Crear repositorio del backend
- [ ] Configurar Railway y PostgreSQL
- [ ] Implementar servidor básico Express
- [ ] Crear esquema de base de datos con Prisma
- [ ] Configurar Socket.io

### Fase 2: Backend (Semana 3-4)
- [ ] Implementar endpoint POST /api/sensor-data
- [ ] Implementar WebSocket para tiempo real
- [ ] Crear endpoints de historial
- [ ] Sistema básico de alertas
- [ ] Tests unitarios

### Fase 3: Migración ESP32 (Semana 5)
- [ ] Modificar código ESP32 para HTTP POST
- [ ] Probar conectividad con backend
- [ ] Dual-mode: Firebase + Backend (transición)
- [ ] Monitorear estabilidad

### Fase 4: Frontend (Semana 6-7)
- [ ] Crear servicio Socket.io en Vue
- [ ] Migrar store de Pinia
- [ ] Implementar login con JWT
- [ ] Actualizar componentes
- [ ] Tests E2E

### Fase 5: Despliegue y Transición (Semana 8)
- [ ] Deploy a producción
- [ ] Monitoreo durante 1 semana (dual-mode)
- [ ] Migrar usuarios a nuevo sistema
- [ ] Desactivar Firebase
- [ ] Documentación final

---

## 💰 Costos y Recursos

### Railway (Backend + PostgreSQL)
- **Starter Plan:** $5/mes
- **PostgreSQL:** Incluido
- **500GB bandwidth:** Incluido
- **Escalable:** Hasta Hobby ($20/mes)

### Vercel (Frontend)
- **Gratis:** Para proyectos personales
- **100GB bandwidth:** Incluido

### Servicios Adicionales (Opcionales)
- **SendGrid:** Email gratuito hasta 100/día
- **Twilio:** SMS (~$0.01 por mensaje)
- **Sentry:** Monitoreo de errores (gratis hasta 5k eventos/mes)

### Total Estimado
- **Prototipo/Desarrollo:** $0/mes (Railway y Vercel free tier)
- **Producción:** $5-10/mes
- **Con alertas SMS:** $10-20/mes

---

## 📚 Recursos y Referencias

### Documentación
- [Railway Docs](https://docs.railway.app/)
- [Prisma PostgreSQL](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [Socket.io Docs](https://socket.io/docs/v4/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

### Tutoriales Recomendados
- [Node.js + PostgreSQL REST API](https://blog.logrocket.com/nodejs-expressjs-postgresql-crud-rest-api-example/)
- [Socket.io Real-time App](https://socket.io/get-started/chat)
- [JWT Authentication](https://www.digitalocean.com/community/tutorials/nodejs-jwt-expressjs)

### Herramientas
- **Postman:** Testing de API
- **Prisma Studio:** Admin de base de datos
- **Socket.io Client Test:** Test de WebSockets
- **Railway CLI:** Deploy desde terminal

---

## ✅ Checklist de Decisión

### ¿Cuándo migrar a backend propio?

Migra cuando necesites:
- ✅ Almacenar datos históricos por meses/años
- ✅ Hacer análisis de tendencias y patrones
- ✅ Enviar alertas automáticas por email/SMS
- ✅ Exportar reportes y datos
- ✅ Control total sobre la infraestructura
- ✅ API personalizada para integraciones
- ✅ Autenticación con roles complejos
- ✅ Reducir dependencia de servicios de terceros

Mantén Firebase si:
- ❌ Solo necesitas ver datos actuales
- ❌ No requieres historial a largo plazo
- ❌ El proyecto es temporal/prototipo
- ❌ No tienes recursos para mantener servidor

---

## 🎯 Conclusión

**Estado Actual:** El prototipo con Firebase es perfecto para desarrollo y pruebas iniciales.

**Plan Futuro:** Cuando el proyecto entre en producción y necesite análisis de datos, alertas automáticas y funcionalidades avanzadas, la migración a backend propio en Railway será la mejor opción.

**Recomendación:** Mantener Firebase durante fase de prototipo (3-6 meses) y evaluar migración cuando:
1. Tengas usuarios reales usando el sistema
2. Necesites datos históricos para tomar decisiones
3. Requieras alertas automáticas
4. El presupuesto permita $5-10/mes

---

**Documento creado:** Noviembre 2025
**Próxima revisión:** Marzo 2026
**Responsable:** Equipo IoT
