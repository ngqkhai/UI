import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Search, Eye, Edit, Download } from "lucide-react";

// Mock project data
const mockProjects = [
  {
    id: "p1a2b3c4",
    topic: "Quantum Mechanics",
    status: "completed",
    created: "2023-12-01",
    duration: "5:32",
  },
  {
    id: "p2d3e4f5",
    topic: "DNA Structure",
    status: "processing",
    created: "2023-12-05",
    duration: "In progress",
  },
  {
    id: "p3g4h5i6",
    topic: "Climate Change",
    status: "completed",
    created: "2023-12-10",
    duration: "8:15",
  },
  {
    id: "p4j5k6l7",
    topic: "Artificial Intelligence",
    status: "draft",
    created: "2023-12-15",
    duration: "Not started",
  },
  {
    id: "p5m6n7o8",
    topic: "Solar System",
    status: "completed",
    created: "2023-12-20",
    duration: "6:45",
  },
];

type ProjectType = {
  id: string;
  topic: string;
  status: "draft" | "processing" | "completed";
  created: string;
  duration: string;
};

export function ProjectTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();
  
  // Filter projects based on search query
  const filteredProjects = mockProjects.filter(project => 
    project.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get current page items
  const indexOfLastItem = page * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstItem, indexOfLastItem);
  
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  
  const handleExport = (projectId: string) => {
    toast({
      title: "Export started",
      description: `Exporting project ${projectId}...`,
    });
    
    // Mock export process
    setTimeout(() => {
      toast({
        title: "Export completed",
        description: `Project ${projectId} has been exported.`,
      });
    }, 2000);
  };
  
  const handleEdit = (projectId: string) => {
    console.log(`Navigate to edit project ${projectId}`);
    toast({
      title: "Edit project",
      description: `Navigating to edit project ${projectId}...`,
    });
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const ProjectDetailDialog = ({ project }: { project: ProjectType }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`View details for ${project.topic}`}>
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{project.topic}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Project ID</p>
              <p>{project.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <p className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Created</p>
              <p>{project.created}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Duration</p>
              <p>{project.duration}</p>
            </div>
          </div>
          
          {project.status === "completed" && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500">Preview</p>
              <div className="border rounded-md p-2">
                <video 
                  controls 
                  className="max-w-full h-auto" 
                  aria-label={`Preview for ${project.topic}`}
                >
                  <source src="/mock/video.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search projects..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search projects"
          />
        </div>
      </div>
      
      <div className="border rounded-md">
        <Table aria-label="Projects table">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Project ID</TableHead>
              <TableHead>Topic</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentProjects.length > 0 ? (
              currentProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.id}</TableCell>
                  <TableCell>{project.topic}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>{project.created}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <ProjectDetailDialog project={project} />
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEdit(project.id)}
                        aria-label={`Edit project ${project.topic}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      {project.status === "completed" && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleExport(project.id)}
                          aria-label={`Export project ${project.topic}`}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No projects found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Previous page"
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label="Next page"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
} 