// Notification Server Simulation
// This would be a backend service in production

class NotificationServer {
    constructor() {
        this.subscribers = new Set();
        this.init();
    }

    init() {
        // Listen for messages from the main thread
        if (typeof window !== 'undefined') {
            window.addEventListener('message', (event) => {
                if (event.data.type === 'BROADCAST_NOTIFICATION') {
                    this.broadcastToAll(event.data.notification);
                }
            });
        }
    }

    // Add a subscriber
    addSubscriber(subscription) {
        this.subscribers.add(JSON.stringify(subscription));
        console.log(`New subscriber added. Total: ${this.subscribers.size}`);
    }

    // Remove a subscriber
    removeSubscriber(subscription) {
        this.subscribers.delete(JSON.stringify(subscription));
        console.log(`Subscriber removed. Total: ${this.subscribers.size}`);
    }

    // Broadcast notification to all subscribers
    async broadcastToAll(notificationData) {
        console.log(`Broadcasting to ${this.subscribers.size} subscribers:`, notificationData);
        
        const promises = Array.from(this.subscribers).map(async (subscriberJson) => {
            try {
                const subscriber = JSON.parse(subscriberJson);
                await this.sendNotificationToSubscriber(subscriber, notificationData);
            } catch (error) {
                console.error('Failed to send notification to subscriber:', error);
                // Remove invalid subscriber
                this.subscribers.delete(subscriberJson);
            }
        });

        await Promise.allSettled(promises);
    }

    // Send notification to a specific subscriber
    async sendNotificationToSubscriber(subscription, notificationData) {
        // In a real implementation, you would use web-push library
        // For now, we'll simulate the notification
        console.log('Sending notification to subscriber:', {
            endpoint: subscription.endpoint.substring(0, 50) + '...',
            notification: notificationData
        });

        // Simulate successful delivery
        return Promise.resolve();
    }

    // Predefined notification templates
    getNotificationTemplate(type, data = {}) {
        const templates = {
            'task_reminder': {
                title: 'Task Reminder',
                body: `Don't forget: ${data.taskTitle || 'You have pending tasks'}`,
                icon: '/icon-192x192.png',
                tag: 'task-reminder',
                data: { url: '/', type: 'task_reminder' }
            },
            'overdue_tasks': {
                title: 'Overdue Tasks',
                body: `You have ${data.count || 1} overdue task${data.count > 1 ? 's' : ''}`,
                icon: '/icon-192x192.png',
                tag: 'overdue-tasks',
                data: { url: '/', type: 'overdue_tasks' },
                requireInteraction: true
            },
            'team_update': {
                title: 'Team Update',
                body: data.message || 'There\'s a new team update',
                icon: '/icon-192x192.png',
                tag: 'team-update',
                data: { url: '/', type: 'team_update' }
            },
            'custom': {
                title: data.title || 'Task Manager',
                body: data.message || 'You have a new notification',
                icon: '/icon-192x192.png',
                tag: 'custom-notification',
                data: { url: '/', type: 'custom', ...data }
            }
        };

        return templates[type] || templates['custom'];
    }

    // Schedule recurring notifications
    scheduleRecurringNotifications() {
        // Check for overdue tasks every hour
        setInterval(() => {
            this.checkAndSendOverdueReminders();
        }, 60 * 60 * 1000); // 1 hour

        // Send daily summary at 9 AM
        const now = new Date();
        const nineAM = new Date();
        nineAM.setHours(9, 0, 0, 0);
        
        if (nineAM <= now) {
            nineAM.setDate(nineAM.getDate() + 1);
        }
        
        const timeUntilNineAM = nineAM.getTime() - now.getTime();
        
        setTimeout(() => {
            this.sendDailySummary();
            // Then repeat every 24 hours
            setInterval(() => this.sendDailySummary(), 24 * 60 * 60 * 1000);
        }, timeUntilNineAM);
    }

    async checkAndSendOverdueReminders() {
        // This would fetch overdue tasks from the database in production
        const notification = this.getNotificationTemplate('overdue_tasks', { count: 1 });
        await this.broadcastToAll(notification);
    }

    async sendDailySummary() {
        const notification = this.getNotificationTemplate('custom', {
            title: 'Daily Summary',
            message: 'Good morning! Check your tasks for today.'
        });
        await this.broadcastToAll(notification);
    }
}

// Initialize notification server (in production, this would be a separate service)
if (typeof window !== 'undefined') {
    window.notificationServer = new NotificationServer();
    
    // Example usage:
    // window.notificationServer.scheduleRecurringNotifications();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationServer;
}
