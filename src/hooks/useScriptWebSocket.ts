import { useState, useEffect, useCallback, useRef } from 'react';
import WebSocketManager from '@/lib/websocket/WebSocketManager';

interface ScriptWebSocketProps {
  collectionId?: string;
  onScriptGenerated?: (scriptId: string) => void;
}

export function useScriptWebSocket({ collectionId, onScriptGenerated }: ScriptWebSocketProps) {
  const [scriptId, setScriptId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  
  // Use a ref to store the collection ID to prevent stale closures
  const collectionIdRef = useRef(collectionId);
  
  // Update the ref when collectionId changes
  useEffect(() => {
    collectionIdRef.current = collectionId;
  }, [collectionId]);
  
  // Get the WebSocket URL from environment variables or use a default
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8002/direct-ws';
  
  // Set up event handlers and manage connection
  useEffect(() => {
    if (!collectionId) return;
    
    // Create connection handlers
    const handleConnectionStatus = (connected: boolean) => {
      setIsConnected(connected);
      setStatus(connected ? 'connected' : 'disconnected');
      
      if (connected) {
        setError(null);
      }
    };
    
    const handleError = (err: Error) => {
      setError(err.message);
      setStatus('error');
    };
    
    const handleScriptGenerated = (generatedScriptId: string) => {
      setScriptId(generatedScriptId);
      setStatus('script_generated');
      
      if (onScriptGenerated) {
        onScriptGenerated(generatedScriptId);
      }
    };
    
    // Register event handlers
    WebSocketManager.on(collectionId, 'status', handleConnectionStatus);
    WebSocketManager.on(collectionId, 'error', handleError);
    WebSocketManager.on(collectionId, 'script_generated', handleScriptGenerated);
    
    // Get or create connection
    const socket = WebSocketManager.getConnection(collectionId, wsUrl);
    
    // Set initial connected state if socket already exists and is open
    if (socket && socket.readyState === WebSocket.OPEN) {
      setIsConnected(true);
      setStatus('connected');
    }
    
    // Cleanup function
    return () => {
      // Unregister event handlers
      WebSocketManager.off(collectionId, 'status', handleConnectionStatus);
      WebSocketManager.off(collectionId, 'error', handleError);
      WebSocketManager.off(collectionId, 'script_generated', handleScriptGenerated);
      
      // Don't close the connection here - let the manager handle connection lifecycle
    };
  }, [collectionId, wsUrl, onScriptGenerated]);
  
  // Add a reconnect function that uses the manager
  const reconnect = useCallback(() => {
    if (!collectionIdRef.current) return null;
    
    // Close existing connection if any
    WebSocketManager.closeConnection(collectionIdRef.current);
    
    // Create a new connection
    return WebSocketManager.getConnection(collectionIdRef.current, wsUrl);
  }, [wsUrl]);
  
  // Return the current state and functions
  return {
    scriptId,
    isConnected,
    error,
    status,
    reconnect
  };
}