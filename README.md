# SiteFly 🚀

**Tu empleado digital para vender en línea**

SiteFly es una plataforma SaaS que permite a pequeños negocios crear y gestionar un catálogo de venta en línea en minutos, sin necesidad de conocimientos técnicos.

## ✨ Características

### Para Emprendedores
- 🛍️ **Catálogo de Productos**: Crea y gestiona tu tienda en línea fácilmente
- 💬 **Integración WhatsApp**: Los clientes hacen pedidos directamente por WhatsApp
- 📱 **Diseño Responsive**: Tu negocio se ve perfecto en cualquier dispositivo
- 🎨 **Personalización Completa**: Cambiar colores, logo y branding en segundos
- 📊 **Dashboard Analítico**: Monitorea pedidos, ingresos y visitas en tiempo real
- 🤖 **Asistente IA**: Recibe ayuda automática para gestionar tu negocio
- 🔐 **Autenticación Mágica**: Acceso seguro con enlace por correo
- 🌐 **Dominio Automático**: Tu tienda en sitefly.app/tu-negocio

### Planes
- **Gratuito**: Hasta 5 productos, pedidos por WhatsApp, plantilla básica
- **Pro ($9/mes)**: Productos ilimitados, SEO avanzado, soporte prioritario, sin comisión

## 🛠️ Stack Tecnológico

### Frontend
- **HTML5** - Estructura semántica
- **CSS3** - Estilos avanzados con Tailwind CSS
- **Vanilla JavaScript** - Sin dependencias externas
- **Tailwind CSS** - Framework de utilidad CSS via CDN

### Backend & Servicios
- **Supabase** - Base de datos PostgreSQL y autenticación
- **Vercel** - Hosting y CI/CD

### Librerías
- **Lucide Icons** - Sistema de iconos
- **Chart.js** - Gráficos analíticos (opcional)

## 🚀 Demo en Vivo

Accede a la plataforma completa aquí:
**[👉 sitefly-teal.vercel.app](https://sitefly-teal.vercel.app)**

### Usuarios de Prueba
- **Negocio 1**: ID de ejemplo en la URL `negocio.html?id=test-cafe`
- **Negocio 2**: ID de ejemplo en la URL `negocio.html?id=test-restaurante`

## 📸 Screenshots

### Panel de Administración
![Dashboard Admin](https://img.shields.io/badge/Coming%20Soon-lightgrey?style=for-the-badge)

### Página de Negocio
![Business Page](https://img.shields.io/badge/Coming%20Soon-lightgrey?style=for-the-badge)

### Carrito de Compras
![Shopping Cart](https://img.shields.io/badge/Coming%20Soon-lightgrey?style=for-the-badge)

## 📁 Estructura del Proyecto

```
Sitefly/
├── index.html          # Panel de admin y chat IA
├── negocio.html        # Página pública del negocio
├── css/
│   └── styles.css      # Estilos personalizados
├── js/
│   ├── config.js       # Configuración de Supabase
│   ├── utils.js        # Utilidades compartidas
│   ├── auth.js         # Autenticación
│   ├── chat.js         # Chat IA
│   ├── admin.js        # Panel administrativo
│   ├── preview.js      # Preview de página
│   ├── cart.js         # Carrito de compras
│   ├── negocio.js      # Lógica página de negocio
│   └── app.js          # Inicialización de la app
├── sql/
│   └── schema.sql      # Esquema de base de datos
└── README.md
```

## 🔧 Configuración Local

### Requisitos
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Cuenta de Supabase (gratuita)
- Clave de API de Supabase

### Pasos

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/wilsoncarmona64-code/Sitefly.git
   cd Sitefly
   ```

2. **Configurar Supabase**
   - Ve a [supabase.com](https://supabase.com) y crea un proyecto
   - Obtén tu URL y API Key pública
   - Actualiza `js/config.js` con tus credenciales

3. **Abrir localmente**
   ```bash
   # Opción 1: Usar un servidor local (Python)
   python -m http.server 8000
   
   # Opción 2: Usar Live Server en VS Code
   # Haz clic derecho en index.html > Open with Live Server
   ```

4. **Acceder en el navegador**
   ```
   http://localhost:8000
   ```

## 📊 Base de Datos

Las tablas necesarias en Supabase son:

- `businesses` - Información del negocio (nombre, descripción, WhatsApp, etc.)
- `products` - Productos del catálogo
- `orders` - Pedidos de clientes
- `order_items` - Items dentro de cada pedido
- `users` - Usuarios autenticados

Ver `sql/schema.sql` para la estructura completa.

## 🤝 Flujo de Negocio

1. **Emprendedor** inicia sesión con su correo (magic link)
2. **Onboarding**: Configura nombre, categoría, WhatsApp, logo y primer producto
3. **Dashboard**: Visualiza estadísticas, gestiona productos y pedidos
4. **Página Pública**: Clientes ven el catálogo y hacen pedidos por WhatsApp
5. **Notificación**: Pedido se envía a WhatsApp del emprendedor automáticamente

## 🔐 Seguridad

- ✅ Autenticación con Supabase (magic links)
- ✅ Validación de entrada en el cliente
- ✅ Conexión HTTPS a Supabase
- ⚠️ Las claves de API son públicas (es necesario usar RLS en Supabase)

## 📝 Variables de Entorno

Actualiza `js/config.js` con:
```javascript
const SUPABASE_URL = 'https://tu-proyecto.supabase.co'
const SUPABASE_KEY = 'tu-clave-publica'
```

## 🚀 Despliegue

El proyecto está configurado para desplegar en Vercel:

1. Push a GitHub
2. Conecta tu repositorio en Vercel
3. Vercel detectará automáticamente el tipo de proyecto
4. ¡Listo! Tu app estará en vivo

## 📚 Documentación Adicional

- [Documentación de Supabase](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev)

## 🐛 Problemas Conocidos

- [ ] Implementar pagos (actualmente solo WhatsApp)
- [ ] Agregar múltiples idiomas
- [ ] Mejorar sistema de notificaciones
- [ ] Integración con más redes sociales

## 📄 Licencia

MIT - Libre para usar, modificar y distribuir.

## 👨‍💻 Autor

**Wilson Carmona**
- GitHub: [@wilsoncarmona64-code](https://github.com/wilsoncarmona64-code)

## 💬 Soporte

¿Tienes preguntas? Abre un [issue en GitHub](https://github.com/wilsoncarmona64-code/Sitefly/issues)

---

Hecho con ❤️ para emprendedores digitales
