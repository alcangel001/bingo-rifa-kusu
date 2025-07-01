# Bingo y Rifa Kusu

Una aplicación web completa para jugar Bingo y Rifas en línea con asistente de IA integrado.

## 🎯 Características

- **Sistema de Usuarios**: Tres roles (Admin, Organizador, Jugador) con autenticación completa
- **Juegos de Bingo**: Partidas automáticas con diferentes patrones y premios
- **Sistema de Rifas**: Compra y reserva de tickets con sorteos automáticos
- **Economía Virtual**: Sistema de créditos con solicitudes y aprobaciones
- **Chat Privado**: Comunicación entre usuarios
- **Asistente de IA**: Kusu-Bot powered by Google Gemini para ayuda y soporte
- **Paneles de Administración**: Dashboards para gestión y estadísticas
- **Diseño Responsive**: Compatible con dispositivos móviles y desktop

## 🚀 Tecnologías

- **Frontend**: React 18, TypeScript, TailwindCSS
- **Build Tool**: Vite
- **IA**: Google Gemini API
- **Hosting**: Netlify (recomendado)

## 📋 Requisitos

- Node.js 18+ y npm
- Cuenta de GitHub (para despliegue)
- Cuenta de Netlify (para hosting)
- API Key de Google Gemini (opcional, para el asistente de IA)

## 🛠️ Instalación Local

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/bingo-rifa-kusu.git
   cd bingo-rifa-kusu
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.local.example .env.local
   # Editar .env.local con tu API key de Google Gemini
   ```

4. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```

5. **Construir para producción**
   ```bash
   npm run build
   ```

## 🌐 Despliegue en Netlify

Para desplegar esta aplicación en Netlify, sigue la **Guía Completa de Despliegue** incluida en este proyecto (`GUIA_DESPLIEGUE_NETLIFY.md`). La guía incluye:

- Configuración paso a paso de GitHub
- Configuración de Netlify
- Configuración de variables de entorno
- Solución de problemas comunes
- Mantenimiento y actualizaciones

## 👥 Usuarios de Prueba

La aplicación incluye usuarios de prueba para testing:

### Admin
- **Usuario**: `100%maracucho`
- **Contraseña**: `12`
- **Permisos**: Acceso completo, gestión de usuarios y créditos

### Organizador
- **Usuario**: `kusu`
- **Contraseña**: `kusu123`
- **Permisos**: Crear juegos y rifas, gestionar eventos

### Jugadores
- **Usuario**: `miaceleste` | **Contraseña**: `celeste123`
- **Usuario**: `david` | **Contraseña**: `david123`
- **Permisos**: Participar en juegos, comprar tickets, usar chat

## 🎮 Cómo Usar

### Para Jugadores
1. Regístrate o inicia sesión
2. Explora los juegos de Bingo y Rifas disponibles
3. Compra cartones de Bingo o tickets de Rifa
4. Participa en tiempo real
5. Usa el chat para comunicarte con otros jugadores
6. Consulta al asistente de IA para ayuda

### Para Organizadores
1. Inicia sesión con cuenta de organizador
2. Crea nuevos juegos de Bingo o Rifas
3. Configura premios y precios
4. Gestiona las partidas en curso
5. Revisa estadísticas en tu dashboard

### Para Administradores
1. Accede con cuenta de administrador
2. Gestiona todos los usuarios del sistema
3. Aprueba solicitudes de créditos
4. Supervisa todas las actividades
5. Accede a estadísticas completas

## 🤖 Asistente de IA

Kusu-Bot es un asistente inteligente que ayuda a los usuarios con:
- Explicación de reglas de juegos
- Ayuda con la navegación
- Resolución de dudas
- Soporte general

Para activar el asistente, necesitas configurar una API key de Google Gemini en las variables de entorno.

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── AIAssistantModal.tsx
│   ├── AdminDashboard.tsx
│   ├── BingoCard.tsx
│   ├── GameScreen.tsx
│   └── ...
├── context/            # Contextos de React
│   ├── AuthContext.tsx
│   ├── GameContext.tsx
│   └── ...
├── data/               # Datos de prueba
│   └── mock.ts
├── utils/              # Utilidades
│   └── bingo.ts
├── App.tsx             # Componente principal
├── index.tsx           # Punto de entrada
└── types.ts            # Definiciones de tipos
```

## 🔧 Scripts Disponibles

- `npm run dev` - Ejecutar en modo desarrollo
- `npm run build` - Construir para producción
- `npm run preview` - Previsualizar build de producción

## 🐛 Solución de Problemas

### El asistente de IA no funciona
- Verifica que `VITE_API_KEY` esté configurada
- Asegúrate de que la API key de Google Gemini sea válida
- Comprueba que tengas créditos disponibles en Google Cloud

### Errores de compilación
- Ejecuta `npm install` para instalar dependencias
- Verifica que estés usando Node.js 18+
- Revisa que no haya errores de TypeScript

### Problemas de despliegue
- Consulta la guía de despliegue incluida
- Verifica la configuración de variables de entorno en Netlify
- Revisa los logs de construcción en Netlify

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Si necesitas ayuda:
- Revisa la documentación incluida
- Consulta la guía de despliegue
- Abre un issue en GitHub
- Contacta al equipo de desarrollo

---

**Desarrollado con ❤️ para la comunidad de jugadores en línea**

