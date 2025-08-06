// Estado global de la aplicación
const AppState = {
    scripts: [],
    filteredScripts: [],
    currentEditId: null,
    filters: {
        search: '',
        status: '',
        category: '',
        priority: ''
    }
};

// API Base URL
const API_BASE = '/api';

// Elementos del DOM
const elements = {
    scriptsGrid: document.getElementById('scriptsGrid'),
    loadingContainer: document.getElementById('loadingContainer'),
    emptyState: document.getElementById('emptyState'),
    modalOverlay: document.getElementById('modalOverlay'),
    modalTitle: document.getElementById('modalTitle'),
    scriptForm: document.getElementById('scriptForm'),
    toastContainer: document.getElementById('toastContainer'),
    
    // Stats
    pendingCount: document.getElementById('pendingCount'),
    appliedCount: document.getElementById('appliedCount'),
    errorCount: document.getElementById('errorCount'),
    totalCount: document.getElementById('totalCount'),
    
    // Filters
    searchInput: document.getElementById('searchInput'),
    statusFilter: document.getElementById('statusFilter'),
    categoryFilter: document.getElementById('categoryFilter'),
    priorityFilter: document.getElementById('priorityFilter'),
    
    // Buttons
    addScriptBtn: document.getElementById('addScriptBtn'),
    loadSampleBtn: document.getElementById('loadSampleBtn'),
    clearFiltersBtn: document.getElementById('clearFiltersBtn'),
    modalClose: document.getElementById('modalClose'),
    cancelBtn: document.getElementById('cancelBtn'),
    saveBtn: document.getElementById('saveBtn'),
    
    // Form fields
    scriptName: document.getElementById('scriptName'),
    scriptPath: document.getElementById('scriptPath'),
    scriptCategory: document.getElementById('scriptCategory'),
    scriptPriority: document.getElementById('scriptPriority'),
    scriptStatus: document.getElementById('scriptStatus'),
    scriptResponsible: document.getElementById('scriptResponsible'),
    scriptNotes: document.getElementById('scriptNotes')
};

// Utilidades
const Utils = {
    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },
    
    getPriorityText(priority) {
        const priorities = {
            high: 'Alta',
            medium: 'Media',
            low: 'Baja'
        };
        return priorities[priority] || priority;
    },
    
    getStatusText(status) {
        const statuses = {
            pending: 'Pendiente',
            applied: 'Aplicado',
            error: 'Error'
        };
        return statuses[status] || status;
    },
    
    getCategoryIcon(category) {
        const icons = {
            'BD': 'fas fa-database',
            'Alters': 'fas fa-wrench',
            'Updates': 'fas fa-sync-alt',
            'Vistas': 'fas fa-eye',
            'Permisos': 'fas fa-key',
            'Scripts ID': 'fas fa-code'
        };
        return icons[category] || 'fas fa-file-code';
    },
    
    getStatusIcon(status) {
        const icons = {
            pending: 'fas fa-clock',
            applied: 'fas fa-check-circle',
            error: 'fas fa-exclamation-triangle'
        };
        return icons[status] || 'fas fa-question-circle';
    }
};

