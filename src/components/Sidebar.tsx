import React from 'react';
import { 
  Image, 
  Type, 
  Mic, 
  Settings, 
  FolderOpen,
  Plus,
  Layers,
  Music,
  Video,
  PanelLeft,
  Clock
} from 'lucide-react';

interface SidebarProps {
  onAddSlide: () => void;
  collapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onAddSlide, collapsed, toggleSidebar }) => {
  return (
    <div className={`bg-gray-900 border-r border-gray-800 flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-56'}`}>
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        {!collapsed && <span className="text-gray-200 font-medium">Tools</span>}
        <button 
          className="p-2 rounded-md hover:bg-gray-800 text-gray-400"
          onClick={toggleSidebar}
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <PanelLeft size={18} className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-3 mb-6">
          <button 
            className="w-full flex items-center p-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
            onClick={onAddSlide}
          >
            <Plus size={collapsed ? 20 : 18} className={collapsed ? 'mx-auto' : 'mr-3'} />
            {!collapsed && <span>Add Slide</span>}
          </button>
        </div>
        
        <div className="space-y-1 px-3">
          {/* Content Tools Section */}
          {!collapsed && <div className="text-xs text-gray-500 uppercase tracking-wider px-2 mb-2">Content</div>}
          
          <button className="w-full flex items-center p-2 rounded-md hover:bg-gray-800 text-gray-300 transition-colors">
            <Type size={collapsed ? 20 : 18} className={collapsed ? 'mx-auto' : 'mr-3'} />
            {!collapsed && <span>Text</span>}
          </button>
          
          <button className="w-full flex items-center p-2 rounded-md hover:bg-gray-800 text-gray-300 transition-colors">
            <Image size={collapsed ? 20 : 18} className={collapsed ? 'mx-auto' : 'mr-3'} />
            {!collapsed && <span>Images</span>}
          </button>
          
          <button className="w-full flex items-center p-2 rounded-md hover:bg-gray-800 text-gray-300 transition-colors">
            <Video size={collapsed ? 20 : 18} className={collapsed ? 'mx-auto' : 'mr-3'} />
            {!collapsed && <span>Videos</span>}
          </button>
          
          <button className="w-full flex items-center p-2 rounded-md hover:bg-gray-800 text-gray-300 transition-colors">
            <Layers size={collapsed ? 20 : 18} className={collapsed ? 'mx-auto' : 'mr-3'} />
            {!collapsed && <span>Shapes</span>}
          </button>
          
          {/* Audio Tools Section */}
          {!collapsed && <div className="text-xs text-gray-500 uppercase tracking-wider px-2 mt-6 mb-2">Audio</div>}
          
          <button className="w-full flex items-center p-2 rounded-md hover:bg-gray-800 text-gray-300 transition-colors">
            <Mic size={collapsed ? 20 : 18} className={collapsed ? 'mx-auto' : 'mr-3'} />
            {!collapsed && <span>Voiceover</span>}
          </button>
          
          <button className="w-full flex items-center p-2 rounded-md hover:bg-gray-800 text-gray-300 transition-colors">
            <Music size={collapsed ? 20 : 18} className={collapsed ? 'mx-auto' : 'mr-3'} />
            {!collapsed && <span>Background Music</span>}
          </button>
          
          {/* Project Tools Section */}
          {!collapsed && <div className="text-xs text-gray-500 uppercase tracking-wider px-2 mt-6 mb-2">Project</div>}
          
          <button className="w-full flex items-center p-2 rounded-md hover:bg-gray-800 text-gray-300 transition-colors">
            <FolderOpen size={collapsed ? 20 : 18} className={collapsed ? 'mx-auto' : 'mr-3'} />
            {!collapsed && <span>Projects</span>}
          </button>
          
          <button className="w-full flex items-center p-2 rounded-md hover:bg-gray-800 text-gray-300 transition-colors">
            <Clock size={collapsed ? 20 : 18} className={collapsed ? 'mx-auto' : 'mr-3'} />
            {!collapsed && <span>Timeline</span>}
          </button>
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-800">
        <button className="w-full flex items-center p-2 rounded-md hover:bg-gray-800 text-gray-300 transition-colors">
          <Settings size={collapsed ? 20 : 18} className={collapsed ? 'mx-auto' : 'mr-3'} />
          {!collapsed && <span>Settings</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
