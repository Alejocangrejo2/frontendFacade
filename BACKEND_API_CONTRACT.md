# 🏨 Hotel Dorado — Contrato API Backend (Spring Boot)

> **Este documento es para el desarrollador del backend.**
> Contiene todos los endpoints que el frontend consume, los modelos de datos esperados y la lógica de negocio requerida.

---

## Configuración General

| Parámetro | Valor |
|-----------|-------|
| Base URL | `http://localhost:8080/api` |
| Content-Type | `application/json` |
| CORS | Habilitar para `*` (desarrollo) |

> ⚠️ **CORS es obligatorio.** El frontend corre en un puerto diferente durante desarrollo. Asegurar que el backend permita orígenes cruzados.

---

## Modelos de Datos

### Room (Habitación)
```json
{
  "id": 1,
  "type": "SUITE",           // Enum: SENCILLA, DOBLE, SUITE, SUITE_JUNIOR, DOBLE_DELUXE, SENCILLA_SUPERIOR
  "number": "501",
  "pricePerNight": 350000,    // En pesos colombianos (COP)
  "capacity": 4,
  "amenities": ["Wi-Fi", "Mini Bar", "Jacuzzi"],
  "available": true,
  "description": "Descripción de la habitación"
}
```

### Guest (Huésped)
```json
{
  "id": 1,
  "firstName": "Juan",
  "lastName": "Pérez",
  "documentType": "CC",       // Enum: CC, CE, PP, TI
  "documentNumber": "1234567890",
  "email": "juan@email.com",
  "phone": "+57 300 123 4567"
}
```

### Reservation (Reserva)
```json
{
  "id": 1,
  "guest": { /* Guest object */ },
  "room": { /* Room object */ },
  "checkInDate": "2026-04-15",     // Formato: YYYY-MM-DD
  "checkOutDate": "2026-04-18",
  "status": "PENDIENTE",           // Enum: PENDIENTE, CHECK_IN, CHECK_OUT
  "services": [ /* Array de HotelService */ ],
  "digitalKey": null,              // String generada al hacer check-in, null antes
  "totalPrice": 1050000
}
```

### HotelService (Servicio Adicional)
```json
{
  "id": 1,
  "name": "Masaje Relajante",
  "category": "SPA",             // Enum: SPA, RESTAURANTE, TRANSPORTE, HABITACION, TOUR, LAVANDERIA
  "description": "Masaje corporal completo de 60 min.",
  "price": 80000
}
```

### Invoice (Factura)
```json
{
  "id": 1,
  "reservation": { /* Reservation object completo */ },
  "subtotal": 1130000,
  "taxes": 214700,                // 19% IVA
  "total": 1344700,
  "generatedAt": "2026-04-18T14:30:00.000Z",
  "items": [
    { "description": "Habitación Suite — 3 noche(s)", "amount": 1050000 },
    { "description": "Masaje Relajante", "amount": 80000 }
  ]
}
```

### PriceInfo (Precio Dinámico)
```json
{
  "roomId": 1,
  "pricePerNight": 455000,        // Precio ya con multiplicador de temporada
  "nights": 3,
  "totalPrice": 1365000,
  "isHighSeason": true,
  "seasonLabel": "Temporada Alta"  // o "Temporada Baja"
}
```

---

## Endpoints

### 1. Buscar Habitaciones Disponibles

```
GET /api/rooms?checkIn={date}&checkOut={date}
```

**Query Params:**
| Parámetro | Tipo | Ejemplo |
|-----------|------|---------|
| checkIn | string (YYYY-MM-DD) | 2026-04-15 |
| checkOut | string (YYYY-MM-DD) | 2026-04-18 |

**Response:** `200 OK`
```json
[
  { /* Room object con available: true */ },
  { /* Room object */ }
]
```

**Lógica:**
- Retornar solo habitaciones **disponibles** en el rango de fechas dado.
- Una habitación no está disponible si ya tiene una reserva que se superpone con las fechas solicitadas.

---

### 2. Obtener Detalle de Habitación

```
GET /api/rooms/{id}
```

**Response:** `200 OK`
```json
{ /* Room object completo */ }
```

---

### 3. Obtener Precio Dinámico

```
GET /api/rooms/{id}/price?checkIn={date}&checkOut={date}
```

**Response:** `200 OK`
```json
{
  "roomId": 1,
  "pricePerNight": 455000,
  "nights": 3,
  "totalPrice": 1365000,
  "isHighSeason": true,
  "seasonLabel": "Temporada Alta"
}
```

**Lógica del Precio Dinámico (Temporada):**
- **Temporada Alta** (meses: Enero, Junio, Julio, Diciembre): multiplicador × 1.3
- **Temporada Baja** (resto del año): multiplicador × 1.0
- Se evalúa basado en el mes de `checkIn`
- `totalPrice = pricePerNight * nights`

---

### 4. Crear Reserva

```
POST /api/reservations
```

**Request Body:**
```json
{
  "guest": {
    "firstName": "Juan",
    "lastName": "Pérez",
    "documentType": "CC",
    "documentNumber": "1234567890",
    "email": "juan@email.com",
    "phone": "+57 300 123 4567"
  },
  "room": {
    "id": 1
  },
  "checkInDate": "2026-04-15",
  "checkOutDate": "2026-04-18"
}
```

