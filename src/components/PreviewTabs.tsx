import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";

export function PreviewTabs() {
  const [activeTab, setActiveTab] = useState("script");
  const [loading, setLoading] = useState(false);
  const [scriptPreview, setScriptPreview] = useState("Quantum mechanics is a fundamental theory in physics that provides a description of the physical properties of nature at the scale of atoms and subatomic particles.");
  const { toast } = useToast();

  const handleRefresh = async (type: string) => {
    setLoading(true);
    
    try {
      // Mock API fetch with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock response based on the type
      switch (type) {
        case "script":
          setScriptPreview("Quantum mechanics is a fundamental theory in physics that describes nature at the atomic and subatomic scales. It differs from classical physics in that energy, momentum and other quantities are often restricted to discrete values (quantization), objects have characteristics of both particles and waves, and there are limits to how accurately the value of a physical quantity can be predicted prior to its measurement.");
          break;
          
        default:
          break;
      }
      
      toast({
        title: "Preview refreshed",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} preview has been updated.`,
      });
    } catch (error) {
      toast({
        title: "Failed to refresh preview",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tabs 
      defaultValue="script" 
      value={activeTab} 
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-4 md:grid-cols-4">
        <TabsTrigger value="script">Script</TabsTrigger>
        <TabsTrigger value="audio">Audio</TabsTrigger>
        <TabsTrigger value="visual">Visual</TabsTrigger>
        <TabsTrigger value="video">Video</TabsTrigger>
      </TabsList>
      
      <TabsContent value="script" className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Script Preview</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleRefresh("script")} 
            disabled={loading}
            aria-label="Refresh script preview"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-[150px] w-full" />
          </div>
        ) : (
          <Textarea 
            value={scriptPreview} 
            className="min-h-[150px] resize-y" 
            readOnly 
            aria-label="Script preview content"
          />
        )}
      </TabsContent>
      
      <TabsContent value="audio" className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Audio Preview</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleRefresh("audio")}
            disabled={loading}
            aria-label="Refresh audio preview"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-[80px] w-full" />
          </div>
        ) : (
          <div className="p-4 border rounded-md">
            <p className="text-sm text-gray-500 mb-2">Mock audio player</p>
            <audio 
              controls 
              className="w-full" 
              aria-label="Audio preview"
            >
              <source src="/mock/audio.mp3" type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="visual" className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Visual Preview</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleRefresh("visual")}
            disabled={loading}
            aria-label="Refresh visual preview"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-[200px] w-full max-w-[400px] mx-auto" />
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="border rounded-md p-2 max-w-[400px]">
              <img 
                src="/mock/visual.png" 
                alt="Visual preview" 
                className="max-w-full h-auto"
                width={400}
                height={300}
              />
            </div>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="video" className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Video Preview</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleRefresh("video")}
            disabled={loading}
            aria-label="Refresh video preview"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-[300px] w-full" />
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="border rounded-md p-2">
              <video 
                controls 
                className="max-w-full h-auto" 
                aria-label="Video preview"
              >
                <source src="/mock/video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
} 