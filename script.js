// Task Manager Application
class TaskManager {
    constructor() {
        this.tasks = [];
        this.currentEditId = null;
        this.storageKey = 'taskManager_tasks';
        this.syncEnabled = false;
        this.init();
    }

    init() {
        this.loadTasks();
        this.bindEvents();
        this.renderTasks();
        this.updateEmptyState();
        this.initializeSync();
        this.setupOfflineSupport();
        this.setupInstallPrompt();
        this.updateNetworkStatus();
    }

    async loadTasks() {
        try {
            // Try to load from cloud storage first
            await this.loadFromCloud();
        } catch (error) {
            console.log('Cloud storage not available, using local storage');
            this.tasks = JSON.parse(localStorage.getItem(this.storageKey)) || [];
        }
    }

    async loadFromCloud() {
        // Check if we have cloud storage capabilities
        if ('serviceWorker' in navigator) {
            // Try to sync with cloud storage
            const cloudData = await this.getCloudData();
            if (cloudData) {
                this.tasks = cloudData;
                this.syncToLocal();
            } else {
                this.tasks = JSON.parse(localStorage.getItem(this.storageKey)) || [];
            }
        } else {
            this.tasks = JSON.parse(localStorage.getItem(this.storageKey)) || [];
        }
    }

    async getCloudData() {
        // This will work with GitHub Gist as a simple cloud storage
        const gistId = localStorage.getItem('taskManager_gistId');
        if (!gistId) return null;

        try {
            const response = await fetch(`https://api.github.com/gists/${gistId}`);
            if (response.ok) {
                const gist = await response.json();
                const content = gist.files['tasks.json'].content;
                return JSON.parse(content);
            }
        } catch (error) {
            console.log('Failed to load from cloud:', error);
        }
        return null;
    }

    initializeSync() {
        // Add sync controls to UI
        this.addSyncControls();
        
        // Auto-sync every 5 minutes if enabled
        setInterval(() => {
            if (this.syncEnabled) {
                this.syncToCloud();
            }
        }, 5 * 60 * 1000);
    }

    setupOfflineSupport() {
        // Register service worker for offline support
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(error => {
                console.log('Service Worker registration failed:', error);
            });
        }

        // Handle online/offline events
        window.addEventListener('online', () => {
            this.showMessage('Back online! Syncing data...', 'success');
            this.updateNetworkStatus();
            if (this.syncEnabled) {
                this.syncToCloud();
            }
        });

