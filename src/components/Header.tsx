import React from 'react';
import { Monitor, ChevronDown, HelpCircle, Settings, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleDarkMode }) => {
  return (
    <div className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6 shadow-md">
      <div className="flex items-center">
        <Monitor className="text-indigo-400 mr-3" size={28} />
        <span className="font-bold text-xl gradient-text">EasyVSL<sup className="text-xs">2.0</sup></span>
      </div>
      
      <div className="flex items-center space-x-6">
        <button 
          onClick={toggleDarkMode}
          className="p-2 rounded-full hover:bg-gray-700 text-gray-300 transition-colors"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <button className="p-2 rounded-full hover:bg-gray-700 text-gray-300 transition-colors">
          <Settings size={20} />
        </button>
        
        <button className="p-2 rounded-full hover:bg-gray-700 text-gray-300 transition-colors">
          <HelpCircle size={20} />
        </button>
        
        <div className="flex items-center bg-gray-700 rounded-full pl-3 pr-1 py-1 hover:bg-gray-600 transition-colors cursor-pointer">
          <span className="mr-2 text-gray-200">Adeline</span>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
            A
          </div>
          <ChevronDown size={16} className="ml-1 text-gray-400" />
        </div>
      </div>
    </div>
  );
};

export default Header;