**Response:** `201 Created`
```json
{
  "id": 5432,
  "guest": { /* Guest completo con id asignado */ },
  "room": { /* Room completo */ },
  "checkInDate": "2026-04-15",
  "checkOutDate": "2026-04-18",
  "status": "PENDIENTE",
  "services": [],
  "digitalKey": null,
  "totalPrice": 1050000
}
```

**Lógica:**
- Crear el Guest si no existe (por número de documento).
- Verificar disponibilidad de la habitación en esas fechas.
- Estado inicial: `PENDIENTE`.
- `digitalKey`: `null` hasta el check-in.
- Guardar todo en memoria/cache (no BD).

---

### 5. Obtener Reserva

```
GET /api/reservations/{id}
```

**Response:** `200 OK`
```json
{ /* Reservation object completo */ }
```

---

### 6. Realizar Check-In

```
PUT /api/reservations/{id}/checkin
```

**Response:** `200 OK`
```json
{
  "id": 5432,
  "status": "CHECK_IN",
  "digitalKey": "KEY-A1B2C3D4",
  /* ... resto de la reserva ... */
}
```

**Lógica:**
- Cambiar `status` de `PENDIENTE` → `CHECK_IN`.
- Generar una llave digital aleatoria (ej: `KEY-` + 8 caracteres alfanuméricos).
- Asignar la llave a `digitalKey`.

---

### 7. Realizar Check-Out

```
PUT /api/reservations/{id}/checkout
```

**Response:** `200 OK`
```json
{
  "id": 5432,
  "status": "CHECK_OUT",
  "digitalKey": null,
  /* ... resto de la reserva ... */
}
```

**Lógica:**
- Cambiar `status` de `CHECK_IN` → `CHECK_OUT`.
- Anular `digitalKey` (set `null`).
- La habitación vuelve a estar disponible.

---

### 8. Listar Servicios Disponibles

```
GET /api/services
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Masaje Relajante",
    "category": "SPA",
    "description": "Masaje corporal completo de 60 minutos.",
    "price": 80000
  },
  { /* más servicios... */ }
]
```

**Servicios Sugeridos:**
| ID | Nombre | Categoría | Precio |
|----|--------|-----------|--------|
| 1 | Masaje Relajante | SPA | 80,000 |
| 2 | Cena Gourmet | RESTAURANTE | 55,000 |
| 3 | Transfer Aeropuerto | TRANSPORTE | 40,000 |
| 4 | Desayuno en Habitación | HABITACION | 25,000 |
| 5 | Tour por la Ciudad | TOUR | 65,000 |
| 6 | Lavandería Express | LAVANDERIA | 30,000 |

---

### 9. Agregar Servicio a Reserva

```
POST /api/reservations/{id}/services
```

**Request Body:**
```json
{
  "serviceId": 1
}
```

**Response:** `200 OK`
```json
{ /* Reservation completa con el servicio agregado en services[] */ }
```

**Lógica:**
- Buscar el servicio por `serviceId`.
- Si no está ya agregado, añadirlo al array `services` de la reserva.
- Retornar la reserva completa actualizada.

---

### 10. Quitar Servicio de Reserva

```
DELETE /api/reservations/{id}/services/{serviceId}
```

**Response:** `200 OK`
```json
{ /* Reservation completa sin el servicio removido */ }
```

---

### 11. Generar Factura

```
GET /api/reservations/{id}/invoice
```

**Response:** `200 OK`
```json
{
  "id": 87432,
  "reservation": { /* Reservation completa */ },
  "subtotal": 1130000,
  "taxes": 214700,
  "total": 1344700,
  "generatedAt": "2026-04-18T14:30:00.000Z",
  "items": [
    { "description": "Habitación Suite Presidencial — 3 noche(s)", "amount": 1050000 },
    { "description": "Masaje Relajante", "amount": 80000 }
  ]
}
```

**Lógica de Facturación:**
```
roomTotal   = room.pricePerNight * noches
servicios   = Σ service.price
subtotal    = roomTotal + servicios
taxes       = subtotal * 0.19     (IVA 19%)
total       = subtotal + taxes
```

**Items:**
1. Primer item: `"Habitación {tipo} — {noches} noche(s)"` con monto `roomTotal`
2. Siguientes items: uno por cada servicio agregado con su nombre y precio

---

## Códigos de Error

| Código | Uso |
|--------|-----|
| 200 | Operación exitosa |
| 201 | Recurso creado (reserva) |
| 400 | Datos inválidos o faltantes |
| 404 | Recurso no encontrado |
| 409 | Conflicto (ej: habitación ya reservada en esas fechas) |
| 500 | Error interno del servidor |

**Formato de error:**
```json
{
  "message": "La habitación no está disponible en las fechas seleccionadas",
  "status": 409
}
```

---

## Notas Importantes

1. **Sin Base de Datos:** Todo se maneja en **caché/memoria** del servidor. Usar `HashMap`, `ConcurrentHashMap`, o similar en Java.

2. **CORS:** Configurar `@CrossOrigin(origins = "*")` o un `WebMvcConfigurer` global.

3. **Datos iniciales:** Al arrancar el servidor, pre-cargar las 6 habitaciones y 6 servicios en memoria.

4. **Formato de fechas:** Siempre `YYYY-MM-DD` (ISO 8601).

5. **Moneda:** Todo en Pesos Colombianos (COP), valores enteros sin decimales.

6. **El frontend ya funciona en modo mock.** Cuando el backend esté listo:
   - Abrir `js/services/ApiService.js`
   - Cambiar `ApiService.MOCK_MODE = false`
   - Actualizar `this.baseUrl` con la URL del backend desplegado
