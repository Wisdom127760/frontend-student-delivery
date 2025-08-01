import { io } from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.listeners = new Map();
    }

    // Initialize socket connection
    connect(userId, userType) {
        if (this.socket) {
            this.disconnect();
        }

        const serverUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
        console.log('Connecting to socket server:', serverUrl);

        this.socket = io(serverUrl, {
            transports: ['websocket', 'polling'],
            autoConnect: true,
            timeout: 10000
        });

        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket.id);
            this.isConnected = true;

            // Authenticate with server
            console.log('Authenticating socket with:', { userId, userType });
            this.socket.emit('authenticate', { userId, userType });
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
            this.isConnected = false;
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            this.isConnected = false;
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        return this.socket;
    }

    // Disconnect socket
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }
    }

    // Add event listener
    on(event, callback) {
        if (!this.socket) {
            console.warn('Socket not connected. Call connect() first.');
            return;
        }

        console.log('Adding socket listener for event:', event);
        this.socket.on(event, callback);

        // Store listener for cleanup
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    // Remove event listener
    off(event, callback) {
        if (!this.socket) return;

        this.socket.off(event, callback);

        // Remove from stored listeners
        if (this.listeners.has(event)) {
            const listeners = this.listeners.get(event);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    // Emit event
    emit(event, data) {
        if (!this.socket) {
            console.warn('Socket not connected. Call connect() first.');
            return;
        }

        this.socket.emit(event, data);
    }

    // Get connection status
    getConnectionStatus() {
        return this.isConnected;
    }

    // Cleanup all listeners
    cleanup() {
        if (this.socket) {
            this.listeners.forEach((callbacks, event) => {
                callbacks.forEach(callback => {
                    this.socket.off(event, callback);
                });
            });
            this.listeners.clear();
        }
    }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService; 