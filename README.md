# Task Manager App

A modern, responsive task management application built with HTML, CSS, and JavaScript. Works offline and can be accessed from any device, anywhere in the world. Now includes push notifications to keep everyone updated!

## 🌟 Features

- **Task Assignment**: Track who is responsible for each task
- **Task Description**: Detailed description of what needs to be done  
- **Due Dates**: Set and track when tasks need to be completed
- **Comments**: Add additional notes and context to tasks
- **Status Tracking**: Monitor task progress (Pending, In Progress, Completed)
- **Search & Filter**: Easily find tasks by searching or filtering by status
- **Cloud Sync**: Sync data across all your devices (optional)
- **Push Notifications**: Send notifications to all app users
- **Overdue Alerts**: Automatic notifications for overdue tasks
- **Offline Support**: Works without internet connection
- **PWA Ready**: Install as a mobile app
- **Responsive Design**: Works great on desktop and mobile devices
- **Export/Import**: Backup and restore your tasks

## 🔔 Notification Features

### For Users:
- **Enable Notifications**: Click the bell icon to enable push notifications
- **Overdue Reminders**: Get notified when tasks become overdue
- **Team Updates**: Receive notifications when others send updates
- **Custom Alerts**: Set up personalized notification preferences

### For Administrators:
- **Broadcast Messages**: Send notifications to all app users
- **Team Coordination**: Keep everyone informed about project updates
- **Deadline Reminders**: Automatic notifications for approaching deadlines
- **Status Updates**: Notify team when tasks are completed

## 📱 How to Enable Notifications

1. **Open the app** on any device
2. **Click the bell icon** (🔔) in the top right
3. **Allow notifications** when prompted by your browser
4. **You're all set!** You'll now receive:
   - Overdue task reminders
   - Team broadcast messages
   - Important updates

## 📢 Sending Notifications (Admin)

If you're managing a team:
1. **Enable notifications** first (bell icon)
2. **Click the menu** (⋮) next to the bell icon
3. **Select "Send Notification"**
4. **Type your message** and press OK
5. **All users** with notifications enabled will receive it!

## 🚀 Quick Start

### Local Development
1. Make sure Python is installed on your system
2. Open a terminal in the project directory
3. Run: `python -m http.server 8080`
4. Open your browser and navigate to `http://localhost:8080`

### Deploy to the Web (Make it accessible everywhere)
See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions on how to make your app available from any device and location using free hosting services like GitHub Pages, Netlify, or Vercel.

## 📱 Mobile Installation

Your app works as a Progressive Web App (PWA):
- **iPhone/iPad**: Open in Safari → Share → "Add to Home Screen"
- **Android**: Open in Chrome → Menu → "Add to Home Screen"
- **Desktop**: Look for the install button in your browser's address bar

## ☁️ Cross-Device Sync

Enable cloud synchronization to access your tasks from any device:

1. Click the cloud icon in the app
2. Enter your GitHub Personal Access Token
3. Your tasks will automatically sync across all your devices!

**To create a GitHub token:**
- Go to GitHub Settings → Developer Settings → Personal Access Tokens
- Generate new token with `gist` permissions
- Copy and paste into the app

## How to Use

### Adding a New Task

1. Click the "Add New Task" button
2. Fill in the form with:
   - **Who will do the job**: Enter the person's name or team responsible
   - **What needs to be done**: Describe the task in detail
   - **Date to be done**: Set the due date
   - **Comments**: Add any additional notes (optional)
   - **Status**: Set the initial status (defaults to Pending)
3. Click "Add Task" to save

### Managing Tasks

- **Edit**: Click the edit icon (pencil) on any task card to modify it
- **Delete**: Click the delete icon (trash) to remove a task
- **Search**: Use the search bar to find tasks by assignee, description, or comments
- **Filter**: Use the status dropdown to show only tasks with specific statuses

### Keyboard Shortcuts

- **Ctrl/Cmd + N**: Add new task
- **Escape**: Close modal dialogs

## Task Status Options

- **Pending**: Task has not been started yet (Orange indicator)
- **In Progress**: Task is currently being worked on (Blue indicator)  
- **Completed**: Task has been finished (Green indicator)

## Data Storage

All tasks are automatically saved to your browser's local storage. This means:
- Tasks persist between browser sessions
- Data is stored locally on your device
- No internet connection required after initial load
- Data is specific to each browser/device

## Browser Compatibility

This application works in all modern browsers including:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## File Structure

```
task-manager/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and responsive design
├── script.js           # JavaScript functionality
├── README.md           # Project documentation
└── .github/
    └── copilot-instructions.md  # Development guidelines
```

## Technical Details

- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **Storage**: Browser LocalStorage API
- **Icons**: Font Awesome 6
- **Fonts**: Google Fonts (Inter)
- **Responsive**: CSS Grid and Flexbox
- **Animations**: CSS animations and transitions

## Features Overview

### User Interface
- Modern gradient background with glass-morphism effects
- Card-based layout for tasks
- Responsive design that works on all screen sizes
- Smooth animations and hover effects
- Modal dialogs for task creation/editing

### Functionality
- Create, read, update, and delete tasks (CRUD operations)
- Real-time search across all task fields
- Filter tasks by status
- Visual overdue indicators
- Form validation
- Toast notifications for user feedback
- Keyboard shortcuts for power users

## Future Enhancements

Potential features that could be added:
- Task categories/tags
- Priority levels
- Due date reminders
- Export to CSV/JSON
- Team collaboration features
- Task templates
- Time tracking
- Recurring tasks

## Support

For questions or issues:
1. Check the browser console for any error messages
2. Ensure JavaScript is enabled in your browser
3. Try refreshing the page or clearing browser cache
4. Make sure you're using a supported browser version

---

**Enjoy managing your tasks efficiently!** 🚀
