# Prueba Técnica – Desarrollador Junior

## Descripción del Proyecto

Este proyecto corresponde a la implementación de un **sistema de gestión de tareas**

* Diseño de **bases de datos relacionales**
* **JavaScript Vanilla** y manipulación del DOM
* Arquitectura modular en frontend
* Persistencia de datos utilizando **localStorage**
* Control de acceso mediante **roles de usuario**

La aplicación permite a los usuarios gestionar tareas asignadas, visualizar su estado y administrar usuarios dependiendo de su rol dentro del sistema.

---

# Tecnologías Utilizadas

* HTML5
* CSS3 (Flexbox y Grid – diseño responsive)
* JavaScript Vanilla (ES6 Modules)
* localStorage (persistencia de datos en el navegador)
* SQL (modelo de base de datos relacional)

---

# Estructura del Proyecto

```
task-manager/
│
├── index.html
├── css/
│   └── styles.css
│
├── js/
│   ├── storage.js
│   ├── auth.js
│   ├── dom.js
│   └── app.js
│
├── database.sql
└── README.md
```

---

# Base de Datos

El archivo **database.sql** contiene el diseño de la base de datos solicitado en la prueba.

## Tablas implementadas

### Tabla `usuarios`

* id (PK)
* username
* password
* rol (ADMIN / USER)

### Tabla `tareas`

* id (PK)
* titulo
* estado (PENDIENTE / COMPLETADA)
* fecha_creacion
* fecha_vencimiento
* usuario_id (FK)

### Restricciones

* **Foreign Key** entre tareas y usuarios
* **Constraint CHECK**

```
fecha_vencimiento >= fecha_creacion
```

---

# Datos de Prueba

Se incluyen datos iniciales para facilitar las pruebas.

## Usuarios

| Usuario | Contraseña | Rol   |
| ------- | ---------- | ----- |
| admin   | admin123   | ADMIN |
| juan    | juan123    | USER  |
| ana     | ana123     | USER  |

## Tareas

Se incluyen **5 tareas de ejemplo** asociadas a distintos usuarios.

---

# Consultas SQL Implementadas

## 1. Listado de tareas por proximidad de vencimiento

```sql
SELECT *
FROM tareas
ORDER BY fecha_vencimiento ASC;
```

---

## 2. Conteo de tareas por usuario y estado

```sql
SELECT u.username, t.estado, COUNT(*) total
FROM tareas t
JOIN usuarios u ON t.usuario_id = u.id
GROUP BY u.username, t.estado;
```

---

## 3. Tareas atrasadas

```sql
SELECT *
FROM tareas
WHERE estado = 'PENDIENTE'
AND fecha_vencimiento < CURDATE();
```

---

# Arquitectura del Frontend

El frontend está desarrollado en **JavaScript Vanilla utilizando módulos ES6**.

## storage.js

Capa de acceso a datos que simula una base de datos usando **localStorage**.

Funciones principales:

* obtener usuarios
* obtener tareas
* guardar usuarios
* guardar tareas
* inicializar datos de prueba (seed)

---

## auth.js

Gestiona la autenticación de usuarios.

Responsabilidades:

* validar credenciales
* mantener la sesión del usuario
* identificar el rol del usuario autenticado

---

## dom.js

Responsable del **renderizado dinámico de la interfaz**.

Funciones principales:

* renderizar lista de tareas
* actualizar estado visual de tareas
* mostrar tareas vencidas en rojo
* generar chips de estado y usuario

---

## app.js

Contiene la lógica principal de la aplicación.

Responsabilidades:

* manejo de formularios
* validaciones
* filtros
* control de roles
* comunicación entre módulos mediante **Custom Events**

---

# Sistema de Roles

## Usuario Normal (USER)

Puede:

* visualizar sus propias tareas
* marcar tareas como completadas
* eliminar sus tareas
* crear nuevas tareas propias

No puede:

* ver tareas de otros usuarios
* crear usuarios

---

## Administrador (ADMIN)

Tiene acceso total a:

* visualizar tareas de todos los usuarios
* filtrar tareas por usuario
* crear usuarios
* crear tareas para cualquier usuario
* modificar estado de tareas
* eliminar tareas

---

# Validaciones Implementadas

## Login

* usuario obligatorio
* contraseña obligatoria

## Crear Tarea

* título obligatorio
* fecha de vencimiento no puede ser anterior a hoy

## Crear Usuario (solo admin)

* nombre de usuario único
* contraseña mínima requerida

---

# Eventos Personalizados (Custom Events)

Para desacoplar módulos se implementaron eventos personalizados.

Eventos utilizados:

```
task:created
task:toggled
task:deleted
tasks:filtersChanged
```

Estos eventos permiten que los módulos se comuniquen sin dependencia directa.

---

# Interfaz de Usuario

Características principales:

* Renderizado dinámico de tareas
* Diferenciación visual de tareas vencidas
* Diseño responsive (Mobile First)
* Formularios claros y validados
* Indicadores visuales de estado

Las tareas vencidas se muestran con **estilo resaltado en color rojo**.

---

# Cómo Ejecutar el Proyecto

Desde la raíz del proyecto ejecutar:

```
cd PruebaDevJunior
npx serve task-manager
```

o

```
npx http-server task-manager -p 3000
```

Luego abrir en el navegador:

```
http://localhost:3000
```

---

# Pruebas de Funcionalidad

## Prueba de Administrador

Iniciar sesión con:

```
usuario: admin
contraseña: admin123
```

Permite probar:

* gestión completa de tareas
* creación de usuarios
* filtros por usuario

---

## Prueba de Usuario Normal

```
usuario: juan
contraseña: juan123
```

o

```
usuario: ana
contraseña: ana123
```

Permite verificar:

* acceso restringido a sus tareas
* gestión individual de tareas

---

# Características Destacadas

* Arquitectura modular en JavaScript
* Persistencia con localStorage
* Control de acceso por roles
* Eventos personalizados entre módulos
* Validaciones en frontend
* Interfaz responsive

---

# Autor

Jonathan Urbina
