"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Loader2, AlertCircle, Play, Pause } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/config";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import WebSocketManager from "@/lib/websocket/WebSocketManager";

interface Configuration {
  id: string;
  name: string;
  description?: string;
  cloudinary_url?: string;
  sample_text?: string;
}

// Replace the entire VideoConfigFormProps interface and VideoConfigurationForm component with this updated version
interface VideoConfigFormProps {
  formData: any;
  handleChange: (field: string, value: string) => void;
  isLoading: boolean;
  styles: Configuration[];
  languages: Configuration[];
  voices: Configuration[];
  visualStyles: Configuration[];
  targetAudiences: Configuration[];
  durations: Configuration[];
  onSave: () => void;
}

// Map of voice sample URLs by voice ID
const VOICE_SAMPLE_URLS: Record<string, string> = {
  // Add sample URLs for each voice - update these with your actual Cloudinary URLs
  "682100514bac275f08fd1e63": "https://res.cloudinary.com/djupm4v0l/video/upload/v1746992018/voice-synthesis/352146c8-0d9f-4231-823e-819aa3cb161c_prxquo.mp3",
  "682100514bac275f08fd1e64": "https://res.cloudinary.com/djupm4v0l/video/upload/v1746992259/voice-synthesis/sample-2_fvuzbk.mp3", 
  "682100514bac275f08fd1e65": "https://res.cloudinary.com/djupm4v0l/video/upload/v1746992259/voice-synthesis/sample-3_uumswl.mp3",
  "682100514bac275f08fd1e66": "https://res.cloudinary.com/djupm4v0l/video/upload/v1746992259/voice-synthesis/sample-4_q4kcka.mp3"
};

