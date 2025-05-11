"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, FileText, ArrowLeft, Video, Download, Edit, Play, Pause, Volume2 } from "lucide-react";
import { ImageIcon } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/config";
import Image from "next/image";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import ErrorBoundary from "@/components/ErrorBoundary";

interface VoiceData {
  scene_id: string;
  voice_id: string;
  audio_url: string;
  cloudinary_url: string;
  duration: number;
}

interface ImageData {
  scene_id: string;
  cloudinary_url: string;
}

interface ScriptScene {
  scene_id?: string;
  scene_number: number;
  title: string;
  script: string;
  visual: string;
  time?: string;
}

interface ScriptData {
  metadata: {
    title: string;
    topic: string;
    style: string;
    duration: string;
    language: string;
    target_audience?: string;
  };
  scenes: ScriptScene[];
}

interface VoiceDataContainer {
  scene_voiceovers: VoiceData[];
}

interface ImageDataContainer {
  scene_images: ImageData[];
}

interface CompleteScriptData {
  job_id?: string;
  script_id?: string;
  script: ScriptData;
  voice_data?: VoiceDataContainer;
  image_data?: ImageDataContainer;
  // For backward compatibility
  voice?: {
    script_id: string;
    collection_id: string;
    scene_voiceovers: VoiceData[];
  };
  image?: {
    script_id: string;
    collection_id: string;
    scene_images: ImageData[];
  };
  status: string;
}

export default function ScriptReviewPage() {
  return (
    <ErrorBoundary>
      <ScriptReviewContent />
    </ErrorBoundary>
  );
}