        window.addEventListener('offline', () => {
            this.showMessage('You are offline. Changes will be synced when online.', 'info');
            this.updateNetworkStatus();
        });
    }

    setupInstallPrompt() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            deferredPrompt = e;
            
            // Show custom install prompt if not already dismissed
            if (!localStorage.getItem('installPromptDismissed')) {
                document.getElementById('installPrompt').style.display = 'block';
            }
        });

        document.getElementById('installBtn').addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const result = await deferredPrompt.userChoice;
                
                if (result.outcome === 'accepted') {
                    this.showMessage('App installed successfully!', 'success');
                }
                
                deferredPrompt = null;
                document.getElementById('installPrompt').style.display = 'none';
            }
        });

        document.getElementById('dismissInstall').addEventListener('click', () => {
            document.getElementById('installPrompt').style.display = 'none';
            localStorage.setItem('installPromptDismissed', 'true');
        });
    }

    updateNetworkStatus() {
        const networkStatus = document.getElementById('networkStatus');
        if (navigator.onLine) {
            networkStatus.style.display = 'none';
        } else {
            networkStatus.style.display = 'flex';
        }
    }

    bindEvents() {
        // Modal events
        document.getElementById('addTaskBtn').addEventListener('click', () => this.openModal());
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());
        
        // Form submission
        document.getElementById('taskForm').addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Search and filter
        document.getElementById('searchInput').addEventListener('input', (e) => this.handleSearch(e));
        document.getElementById('statusFilter').addEventListener('change', (e) => this.handleFilter(e));
        
        // Sync controls
        document.getElementById('syncBtn').addEventListener('click', () => this.handleSyncToggle());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportTasks());
        document.getElementById('importBtn').addEventListener('click', () => this.importTasks());
        document.getElementById('shareBtn').addEventListener('click', () => this.shareApp());
        
        // Modal click outside to close
        document.getElementById('taskModal').addEventListener('click', (e) => {
            if (e.target.id === 'taskModal') {
                this.closeModal();
            }
        });
    }

    openModal(task = null) {
        const modal = document.getElementById('taskModal');
        const modalTitle = document.getElementById('modalTitle');
        const submitBtn = document.getElementById('submitBtn');
        
        if (task) {
            // Edit mode
            modalTitle.textContent = 'Edit Task';
            submitBtn.textContent = 'Update Task';
            this.currentEditId = task.id;
            
            // Populate form with task data
            document.getElementById('assignee').value = task.assignee;
            document.getElementById('taskDescription').value = task.description;
            document.getElementById('dueDate').value = task.dueDate;
            document.getElementById('comments').value = task.comments || '';
            document.getElementById('status').value = task.status;
        } else {
            // Add mode
            modalTitle.textContent = 'Add New Task';
            submitBtn.textContent = 'Add Task';
            this.currentEditId = null;
            this.resetForm();
        }
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Focus first input
        setTimeout(() => {
            document.getElementById('assignee').focus();
        }, 100);
    }

    closeModal() {
        const modal = document.getElementById('taskModal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.resetForm();
        this.currentEditId = null;
    }

    resetForm() {
        document.getElementById('taskForm').reset();
        // Set default due date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('dueDate').value = today;
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const taskData = {
            assignee: formData.get('assignee').trim(),
            description: formData.get('taskDescription').trim(),
            dueDate: formData.get('dueDate'),
            comments: formData.get('comments').trim(),
            status: formData.get('status')
        };

        if (this.currentEditId) {
            // Update existing task
            this.updateTask(this.currentEditId, taskData);
        } else {
            // Create new task
            this.createTask(taskData);
        }

        this.closeModal();
    }

    createTask(taskData) {
        const task = {
            id: Date.now().toString(),
            ...taskData,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(task);
        this.saveTasks();
        this.renderTasks();
        this.updateEmptyState();
        
        // Show success message (optional)
        this.showMessage('Task created successfully!', 'success');
    }

    updateTask(id, taskData) {
        const index = this.tasks.findIndex(task => task.id === id);
        if (index !== -1) {
            this.tasks[index] = {
                ...this.tasks[index],
                ...taskData,
                updatedAt: new Date().toISOString()
            };
            this.saveTasks();
            this.renderTasks();
            this.showMessage('Task updated successfully!', 'success');
        }
    }

    deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== id);
            this.saveTasks();
            this.renderTasks();
            this.updateEmptyState();
            this.showMessage('Task deleted successfully!', 'success');
        }
    }

    saveTasks() {
        this.syncToLocal();
        if (this.syncEnabled && navigator.onLine) {
            this.syncToCloud();
        }
    }

    syncToLocal() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.tasks));
    }

    async syncToCloud() {
        const gistId = localStorage.getItem('taskManager_gistId');
        const token = localStorage.getItem('taskManager_token');
        
        if (!token) {
            console.log('No GitHub token available for sync');
            return;
        }

        try {
            const data = {
                files: {
                    'tasks.json': {
                        content: JSON.stringify(this.tasks, null, 2)
                    }
                }
            };

            let url, method;
            if (gistId) {
                url = `https://api.github.com/gists/${gistId}`;
                method = 'PATCH';
            } else {
                url = 'https://api.github.com/gists';
                method = 'POST';
                data.description = 'Task Manager Data';
                data.public = false;
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const gist = await response.json();
                if (!gistId) {
                    localStorage.setItem('taskManager_gistId', gist.id);
                }
                this.showMessage('Data synced to cloud successfully!', 'success');
            } else {
                throw new Error('Failed to sync to cloud');
            }
        } catch (error) {
            console.error('Cloud sync failed:', error);
            this.showMessage('Failed to sync to cloud. Data saved locally.', 'warning');
        }
    }

    addSyncControls() {
        // Add sync controls after the add button
        const header = document.querySelector('.header');
        const syncControls = document.createElement('div');
        syncControls.className = 'sync-controls';
        syncControls.innerHTML = `
            <button class="sync-btn" id="syncBtn" title="Toggle Cloud Sync">
                <i class="fas fa-cloud"></i>
            </button>
            <div class="dropdown">
                <button class="dropdown-btn" title="More Options">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
                <div class="dropdown-content">
                    <button id="exportBtn"><i class="fas fa-download"></i> Export Tasks</button>
                    <button id="importBtn"><i class="fas fa-upload"></i> Import Tasks</button>
                    <button id="shareBtn"><i class="fas fa-share"></i> Share App</button>
                </div>
            </div>
        `;
        header.appendChild(syncControls);
    }

    async handleSyncToggle() {
        if (!this.syncEnabled) {
            const token = prompt('Enter your GitHub Personal Access Token for cloud sync:\n(Create one at: https://github.com/settings/tokens)');
            if (token) {
                localStorage.setItem('taskManager_token', token);
                this.syncEnabled = true;
                document.getElementById('syncBtn').classList.add('active');
                this.showMessage('Cloud sync enabled!', 'success');
                await this.syncToCloud();
            }
        } else {
            this.syncEnabled = false;
            document.getElementById('syncBtn').classList.remove('active');
            this.showMessage('Cloud sync disabled', 'info');
        }
    }

    exportTasks() {
        const dataStr = JSON.stringify(this.tasks, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tasks_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        this.showMessage('Tasks exported successfully!', 'success');
    }

    importTasks() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importedTasks = JSON.parse(e.target.result);
                        if (confirm('This will replace all current tasks. Continue?')) {
                            this.tasks = importedTasks;
                            this.saveTasks();
                            this.renderTasks();
                            this.updateEmptyState();
                            this.showMessage('Tasks imported successfully!', 'success');
                        }
                    } catch (error) {
                        this.showMessage('Invalid file format!', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    shareApp() {
        const url = window.location.href;
        if (navigator.share) {
            navigator.share({
                title: 'Task Manager App',
                text: 'Check out this awesome task manager!',
                url: url
            });
        } else {
            navigator.clipboard.writeText(url).then(() => {
                this.showMessage('App URL copied to clipboard!', 'success');
            }).catch(() => {
                prompt('Copy this URL to share the app:', url);
            });
        }
    }

    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const statusFilter = document.getElementById('statusFilter').value;

        // Filter tasks
        let filteredTasks = this.tasks.filter(task => {
            const matchesSearch = !searchTerm || 
                task.assignee.toLowerCase().includes(searchTerm) ||
                task.description.toLowerCase().includes(searchTerm) ||
                (task.comments && task.comments.toLowerCase().includes(searchTerm));
            
            const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });

        if (filteredTasks.length === 0) {
            tasksList.innerHTML = '';
            this.updateEmptyState(true);
            return;
        }

        this.updateEmptyState(false);

        tasksList.innerHTML = filteredTasks.map(task => this.createTaskCard(task)).join('');

        // Add event listeners to action buttons
        filteredTasks.forEach(task => {
            document.getElementById(`edit-${task.id}`).addEventListener('click', () => this.openModal(task));
            document.getElementById(`delete-${task.id}`).addEventListener('click', () => this.deleteTask(task.id));
        });
    }

    createTaskCard(task) {
        const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';
        const dueDateClass = isOverdue ? 'overdue' : '';
        
        return `
            <div class="task-card status-${task.status}">
                <div class="task-header">
                    <div class="task-assignee">
                        <i class="fas fa-user"></i>
                        <span>${this.escapeHtml(task.assignee)}</span>
                    </div>
                    <div class="task-actions">
                        <button class="action-btn edit" id="edit-${task.id}" title="Edit Task">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" id="delete-${task.id}" title="Delete Task">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="task-description">
                    ${this.escapeHtml(task.description)}
                </div>
                
                <div class="task-meta">
                    <div class="task-due-date ${dueDateClass}">
                        <i class="fas fa-calendar-alt"></i>
                        <span>Due: ${this.formatDate(task.dueDate)}</span>
                        ${isOverdue ? '<i class="fas fa-exclamation-triangle" style="color: #e53e3e;" title="Overdue"></i>' : ''}
                    </div>
                    <div class="task-status">
                        <i class="fas fa-info-circle"></i>
                        <span class="status-badge ${task.status}">${task.status}</span>
                    </div>
                </div>
                
                ${task.comments ? `
                    <div class="task-comments">
                        <i class="fas fa-comment"></i>
                        ${this.escapeHtml(task.comments)}
                    </div>
                ` : ''}
            </div>
        `;
    }

    handleSearch(e) {
        this.renderTasks();
    }

    handleFilter(e) {
        this.renderTasks();
    }

    updateEmptyState(show = null) {
        const emptyState = document.getElementById('emptyState');
        const tasksList = document.getElementById('tasksList');
        
        if (show === null) {
            show = this.tasks.length === 0;
        }
        
        if (show) {
            emptyState.style.display = 'block';
            tasksList.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            tasksList.style.display = 'grid';
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showMessage(message, type = 'info') {
        // Create a simple toast message
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#48bb78' : '#4299e1'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1001;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(toast);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

// Add CSS for toast animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .overdue {
        color: #e53e3e !important;
        font-weight: 600;
    }
`;
document.head.appendChild(style);

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TaskManager();
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + N to add new task
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        document.getElementById('addTaskBtn').click();
    }
    
    // Escape to close modal
    if (e.key === 'Escape') {
        const modal = document.getElementById('taskModal');
        if (modal.style.display === 'block') {
            document.getElementById('closeModal').click();
        }
    }
});
