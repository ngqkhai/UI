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
  job_complete: Set<(data: any) => void>;
}

export class WebSocketManager {
  private static instance: WebSocketManager;
  private connections: Map<string, WebSocket> = new Map();
  private lastConnectionAttempt: Map<string, number> = new Map();
  private eventHandlers: Map<string, WebSocketEvents> = new Map();
  private cooldownPeriod = 500; // ms
  private pingIntervals: Map<string, NodeJS.Timeout> = new Map(); // Store ping interval references
  private pingInterval = 30000; // Send a ping every 30 seconds
  
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
   * Get or create a WebSocket connection for a specific ID
   * This can be either a collection ID or a job ID
   */
  public getConnection(id: string, wsUrl: string): WebSocket | null {
    if (!id) return null;
    
    // Check for existing connection
    const existing = this.connections.get(id);
    if (existing && (existing.readyState === WebSocket.OPEN || 
                     existing.readyState === WebSocket.CONNECTING)) {
      console.log(`Reusing existing WebSocket connection for id: ${id}`);
      return existing;
    }
    
    // Check cooldown period
    const now = Date.now();
    const lastAttempt = this.lastConnectionAttempt.get(id) || 0;
    if (now - lastAttempt < this.cooldownPeriod) {
      console.log(`Connection attempt for ${id} rejected - in cooldown period`);
      return null;
    }
    
    // Create new connection - WebSocket URL should already include query params
    console.log(`Creating new WebSocket connection for id: ${id}`);
    this.lastConnectionAttempt.set(id, now);
    
    try {
      const socket = new WebSocket(wsUrl);
      this.connections.set(id, socket);
      
      // Initialize event handlers collection if it doesn't exist
      if (!this.eventHandlers.has(id)) {
        this.eventHandlers.set(id, {
          message: new Set(),
          status: new Set(),
          error: new Set(),
          script_generated: new Set(),
          job_complete: new Set()
        });
      }
      
      // Set up event handlers
      socket.onopen = () => {
        console.log(`WebSocket connected successfully for id: ${id}`);
        const handlers = this.eventHandlers.get(id);
        handlers?.status.forEach(handler => handler(true));
        
        // Set up ping interval to keep connection alive
        this.setupPingInterval(id, socket);
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          
          const handlers = this.eventHandlers.get(id);
          
          // Handle specific message types
          if (data.type === 'ping') {
            // Respond to ping messages with pong
            console.log('Responding to ping with pong');
            socket.send(JSON.stringify({ type: 'pong' }));
          } else if (data.type === 'script_generated') {
            // Add detailed debugging for script_generated events
            console.log('Script generated event received:', data);
            
            if (data.script_id) {
              console.log(`Script generation completed. Script ID: ${data.script_id}`);
              handlers?.script_generated.forEach(handler => handler(data.script_id));
            } else {
              console.error('Received script_generated event without script_id:', data);
            }
          } else if (data.type === 'job_status') {
            console.log(`Job status update received:`, data);
          } else if (data.type === 'job_complete') {
            console.log(`Job complete event received:`, data);
            handlers?.job_complete.forEach(handler => handler(data));
          }
          
          // Notify all message handlers regardless of message type
          handlers?.message.forEach(handler => handler(data));
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
          const handlers = this.eventHandlers.get(id);
          handlers?.error.forEach(handler => handler(new Error('Failed to parse WebSocket message')));
        }
      };
      
      socket.onerror = (event) => {
        console.error('WebSocket error:', event);
        const handlers = this.eventHandlers.get(id);
        handlers?.error.forEach(handler => handler(new Error('WebSocket connection error')));
        handlers?.status.forEach(handler => handler(false));
      };
      
      socket.onclose = (event) => {
        console.log(`WebSocket disconnected with code: ${event.code}, reason: ${event.reason}`);
        
        // Notify all status handlers
        const handlers = this.eventHandlers.get(id);
        handlers?.status.forEach(handler => handler(false));
        
        // Clean up connection from registry if it's the one we're tracking
        if (this.connections.get(id) === socket) {
          this.connections.delete(id);
        }
        
        // Try to reconnect automatically if the close was not intentional
        if (event.code !== 1000) {
          console.log(`Attempting to reconnect for id: ${id}`);
          // Implement reconnection with small delay to avoid immediate reconnection
          setTimeout(() => {
            this.getConnection(id, wsUrl);
          }, 1000);
        }
      };
      
      return socket;
    } catch (e: any) {
      console.error('Error creating WebSocket connection:', e);
      const handlers = this.eventHandlers.get(id);
      handlers?.error.forEach(handler => handler(new Error(`Failed to create WebSocket: ${e.message}`)));
      return null;
    }
  }
  
  /**
   * Register event handlers for a specific ID's WebSocket
   */
  public on(id: string, event: 'message' | 'status' | 'error' | 'script_generated' | 'job_complete', handler: any): void {
    if (!this.eventHandlers.has(id)) {
      this.eventHandlers.set(id, {
        message: new Set(),
        status: new Set(),
        error: new Set(),
        script_generated: new Set(),
        job_complete: new Set()
      });
    }
    
    const handlers = this.eventHandlers.get(id);
    if (handlers) {
      handlers[event].add(handler);
    }
  }
  
  /**
   * Unregister event handlers
   */
  public off(id: string, event: 'message' | 'status' | 'error' | 'script_generated' | 'job_complete', handler: any): void {
    const handlers = this.eventHandlers.get(id);
    if (handlers) {
      handlers[event].delete(handler);
    }
  }
  
  /**
   * Close a specific connection
   */
  public closeConnection(id: string): void {
    const socket = this.connections.get(id);
    if (socket && socket.readyState !== WebSocket.CLOSED && socket.readyState !== WebSocket.CLOSING) {
      console.log(`Manually closing WebSocket for id: ${id}`);
      socket.close(1000, "Connection closed by client");
      this.connections.delete(id);
      
      // Clean up ping interval
      if (this.pingIntervals.has(id)) {
        clearInterval(this.pingIntervals.get(id));
        this.pingIntervals.delete(id);
      }
    }
  }
  
  /**
   * Remove all handlers for a specific ID
   */
  public unregisterAllHandlers(id: string): void {
    if (this.eventHandlers.has(id)) {
      const handlers = this.eventHandlers.get(id)!;
      handlers.message.clear();
      handlers.status.clear();
      handlers.error.clear();
      handlers.script_generated.clear();
      handlers.job_complete.clear();
    }
  }
  
  /**
   * Debug method to log current connections
   */
  public debugConnections(): void {
    console.log("--- Current WebSocket Connections ---");
    this.connections.forEach((socket, id) => {
      console.log(`ID: ${id}, State: ${this.getReadyStateString(socket.readyState)}`);
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
  
  /**
   * Sets up a ping interval to keep the connection alive
   */
  private setupPingInterval(id: string, socket: WebSocket): void {
    // Clear any existing interval
    if (this.pingIntervals.has(id)) {
      clearInterval(this.pingIntervals.get(id));
    }
    
    // Set up new ping interval
    const interval = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        console.log(`Sending ping for connection: ${id}`);
        try {
          socket.send(JSON.stringify({ type: 'ping' }));
        } catch (e) {
          console.error('Error sending ping:', e);
        }
      } else {
        // Clear interval if socket is not open
        clearInterval(interval);
        this.pingIntervals.delete(id);
      }
    }, this.pingInterval);
    
    this.pingIntervals.set(id, interval);
  }
}

// Export a singleton instance
export default WebSocketManager.getInstance(); 