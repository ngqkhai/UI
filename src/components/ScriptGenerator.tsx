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
import { FileText, Loader2, AlertCircle } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/config";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Configuration {
  id: string;
  name: string;
  description?: string;
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
                <SelectValue placeholder="Select voice" />
              </SelectTrigger>
              <SelectContent>
                {voices.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id} className="text-sm">
                    {voice.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
  const [generationProgress, setGenerationProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Configuration states
  const [styles, setStyles] = useState<Configuration[]>([]);
  const [languages, setLanguages] = useState<Configuration[]>([]);
  const [voices, setVoices] = useState<Configuration[]>([]);
  const [visualStyles, setVisualStyles] = useState<Configuration[]>([]);
  const [targetAudiences, setTargetAudiences] = useState<Configuration[]>([]);
  const [durations, setDurations] = useState<Configuration[]>([]);

  const [formData, setFormData] = useState({
    style: "",
    language: "",
    voice: "",
    visual_style: "",
    target_audience: "general",
    duration: "medium"
  });

  // Add this near other state variables
  const [currentCollectionId, setCurrentCollectionId] = useState<string | null>(null);

  // Wrap currentCollectionId in a useRef to prevent unnecessary re-renders
  const collectionIdRef = useRef<string | null>(null);



  // Update the collectionIdRef when currentCollectionId changes
  useEffect(() => {
    if (currentCollectionId) {
      collectionIdRef.current = currentCollectionId;
      console.log("Collection ID updated:", currentCollectionId);
    }
  }, [currentCollectionId]);

  // Update the WebSocket status display with more detailed logging
  useEffect(() => {
    console.log("WebSocket status changed:", { currentCollectionId, isConnected, webSocketStatus });
    
    if (currentCollectionId && isConnected) {
      setGenerationProgress(`Connected to script generation service. Waiting for script...`);
    } else if (currentCollectionId && !isConnected) {
      setGenerationProgress(`Connecting to script generation service...`);
    }
  }, [currentCollectionId, isConnected, webSocketStatus]);

  // Add logging for scriptId changes
  useEffect(() => {
    if (scriptId) {
      console.log("Script ID received via WebSocket:", scriptId);
    }
  }, [scriptId]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

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
      let content = "";
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
      const voiceData = findNameById(voices, formData.voice);
      const languageData = findNameById(languages, formData.language);
      const visualStyleData = findNameById(visualStyles, formData.visual_style);
      
      // Handle different input methods
      if (activeTab === "url") {
        console.log("URL validation:", validateUrl(scriptUrl));
        if (!validateUrl(scriptUrl)) return;
        const response = await fetch(API_ENDPOINTS.wikipedia, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            url: scriptUrl, 
            script_type: styleData, 
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
        if (!validateFile(scriptFile)) return;

        const formDataObj = new FormData();
        formDataObj.append("file", scriptFile!);
        formDataObj.append("script_type", styleData);
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
        if (!validateText(scriptText)) return;
        
        // For text input, we need to create a collection first
        const response = await fetch(API_ENDPOINTS.collections, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            title: "User Script",
            content: scriptText,
            metadata: {
              source: "user_input",
              script_type: styleData,
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

      // If we have a collection ID, we need to wait for script generation
      if (collectionId) {
        // Store the collection ID stably
        collectionIdRef.current = collectionId;
        // Also update the state for UI updates
        setCurrentCollectionId(collectionId);
        
        setGenerationProgress("Processing content...");
      toast({
          title: "Processing Content",
          description: "Your content is being analyzed and a script will be generated shortly.",
        });
        
        // The data collector will publish to RabbitMQ and the script generator will process
        // the message automatically, so we don't need a separate API call.
        // Just wait for the WebSocket notification
        console.log("Waiting for script generation via RabbitMQ and WebSocket notification...");
        
      } else {
        throw new Error("Failed to get collection ID");
      }
    } catch (error) {
      setGenerationProgress(null);
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

          {/* Video Configuration Section - Replace the old configuration section with the new component */}
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
                  <div className={`h-full bg-blue-600 rounded-full ${isConnected ? 'animate-pulse' : ''}`} style={{ width: scriptId ? '100%' : '30%' }}></div>
                </div>
                {currentCollectionId && (
                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <span className={`inline-block h-1.5 w-1.5 md:h-2 md:w-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                    <span>{isConnected ? 'Connected to script service' : 'Connecting to script service...'}</span>
                  </div>
                )}
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