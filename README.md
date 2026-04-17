# 🌍 Dashboard Mundial

Aplicación web universitaria que integra autenticación segura con JWT y consumo de tres APIs externas para mostrar información en tiempo real sobre países, clima y mercado cripto.

## Tecnologías

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Backend:** Node.js + Express
- **Autenticación:** JWT + bcryptjs
- **APIs externas:** REST Countries, Open-Meteo, CoinGecko

## APIs integradas

| API | Descripción | Clave requerida |
|-----|-------------|-----------------|
| [REST Countries](https://restcountries.com) | Información detallada de países | No |
| [Open-Meteo](https://open-meteo.com) | Clima actual de capitales mundiales | No |
| [CoinGecko](https://www.coingecko.com/api) | Precios de criptomonedas en tiempo real | No |

## Estructura del proyecto

```
dashboard-mundial/
├── backend/
│   ├── server.js       # Servidor Express + rutas de auth
│   ├── package.json
│   └── .env            # Variables de entorno (no subir a git)
└── frontend/
    ├── login.html      # Página de login / registro
    ├── dashboard.html  # Dashboard principal
    ├── css/style.css
    └── js/
        ├── login.js
        └── dashboard.js
```

## Instalación y uso

### 1. Clonar el repositorio
```bash
git clone https://github.com/Theborrex/dashboard-mundial.git
cd dashboard-mundial
```

### 2. Instalar dependencias del backend
```bash
cd backend
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `backend/.env`:
```
JWT_SECRET=tu_clave_secreta_aqui
PORT=3000
```

### 4. Iniciar el servidor
```bash
node server.js
```

### 5. Abrir el frontend
Abre `frontend/login.html` en el navegador.

**Usuario de prueba:** `admin@demo.com` / `admin123`

## Seguridad implementada

- Contraseñas cifradas con **bcrypt** (salt rounds: 10)
- Tokens **JWT** con expiración de 2 horas
- Validación de inputs en frontend y backend
- Datos sensibles manejados con variables de entorno
- `.env` excluido del repositorio con `.gitignore`

## Funcionalidades

- Registro e inicio de sesión con validación
- Búsqueda de cualquier país por nombre
- Filtro de países por región (América, Europa, Asia, África, Oceanía)
- Modal con detalles completos de cada país
- Clima en tiempo real de 8 capitales del mundo
- Precios actualizados de las 8 principales criptomonedas
- Cierre de sesión seguro