const VideoConfigurationForm = ({
  formData,
  handleChange,
  isLoading,
  styles,
  languages,
  voices,
  visualStyles,
  targetAudiences,
  durations,
  onSave
}: VideoConfigFormProps) => {
  // Add state to track which audio is currently playing
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState<string | null>(null);
  const audioRefs = useRef<{[key: string]: HTMLAudioElement | null}>({});
  const { toast } = useToast();

  // Function to handle playing audio samples
  const handlePlayAudio = (voiceId: string, url?: string) => {
    // Find the URL from our map if not provided directly
    const audioUrl = url || VOICE_SAMPLE_URLS[voiceId];
    
    if (!audioUrl) {
      console.error("No audio URL available for voice:", voiceId);
      toast({
        title: "Unable to play audio",
        description: "No audio sample available for this voice",
        variant: "destructive",
      });
      return;
    }
    
    // Stop currently playing audio if any
    if (playingAudio && playingAudio !== voiceId && audioRefs.current[playingAudio]) {
      audioRefs.current[playingAudio]?.pause();
    }
    
    // Play or pause the selected audio
    if (playingAudio === voiceId) {
      if (audioRefs.current[voiceId]?.paused) {
        audioRefs.current[voiceId]?.play();
      } else {
        audioRefs.current[voiceId]?.pause();
        setPlayingAudio(null);
      }
    } else {
      // Create audio element if it doesn't exist
      if (!audioRefs.current[voiceId]) {
        setLoadingAudio(voiceId);
        const audio = new Audio(audioUrl);
        
        audio.addEventListener('canplaythrough', () => {
          setLoadingAudio(null);
          audio.play();
          setPlayingAudio(voiceId);
        });
        
        audio.addEventListener('error', () => {
          setLoadingAudio(null);
          toast({
            title: "Error",
            description: "Failed to load audio sample",
            variant: "destructive",
          });
        });
        
        audio.addEventListener('ended', () => setPlayingAudio(null));
        audioRefs.current[voiceId] = audio;
        audio.load();
      } else {
        audioRefs.current[voiceId]?.play();
        setPlayingAudio(voiceId);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg md:text-xl font-semibold text-gray-800">Video Configuration</h3>
        <p className="text-sm text-gray-500 mt-1">Customize how your video will look and feel</p>
      </div>
      
      {/* Form content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Style */}
          <div className="space-y-2">
            <Label htmlFor="style" className="text-sm font-medium text-gray-700">
              Style
              <span className="text-xs text-gray-400 ml-1">Required</span>
            </Label>
            <Select 
              value={formData.style} 
              onValueChange={(value) => handleChange("style", value)} 
              disabled={isLoading}
            >
              <SelectTrigger id="style" className="h-10 md:h-11 text-sm bg-white border-gray-300 hover:border-gray-400 transition-colors">
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                {styles.map((style) => (
                  <SelectItem key={style.id} value={style.id} className="text-sm">
                    {style.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">Choose the overall style of your video</p>
          </div>
          
          {/* Target Audience */}
          <div className="space-y-2">
            <Label htmlFor="target_audience" className="text-sm font-medium text-gray-700">
              Target Audience
              <span className="text-xs text-gray-400 ml-1">Required</span>
            </Label>
            <Select 
              value={formData.target_audience} 
              onValueChange={(value) => handleChange("target_audience", value)} 
              disabled={isLoading}
            >
              <SelectTrigger id="target_audience" className="h-10 md:h-11 text-sm bg-white border-gray-300 hover:border-gray-400 transition-colors">
                <SelectValue placeholder="Select target audience" />
              </SelectTrigger>
              <SelectContent>
                {targetAudiences.map((audience) => (
                  <SelectItem key={audience.id} value={audience.id} className="text-sm">
                    {audience.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">Who is your video intended for?</p>
          </div>
          
          {/* Voice */}
          <div className="space-y-2">
            <Label htmlFor="voice" className="text-sm font-medium text-gray-700">
              Voice
              <span className="text-xs text-gray-400 ml-1">Required</span>
            </Label>
            <Select 
              value={formData.voice} 
              onValueChange={(value) => handleChange("voice", value)} 
              disabled={isLoading}
            >
              <SelectTrigger id="voice" className="h-10 md:h-11 text-sm bg-white border-gray-300 hover:border-gray-400 transition-colors">
                <SelectValue placeholder="Select voice">
                  {formData.voice && voices.find(v => v.id === formData.voice)?.description}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {voices.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id} className="text-sm">
                    {voice.description || voice.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Play Button for selected voice */}
            {formData.voice && voices.length > 0 && (
              <div className="flex items-center mt-1 bg-blue-50 p-1.5 rounded-md">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className={`h-8 w-8 p-0 rounded-full mr-2 ${playingAudio === formData.voice ? 'bg-blue-500 border-blue-600 text-white' : 'bg-white hover:bg-blue-100'}`}
                  onClick={() => {
                    const selectedVoice = voices.find(v => v.id === formData.voice);
                    if (selectedVoice) {
                      const audioUrl = selectedVoice.cloudinary_url || VOICE_SAMPLE_URLS[selectedVoice.id];
                      if (audioUrl) {
                        handlePlayAudio(selectedVoice.id, audioUrl);
                      } else {
                        console.error("No audio URL for voice:", selectedVoice);
                        toast({
                          title: "Unable to play audio",
                          description: "No audio sample available for this voice",
                          variant: "destructive",
                        });
                      }
                    }
                  }}
                  disabled={loadingAudio === formData.voice || 
                    !voices.find(v => v.id === formData.voice) || 
                    (!voices.find(v => v.id === formData.voice)?.cloudinary_url && 
                     !VOICE_SAMPLE_URLS[formData.voice])}
                >
                  {loadingAudio === formData.voice ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : playingAudio === formData.voice ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <div className="flex flex-col">
                  <span className="text-xs text-blue-700 font-medium">Listen to selected voice</span>
                  {!voices.find(v => v.id === formData.voice)?.cloudinary_url && 
                   !VOICE_SAMPLE_URLS[formData.voice] && (
                    <span className="text-xs text-red-500">No audio sample available</span>
                  )}
                </div>
              </div>
            )}
            
            <p className="text-xs text-gray-500">The voice for your video narration</p>
          </div>
          
          {/* Language */}
          <div className="space-y-2">
            <Label htmlFor="language" className="text-sm font-medium text-gray-700">
              Language
              <span className="text-xs text-gray-400 ml-1">Required</span>
            </Label>
            <Select 
              value={formData.language} 
              onValueChange={(value) => handleChange("language", value)} 
              disabled={isLoading}
            >
              <SelectTrigger id="language" className="h-10 md:h-11 text-sm bg-white border-gray-300 hover:border-gray-400 transition-colors">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((language) => (
                  <SelectItem key={language.id} value={language.id} className="text-sm">
                    {language.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">Language for script and voiceover</p>
          </div>
          
          {/* Visual Style */}
          <div className="space-y-2">
            <Label htmlFor="visual_style" className="text-sm font-medium text-gray-700">
              Visual Style
              <span className="text-xs text-gray-400 ml-1">Required</span>
            </Label>
            <Select 
              value={formData.visual_style} 
              onValueChange={(value) => handleChange("visual_style", value)} 
              disabled={isLoading}
            >
              <SelectTrigger id="visual_style" className="h-10 md:h-11 text-sm bg-white border-gray-300 hover:border-gray-400 transition-colors">
                <SelectValue placeholder="Select visual style" />
              </SelectTrigger>
              <SelectContent>
                {visualStyles.map((style) => (
                  <SelectItem key={style.id} value={style.id} className="text-sm">
                    {style.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">The visual aesthetic of your video</p>
          </div>
          
          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration" className="text-sm font-medium text-gray-700">
              Duration
              <span className="text-xs text-gray-400 ml-1">Required</span>
            </Label>
            <Select 
              value={formData.duration} 
              onValueChange={(value) => handleChange("duration", value)} 
              disabled={isLoading}
            >
              <SelectTrigger id="duration" className="h-10 md:h-11 text-sm bg-white border-gray-300 hover:border-gray-400 transition-colors">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {durations.map((duration) => (
                  <SelectItem key={duration.id} value={duration.id} className="text-sm">
                    {duration.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">Approximate length of the video</p>
          </div>
        </div>
        
        {/* Save button */}
        <div className="mt-8 flex justify-end">
          <Button 
            onClick={onSave}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 h-11 rounded-lg shadow-sm transition-all"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>Continue</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function CreateVideo() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("text");
  const [scriptText, setScriptText] = useState("");
  const [scriptUrl, setScriptUrl] = useState("");
  const [scriptFile, setScriptFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoadingConfigs, setIsLoadingConfigs] = useState(true);
  const [textError, setTextError] = useState("");
  const [urlError, setUrlError] = useState("");
  const [fileError, setFileError] = useState("");
  const [scriptGenUrl, setScriptGenUrl] = useState("");
  const [generationProgress, setGenerationProgress] = useState("");
  const [generationError, setGenerationError] = useState("");
  const [wsConnected, setWsConnected] = useState(false);
  const wsConnectionRef = useRef<WebSocket | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const collectionIdRef = useRef<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Configuration options fetched from the API
  const [styles, setStyles] = useState<Configuration[]>([]);
  const [languages, setLanguages] = useState<Configuration[]>([]);
  const [voices, setVoices] = useState<Configuration[]>([]);
  const [visualStyles, setVisualStyles] = useState<Configuration[]>([]);
  const [targetAudiences, setTargetAudiences] = useState<Configuration[]>([]);
  const [durations, setDurations] = useState<Configuration[]>([]);
  
  // Form data with selected configuration options
  const [formData, setFormData] = useState<{
    style: string;
    language: string;
    voice: string;
    visual_style: string;
    target_audience: string;
    duration: string;
    voiceName?: string;
  }>({
    style: "",
    language: "",
    voice: "",
    visual_style: "",
    target_audience: "",
    duration: ""
  });

  // Add this near other state variables
  const [currentCollectionId, setCurrentCollectionId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Clean up WebSocket when the component unmounts
  useEffect(() => {
    return () => {
      if (collectionIdRef.current) {
        console.log(`Cleaning up WebSocket for collection ${collectionIdRef.current}`);
        WebSocketManager.closeConnection(collectionIdRef.current);
        WebSocketManager.unregisterAllHandlers(collectionIdRef.current);
      }
    };
  }, []);

  // Fetch configurations
  useEffect(() => {
    const fetchConfigurations = async () => {
      try {
        setIsLoadingConfigs(true);
        console.log("Fetching configurations...");
        const [stylesRes, languagesRes, voicesRes, visualStylesRes, targetAudiencesRes, durationsRes] = await Promise.all([
          fetch(API_ENDPOINTS.styles),
          fetch(API_ENDPOINTS.languages),
          fetch(API_ENDPOINTS.voices),
          fetch(API_ENDPOINTS.visualStyles),
          fetch(API_ENDPOINTS.targetAudiences),
          fetch(API_ENDPOINTS.durations)
        ]);

        if (!stylesRes.ok || !languagesRes.ok || !voicesRes.ok || !visualStylesRes.ok || 
            !targetAudiencesRes.ok || !durationsRes.ok) {
          console.error("Config fetch failed:", {
            styles: stylesRes.status,
            languages: languagesRes.status,
            voices: voicesRes.status,
            visualStyles: visualStylesRes.status,
            targetAudiences: targetAudiencesRes.status,
            durations: durationsRes.status
          });
          throw new Error("Failed to fetch configurations");
        }

        const [stylesData, languagesData, voicesData, visualStylesData, 
               targetAudiencesData, durationsData] = await Promise.all([
          stylesRes.json(),
          languagesRes.json(),
          voicesRes.json(),
          visualStylesRes.json(),
          targetAudiencesRes.json(),
          durationsRes.json()
        ]);

        setStyles(stylesData);
        setLanguages(languagesData);
        setVoices(voicesData);
        console.log("Voice data received:", voicesData);
        
        // Log each voice object details
        for (let i = 0; i < voicesData.length; i++) {
          const voice = voicesData[i];
          console.log(`Voice ${i}:`, voice);
          console.log(`  Has cloudinary_url:`, !!voice.cloudinary_url);
          console.log(`  cloudinary_url value:`, voice.cloudinary_url);
        }
        setVisualStyles(visualStylesData);
        setTargetAudiences(targetAudiencesData);
        setDurations(durationsData);

        // Set default values
        if (stylesData.length > 0) setFormData(prev => ({ ...prev, style: stylesData[0].name }));
        if (languagesData.length > 0) setFormData(prev => ({ ...prev, language: languagesData[0].name }));
        if (voicesData.length > 0) setFormData(prev => ({ ...prev, voice: voicesData[0].name }));
        if (visualStylesData.length > 0) setFormData(prev => ({ ...prev, visual_style: visualStylesData[0].name }));
        if (targetAudiencesData.length > 0) setFormData(prev => ({ ...prev, target_audience: targetAudiencesData[0].name }));
        if (durationsData.length > 0) setFormData(prev => ({ ...prev, duration: durationsData[0].name }));
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load configurations. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingConfigs(false);
      }
    };

    fetchConfigurations();
  }, [toast]);

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

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // If changing voice, find the voice object and store its name separately for API requests
    if (field === "voice") {
      const selectedVoice = voices.find(v => v.id === value);
      if (selectedVoice) {
        setFormData(prev => ({ 
          ...prev, 
          [field]: value,
          voiceName: selectedVoice.name  // Store the name separately for API requests
        } as typeof prev));
      }
    }
  };

  // Validate text input
  const validateText = (text: string) => {
    console.log("Validating text:", text);
    if (!text) {
      setTextError("Script is required");
      return false;
    }
    if (text.length < 50) {
      setTextError("Script must be at least 50 characters");
      return false;
    }
    if (text.length > 5000) {
      setTextError("Script cannot exceed 5000 characters");
      return false;
    }
    setTextError("");
    return true;
  };

  // Validate URL input
  const validateUrl = (url: string) => {
    console.log("Validating URL:", url);
    if (!url) {
      setUrlError("URL is required");
      return false;
    }
    const urlRegex = /^https?:\/\/.+/
    if (!urlRegex.test(url)) {
      setUrlError("Please enter a valid URL");
      return false;
    }
    setUrlError("");
    return true;
  };

  // Validate file input
  const validateFile = (file: File | null) => {
    console.log("Validating file:", file);
    if (!file) {
      setFileError("File is required");
      return false;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      setFileError("Only PDF, DOC, or DOCX files are allowed");
      return false;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setFileError("File size cannot exceed 5MB");
      return false;
    }

    setFileError("");
    return true;
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setScriptText(text);
    validateText(text);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setScriptUrl(url);
    if (url) {
      validateUrl(url);
    } else {
      setUrlError("");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setScriptFile(file);
      validateFile(file);
      toast({
        title: "File selected",
        description: `File "${file.name}" selected`,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted");
    setLoading(true);
    setGenerationProgress("Initializing...");
    
    try {
      let collectionId = null;
      console.log("Active tab:", activeTab);
      console.log("Form data:", formData);
      
      // Find the name properties from configuration data
      const findNameById = (array: Configuration[], id: string): string => {
        const item = array.find(item => item.id === id);
        return item ? item.name : id;
      };
      
      // Get actual names from configuration data
      const styleData = findNameById(styles, formData.style);
      const targetAudienceData = findNameById(targetAudiences, formData.target_audience);
      const durationData = findNameById(durations, formData.duration);
      const languageData = findNameById(languages, formData.language);
      const visualStyleData = findNameById(visualStyles, formData.visual_style);
      
      // For voice, use the stored name rather than finding by ID
      const voiceData = formData.voiceName || findNameById(voices, formData.voice);
      
      // Handle different input methods
      if (activeTab === "url") {
        console.log("URL validation:", validateUrl(scriptUrl));
        if (!validateUrl(scriptUrl)) {
          setLoading(false);
          return;
        }
        const response = await fetch(API_ENDPOINTS.wikipedia, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            url: scriptUrl, 
            style: styleData, 
            target_audience: targetAudienceData, 
            duration: durationData, 
            voice: voiceData, 
            language: languageData,
            visual_style: visualStyleData,
          }),
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch content from URL");
        }

        const data = await response.json();
        console.log("URL response data:", data);
        collectionId = data.collection_id;
      } else if (activeTab === "file") {
        if (!validateFile(scriptFile)) {
          setLoading(false);
          return;
        }

        const formDataObj = new FormData();
        formDataObj.append("file", scriptFile!);
        formDataObj.append("style", styleData);
        formDataObj.append("target_audience", targetAudienceData);
        formDataObj.append("duration", durationData);
        formDataObj.append("voice", voiceData);
        formDataObj.append("language", languageData);
        formDataObj.append("visual_style", visualStyleData);

        const response = await fetch(API_ENDPOINTS.uploadFile, {
          method: "POST",
          body: formDataObj,
        });

        if (!response.ok) {
          throw new Error("Failed to upload file");
        }

        const data = await response.json();
        console.log("File response data:", data);
        collectionId = data.collection_id;
      } else {
        // Text input
        if (!validateText(scriptText)) {
          setLoading(false);
          return;
        }
        
        // For text input, we need to create a collection first
        const response = await fetch(API_ENDPOINTS.collections, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            title: "User Script",
            content: scriptText,
            metadata: {
              source: "user_input",
              style: styleData,
              target_audience: targetAudienceData,
              voice: voiceData,
              duration: durationData,
              language: languageData,
              visual_style: visualStyleData
            }
          }),
        });
        
        if (!response.ok) {
          throw new Error("Failed to create collection from text");
        }
        
        const data = await response.json();
        console.log("Text collection response:", data);
        collectionId = data.collection_id || data.id;
      }

      // If we have a collection ID, store it and set up WebSocket
      if (collectionId) {
        // Store collection ID in ref for future WebSocket access
        collectionIdRef.current = collectionId;
        setCurrentCollectionId(collectionId);
        
        // Set up WebSocket connection for real-time updates
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';
        const wsUrlWithCollectionId = `${wsUrl}?collection_id=${collectionId}`;
        
        console.log(`Setting up WebSocket connection to ${wsUrlWithCollectionId}`);
        
        // Set up WebSocket handlers for this collection
        WebSocketManager.on(collectionId, 'status', (connected: boolean) => {
          console.log(`WebSocket connection status for ${collectionId}: ${connected}`);
          setWsConnected(connected);
        });
        
        WebSocketManager.on(collectionId, 'message', (data: any) => {
          console.log(`WebSocket message for ${collectionId}:`, data);
          
          // Handle different message types
          if (data.type === 'script_generated' && data.script_id) {
            toast({
              title: "Script Generated",
              description: "Your script has been generated successfully!",
            });
            
            // Redirect to the script review page
            router.push(`/dashboard/script-review/${data.script_id}`);
          } else if (data.type === 'collection_status') {
            setGenerationProgress(`${data.status} (${data.progress || 0}%)`);
          } else if (data.type === 'job_complete') {
            // Complete job with all assets
            setGenerationProgress("Complete!");
            toast({
              title: "Success",
              description: "Video assets generated successfully!",
            });
            setLoading(false);
            
            // Redirect to the script review page
            if (data.script_id) {
              router.push(`/dashboard/script-review/${data.script_id}`);
            }
          } else if (data.type === 'error') {
            // Handle error messages
            setGenerationProgress("");
            toast({
              title: "Error",
              description: data.message || "An error occurred during processing",
              variant: "destructive",
            });
            setLoading(false);
          }
        });
        
        WebSocketManager.on(collectionId, 'error', (error: Error) => {
          console.error(`WebSocket error for ${collectionId}:`, error);
          toast({
            title: "Connection Error",
            description: "Lost connection to the server. Updates may be delayed.",
            variant: "destructive",
          });
        });
        
        // Create the WebSocket connection
        const socket = WebSocketManager.getConnection(collectionId, wsUrlWithCollectionId);
        wsConnectionRef.current = socket;
        
        setGenerationProgress("Connected. Waiting for processing to begin...");
        
        // The collection has been created, API Gateway should already be subscribed to script.ready events
        // Just need to make sure the WebSocket is established so we can receive updates
        toast({
          title: "Processing Started",
          description: "Your content is being processed. You'll receive updates in real-time.",
        });
        
      } else {
        throw new Error("Failed to get collection ID");
      }
    } catch (error) {
      setGenerationProgress("");
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
      setLoading(false);
    }
  };
  
  // Add this function to handle the save operation from the VideoConfigurationForm
  const handleSaveConfig = () => {
    toast({
      title: "Configuration Saved",
      description: "Your video configuration has been saved successfully.",
    });
    // Additional logic can be added here if needed
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 px-4 py-6 md:px-6 md:py-8 max-w-[1400px] mx-auto">
      {/* Left Column - Form */}
      <div className="flex-1 min-w-0 w-full">
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          {/* Script Input Section */}
          <div className="space-y-4 bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100">
            <Label className="text-base md:text-lg font-medium mb-2 block">Script Input Method</Label>
            <Tabs defaultValue="text" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 h-10 md:h-12 mb-4 md:mb-6 w-full">
                <TabsTrigger value="text" className="text-sm md:text-base">
                  Text Input
                </TabsTrigger>
                <TabsTrigger value="file" className="text-sm md:text-base">
                  File Upload
                </TabsTrigger>
                <TabsTrigger value="url" className="text-sm md:text-base">
                  URL
                </TabsTrigger>
              </TabsList>

              {/* Text Input Tab */}
              <TabsContent value="text" className="space-y-3 md:space-y-4">
                <div className="space-y-2 md:space-y-3">
                  <Label htmlFor="script-text" className="text-base md:text-lg font-medium">
                    Detail Script
                  </Label>
                  <Textarea
                    id="script-text"
                    placeholder="e.g., Detailed explanation of Quantum Mechanics"
                    value={scriptText}
                    onChange={handleTextChange}
                    className={`min-h-[150px] md:min-h-[200px] resize-vertical text-sm md:text-base p-3 md:p-4 ${textError ? "border-red-500" : ""}`}
                  />
                  {textError && (
                    <div className="flex items-center text-red-500 text-xs md:text-sm">
                      <AlertCircle className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                      {textError}
                    </div>
                  )}
                  <div className="text-xs md:text-sm text-muted-foreground">{scriptText.length}/5000 characters (minimum 50)</div>
                </div>
              </TabsContent>

              {/* File Upload Tab */}
              <TabsContent value="file" className="space-y-3 md:space-y-4">
                <div className="space-y-2 md:space-y-3">
                  <Label htmlFor="script-file" className="text-base md:text-lg font-medium">
                    Upload Script File
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 md:p-8 text-center transition-colors hover:border-blue-400 hover:bg-blue-50">
                    <div className="space-y-3 md:space-y-4">
                      <div className="flex justify-center">
                        <FileText className="h-10 w-10 md:h-14 md:w-14 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-base md:text-lg font-medium">Drag and drop your file here, or click to browse</p>
                        <p className="text-xs md:text-sm text-muted-foreground mt-1 md:mt-2">Supports PDF, DOC, DOCX (max 5MB)</p>
                      </div>
                      <div>
                        <input
                          ref={fileInputRef}
                          id="script-file"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="h-10 md:h-12 px-4 md:px-6 text-sm md:text-base"
                        >
                          Browse Files
                        </Button>
                      </div>
                    </div>
                  </div>
                  {scriptFile && (
                    <div className="flex items-center justify-between p-3 md:p-4 bg-blue-50 rounded-md">
                      <span className="text-sm md:text-base text-blue-600 truncate max-w-[80%]">{scriptFile.name}</span>
                    </div>
                  )}
                  {fileError && (
                    <div className="flex items-center text-red-500 text-xs md:text-sm">
                      <AlertCircle className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                      {fileError}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* URL Tab */}
              <TabsContent value="url" className="space-y-3 md:space-y-4">
                <div className="space-y-2 md:space-y-3">
                  <Label htmlFor="script-url" className="text-base md:text-lg font-medium">
                    Wikipedia URL
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="script-url"
                      type="url"
                      placeholder="Enter a Wikipedia URL"
                      value={scriptUrl}
                      onChange={handleUrlChange}
                      className={`flex-1 h-10 md:h-12 text-sm md:text-base ${urlError ? "border-red-500" : ""}`}
                    />
                  </div>
                  {urlError && (
                    <div className="flex items-center text-red-500 text-xs md:text-sm">
                      <AlertCircle className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                      {urlError}
                    </div>
                  )}
                  <div className="text-xs md:text-sm text-muted-foreground">
                    Enter a Wikipedia URL and click "Generate Video" to process it
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Video Configuration Section */}
          <VideoConfigurationForm
            formData={formData}
            handleChange={handleChange}
            isLoading={isLoadingConfigs}
            styles={styles}
            languages={languages}
            voices={voices}
            visualStyles={visualStyles}
            targetAudiences={targetAudiences}
            durations={durations}
            onSave={handleSaveConfig}
          />

          {/* Generation Status and Submit Section */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100 space-y-4 md:space-y-6">
            {generationProgress && (
              <div className="bg-blue-50 p-3 md:p-4 rounded-md">
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 md:h-5 md:w-5 text-blue-600 animate-spin mr-2" />
                  <p className="text-sm md:text-base text-blue-700 font-medium">{generationProgress}</p>
                </div>
                <div className="mt-2 h-1.5 md:h-2 bg-blue-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '30%' }}></div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-700 hover:bg-blue-800 h-10 md:h-14 text-sm md:text-lg font-medium"
              disabled={loading || isLoadingConfigs}
              onClick={() => console.log("Button clicked", { loading, isLoadingConfigs })}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 md:h-6 md:w-6 animate-spin" />
                  {generationProgress ? "Generating..." : "Processing..."}
                </>
              ) : (
                "Generate Video"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}