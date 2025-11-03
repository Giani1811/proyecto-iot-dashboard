# 🔌 Sistema de Detección de Sensores Desconectados

**Fecha:** Noviembre 2025
**Estado:** ✅ Implementado

---

## 📋 Resumen

Sistema inteligente que detecta cuando un sensor está desconectado y muestra mensajes claros al usuario con indicadores visuales distintivos.

---

## 🎯 Objetivo

Permitir que los usuarios identifiquen rápidamente cuándo un sensor no está funcionando, diferenciando entre:
- ⏳ **Esperando datos** - Primera carga
- 🔌 **Sensor desconectado** - Hardware no conectado
- ✅ **Funcionando normalmente** - Con datos válidos

---

## 🔧 Implementación

### **1. Store de Sensores (src/stores/sensors.js)**

#### **Estado de Plantas:**
Agregado campo `isConnected` a cada planta:
```javascript
plantas: {
  azul: {
    // ... otros campos
    isConnected: false  // ← NUEVO
  }
}
```

#### **Detección Automática:**
```javascript
// Al recibir datos del ESP32
if (data.plantaAzul) {
  const hasValidData =
    data.plantaAzul.temperaturaSuelo !== null &&
    data.plantaAzul.humedadSuelo !== null

  this.plantas.azul.isConnected = hasValidData

  // Solo guardar historial si hay datos válidos
  if (hasValidData) {
    this.addToPlantHistory('azul', data.plantaAzul)
  }
}
```

#### **Getter Mejorado:**
```javascript
getPlantaStatus: (state) => (plantaId) => {
  const planta = state.plantas[plantaId]

  // PRIORIDAD 1: Verificar desconexión
  if (!planta || !planta.isConnected) {
    return {
      status: 'disconnected',
      message: 'Sin datos - Verificar conexión del sensor',
      icon: '🔌'
    }
  }

  // PRIORIDAD 2: Primera carga
  if (planta.temperaturaSuelo === null) {
    return {
      status: 'unknown',
      message: 'Esperando datos...',
      icon: '⏳'
    }
  }

  // PRIORIDAD 3: Evaluar condiciones
  // ... resto de lógica
}
```

---

### **2. PlantCard Component (src/components/PlantCard.vue)**

#### **Badge de Desconexión:**
```vue
<div v-if="plantaStatus.status === 'disconnected'" class="disconnected-badge">
  <span class="badge-icon">🔌❌</span>
  <span class="badge-text">Desconectado</span>
</div>
```

#### **Mensaje de Estado:**
```vue
<div class="plant-status" :class="statusClass">
  <span class="status-message">{{ plantaStatus.message }}</span>
</div>
```

**Resultado visual:**
```
┌──────────────────────────────┐
│ 🔵 PLANTA AZUL  🔌❌ Descon. │
├──────────────────────────────┤
│ 🌡️ Temp: --   💧 Hum: --    │
├──────────────────────────────┤
│ Sin datos - Verificar        │
│ conexión del sensor          │
│ ░░░░░░░░░░░░░░ 0%            │
└──────────────────────────────┘
```

#### **Estilos CSS:**
```css
/* Borde naranja para sensor desconectado */
.plant-card.status-disconnected {
  border-color: #f97316;
  opacity: 0.85;
}

/* Badge visible */
.disconnected-badge {
  background: #fff7ed;
  border: 2px solid #f97316;
  color: #ea580c;
}

/* Mensaje de estado */
.plant-status.status-disconnected {
  background: #fff7ed;
  color: #ea580c;
  border: 1px solid #fdba74;
}

/* Barra de humedad vacía */
.humidity-bar.status-disconnected {
  background: #d1d5db;
  width: 0 !important;
}
```

---

### **3. AmbientCard Component (src/components/AmbientCard.vue)**

#### **Detección por Sensor Individual:**
```javascript
// Verificar si DHT11 está conectado
const isDHT11Connected = computed(() => {
  const temp = sensorsStore.ambiente.dht11.temperature
  const hum = sensorsStore.ambiente.dht11.humidity
  return temp !== null && hum !== null
})

// Lo mismo para DHT22
const isDHT22Connected = computed(() => {
  // ...
})
```

