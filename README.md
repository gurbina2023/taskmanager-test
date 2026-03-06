## Task Manager (vanilla JS)

Pequeño proyecto de gestor de tareas desarrollado con HTML, CSS y JavaScript sin frameworks, pensado como base para practicar.

### Estructura del proyecto

- **index.html**: estructura principal de la aplicación.
- **css/styles.css**: estilos de la interfaz (layout, tipografía, tarjetas de tareas, etc.).
- **js/storage.js**: utilidades de almacenamiento usando `localStorage` (usuarios y tareas).
- **js/auth.js**: lógica mínima de "autenticación" basada en nombre de usuario.
- **js/dom.js**: funciones para pintar tareas y manipular el DOM.
- **js/app.js**: punto de entrada, maneja el estado y conecta todos los módulos.

### Funcionalidades actuales

- **Login con usuario y contraseña**, con roles (`ADMIN` / `USER`).
- **Persistencia local** de usuarios y tareas por usuario usando `localStorage`.
- **Crear tareas** con título, descripción opcional, prioridad y fecha límite (validada para no ser anterior a hoy).
- **Marcar tareas como completadas** o pendientes.
- **Eliminar tareas**.
- **Filtrar por estado** (todas, pendientes, completadas) y **prioridad** (todas, baja, media, alta).
- **Roles**:
  - Usuario normal: solo ve y gestiona sus propias tareas.
  - Administrador: puede ver y gestionar tareas de todos los usuarios, filtrar por usuario y crear nuevos usuarios.
- **Diferenciación visual de tareas vencidas** con estilos destacados.
- **Custom Events** (`task:created`, `task:toggled`, `task:deleted`, `tasks:filtersChanged`) para comunicación entre módulos.

### Cómo ejecutar

1. Abre la carpeta `task-manager` con un servidor estático sencillo (por ejemplo, la extensión "Live Server" o `npx serve`).
2. Visita `http://localhost:3000` (o el puerto que te indique la herramienta).
3. Inicia sesión con el usuario **admin / admin123** (o cualquiera de los definidos) y prueba las funcionalidades de tareas y gestión de usuarios.

### Script SQL

En el archivo `database.sql` se incluye:

- Creación de tablas `usuarios` y `tareas` con claves primarias, foráneas y `CHECK` de integridad para la fecha de vencimiento.
- Inserción de al menos 3 usuarios y 5 tareas.
- Las consultas SQL pedidas en el enunciado de la prueba.

Puedes modificar libremente los módulos JS para añadir edición de tareas, validaciones adicionales, o integrar un backend real más adelante.

