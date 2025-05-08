import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Film, 
  FolderOpen, 
  Settings, 
  LogOut 
} from "lucide-react";

export function Sidebar() {
  return (
    <aside className="fixed w-[250px] h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-[#1E40AF]">Science Video Creator</h1>
      </div>
      
      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          <li>
            <Link href="/" className="flex items-center px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-700">
              <LayoutDashboard className="h-5 w-5 mr-3" />
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/create" className="flex items-center px-4 py-3 bg-blue-100 text-blue-700 font-medium">
              <Film className="h-5 w-5 mr-3" />
              Create Video
            </Link>
          </li>
          <li>
            <Link href="/projects" className="flex items-center px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-700">
              <FolderOpen className="h-5 w-5 mr-3" />
              Projects
            </Link>
          </li>
          <li>
            <Link href="/settings" className="flex items-center px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-700">
              <Settings className="h-5 w-5 mr-3" />
              Settings
            </Link>
          </li>
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/mock/avatar.png" alt="User" />
            <AvatarFallback>US</AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <p className="text-sm font-medium">User Name</p>
            <p className="text-xs text-gray-500">user@example.com</p>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto" aria-label="Logout">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
} 