#### **Template Condicional:**
```vue
<div class="sensor-card" :class="{ 'sensor-disconnected': !isDHT11Connected }">
  <div class="sensor-header">
    <!-- ... nombre del sensor ... -->
    <div v-if="!isDHT11Connected" class="sensor-status-badge disconnected">
      🔌❌
    </div>
  </div>

  <!-- Mensaje si está desconectado -->
  <div v-if="!isDHT11Connected" class="disconnection-message">
    <span class="disconnect-icon">⚠️</span>
    <span class="disconnect-text">Sensor desconectado</span>
  </div>

  <!-- Lecturas si está conectado -->
  <div v-else class="sensor-readings">
    <!-- ... temperaturas y humedad ... -->
  </div>
</div>
```

**Resultado visual:**
```
┌────────────────────────────┐
│ DHT11              🔌❌     │
│ Sensor 1 - Pin 13          │
├────────────────────────────┤
│ ⚠️ Sensor desconectado     │
└────────────────────────────┘
```

#### **Estilos CSS:**
```css
/* Tarjeta desconectada */
.sensor-card.sensor-disconnected {
  border-color: #f97316;
  opacity: 0.8;
}

/* Badge de desconexión */
.sensor-status-badge.disconnected {
  background: #fff7ed;
  border: 2px solid #f97316;
}

/* Mensaje de desconexión */
.disconnection-message {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #fff7ed;
  border: 1px solid #fdba74;
  color: #ea580c;
}
```

---

## 🎨 Estados Visuales

