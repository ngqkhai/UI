import { useState } from "react";
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

export function VideoForm() {
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState("simple");
  const [language, setLanguage] = useState("en");
  const [voice, setVoice] = useState("Joanna");
  const [visualStyle, setVisualStyle] = useState("modern");
  const [loading, setLoading] = useState(false);
  const [topicError, setTopicError] = useState("");
  const { toast } = useToast();

  const validateForm = () => {
    let isValid = true;
    
    if (!topic.trim()) {
      setTopicError("Topic is required");
      isValid = false;
    } else {
      setTopicError("");
    }
    
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Video generation started",
        description: "Your video is being processed. Check the preview tabs for updates.",
      });
    } catch (error) {
      toast({
        title: "Failed to generate video",
        description: "Please try again with different parameters.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="topic">Topic</Label>
          <Input
            id="topic"
            placeholder="e.g., Quantum Mechanics"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            aria-label="Video topic"
            aria-describedby="topic-error"
          />
          {topicError && (
            <p id="topic-error" className="text-red-500 text-sm" aria-live="polite">
              {topicError}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="style">Presentation Style</Label>
          <Select value={style} onValueChange={setStyle}>
            <SelectTrigger id="style" aria-label="Select presentation style">
              <SelectValue placeholder="Select style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="simple">Simple</SelectItem>
              <SelectItem value="popular">Popular Science</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger id="language" aria-label="Select language">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="vi">Vietnamese</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="voice">Voice</Label>
          <Select value={voice} onValueChange={setVoice}>
            <SelectTrigger id="voice" aria-label="Select voice">
              <SelectValue placeholder="Select voice" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Joanna">Joanna (Female)</SelectItem>
              <SelectItem value="Matthew">Matthew (Male)</SelectItem>
              <SelectItem value="Salli">Salli (Female)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="visual-style">Visual Style</Label>
          <Select value={visualStyle} onValueChange={setVisualStyle}>
            <SelectTrigger id="visual-style" aria-label="Select visual style">
              <SelectValue placeholder="Select visual style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="modern">Modern</SelectItem>
              <SelectItem value="cartoon">Cartoon</SelectItem>
              <SelectItem value="realistic">Realistic</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full md:w-auto bg-[#1E40AF] hover:bg-blue-800"
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Video"}
      </Button>
    </form>
  );
} 