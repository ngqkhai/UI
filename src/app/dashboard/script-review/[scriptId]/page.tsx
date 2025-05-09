"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, FileText, ArrowLeft, Video, Download, Edit } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/config";

interface ScriptScene {
  scene_id?: string;
  script: string;
  visual: string;
  time?: string;
  voiceover?: boolean;
}

interface ScriptMetadata {
  title?: string;
  duration?: string;
  style?: string;
  target_audience?: string;
}

interface Script {
  _id: string;
  scenes: ScriptScene[];
  metadata?: ScriptMetadata;
}

export default function ScriptReviewPage() {
  const { scriptId } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [script, setScript] = useState<Script | null>(null);
  const [expandedScenes, setExpandedScenes] = useState<Record<string, boolean>>({});
  const [expandAll, setExpandAll] = useState(true);
  const sceneRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
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
        setScript(data.script);
        
        // Initialize all scenes as expanded
        if (data.script?.scenes) {
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
    setExpandedScenes(prev => ({
      ...prev,
      [sceneId]: !prev[sceneId]
    }));
  };
  
  const toggleAllScenes = () => {
    const newState = !expandAll;
    setExpandAll(newState);
    
    if (script?.scenes) {
      const updatedState = script.scenes.reduce((acc: Record<string, boolean>, scene: ScriptScene, index: number) => {
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
  
  if (!script) {
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
                  className="p-4 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleScene(sceneId)}
                >
                  <div className="flex items-center space-x-3">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <div className="flex justify-end">
                          <button className="text-xs text-blue-600 hover:text-blue-800 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Edit Script
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h6 className="font-medium text-green-700 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Visual
                        </h6>
                        <div className="bg-white border border-green-100 rounded-lg p-4 min-h-[160px] max-h-[300px] overflow-auto custom-scrollbar text-gray-700 leading-relaxed">
                          {scene.visual}
                        </div>
                        <div className="flex justify-end">
                          <button className="text-xs text-green-600 hover:text-green-800 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Edit Visual
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {scene.voiceover !== undefined && (
                      <div className="mt-4 flex items-center">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center
                          ${scene.voiceover ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-3 w-3 mr-1" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            {scene.voiceover ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            )}
                          </svg>
                          Voiceover: {scene.voiceover ? 'Yes' : 'No'}
                        </div>
                      </div>
                    )}
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
    </div>
  );
} 