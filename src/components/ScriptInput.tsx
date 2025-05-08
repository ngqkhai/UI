import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export function ScriptInput() {
  const [textScript, setTextScript] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [urlFetchedText, setUrlFetchedText] = useState("");
  const [fileUploadedText, setFileUploadedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [textError, setTextError] = useState("");
  const [urlError, setUrlError] = useState("");
  const [fileError, setFileError] = useState("");
  const { toast } = useToast();

  const handleTextValidation = (text: string) => {
    if (text.length < 50) {
      setTextError("Script must be at least 50 characters long");
      return false;
    }
    setTextError("");
    return true;
  };

  const handleTextSubmit = async () => {
    if (!handleTextValidation(textScript)) return;
    
    setLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Script added successfully",
        description: "Your script has been saved.",
      });
    } catch (error) {
      toast({
        title: "Failed to add script",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUrlFetch = async () => {
    if (!urlInput || !urlInput.startsWith("http")) {
      setUrlError("Please enter a valid URL");
      return;
    }
    setUrlError("");
    
    setLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUrlFetchedText("Fetched: Quantum mechanics is a fundamental theory in physics that provides a description of the physical properties of nature at the scale of atoms and subatomic particles. It is the foundation of all quantum physics including quantum chemistry, quantum field theory, quantum technology, and quantum information science.");
      
      toast({
        title: "Text fetched successfully",
        description: "Content extracted from URL.",
      });
    } catch (error) {
      toast({
        title: "Failed to fetch text",
        description: "Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    const validTypes = ['.pdf', '.doc', '.docx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!validTypes.includes(fileExtension)) {
      setFileError("Please upload a PDF or Word document");
      return;
    }
    
    // Check file size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFileError("File size must be less than 5MB");
      return;
    }
    
    setFileError("");
    setLoading(true);
    
    try {
      // Mock API call with FormData
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setFileUploadedText("Uploaded: Quantum mechanics is a fundamental theory in physics that provides a description of the physical properties of nature at the scale of atoms and subatomic particles. It is the foundation of all quantum physics including quantum chemistry, quantum field theory, quantum technology, and quantum information science.");
      
      toast({
        title: "File uploaded successfully",
        description: `Extracted text from ${file.name}.`,
      });
    } catch (error) {
      toast({
        title: "Failed to upload file",
        description: "Please try again with a different file.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Tabs defaultValue="text" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="text">Text Input</TabsTrigger>
          <TabsTrigger value="url">URL</TabsTrigger>
          <TabsTrigger value="file">File Upload</TabsTrigger>
        </TabsList>
        
        <TabsContent value="text" className="space-y-4">
          <div className="space-y-2">
            <Textarea 
              placeholder="Enter script, e.g., 'Quantum mechanics is…'" 
              className="min-h-[200px] resize-y"
              value={textScript}
              onChange={(e) => setTextScript(e.target.value)}
              aria-label="Script textarea"
            />
            {textError && <p className="text-red-500 text-sm" aria-live="polite">{textError}</p>}
          </div>
          <Button 
            onClick={handleTextSubmit} 
            disabled={loading}
            className="bg-[#1E40AF] hover:bg-blue-800"
          >
            {loading ? "Processing..." : "Add Script"}
          </Button>
        </TabsContent>
        
        <TabsContent value="url" className="space-y-4">
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input 
                  type="url" 
                  placeholder="e.g., https://docs.google.com/..." 
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  aria-label="URL input"
                />
                {urlError && <p className="text-red-500 text-sm mt-1" aria-live="polite">{urlError}</p>}
              </div>
              <Button 
                variant="outline" 
                onClick={handleUrlFetch}
                disabled={loading}
                aria-label="Fetch text from URL"
              >
                {loading ? "Fetching..." : "Fetch Text"}
              </Button>
            </div>
            
            {urlFetchedText && (
              <div className="space-y-2">
                <Label>Fetched Content</Label>
                <Textarea 
                  value={urlFetchedText} 
                  className="min-h-[150px] resize-y" 
                  readOnly 
                  aria-label="Fetched content"
                />
                <Button 
                  onClick={handleTextSubmit} 
                  disabled={loading}
                  className="bg-[#1E40AF] hover:bg-blue-800"
                >
                  {loading ? "Processing..." : "Use This Content"}
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="file" className="space-y-4">
          <div className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="file-upload">Upload Document</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleFileUpload}
                  aria-label="File upload"
                />
                <Label 
                  htmlFor="file-upload" 
                  className="cursor-pointer text-blue-600 hover:underline"
                >
                  Choose a file
                </Label>
                <p className="text-sm text-gray-500 mt-1">or drag and drop</p>
                <p className="text-xs text-gray-400 mt-2">PDF or Word document (max 5MB)</p>
                {fileError && <p className="text-red-500 text-sm mt-2" aria-live="polite">{fileError}</p>}
              </div>
            </div>
            
            {fileUploadedText && (
              <div className="space-y-2">
                <Label>Extracted Content</Label>
                <Textarea 
                  value={fileUploadedText} 
                  className="min-h-[150px] resize-y" 
                  readOnly 
                  aria-label="Extracted content"
                />
                <Button 
                  onClick={handleTextSubmit} 
                  disabled={loading}
                  className="bg-[#1E40AF] hover:bg-blue-800"
                >
                  {loading ? "Processing..." : "Use This Content"}
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 