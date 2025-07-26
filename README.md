# Control de Scripts Oracle - Grid Edition

Sistema moderno de gestión de scripts Oracle con interfaz de cuadrícula interactiva y persistencia en base de datos SQLite.

## 🚀 Características

### ✨ Interfaz Moderna
- **Diseño de cuadrícula**: Layout responsivo con CSS Grid
- **Tarjetas interactivas**: Cada script se muestra en una tarjeta visual
- **Animaciones suaves**: Hover effects y transiciones
- **Diseño responsivo**: Optimizado para desktop, tablet y móvil
- **Tema profesional**: Colores y tipografía moderna

### 🔧 Funcionalidades
- **CRUD completo**: Crear, leer, actualizar y eliminar scripts
- **Filtros avanzados**: Por estado, categoría, prioridad y búsqueda de texto
- **Estadísticas en tiempo real**: Contadores dinámicos por estado
- **Notificaciones**: Toast notifications para feedback del usuario
- **Datos de ejemplo**: Carga automática de scripts de muestra

### 🗄️ Base de Datos
- **SQLite**: Base de datos ligera y eficiente
- **API REST**: Backend Flask con endpoints completos
- **Persistencia**: Datos guardados permanentemente
- **Esquema optimizado**: Campos adicionales como checksums y dependencias

## 📋 Requisitos

- Python 3.11+
- Flask
- Flask-SQLAlchemy
- Flask-CORS

## 🛠️ Instalación

### 1. Clonar o descargar el proyecto
```bash
# Si tienes git
git clone <repository-url>
cd scripts_control_backend

# O simplemente descomprime el archivo ZIP
```

### 2. Crear y activar entorno virtual
```bash
# En Windows
python -m venv venv
venv\\Scripts\\activate

# En Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 3. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 4. Ejecutar la aplicación
```bash
python src/main.py
```

La aplicación estará disponible en: http://localhost:5000

## 🎯 Uso

### Interfaz Principal
1. **Estadísticas**: Panel superior con contadores por estado
2. **Filtros**: Barra de búsqueda y filtros por categoría, estado y prioridad
3. **Cuadrícula**: Scripts mostrados en tarjetas interactivas
4. **Acciones**: Botones para agregar, editar, eliminar y marcar como aplicado

### Gestión de Scripts

#### Agregar Nuevo Script
1. Click en "Agregar Script"
2. Llenar el formulario:
   - **Nombre**: Nombre del archivo SQL
   - **Ruta**: Ubicación del script
   - **Categoría**: BD, Alters, Updates, Vistas, Permisos, Scripts ID
   - **Prioridad**: Alta, Media, Baja
   - **Estado**: Pendiente, Aplicado, Error
   - **Responsable**: Persona a cargo
   - **Observaciones**: Notas adicionales
3. Click en "Guardar"

#### Editar Script
1. Click en el botón "Editar" de cualquier tarjeta
2. Modificar los campos necesarios
3. Click en "Guardar"

#### Marcar como Aplicado
1. Click en "Marcar Aplicado" en scripts pendientes
2. El estado cambiará automáticamente y se registrará la fecha

#### Filtrar y Buscar
- **Búsqueda**: Escribe en el campo de búsqueda para filtrar por nombre
- **Filtros**: Usa los selectores para filtrar por estado, categoría o prioridad
- **Limpiar**: Click en "Limpiar Filtros" para mostrar todos los scripts

### Datos de Ejemplo
Click en "Datos Ejemplo" para cargar 6 scripts de muestra y probar la aplicación.

## 🏗️ Arquitectura

### Backend (Flask)
```
src/
├── main.py              # Punto de entrada
├── models/
│   └── script.py        # Modelo de datos SQLite
├── routes/
│   └── scripts.py       # Endpoints API REST
├── static/              # Archivos frontend
│   ├── index.html       # Interfaz principal
│   ├── styles.css       # Estilos CSS
│   └── app.js          # Lógica JavaScript
└── database/
    └── app.db          # Base de datos SQLite
```

### API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/scripts` | Obtener todos los scripts |
| POST | `/api/scripts` | Crear nuevo script |
| GET | `/api/scripts/{id}` | Obtener script específico |
| PUT | `/api/scripts/{id}` | Actualizar script |
| DELETE | `/api/scripts/{id}` | Eliminar script |
| POST | `/api/scripts/{id}/apply` | Marcar como aplicado |
| GET | `/api/scripts/stats` | Obtener estadísticas |
| POST | `/api/scripts/sample-data` | Cargar datos de ejemplo |

### Frontend (Vanilla JS)
- **HTML5**: Estructura semántica
- **CSS3**: Grid, Flexbox, Custom Properties
- **JavaScript ES6+**: Fetch API, async/await
- **Font Awesome**: Iconografía

## 🎨 Personalización

### Colores
Edita las variables CSS en `styles.css`:
```css
:root {
    --primary-color: #3498db;
    --success-color: #27ae60;
    --warning-color: #f39c12;
    --danger-color: #e74c3c;
    /* ... más colores */
}
```

### Categorías
Modifica las opciones en `index.html` y `app.js`:
```html
<option value="Nueva_Categoria">Nueva Categoría</option>
```

## 🔧 Desarrollo

### Estructura de Datos
```sql
CREATE TABLE scripts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    path TEXT,
    category TEXT NOT NULL,
    priority TEXT NOT NULL,
    status TEXT NOT NULL,
    date_applied DATETIME,
    date_created DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    responsible TEXT DEFAULT 'DBA Team',
    notes TEXT,
    file_size INTEGER,
    checksum TEXT,
    execution_time INTEGER,
    dependencies TEXT
);
```

### Agregar Nuevas Funcionalidades
1. **Backend**: Agregar endpoints en `routes/scripts.py`
2. **Frontend**: Actualizar `app.js` con nuevas funciones
3. **UI**: Modificar `index.html` y `styles.css`

## 🚀 Despliegue

### Desarrollo Local
```bash
python src/main.py
```

### Producción
1. Usar un servidor WSGI como Gunicorn
2. Configurar proxy reverso (Nginx)
3. Usar base de datos más robusta si es necesario

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 src.main:app
```

## 📱 Compatibilidad

### Navegadores Soportados
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Dispositivos
- ✅ Desktop (1200px+)
- ✅ Tablet (768px - 1200px)
- ✅ Móvil (< 768px)

## 🐛 Solución de Problemas

### Error: "ModuleNotFoundError"
```bash
# Asegúrate de que el entorno virtual esté activado
source venv/bin/activate  # Linux/Mac
venv\\Scripts\\activate   # Windows

# Reinstala las dependencias
pip install -r requirements.txt
```

### Error: "Port already in use"
```bash
# Cambiar puerto en main.py
app.run(host='0.0.0.0', port=5001, debug=True)
```

### Base de datos no se crea
```bash
# Verificar permisos de escritura en la carpeta database/
chmod 755 src/database/
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo LICENSE para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Para soporte técnico o preguntas:
- Crear un issue en el repositorio
- Revisar la documentación
- Verificar los logs de la aplicación

---

**Desarrollado con ❤️ para mejorar la gestión de scripts Oracle**

