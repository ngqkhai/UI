import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Check, Youtube } from "lucide-react";

export function YouTubeUpload() {
  const [authenticated, setAuthenticated] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [privacy, setPrivacy] = useState("private");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileError, setFileError] = useState("");
  const [titleError, setTitleError] = useState("");
  const { toast } = useToast();

  const handleAuthentication = async () => {
    try {
      // Mock OAuth authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate redirect and return
      setAuthenticated(true);
      
      toast({
        title: "Successfully connected to YouTube",
        description: "Your account is now linked.",
      });
    } catch (error) {
      toast({
        title: "Authentication failed",
        description: "Could not connect to YouTube. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['video/mp4', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      setFileError("Please upload an MP4 or MOV file");
      setVideoFile(null);
      return;
    }
    
    // Validate file size (< 1GB)
    if (file.size > 1024 * 1024 * 1024) {
      setFileError("File size must be less than 1GB");
      setVideoFile(null);
      return;
    }
    
    setFileError("");
    setVideoFile(file);
  };

  const validateForm = () => {
    let isValid = true;
    
    if (!title.trim() || title.length > 100) {
      setTitleError("Title is required and must be less than 100 characters");
      isValid = false;
    } else {
      setTitleError("");
    }
    
    return isValid;
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authenticated) {
      toast({
        title: "Not authenticated",
        description: "Please connect to YouTube first.",
        variant: "destructive",
      });
      return;
    }
    
    if (!videoFile) {
      setFileError("Please select a video file");
      return;
    }
    
    if (!validateForm()) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Mock upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 300);
      
      // Mock API call with delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      clearInterval(interval);
      setUploadProgress(100);
      
      toast({
        title: "Video uploaded successfully",
        description: `Your video "${title}" is now on YouTube.`,
      });
      
      // Mock response with video ID and URL
      const mockResponse = {
        videoId: "mock_123",
        url: "https://youtube.com/watch?v=mock_123"
      };
      
      // You could set these values in state and display them
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Could not upload to YouTube. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Button
          variant={authenticated ? "outline" : "default"}
          className={!authenticated ? "bg-[#FF0000] hover:bg-[#CC0000] text-white" : ""}
          onClick={handleAuthentication}
          disabled={authenticated || uploading}
          aria-label="Connect to YouTube"
        >
          {authenticated ? (
            <>
              <Check className="h-4 w-4 mr-2 text-green-600" />
              <span className="text-green-600">Connected to YouTube</span>
            </>
          ) : (
            <>
              <Youtube className="h-4 w-4 mr-2" />
              Connect YouTube
            </>
          )}
        </Button>
      </div>
      
      <form onSubmit={handleUpload} className="space-y-4">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="video-upload">Upload Video</Label>
          <div className={`border-2 border-dashed rounded-lg p-6 text-center ${fileError ? "border-red-500" : "border-gray-300"}`}>
            <Input
              id="video-upload"
              type="file"
              accept="video/mp4,video/quicktime"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
              aria-label="Video file upload"
            />
            <Label 
              htmlFor="video-upload" 
              className="cursor-pointer text-blue-600 hover:underline"
            >
              Choose a video file
            </Label>
            <p className="text-sm text-gray-500 mt-1">or drag and drop</p>
            <p className="text-xs text-gray-400 mt-2">MP4 or MOV video (max 1GB)</p>
            {fileError && <p className="text-red-500 text-sm mt-2" aria-live="polite">{fileError}</p>}
            {videoFile && <p className="text-blue-600 mt-2 font-medium">{videoFile.name}</p>}
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="video-title">Title</Label>
            <Input
              id="video-title"
              placeholder="Enter video title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              disabled={uploading}
              aria-label="Video title"
              aria-describedby="title-error"
            />
            {titleError && <p id="title-error" className="text-red-500 text-sm" aria-live="polite">{titleError}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="video-description">Description</Label>
            <Textarea
              id="video-description"
              placeholder="Enter video description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={5000}
              disabled={uploading}
              aria-label="Video description"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="video-tags">Tags (comma-separated)</Label>
            <Input
              id="video-tags"
              placeholder="science, education, physics"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              disabled={uploading}
              aria-label="Video tags"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="privacy-status">Privacy Status</Label>
            <Select value={privacy} onValueChange={setPrivacy} disabled={uploading}>
              <SelectTrigger id="privacy-status" aria-label="Select privacy status">
                <SelectValue placeholder="Select privacy status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="unlisted">Unlisted</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Uploading...</span>
              <span className="text-sm">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} aria-label="Upload progress" />
          </div>
        )}
        
        <Button 
          type="submit" 
          className="w-full md:w-auto bg-[#1E40AF] hover:bg-blue-800"
          disabled={!authenticated || !videoFile || uploading}
        >
          {uploading ? "Uploading..." : "Upload Video"}
        </Button>
      </form>
    </div>
  );
} 