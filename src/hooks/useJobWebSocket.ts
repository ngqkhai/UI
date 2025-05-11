import { useState, useEffect, useCallback, useRef } from 'react';
import WebSocketManager from '@/lib/websocket/WebSocketManager';

interface JobWebSocketProps {
  jobId?: string;
  onJobComplete?: (data: any) => void;
  onStatusChange?: (status: string) => void;
}

export function useJobWebSocket({ jobId, onJobComplete, onStatusChange }: JobWebSocketProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [scriptText, setScriptText] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  
  // Use a ref to store the job ID to prevent stale closures
  const jobIdRef = useRef(jobId);
  
  // Update the ref when jobId changes
  useEffect(() => {
    jobIdRef.current = jobId;
  }, [jobId]);
  
  // Get the WebSocket URL from environment variables or use a default
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';
  
  // Set up event handlers and manage connection
  useEffect(() => {
    if (!jobId) return;
    
    // Create connection handlers
    const handleConnectionStatus = (connected: boolean) => {
      setIsConnected(connected);
      if (connected) {
        setError(null);
      }
    };
    
    const handleError = (err: Error) => {
      setError(err.message);
    };
    
    const handleMessage = (data: any) => {
      console.log('WebSocket message received:', data);
      
      if (data.type === 'job_status') {
        // Update job status
        setStatus(data.status);
        if (onStatusChange) {
          onStatusChange(data.status);
        }
      } 
      else if (data.type === 'job_complete') {
        // Handle job complete event
        setStatus('READY');
        setScriptText(data.script_text);
        setAudioUrl(data.audio_url);
        setImageUrls(data.image_urls || []);
        setIsComplete(true);
        
        if (onJobComplete) {
          onJobComplete({
            jobId: data.job_id,
            scriptText: data.script_text,
            audioUrl: data.audio_url,
            imageUrls: data.image_urls || []
          });
        }
      }
    };
    
    // Register event handlers
    WebSocketManager.on(jobId, 'status', handleConnectionStatus);
    WebSocketManager.on(jobId, 'error', handleError);
    WebSocketManager.on(jobId, 'message', handleMessage);
    
    // Get or create connection with the job ID in the query param
    const wsUrlWithJobId = `${wsUrl}?job_id=${jobId}`;
    const socket = WebSocketManager.getConnection(jobId, wsUrlWithJobId);
    
    // Set initial connected state if socket already exists and is open
    if (socket && socket.readyState === WebSocket.OPEN) {
      setIsConnected(true);
    }
    
    // Cleanup function
    return () => {
      // Unregister event handlers
      WebSocketManager.off(jobId, 'status', handleConnectionStatus);
      WebSocketManager.off(jobId, 'error', handleError);
      WebSocketManager.off(jobId, 'message', handleMessage);
    };
  }, [jobId, wsUrl, onJobComplete, onStatusChange]);
  
  // Add a reconnect function that uses the manager
  const reconnect = useCallback(() => {
    if (!jobIdRef.current) return null;
    
    // Close existing connection if any
    WebSocketManager.closeConnection(jobIdRef.current);
    
    // Create a new connection with the job ID in the query param
    const wsUrlWithJobId = `${wsUrl}?job_id=${jobIdRef.current}`;
    return WebSocketManager.getConnection(jobIdRef.current, wsUrlWithJobId);
  }, [wsUrl]);
  
  // Check job status via HTTP as a fallback (polling)
  const checkJobStatus = useCallback(async () => {
    if (!jobIdRef.current) return;
    
    try {
      const response = await fetch(`/api/scripts/${jobIdRef.current}`);
      if (response.ok) {
        const data = await response.json();
        setStatus(data.status);
        
        if (data.status === 'READY') {
          setScriptText(data.script_text);
          setAudioUrl(data.audio_url);
          setImageUrls(data.image_urls || []);
          setIsComplete(true);
          
          if (onJobComplete) {
            onJobComplete({
              jobId: data.id,
              scriptText: data.script_text,
              audioUrl: data.audio_url,
              imageUrls: data.image_urls || []
            });
          }
        }
        
        if (onStatusChange) {
          onStatusChange(data.status);
        }
      }
    } catch (err) {
      console.error('Error checking job status:', err);
    }
  }, [onJobComplete, onStatusChange]);
  
  // Return the current state and functions
  return {
    isConnected,
    error,
    status,
    audioUrl,
    imageUrls,
    scriptText,
    isComplete,
    reconnect,
    checkJobStatus
  };
} 