// API Functions
const API = {
    async get(endpoint) {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`);
            return await response.json();
        } catch (error) {
            console.error('API GET Error:', error);
            throw error;
        }
    },
    
    async post(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('API POST Error:', error);
            throw error;
        }
    },
    
    async put(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('API PUT Error:', error);
            throw error;
        }
    },
    
    async delete(endpoint) {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            console.error('API DELETE Error:', error);
            throw error;
        }
    }
};

// Toast Notifications
const Toast = {
    show(message, type = 'success', title = '') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const iconMap = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="${iconMap[type]}"></i>
            </div>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                <div class="toast-message">${message}</div>
            </div>
        `;
        
        elements.toastContainer.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
};

// Loading State
const Loading = {
    show() {
        elements.loadingContainer.style.display = 'block';
        elements.scriptsGrid.style.display = 'none';
        elements.emptyState.style.display = 'none';
    },
    
    hide() {
        elements.loadingContainer.style.display = 'none';
    }
};

// Scripts Management
const Scripts = {
    async loadAll() {
        try {
            Loading.show();
            const response = await API.get('/scripts');
            
            if (response.success) {
                AppState.scripts = response.data;
                this.applyFilters();
                this.updateStats();
            } else {
                Toast.show('Error al cargar scripts', 'error');
            }
        } catch (error) {
            Toast.show('Error de conexión al cargar scripts', 'error');
        } finally {
            Loading.hide();
        }
    },
    
    async create(scriptData) {
        try {
            const response = await API.post('/scripts', scriptData);
            
            if (response.success) {
                Toast.show('Script creado exitosamente', 'success');
                await this.loadAll();
                Modal.close();
            } else {
                Toast.show(response.error || 'Error al crear script', 'error');
            }
        } catch (error) {
            Toast.show('Error de conexión al crear script', 'error');
        }
    },
    
    async update(id, scriptData) {
        try {
            const response = await API.put(`/scripts/${id}`, scriptData);
            
            if (response.success) {
                Toast.show('Script actualizado exitosamente', 'success');
                await this.loadAll();
                Modal.close();
            } else {
                Toast.show(response.error || 'Error al actualizar script', 'error');
            }
        } catch (error) {
            Toast.show('Error de conexión al actualizar script', 'error');
        }
    },
    
    async delete(id) {
        if (!confirm('¿Estás seguro de que deseas eliminar este script?')) {
            return;
        }
        
        try {
            const response = await API.delete(`/scripts/${id}`);
            
            if (response.success) {
                Toast.show('Script eliminado exitosamente', 'success');
                await this.loadAll();
            } else {
                Toast.show(response.error || 'Error al eliminar script', 'error');
            }
        } catch (error) {
            Toast.show('Error de conexión al eliminar script', 'error');
        }
    },
    
    async markAsApplied(id) {
        try {
            const response = await API.post(`/scripts/${id}/apply`);
            
            if (response.success) {
                Toast.show('Script marcado como aplicado', 'success');
                await this.loadAll();
            } else {
                Toast.show(response.error || 'Error al marcar script', 'error');
            }
        } catch (error) {
            Toast.show('Error de conexión al marcar script', 'error');
        }
    },
    
    async loadSampleData() {
        try {
            const response = await API.post('/scripts/sample-data');
            
            if (response.success) {
                Toast.show(`${response.imported_count} scripts de ejemplo cargados`, 'success');
                await this.loadAll();
            } else {
                Toast.show(response.error || 'Error al cargar datos de ejemplo', 'error');
            }
        } catch (error) {
            Toast.show('Error de conexión al cargar datos de ejemplo', 'error');
        }
    },
    
    applyFilters() {
        const { search, status, category, priority } = AppState.filters;
        
        AppState.filteredScripts = AppState.scripts.filter(script => {
            const matchesSearch = !search || 
                script.name.toLowerCase().includes(search.toLowerCase()) ||
                (script.notes && script.notes.toLowerCase().includes(search.toLowerCase()));
            
            const matchesStatus = !status || script.status === status;
            const matchesCategory = !category || script.category === category;
            const matchesPriority = !priority || script.priority === priority;
            
            return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
        });
        
        this.render();
    },
    
    updateStats() {
        const stats = {
            total: AppState.scripts.length,
            pending: AppState.scripts.filter(s => s.status === 'pending').length,
            applied: AppState.scripts.filter(s => s.status === 'applied').length,
            error: AppState.scripts.filter(s => s.status === 'error').length
        };
        
        elements.totalCount.textContent = stats.total;
        elements.pendingCount.textContent = stats.pending;
        elements.appliedCount.textContent = stats.applied;
        elements.errorCount.textContent = stats.error;
    },
    
    render() {
        const scripts = AppState.filteredScripts;
        
        if (scripts.length === 0) {
            elements.scriptsGrid.style.display = 'none';
            elements.emptyState.style.display = 'block';
            return;
        }
        
        elements.scriptsGrid.style.display = 'grid';
        elements.emptyState.style.display = 'none';
        
        elements.scriptsGrid.innerHTML = scripts.map(script => this.createScriptCard(script)).join('');
    },
    
    createScriptCard(script) {
        return `
            <div class="script-card ${script.status}" data-id="${script.id}">
                <div class="script-header">
                    <div>
                        <div class="script-title">
                            <i class="${Utils.getCategoryIcon(script.category)}"></i>
                            ${script.name}
                        </div>
                        <div class="script-path">${script.path || 'Sin ruta especificada'}</div>
                    </div>
                    <div class="script-actions">
                        <button class="btn btn-primary btn-icon" onclick="Scripts.edit(${script.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-icon" onclick="Scripts.delete(${script.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="script-body">
                    <div class="script-meta">
                        <span class="badge badge-category">
                            <i class="${Utils.getCategoryIcon(script.category)}"></i>
                            ${script.category}
                        </span>
                        <span class="badge badge-priority ${script.priority}">
                            ${Utils.getPriorityText(script.priority)}
                        </span>
                        <span class="badge badge-status ${script.status}">
                            <i class="${Utils.getStatusIcon(script.status)}"></i>
                            ${Utils.getStatusText(script.status)}
                        </span>
                    </div>
                    
                    <div class="script-info">
                        <div class="script-info-item">
                            <i class="fas fa-user"></i>
                            <span>${script.responsible || 'No asignado'}</span>
                        </div>
                        <div class="script-info-item">
                            <i class="fas fa-calendar"></i>
                            <span>Creado: ${Utils.formatDate(script.date_created)}</span>
                        </div>
                        ${script.date_applied ? `
                            <div class="script-info-item">
                                <i class="fas fa-check"></i>
                                <span>Aplicado: ${Utils.formatDate(script.date_applied)}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    ${script.notes ? `
                        <div class="script-notes">
                            <i class="fas fa-sticky-note"></i>
                            ${script.notes}
                        </div>
                    ` : ''}
                    
                    <div class="script-footer">
                        ${script.status === 'pending' ? `
                            <button class="btn btn-success" onclick="Scripts.markAsApplied(${script.id})">
                                <i class="fas fa-check"></i> Marcar Aplicado
                            </button>
                        ` : ''}
                        <button class="btn btn-primary" onclick="Scripts.edit(${script.id})">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    
    edit(id) {
        const script = AppState.scripts.find(s => s.id === id);
        if (!script) return;
        
        AppState.currentEditId = id;
        elements.modalTitle.textContent = 'Editar Script';
        
        // Llenar formulario
        elements.scriptName.value = script.name;
        elements.scriptPath.value = script.path || '';
        elements.scriptCategory.value = script.category;
        elements.scriptPriority.value = script.priority;
        elements.scriptStatus.value = script.status;
        elements.scriptResponsible.value = script.responsible || '';
        elements.scriptNotes.value = script.notes || '';
        
        Modal.open();
    }
};

// Modal Management
const Modal = {
    open() {
        elements.modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    },
    
    close() {
        elements.modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
        this.reset();
    },
    
    reset() {
        AppState.currentEditId = null;
        elements.modalTitle.textContent = 'Agregar Nuevo Script';
        elements.scriptForm.reset();
        elements.scriptResponsible.value = 'DBA';
    }
};

// Event Listeners
function initEventListeners() {
    // Buttons
    elements.addScriptBtn.addEventListener('click', () => {
        Modal.reset();
        Modal.open();
    });
    
   // elements.loadSampleBtn.addEventListener('click', Scripts.loadSampleData);
    
    elements.clearFiltersBtn.addEventListener('click', () => {
        elements.searchInput.value = '';
        elements.statusFilter.value = '';
        elements.categoryFilter.value = '';
        elements.priorityFilter.value = '';
        
        AppState.filters = {
            search: '',
            status: '',
            category: '',
            priority: ''
        };
        
        Scripts.applyFilters();
    });
    
    // Modal
    elements.modalClose.addEventListener('click', Modal.close);
    elements.cancelBtn.addEventListener('click', Modal.close);
    
    elements.modalOverlay.addEventListener('click', (e) => {
        if (e.target === elements.modalOverlay) {
            Modal.close();
        }
    });
    
    // Form
    elements.scriptForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(elements.scriptForm);
        const scriptData = {
            name: elements.scriptName.value,
            path: elements.scriptPath.value,
            category: elements.scriptCategory.value,
            priority: elements.scriptPriority.value,
            status: elements.scriptStatus.value,
            responsible: elements.scriptResponsible.value,
            notes: elements.scriptNotes.value
        };
        
        if (AppState.currentEditId) {
            await Scripts.update(AppState.currentEditId, scriptData);
        } else {
            await Scripts.create(scriptData);
        }
    });
    
    // Filters
    elements.searchInput.addEventListener('input', (e) => {
        AppState.filters.search = e.target.value;
        Scripts.applyFilters();
    });
    
    elements.statusFilter.addEventListener('change', (e) => {
        AppState.filters.status = e.target.value;
        Scripts.applyFilters();
    });
    
    elements.categoryFilter.addEventListener('change', (e) => {
        AppState.filters.category = e.target.value;
        Scripts.applyFilters();
    });
    
    elements.priorityFilter.addEventListener('change', (e) => {
        AppState.filters.priority = e.target.value;
        Scripts.applyFilters();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            Modal.close();
        }
        
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            Modal.reset();
            Modal.open();
        }
    });
}

// Initialize App
async function initApp() {
    initEventListeners();
    await Scripts.loadAll();
    Toast.show('Aplicación cargada correctamente', 'success', 'Bienvenido');
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