function ScriptReviewContent() {
  const { scriptId } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [scriptData, setScriptData] = useState<CompleteScriptData | null>(null);
  const [expandedScenes, setExpandedScenes] = useState<Record<string, boolean>>({});
  const [expandAll, setExpandAll] = useState(true);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const sceneRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  
  // Edit dialog states
  const [editScriptOpen, setEditScriptOpen] = useState(false);
  const [editVisualOpen, setEditVisualOpen] = useState(false);
  const [currentEditingScene, setCurrentEditingScene] = useState<{sceneId: string, index: number} | null>(null);
  const [editedScript, setEditedScript] = useState('');
  const [editedVisual, setEditedVisual] = useState('');
  const [updating, setUpdating] = useState(false);
  
  // Fetch script data
  useEffect(() => {
    const fetchScript = async () => {
      if (!scriptId) return;
      
      try {
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.script(scriptId as string));
        
        if (!response.ok) {
          throw new Error("Failed to fetch script data");
        }
        
        const data = await response.json();
        
        // Log the data structure for debugging - only the structure not the full content
        console.log('API response data structure:', {
          keys: Object.keys(data),
          scriptKeys: data.script ? Object.keys(data.script) : null,
          voiceKeys: data.voice ? Object.keys(data.voice) : null,
          voice_dataKeys: data.voice_data ? Object.keys(data.voice_data) : null,
          imageKeys: data.image ? Object.keys(data.image) : null,
          image_dataKeys: data.image_data ? Object.keys(data.image_data) : null,
        });
        
        // Ensure we have a valid response structure
        const scriptData: CompleteScriptData = {
          script: data.script || {},
          voice_data: data.voice_data || data.voice || undefined,
          image_data: data.image_data || data.image || undefined,
          status: data.status || "pending"
        };
        
        console.log('Parsed script data:', scriptData);
        
        setScriptData(scriptData);
        
        // Initialize all scenes as expanded - ONLY ONCE
        if (data.script?.scenes && Object.keys(expandedScenes).length === 0) {
          console.log('Initializing expanded scenes state');
          const initialState = data.script.scenes.reduce((acc: Record<string, boolean>, scene: ScriptScene, index: number) => {
            acc[scene.scene_id || `scene-${index}`] = true;
            return acc;
          }, {});
          setExpandedScenes(initialState);
        }
      } catch (error) {
        console.error("Error fetching script:", error);
        toast({
          title: "Error",
          description: "Failed to load script data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchScript();
  }, [scriptId, toast]);
  
  // Handle audio playback
  useEffect(() => {
    // Pause all audio when a new one starts playing
    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        if (audio) {
          audio.pause();
        }
      });
    };
  }, []);
  
  const handlePlayAudio = (sceneId: string) => {
    const audioElement = audioRefs.current[sceneId];
    
    // Pause any currently playing audio
    Object.entries(audioRefs.current).forEach(([id, audio]) => {
      if (id !== sceneId && audio) {
        audio.pause();
        if (id === playingAudio) {
          setPlayingAudio(null);
        }
      }
    });
    
    // Play or pause the selected audio
    if (audioElement) {
      if (playingAudio === sceneId) {
        audioElement.pause();
        setPlayingAudio(null);
      } else {
        audioElement.play();
        setPlayingAudio(sceneId);
      }
    }
  };
  
  // Helper function to update script in database
  const updateScriptInDb = async (updatedData: CompleteScriptData) => {
    const response = await fetch(API_ENDPOINTS.script(scriptId as string), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update script in database');
    }
    
    return response.json();
  };
  
  // Helper function to get the voiceover data for a specific scene
  const getVoiceoverForScene = (sceneId: string): VoiceData | undefined => {
    // Handle both voice and voice_data structures for compatibility
    if (scriptData?.voice_data?.scene_voiceovers) {
      return scriptData.voice_data.scene_voiceovers.find(
        (vo: VoiceData) => vo.scene_id === sceneId
      );
    }
    
    if (scriptData?.voice?.scene_voiceovers) {
      return scriptData.voice.scene_voiceovers.find(
        (vo: VoiceData) => vo.scene_id === sceneId
      );
    }
    
    return undefined;
  };
  
  // Helper function to get the image data for a specific scene
  const getImageForScene = (sceneId: string): ImageData | undefined => {
    // Handle both image and image_data structures for compatibility
    if (scriptData?.image_data?.scene_images) {
      return scriptData.image_data.scene_images.find(
        (img: ImageData) => img.scene_id === sceneId
      );
    }
    
    if (scriptData?.image?.scene_images) {
      return scriptData.image.scene_images.find(
        (img: ImageData) => img.scene_id === sceneId
      );
    }
    
    return undefined;
  };
  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);
  
  // Handle session loading state
  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
      </main>
    );
  }
  
  if (!session) {
    return null;
  }
  
  const toggleScene = (sceneId: string) => {
    console.log(`Toggling scene ${sceneId}, current state:`, expandedScenes[sceneId]);
    setExpandedScenes(prev => ({
      ...prev,
      [sceneId]: !prev[sceneId]
    }));
  };
  
  const toggleAllScenes = () => {
    const newState = !expandAll;
    setExpandAll(newState);
    
    if (scriptData?.script?.scenes) {
      const updatedState = scriptData.script.scenes.reduce((acc: Record<string, boolean>, scene: ScriptScene, index: number) => {
        acc[scene.scene_id || `scene-${index}`] = newState;
        return acc;
      }, {});
      setExpandedScenes(updatedState);
    }
  };
  
  const scrollToScene = (sceneId: string) => {
    sceneRefs.current[sceneId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  
  // Navigate back to create page
  const handleGoBack = () => {
    router.push("/dashboard/create");
  };
  
  // Proceed to video creation
  const handleCreateVideo = () => {
    toast({
      title: "Starting Video Generation",
      description: "Your video will be created based on this script.",
    });
    // Add your video generation logic here
  };
  
  // Generate a subtle gradient color for each scene
  const getSceneGradient = (index: number) => {
    const hues = [210, 230, 250, 270, 290];
    const hue = hues[index % hues.length];
    return `bg-gradient-to-br from-[hsl(${hue},100%,97%)] to-[hsl(${hue+10},100%,98%)]`;
  };
  
  // Format duration in seconds to MM:SS
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Open script edit dialog
  const handleOpenScriptEdit = (sceneId: string, index: number, scriptText: string) => {
    console.log('Opening script edit dialog', { sceneId, index, scriptText });
    setCurrentEditingScene({ sceneId, index });
    setEditedScript(scriptText);
    setEditScriptOpen(true);
  };
  
  // Open visual edit dialog
  const handleOpenVisualEdit = (sceneId: string, index: number, visualText: string) => {
    console.log('Opening visual edit dialog', { sceneId, index, visualText });
    setCurrentEditingScene({ sceneId, index });
    setEditedVisual(visualText);
    setEditVisualOpen(true);
  };
  
  // Submit edited script and generate new voiceover
  const handleSubmitScriptEdit = async () => {
    if (!currentEditingScene || !scriptData) return;
    
    setUpdating(true);
    try {
      // Create a deep copy of the script data
      const updatedScriptData = JSON.parse(JSON.stringify(scriptData));
      
      // Update the script text in the copied data
      const sceneIndex = currentEditingScene.index;
      updatedScriptData.script.scenes[sceneIndex].script = editedScript;
      
      // Find the voice data for this scene
      const sceneId = currentEditingScene.sceneId;
      const voiceData = getVoiceoverForScene(sceneId);
      
      if (voiceData) {
        // Generate new voiceover with the edited script
        const voiceResponse = await fetch(API_ENDPOINTS.voiceSynthesize, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: editedScript,
            voice_id: voiceData.voice_id,
            language: 'en-US', // Default language, could be parameterized
            speed: 1.0,        // Default speed, could be parameterized
            scene_id: sceneId,
          }),
        });
        
        if (!voiceResponse.ok) {
          throw new Error('Failed to generate new voiceover');
        }
        
        const newVoiceData = await voiceResponse.json();
        
        // Update the voice data in script data - make sure we use voice_data not voice
        if (updatedScriptData.voice_data && updatedScriptData.voice_data.scene_voiceovers) {
          const voiceoverIndex = updatedScriptData.voice_data.scene_voiceovers.findIndex(
            (vo: VoiceData) => vo.scene_id === sceneId
          );
          
          if (voiceoverIndex !== -1) {
            updatedScriptData.voice_data.scene_voiceovers[voiceoverIndex] = {
              ...updatedScriptData.voice_data.scene_voiceovers[voiceoverIndex],
              audio_url: newVoiceData.audio_url,
              cloudinary_url: newVoiceData.cloudinary_url,
              duration: newVoiceData.duration
            };
          }
        }
      }
      
      // Update MongoDB with the new script data
      await updateScriptInDb(updatedScriptData);
      
      // Update local state
      setScriptData(updatedScriptData);
      
      toast({
        title: "Script Updated",
        description: "Script text and voiceover have been updated.",
      });
      
    } catch (error) {
      console.error('Error updating script:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update script and voiceover.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
      setEditScriptOpen(false);
    }
  };
  
  // Submit edited visual and generate new image
  const handleSubmitVisualEdit = async () => {
    if (!currentEditingScene || !scriptData) return;
    
    setUpdating(true);
    try {
      // Create a deep copy of the script data
      const updatedScriptData = JSON.parse(JSON.stringify(scriptData));
      
      // Update the visual description in the copied data
      const sceneIndex = currentEditingScene.index;
      updatedScriptData.script.scenes[sceneIndex].visual = editedVisual;
      
      // Find the scene ID
      const sceneId = currentEditingScene.sceneId;
      
      // Generate new image with the edited visual description
      const visualResponse = await fetch(API_ENDPOINTS.visuals, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: editedVisual,
          scene_id: sceneId,
          script_id: scriptId
        }),
      });
      
      if (!visualResponse.ok) {
        throw new Error('Failed to generate new image');
      }
      
      const newImageData = await visualResponse.json();
      
      // Update the image data in script data - make sure we use image_data not image
      if (updatedScriptData.image_data && updatedScriptData.image_data.scene_images) {
        const imageIndex = updatedScriptData.image_data.scene_images.findIndex(
          (img: ImageData) => img.scene_id === sceneId
        );
        
        if (imageIndex !== -1) {
          updatedScriptData.image_data.scene_images[imageIndex] = {
            ...updatedScriptData.image_data.scene_images[imageIndex],
            cloudinary_url: newImageData.cloudinary_url
          };
        } else if (newImageData.cloudinary_url) {
          // Add new image if it doesn't exist
          updatedScriptData.image_data.scene_images.push({
            scene_id: sceneId,
            cloudinary_url: newImageData.cloudinary_url
          });
        }
      }
      
      // Update MongoDB with the new script data
      await updateScriptInDb(updatedScriptData);
      
      // Update local state
      setScriptData(updatedScriptData);
      
      toast({
        title: "Visual Updated",
        description: "Visual description and image have been updated.",
      });
      
    } catch (error) {
      console.error('Error updating visual:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update visual description and image.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
      setEditVisualOpen(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
          <h2 className="text-xl font-medium text-gray-700">Loading script...</h2>
        </div>
      </div>
    );
  }
  
  if (!scriptData?.script) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-medium text-gray-700 mb-2">Script Not Found</h2>
          <p className="text-gray-500 mb-6">The requested script could not be found or has been deleted.</p>
          <Button onClick={handleGoBack} variant="outline" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Script Creation
          </Button>
        </div>
      </div>
    );
  }
  
  const script = scriptData.script;
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <button onClick={handleGoBack} className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Script Review</h1>
          </div>
          <p className="text-gray-600">Review and edit your generated script before creating the video</p>
        </div>
        <div className="flex gap-3 self-end md:self-auto">
          <Button variant="outline" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit Script
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button onClick={handleCreateVideo} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
            <Video className="h-4 w-4" />
            Create Video
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Generated Script</h3>
          <button 
            onClick={toggleAllScenes}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center transition-colors"
          >
            {expandAll ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Collapse All
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Expand All
              </>
            )}
          </button>
        </div>
        
        {/* Scene navigation dots */}
        <div className="flex justify-center mb-8 space-x-2 overflow-x-auto py-2 px-4 bg-gray-50 rounded-lg">
          {script.scenes.map((scene, index) => (
            <button
              key={`nav-${scene.scene_id || index}`}
              onClick={() => scrollToScene(scene.scene_id || `scene-${index}`)}
              className={`h-3 w-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                index % 3 === 0 ? 'bg-blue-500' : 
                index % 3 === 1 ? 'bg-indigo-500' : 'bg-purple-500'
              }`}
              aria-label={`Jump to scene ${index + 1}`}
              title={`Scene ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Display metadata if available */}
        {script.metadata && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl mb-8 shadow-sm border border-blue-100 animate-fadeIn">
            <h4 className="font-semibold text-lg text-blue-800 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Script Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {script.metadata.title && (
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 mr-2">Title:</span> 
                  <span className="text-blue-700">{script.metadata.title}</span>
                </div>
              )}
              {script.metadata.duration && (
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 mr-2">Duration:</span> 
                  <span className="font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {script.metadata.duration}
                  </span>
                </div>
              )}
              {script.metadata.style && (
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 mr-2">Style:</span> 
                  <span className="text-purple-700">{script.metadata.style}</span>
                </div>
              )}
              {script.metadata.target_audience && (
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 mr-2">Audience:</span> 
                  <span className="text-teal-700">{script.metadata.target_audience}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Display each scene as a block */}
        <div className="space-y-4">
          {script.scenes.map((scene, index) => {
            const sceneId = scene.scene_id || `scene-${index}`;
            const isExpanded = expandedScenes[sceneId];
            const voiceoverData = getVoiceoverForScene(sceneId);
            const imageData = getImageForScene(sceneId);
            
            return (
              <div 
                key={sceneId} 
                ref={(el: HTMLDivElement | null) => { 
                  if (el) sceneRefs.current[sceneId] = el; 
                }}
                className={`border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 
                  ${getSceneGradient(index)} border-l-4 
                  ${index % 3 === 0 ? 'border-l-blue-500' : 
                    index % 3 === 1 ? 'border-l-indigo-500' : 'border-l-purple-500'
                  } transform hover:-translate-y-1 hover:scale-[1.01]`}
                id={sceneId}
              >
                <div 
                  className="p-4 flex justify-between items-center"
                >
                  <div 
                    className="flex items-center space-x-3 cursor-pointer"
                    onClick={() => toggleScene(sceneId)}
                  >
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-white font-medium text-sm 
                      ${index % 3 === 0 ? 'bg-blue-500' : 
                        index % 3 === 1 ? 'bg-indigo-500' : 'bg-purple-500'
                      }`}>
                      {index + 1}
                    </div>
                    <h5 className="font-medium text-lg text-gray-800">Scene {index + 1}</h5>
                  </div>
                  <div className="flex items-center space-x-4">
                    {scene.time && (
                      <span className="text-sm font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {scene.time}
                      </span>
                    )}
                    <button 
                      className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                      aria-label={isExpanded ? "Collapse scene" : "Expand scene"}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-5 w-5 transition-transform duration-200 ${isExpanded ? 'transform rotate-180' : ''}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 border-t border-gray-200 animate-fadeIn">
                    {/* Grid with 3 sections: Script, Visual, and Image */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
                      {/* Script section */}
                      <div className="space-y-2">
                        <h6 className="font-medium text-blue-700 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                          Script
                        </h6>
                        <div className="bg-white border border-blue-100 rounded-lg p-4 min-h-[160px] max-h-[300px] overflow-auto custom-scrollbar text-gray-700 leading-relaxed">
                          {scene.script}
                        </div>
                        
                        {/* Audio player for voiceover */}
                        {voiceoverData && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePlayAudio(sceneId);
                                }}
                                className={`p-2 rounded-full ${
                                  playingAudio === sceneId 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                } transition-colors`}
                                title={playingAudio === sceneId ? "Pause voice" : "Play voice"}
                              >
                                {playingAudio === sceneId ? (
                                  <Pause className="h-5 w-5" />
                                ) : (
                                  <Play className="h-5 w-5" />
                                )}
                              </button>
                              <div className="text-xs text-gray-500 font-mono">
                                {formatDuration(voiceoverData.duration)}
                              </div>
                            </div>
                            <audio 
                              ref={(el) => { audioRefs.current[sceneId] = el; }}
                              src={voiceoverData.cloudinary_url} 
                              onEnded={() => setPlayingAudio(null)}
                              className="hidden"
                            />
                          </div>
                        )}
                        
                        <div className="flex justify-end">
                          <Button 
                            variant="outline"
                            size="sm"
                            className="text-xs h-7 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 flex items-center transition-colors"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Edit Script button clicked', { sceneId, index });
                              handleOpenScriptEdit(sceneId, index, scene.script);
                            }}
                          >
                            <Edit className="h-3.5 w-3.5 mr-1" />
                            Edit Script
                          </Button>
                        </div>
                      </div>
                      
                      {/* Visual description section */}
                      <div className="space-y-2">
                        <h6 className="font-medium text-green-700 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Visual Description
                        </h6>
                        <div className="bg-white border border-green-100 rounded-lg p-4 min-h-[160px] max-h-[300px] overflow-auto custom-scrollbar text-gray-700 leading-relaxed">
                          {scene.visual}
                        </div>
                        <div className="flex justify-end">
                          <Button 
                            variant="outline"
                            size="sm"
                            className="text-xs h-7 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-800 flex items-center transition-colors"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Edit Visual button clicked', { sceneId, index });
                              handleOpenVisualEdit(sceneId, index, scene.visual);
                            }}
                          >
                            <Edit className="h-3.5 w-3.5 mr-1" />
                            Edit Visual
                          </Button>
                        </div>
                      </div>
                      
                      {/* Generated Image section */}
                      <div className="space-y-2">
                        <h6 className="font-medium text-purple-700 flex items-center">
                          <ImageIcon className="h-4 w-4 mr-1" />
                          Generated Image
                        </h6>
                        {imageData ? (
                          <div className="bg-white border border-purple-100 rounded-lg p-2 min-h-[160px] flex items-center justify-center">
                            <div className="relative w-full h-[200px] overflow-hidden rounded-md">
                              <Image 
                                src={imageData.cloudinary_url} 
                                alt={`Generated image for scene ${index + 1}`}
                                fill
                                style={{ objectFit: 'contain' }}
                                className="rounded-md"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="bg-white border border-purple-100 rounded-lg p-4 min-h-[160px] flex items-center justify-center text-gray-400">
                            <div className="text-center">
                              <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-30" />
                              <p>No image generated yet</p>
                            </div>
                          </div>
                        )}
                        <div className="flex justify-end">
                          <button className="text-xs text-purple-600 hover:text-purple-800 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Regenerate Image
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Voiceover status indicator */}
                    <div className="mt-4 flex items-center">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center
                        ${voiceoverData ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                      >
                        <Volume2 className="h-3 w-3 mr-1" />
                        Voiceover: {voiceoverData ? 'Generated' : 'Pending'}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Timeline indicator */}
                <div className="h-1 bg-gray-100">
                  <div 
                    className={`h-full ${
                      index % 3 === 0 ? 'bg-blue-500' : 
                      index % 3 === 1 ? 'bg-indigo-500' : 'bg-purple-500'
                    }`} 
                    style={{ width: `${((index + 1) / script.scenes.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Footer actions */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <Button variant="outline" onClick={handleGoBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button onClick={handleCreateVideo} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
            <Video className="h-4 w-4" />
            Create Video
          </Button>
        </div>
      </div>
      
      {/* Script Edit Dialog */}
      <Dialog open={editScriptOpen} onOpenChange={(open) => {
        console.log('Dialog open state changing to:', open);
        setEditScriptOpen(open);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Script</DialogTitle>
            <DialogDescription>
              Update the script text for this scene. A new voiceover will be generated.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={editedScript}
              onChange={(e) => setEditedScript(e.target.value)}
              className="min-h-[200px]"
              placeholder="Enter script text..."
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEditScriptOpen(false)}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitScriptEdit}
              disabled={updating}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center transition-colors"
            >
              {updating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Save & Generate Voiceover'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Visual Edit Dialog */}
      <Dialog open={editVisualOpen} onOpenChange={setEditVisualOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Visual Description</DialogTitle>
            <DialogDescription>
              Update the visual description for this scene. A new image will be generated.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={editedVisual}
              onChange={(e) => setEditedVisual(e.target.value)}
              className="min-h-[200px]"
              placeholder="Enter visual description..."
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEditVisualOpen(false)}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitVisualEdit}
              disabled={updating}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {updating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Save & Generate Image'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 