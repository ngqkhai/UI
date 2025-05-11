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
  // Fixed to use API Gateway WebSocket endpoint instead of direct script-generator connection
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';
  
  // Set up event handlers and manage connection
  useEffect(() => {
    if (!collectionId) return;
    
    console.log(`Setting up WebSocket handlers for collection: ${collectionId}`);
    
    // Create connection handlers
    const handleConnectionStatus = (connected: boolean) => {
      console.log(`WebSocket connection changed to: ${connected ? 'connected' : 'disconnected'} for collection: ${collectionId}`);
      setIsConnected(connected);
      setStatus(connected ? 'connected' : 'disconnected');
      
      if (connected) {
        setError(null);
      }
    };
    
    const handleError = (err: Error) => {
      console.error(`WebSocket error for collection ${collectionId}:`, err);
      setError(err.message);
      setStatus('error');
    };
    
    const handleScriptGenerated = (generatedScriptId: string) => {
      console.log(`Script generated event received for collection ${collectionId}. Script ID: ${generatedScriptId}`);
      setScriptId(generatedScriptId);
      setStatus('script_generated');
      
      if (onScriptGenerated) {
        onScriptGenerated(generatedScriptId);
      }
    };
    
    // Updated to handle both standard message events and script_generated events
    const handleMessage = (data: any) => {
      console.log(`WebSocket message received for collection ${collectionId}:`, data);
      
      if (data.type === 'script_generated' && data.script_id) {
        handleScriptGenerated(data.script_id);
      } else if (data.type === 'collection_status') {
        console.log(`Collection status update: ${data.status}, progress: ${data.progress || 0}%`);
        setStatus(data.status);
      } else if (data.type === 'pong') {
        console.log(`Received pong response for collection ${collectionId}`);
      }
    };
    
    // Register event handlers
    WebSocketManager.on(collectionId, 'status', handleConnectionStatus);
    WebSocketManager.on(collectionId, 'error', handleError);
    WebSocketManager.on(collectionId, 'script_generated', handleScriptGenerated);
    WebSocketManager.on(collectionId, 'message', handleMessage);
    
    // Get or create connection with collection_id parameter for API Gateway
    const wsUrlWithCollectionId = `${wsUrl}?collection_id=${collectionId}`;
    const socket = WebSocketManager.getConnection(collectionId, wsUrlWithCollectionId);
    
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
      WebSocketManager.off(collectionId, 'message', handleMessage);
      
      // Don't close the connection here - let the manager handle connection lifecycle
    };
  }, [collectionId, wsUrl, onScriptGenerated]);
  
  // Add a reconnect function that uses the manager
  const reconnect = useCallback(() => {
    if (!collectionIdRef.current) return null;
    
    // Close existing connection if any
    WebSocketManager.closeConnection(collectionIdRef.current);
    
    // Create a new connection with collection_id parameter
    const wsUrlWithCollectionId = `${wsUrl}?collection_id=${collectionIdRef.current}`;
    return WebSocketManager.getConnection(collectionIdRef.current, wsUrlWithCollectionId);
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