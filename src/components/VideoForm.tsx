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

interface Configuration {
  id: string;
  name: string;
  description?: string;
}

export function VideoForm() {
  const [activeTab, setActiveTab] = useState("text");
  const [scriptText, setScriptText] = useState("");
  const [scriptUrl, setScriptUrl] = useState("");
  const [scriptFile, setScriptFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoadingConfigs, setIsLoadingConfigs] = useState(true);
  const [textError, setTextError] = useState("");
  const [urlError, setUrlError] = useState("");
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Configuration states
  const [styles, setStyles] = useState<Configuration[]>([]);
  const [languages, setLanguages] = useState<Configuration[]>([]);
  const [voices, setVoices] = useState<Configuration[]>([]);
  const [visualStyles, setVisualStyles] = useState<Configuration[]>([]);

  const [formData, setFormData] = useState({
    style: "",
    language: "",
    voice_id: "",
    visual_style: "",
  });

  // Fetch configurations
  useEffect(() => {
    const fetchConfigurations = async () => {
      try {
        setIsLoadingConfigs(true);
        console.log("Fetching configurations...");
        const [stylesRes, languagesRes, voicesRes, visualStylesRes] = await Promise.all([
          fetch(API_ENDPOINTS.styles),
          fetch(API_ENDPOINTS.languages),
          fetch(API_ENDPOINTS.voices),
          fetch(API_ENDPOINTS.visualStyles)
        ]);

        if (!stylesRes.ok || !languagesRes.ok || !voicesRes.ok || !visualStylesRes.ok) {
          console.error("Config fetch failed:", {
            styles: stylesRes.status,
            languages: languagesRes.status,
            voices: voicesRes.status,
            visualStyles: visualStylesRes.status
          });
          throw new Error("Failed to fetch configurations");
        }

        const [stylesData, languagesData, voicesData, visualStylesData] = await Promise.all([
          stylesRes.json(),
          languagesRes.json(),
          voicesRes.json(),
          visualStylesRes.json()
        ]);

        setStyles(stylesData);
        setLanguages(languagesData);
        setVoices(voicesData);
        setVisualStyles(visualStylesData);

        // Set default values
        if (stylesData.length > 0) setFormData(prev => ({ ...prev, style: stylesData[0].id }));
        if (languagesData.length > 0) setFormData(prev => ({ ...prev, language: languagesData[0].id }));
        if (voicesData.length > 0) setFormData(prev => ({ ...prev, voice_id: voicesData[0].id }));
        if (visualStylesData.length > 0) setFormData(prev => ({ ...prev, visual_style: visualStylesData[0].id }));
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

    try {
      let content = "";
      let collectionId = null;
      console.log("Active tab:", activeTab);
      console.log("Form data:", formData);
      
      // Handle different input methods
      if (activeTab === "url") {
        console.log("URL validation:", validateUrl(scriptUrl));
        if (!validateUrl(scriptUrl)) return;
          
        const response = await fetch(API_ENDPOINTS.wikipedia, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: scriptUrl }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch content from URL");
        }

        const data = await response.json();
        content = data.content;
        collectionId = data.collection_id;
      } else if (activeTab === "file") {
        if (!validateFile(scriptFile)) return;

        const formDataObj = new FormData();
        formDataObj.append("file", scriptFile!);
        formDataObj.append("script_type", formData.style);
        formDataObj.append("target_audience", "general");
        formDataObj.append("duration", "5");
        formDataObj.append("tone", "informative");
        formDataObj.append("language", formData.language);

        const response = await fetch(API_ENDPOINTS.uploadFile, {
          method: "POST",
          body: formDataObj,
        });

        if (!response.ok) {
          throw new Error("Failed to upload file");
        }

        const data = await response.json();
        content = data.content;
        collectionId = data.collection_id;
      } else {
        // Text input
        if (!validateText(scriptText)) return;
        content = scriptText;
      }

      // Generate script
      const scriptResponse = await fetch(API_ENDPOINTS.createScript, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          content,
          style: formData.style,
          language: formData.language,
          voice_id: formData.voice_id,
          visual_style: formData.visual_style,
          collection_id: collectionId,
        }),
      });

      if (!scriptResponse.ok) {
        throw new Error("Failed to generate script");
      }

      const scriptData = await scriptResponse.json();
      
      toast({
        title: "Success",
        description: "Script generation started successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <Label className="text-lg font-medium">Script Input Method</Label>
        <Tabs defaultValue="text" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 h-12 mb-6">
            <TabsTrigger value="text" className="text-base">
              Text Input
            </TabsTrigger>
            <TabsTrigger value="file" className="text-base">
              File Upload
            </TabsTrigger>
            <TabsTrigger value="url" className="text-base">
              URL
            </TabsTrigger>
          </TabsList>

          {/* Text Input Tab */}
          <TabsContent value="text" className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="script-text" className="text-lg font-medium">
                Detail Script
              </Label>
              <Textarea
                id="script-text"
                placeholder="e.g., Detailed explanation of Quantum Mechanics"
                value={scriptText}
                onChange={handleTextChange}
                className={`min-h-[250px] resize-vertical text-base p-4 ${textError ? "border-red-500" : ""}`}
              />
              {textError && (
                <div className="flex items-center text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {textError}
                </div>
              )}
              <div className="text-sm text-muted-foreground">{scriptText.length}/5000 characters (minimum 50)</div>
            </div>
          </TabsContent>

          {/* File Upload Tab */}
          <TabsContent value="file" className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="script-file" className="text-lg font-medium">
                Upload Script File
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center transition-colors hover:border-blue-400 hover:bg-blue-50">
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <FileText className="h-16 w-16 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-lg font-medium">Drag and drop your file here, or click to browse</p>
                    <p className="text-sm text-muted-foreground mt-2">Supports PDF, DOC, DOCX (max 5MB)</p>
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
                      className="h-12 px-6 text-base"
                    >
                      Browse Files
                    </Button>
                  </div>
                </div>
              </div>
              {scriptFile && (
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-md">
                  <span className="text-base text-blue-600 truncate max-w-[80%]">{scriptFile.name}</span>
                </div>
              )}
              {fileError && (
                <div className="flex items-center text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {fileError}
                </div>
              )}
            </div>
          </TabsContent>

          {/* URL Tab */}
          <TabsContent value="url" className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="script-url" className="text-lg font-medium">
                Wikipedia URL
              </Label>
              <div className="flex gap-2">
          <Input
                  id="script-url"
                  type="url"
                  placeholder="Enter a Wikipedia URL"
                  value={scriptUrl}
                  onChange={handleUrlChange}
                  className={`flex-1 ${urlError ? "border-red-500" : ""}`}
                />
              </div>
              {urlError && (
                <div className="flex items-center text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {urlError}
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                Enter a Wikipedia URL and click "Generate Video" to process it
              </div>
            </div>
          </TabsContent>
        </Tabs>
        </div>
        
      <div className="grid grid-cols-2 gap-6 mt-8">
        <div className="space-y-3">
          <Label htmlFor="style" className="text-lg font-medium">
            Style
          </Label>
          <Select value={formData.style} onValueChange={(value: string) => handleChange("style", value)} disabled={isLoadingConfigs}>
            <SelectTrigger id="style" className="h-12 text-base">
              <SelectValue placeholder="Select style" />
            </SelectTrigger>
            <SelectContent>
              {styles.map((style) => (
                <SelectItem key={style.id} value={style.id}>
                  {style.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="language" className="text-lg font-medium">
            Language
          </Label>
          <Select value={formData.language} onValueChange={(value: string) => handleChange("language", value)} disabled={isLoadingConfigs}>
            <SelectTrigger id="language" className="h-12 text-base">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((language) => (
                <SelectItem key={language.id} value={language.id}>
                  {language.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="voice" className="text-lg font-medium">
            Voice
          </Label>
          <Select value={formData.voice_id} onValueChange={(value: string) => handleChange("voice_id", value)} disabled={isLoadingConfigs}>
            <SelectTrigger id="voice" className="h-12 text-base">
              <SelectValue placeholder="Select voice" />
            </SelectTrigger>
            <SelectContent>
              {voices.map((voice) => (
                <SelectItem key={voice.id} value={voice.id}>
                  {voice.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="visual-style" className="text-lg font-medium">
            Visual Style
          </Label>
          <Select value={formData.visual_style} onValueChange={(value: string) => handleChange("visual_style", value)} disabled={isLoadingConfigs}>
            <SelectTrigger id="visual-style" className="h-12 text-base">
              <SelectValue placeholder="Select visual style" />
            </SelectTrigger>
            <SelectContent>
              {visualStyles.map((style) => (
                <SelectItem key={style.id} value={style.id}>
                  {style.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-6">
        <div className="text-sm text-gray-500">
          Debug Info:
          <br />
          Loading: {loading.toString()}
          <br />
          Loading Configs: {isLoadingConfigs.toString()}
          <br />
          Active Tab: {activeTab}
          <br />
          Form Data: {JSON.stringify(formData)}
      </div>
      
      <Button 
        type="submit" 
          className="w-full bg-blue-700 hover:bg-blue-800 h-14 text-lg font-medium mt-8"
          disabled={loading || isLoadingConfigs}
          onClick={() => console.log("Button clicked", { loading, isLoadingConfigs })}
        >
          {loading ? (
            <>
              <Loader2 className="mr-3 h-6 w-6 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Video"
          )}
      </Button>
      </div>
    </form>
  );
} 