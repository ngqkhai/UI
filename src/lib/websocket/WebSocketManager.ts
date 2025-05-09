/**
 * WebSocketManager - Singleton service for managing WebSocket connections
 * 
 * This service manages WebSocket connections outside of React's component lifecycle,
 * preventing rapid connection/disconnection cycles and offering better stability.
 */

type MessageHandler = (data: any) => void;
type ConnectionStatusHandler = (isConnected: boolean) => void;

interface WebSocketEvents {
  message: Set<MessageHandler>;
  status: Set<ConnectionStatusHandler>;
  error: Set<(error: Error) => void>;
  script_generated: Set<(scriptId: string) => void>;
}

export class WebSocketManager {
  private static instance: WebSocketManager;
  private connections: Map<string, WebSocket> = new Map();
  private lastConnectionAttempt: Map<string, number> = new Map();
  private eventHandlers: Map<string, WebSocketEvents> = new Map();
  private cooldownPeriod = 500; // ms
  
  // Private constructor for singleton pattern
  private constructor() {}
  
  /**
   * Get the singleton instance of WebSocketManager
   */
  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }
  
  /**
   * Get or create a WebSocket connection for a specific collection ID
   */
  public getConnection(collectionId: string, wsUrl: string): WebSocket | null {
    if (!collectionId) return null;
    
    // Check for existing connection
    const existing = this.connections.get(collectionId);
    if (existing && (existing.readyState === WebSocket.OPEN || 
                     existing.readyState === WebSocket.CONNECTING)) {
      console.log(`Reusing existing WebSocket connection for collection_id: ${collectionId}`);
      return existing;
    }
    
    // Check cooldown period
    const now = Date.now();
    const lastAttempt = this.lastConnectionAttempt.get(collectionId) || 0;
    if (now - lastAttempt < this.cooldownPeriod) {
      console.log(`Connection attempt for ${collectionId} rejected - in cooldown period`);
      return null;
    }
    
    // Create new connection
    console.log(`Creating new WebSocket connection for collection_id: ${collectionId}`);
    this.lastConnectionAttempt.set(collectionId, now);
    
    try {
      const socket = new WebSocket(`${wsUrl}?collection_id=${collectionId}`);
      this.connections.set(collectionId, socket);
      
      // Initialize event handlers collection if it doesn't exist
      if (!this.eventHandlers.has(collectionId)) {
        this.eventHandlers.set(collectionId, {
          message: new Set(),
          status: new Set(),
          error: new Set(),
          script_generated: new Set()
        });
      }
      
      // Set up event handlers
      socket.onopen = () => {
        console.log(`WebSocket connected successfully for collection_id: ${collectionId}`);
        const handlers = this.eventHandlers.get(collectionId);
        handlers?.status.forEach(handler => handler(true));
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          
          const handlers = this.eventHandlers.get(collectionId);
          
          // Handle specific message types
          if (data.type === 'ping') {
            // Respond to ping messages with pong
            console.log('Responding to ping with pong');
            socket.send(JSON.stringify({ type: 'pong' }));
          } else if (data.type === 'script_generated') {
            // Add detailed debugging for script_generated events
            console.log('!!! SCRIPT GENERATED EVENT RECEIVED !!!');
            console.log('Event collection_id:', data.collection_id);
            console.log('Current collection_id:', collectionId);
            console.log('Script ID:', data.script_id);
            console.log('Full data:', data);
            
            if (data.collection_id === collectionId) {
              if (data.script_id) {
                console.log(`Script generation completed. Script ID: ${data.script_id}`);
                handlers?.script_generated.forEach(handler => handler(data.script_id));
              } else {
                console.error('Received script_generated event without script_id:', data);
              }
            } else {
              console.warn(`Received script_generated event for collection ${data.collection_id} but listening for ${collectionId}`);
            }
          } else if (data.type === 'status_update') {
            console.log(`Status update received: ${data.status}`);
            // Forward status updates to handlers
          }
          
          // Notify all message handlers regardless of message type
          handlers?.message.forEach(handler => handler(data));
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
          const handlers = this.eventHandlers.get(collectionId);
          handlers?.error.forEach(handler => handler(new Error('Failed to parse WebSocket message')));
        }
      };
      
      socket.onerror = (event) => {
        console.error('WebSocket error:', event);
        const handlers = this.eventHandlers.get(collectionId);
        handlers?.error.forEach(handler => handler(new Error('WebSocket connection error')));
        handlers?.status.forEach(handler => handler(false));
      };
      
      socket.onclose = (event) => {
        console.log(`WebSocket disconnected with code: ${event.code}, reason: ${event.reason}`);
        
        // Notify all status handlers
        const handlers = this.eventHandlers.get(collectionId);
        handlers?.status.forEach(handler => handler(false));
        
        // Clean up connection from registry if it's the one we're tracking
        if (this.connections.get(collectionId) === socket) {
          this.connections.delete(collectionId);
        }
        
        // Try to reconnect automatically if the close was not intentional
        if (event.code !== 1000) {
          console.log(`Attempting to reconnect for collection_id: ${collectionId}`);
          // Implement reconnection with small delay to avoid immediate reconnection
          setTimeout(() => {
            this.getConnection(collectionId, wsUrl);
          }, 1000);
        }
      };
      
      return socket;
    } catch (e: any) {
      console.error('Error creating WebSocket connection:', e);
      const handlers = this.eventHandlers.get(collectionId);
      handlers?.error.forEach(handler => handler(new Error(`Failed to create WebSocket: ${e.message}`)));
      return null;
    }
  }
  
  /**
   * Register event handlers for a specific collection's WebSocket
   */
  public on(collectionId: string, event: 'message' | 'status' | 'error' | 'script_generated', handler: any): void {
    if (!this.eventHandlers.has(collectionId)) {
      this.eventHandlers.set(collectionId, {
        message: new Set(),
        status: new Set(),
        error: new Set(),
        script_generated: new Set()
      });
    }
    
    const handlers = this.eventHandlers.get(collectionId);
    if (handlers) {
      handlers[event].add(handler);
    }
  }
  
  /**
   * Unregister event handlers
   */
  public off(collectionId: string, event: 'message' | 'status' | 'error' | 'script_generated', handler: any): void {
    const handlers = this.eventHandlers.get(collectionId);
    if (handlers) {
      handlers[event].delete(handler);
    }
  }
  
  /**
   * Close a specific connection
   */
  public closeConnection(collectionId: string): void {
    const socket = this.connections.get(collectionId);
    if (socket && socket.readyState !== WebSocket.CLOSED && socket.readyState !== WebSocket.CLOSING) {
      console.log(`Manually closing WebSocket for collection_id: ${collectionId}`);
      socket.close(1000, "Connection closed by client");
      this.connections.delete(collectionId);
    }
  }
  
  /**
   * Remove all handlers for a specific collection ID
   */
  public unregisterAllHandlers(collectionId: string): void {
    if (this.eventHandlers.has(collectionId)) {
      const handlers = this.eventHandlers.get(collectionId)!;
      handlers.message.clear();
      handlers.status.clear();
      handlers.error.clear();
      handlers.script_generated.clear();
    }
  }
  
  /**
   * Debug method to log current connections
   */
  public debugConnections(): void {
    console.log("--- Current WebSocket Connections ---");
    this.connections.forEach((socket, collectionId) => {
      console.log(`Collection ID: ${collectionId}, State: ${this.getReadyStateString(socket.readyState)}`);
    });
    console.log("--- End Connection List ---");
  }
  
  private getReadyStateString(state: number): string {
    switch (state) {
      case WebSocket.CONNECTING: return "CONNECTING";
      case WebSocket.OPEN: return "OPEN";
      case WebSocket.CLOSING: return "CLOSING";
      case WebSocket.CLOSED: return "CLOSED";
      default: return "UNKNOWN";
    }
  }
}

// Export a singleton instance
export default WebSocketManager.getInstance(); 