// Task Manager Application
class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.taskIdCounter = this.getNextTaskId();
        this.initializeEventListeners();
        this.renderTasks();
        this.updateStats();
    }

    // Initialize event listeners
    initializeEventListeners() {
        const addTaskBtn = document.getElementById('addTaskBtn');
        const taskInput = document.getElementById('taskInput');

        addTaskBtn.addEventListener('click', () => this.addTask());
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });

        // Focus on input when page loads
        taskInput.focus();
    }

    // Add a new task
    addTask() {
        const taskInput = document.getElementById('taskInput');
        const taskText = taskInput.value.trim();

        if (taskText === '') {
            this.showNotification('Please enter a task!', 'error');
            return;
        }

        if (taskText.length > 100) {
            this.showNotification('Task is too long! Maximum 100 characters.', 'error');
            return;
        }

        const newTask = {
            id: this.taskIdCounter++,
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(newTask); // Add to beginning of array
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        
        taskInput.value = '';
        taskInput.focus();
        
        this.showNotification('Task added successfully!', 'success');
    }

    // Toggle task completion
    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            
            const message = task.completed ? 'Task completed!' : 'Task marked as incomplete';
            this.showNotification(message, 'info');
        }
    }

    // Delete a task
    deleteTask(taskId) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex > -1) {
            this.tasks.splice(taskIndex, 1);
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.showNotification('Task deleted!', 'info');
        }
    }

    // Render all tasks
    renderTasks() {
        const taskList = document.getElementById('taskList');
        
        if (this.tasks.length === 0) {
            taskList.innerHTML = '<li class="empty-state">No tasks yet. Add your first task above!</li>';
            return;
        }

        taskList.innerHTML = this.tasks.map(task => `
            <li class="task-item ${task.completed ? 'completed' : ''}">
                <span class="task-text">${this.escapeHtml(task.text)}</span>
                <div class="task-actions">
                    <button class="task-btn complete-btn" onclick="taskManager.toggleTask(${task.id})">
                        ${task.completed ? '↩️ Undo' : '✅ Complete'}
                    </button>
                    <button class="task-btn delete-btn" onclick="taskManager.deleteTask(${task.id})">
                        🗑️ Delete
                    </button>
                </div>
            </li>
        `).join('');
    }

    // Update task statistics
    updateStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        
        document.getElementById('totalTasks').textContent = `Total: ${totalTasks}`;
        document.getElementById('completedTasks').textContent = `Completed: ${completedTasks}`;
    }

    // Save tasks to localStorage
    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
        localStorage.setItem('taskIdCounter', this.taskIdCounter.toString());
    }

    // Load tasks from localStorage
    loadTasks() {
        const savedTasks = localStorage.getItem('tasks');
        return savedTasks ? JSON.parse(savedTasks) : [];
    }

    // Get next task ID
    getNextTaskId() {
        const savedCounter = localStorage.getItem('taskIdCounter');
        return savedCounter ? parseInt(savedCounter) : 1;
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        `;

        // Set background color based on type
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#17a2b8'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        // Add to DOM
        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Clear all tasks (for demo purposes)
    clearAllTasks() {
        if (confirm('Are you sure you want to clear all tasks?')) {
            this.tasks = [];
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.showNotification('All tasks cleared!', 'info');
        }
    }
}

// Add notification animations to CSS
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);

// Initialize the application
let taskManager;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    taskManager = new TaskManager();
    
    // Add some demo functionality
    console.log('🚀 Task Manager loaded successfully!');
    console.log('💡 Try adding some tasks to see the app in action');
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter to add task
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            taskManager.addTask();
        }
        
        // Ctrl/Cmd + K to clear all tasks
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            taskManager.clearAllTasks();
        }
    });
});

// Add some sample data on first load (optional)
if (typeof window !== 'undefined' && !localStorage.getItem('tasks')) {
    console.log('🎯 First time loading - you can add sample tasks if needed');
}