### **1. Sensor Conectado y Funcionando ✅**
- Borde: Verde (#10b981)
- Badge: ✅
- Mensaje: "Condiciones óptimas"
- Barra de humedad: Activa

### **2. Sensor Desconectado 🔌❌**
- Borde: Naranja (#f97316)
- Badge: 🔌❌ "Desconectado"
- Mensaje: "Sin datos - Verificar conexión"
- Barra de humedad: Vacía (0%)
- Opacidad: 85%

### **3. Esperando Datos ⏳**
- Borde: Gris (#9ca3af)
- Badge: ⏳
- Mensaje: "Esperando datos..."
- Primera carga del sistema

### **4. Condiciones de Alerta ⚠️/🚨**
- Borde: Amarillo/Rojo
- Badge: ⚠️ o 🚨
- Mensaje específico según condición
- Sensor conectado pero con valores fuera de rango

---

## 🔍 Lógica de Detección

### **¿Cuándo un Sensor está Desconectado?**

#### **Para Sensores de Planta (DS18B20 + Capacitivos):**
Un sensor de planta se marca como desconectado cuando:
```javascript
temperaturaSuelo === null || humedadSuelo === null
```

**Causas en el ESP32:**
- DS18B20 desconectado → Envía `-99.0`
- Capacitivo desconectado → Valor fuera de rango calibrado
- Firebase Service filtra estos valores y no los actualiza

#### **Para Sensores Ambientales (DHT11/DHT22):**
Un sensor DHT se marca como desconectado cuando:
```javascript
temperature === null || humidity === null
```

**Causas en el ESP32:**
- DHT desconectado → Envía `999.0`
- Firebase Service filtra estos valores y no los actualiza

---

## 📊 Flujo de Datos

```
┌────────────────────────────────────────────────────────┐
│ ESP32: ¿Sensor conectado?                              │
└─────────────┬──────────────────────────┬───────────────┘
              │                          │
         ✅ SÍ                       ❌ NO
              │                          │
              ↓                          ↓
    Envía valores reales       Envía valores especiales
    (20.5°C, 75%)             (-99.0 o 999.0)
              │                          │
              ↓                          ↓
    ┌─────────────────────────────────────────────────┐
    │ Firebase Service (sensors.js)                   │
    │ Filtra valores especiales                       │
    └─────────┬─────────────────────────┬─────────────┘
              │                          │
         ✅ VÁLIDO                   ❌ INVÁLIDO
              │                          │
              ↓                          ↓
    Actualiza state con datos    NO actualiza (queda null)
    isConnected = true           isConnected = false
              │                          │
              ↓                          ↓
    ┌─────────────────────────────────────────────────┐
    │ UI Components                                   │
    │ Muestran estado según isConnected              │
    └──────────────────────────────────────────────────┘
```

---

## 🧪 Testing

### **Pruebas Recomendadas:**

#### **1. Desconectar Sensor de Planta:**
```bash
# Desconectar DS18B20 Azul del ESP32
# Resultado esperado:
✅ Tarjeta "Planta Azul" muestra:
   - Borde naranja
   - Badge "🔌❌ Desconectado"
   - Mensaje "Sin datos - Verificar conexión"
   - Barra de humedad en 0%
   - Opacidad reducida
```

#### **2. Desconectar DHT11:**
```bash
# Desconectar DHT11 del ESP32
# Resultado esperado:
✅ Tarjeta DHT11 muestra:
   - Borde naranja
   - Badge "🔌❌" en header
   - Mensaje grande "⚠️ Sensor desconectado"
   - NO muestra lecturas de temp/humedad
```

#### **3. Reconectar Sensor:**
```bash
# Reconectar sensor desconectado
# Resultado esperado:
✅ Después de ~15 segundos (próxima lectura):
   - Badge de desconexión desaparece
   - Borde cambia según condiciones
   - Muestra datos nuevamente
   - isConnected = true
```

---

## 🎯 Ventajas del Sistema

### **Para el Usuario:**
✅ **Claridad inmediata** - Sabe exactamente qué sensor tiene problemas
✅ **Diferenciación visual** - Color naranja vs rojo (crítico) vs verde (ok)
✅ **Mensajes específicos** - No solo "--", sino "Sensor desconectado"
✅ **Identificación rápida** - Badge 🔌❌ visible de inmediato

### **Para Debugging:**
✅ **Logs en consola** - Firebase Service logea cuando filtra valores
✅ **Estado persistente** - `isConnected` se guarda en el store
✅ **Sin falsos positivos** - Solo marca desconectado si NO hay datos

---

## 📝 Notas Técnicas

### **Valores Especiales del ESP32:**
```cpp
// En ESP32 (Arduino)
#define SENSOR_DISCONNECTED_DHT   999.0
#define SENSOR_DISCONNECTED_DS18B20 -99.0

// Ejemplo de uso:
float temp = dht11.readTemperature();
if (isnan(temp)) temp = 999.0;  // Marca como desconectado
```

### **Filtrado en Firebase Service:**
```javascript
// src/services/sensors.js
onValue(this.dht11TempRef, (snapshot) => {
  const value = snapshot.val()
  // Solo actualiza si NO es valor de error
  if (value !== null && value !== 999.0) {
    sensorData.dht11.temperature = value
    callback({ ...sensorData })
  }
  // Si value === 999.0, NO actualiza (queda null)
})
```

---

## 🚀 Futuras Mejoras

### **Posibles Extensiones:**

1. **Historial de Desconexiones:**
   - Registrar cuándo se desconectó
   - Cuánto tiempo estuvo desconectado
   - Frecuencia de desconexiones

2. **Notificaciones:**
   - Enviar email cuando sensor se desconecta
   - Push notification en la app
   - Integración con Telegram/WhatsApp

3. **Diagnóstico Avanzado:**
   - "Última vez conectado: hace 2 horas"
   - "Sensor inestable - 5 desconexiones en 1 hora"
   - Sugerencias de solución

4. **Modo Mantenimiento:**
   - Silenciar alertas de sensor específico
   - "En mantenimiento - Ignorar por 1 hora"

---

## ✅ Checklist de Implementación

- [x] Agregar campo `isConnected` al store
- [x] Detectar automáticamente sensores desconectados
- [x] Badge de desconexión en PlantCard
- [x] Mensaje claro en PlantCard
- [x] Estilos visuales distintos (naranja)
- [x] Barra de humedad en 0% cuando desconectado
- [x] Badge de desconexión en AmbientCard (DHT11/DHT22)
- [x] Mensaje de desconexión en AmbientCard
- [x] Opacidad reducida para sensores desconectados
- [x] Prevenir agregar a historial si está desconectado
- [x] Documentación completa

---

## 📖 Documentación Relacionada

- `CAMBIOS_IMPLEMENTADOS.md` - Cambios generales del dashboard
- `ARQUITECTURA_BACKEND_FUTURO.md` - Plan de migración a backend propio
- `README.md` - Información general del proyecto

---

**Estado:** ✅ **COMPLETAMENTE IMPLEMENTADO Y FUNCIONAL**

El sistema ahora detecta inteligentemente cuando un sensor está desconectado y muestra mensajes claros con indicadores visuales distintivos.
