import React, { useState } from 'react';
import { Search, Upload, X } from 'lucide-react';

interface ImageLibraryProps {
  onSelectImage: (imageUrl: string) => void;
}

const ImageLibrary: React.FC<ImageLibraryProps> = ({ onSelectImage }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Sample images for demonstration
  const sampleImages = [
    {
      url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      category: 'business'
    },
    {
      url: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      category: 'technology'
    },
    {
      url: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      category: 'technology'
    },
    {
      url: 'https://images.unsplash.com/photo-1661956602868-6ae368943878?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      category: 'nature'
    },
    {
      url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      category: 'business'
    },
    {
      url: 'https://images.unsplash.com/photo-1661956602944-249bcd04b63f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      category: 'nature'
    },
    {
      url: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      category: 'technology'
    },
    {
      url: 'https://images.unsplash.com/photo-1581472723648-909f4851d4ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      category: 'business'
    },
  ];

  const categories = ['business', 'technology', 'nature'];
  
  const filteredImages = sampleImages.filter(image => {
    if (selectedCategory && image.category !== selectedCategory) {
      return false;
    }
    
    if (searchTerm && !image.url.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <div className="flex mb-4 p-3">
        <div className="relative flex-1 mr-2">
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-200"
            placeholder="Search images..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          {searchTerm && (
            <button 
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200"
              onClick={() => setSearchTerm('')}
            >
              <X size={18} />
            </button>
          )}
        </div>
        
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center">
          <Upload size={18} className="mr-1" />
          Upload
        </button>
      </div>
      
      <div className="mb-4 flex flex-wrap gap-2 px-3">
        <button 
          className={`px-3 py-1 rounded-full text-sm ${
            selectedCategory === null ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'
          }`}
          onClick={() => setSelectedCategory(null)}
        >
          All
        </button>
        
        {categories.map(category => (
          <button 
            key={category}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedCategory === category ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto p-3">
        {filteredImages.map((image, index) => (
          <div 
            key={index}
            className="aspect-video bg-gray-900 rounded overflow-hidden cursor-pointer hover:opacity-80 transition-opacity border border-gray-700 hover:border-indigo-500"
            onClick={() => onSelectImage(image.url)}
          >
            <img 
              src={image.url} 
              alt={`Library image ${index + 1}`} 
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
      
      {filteredImages.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No images found. Try a different search or category.
        </div>
      )}
    </div>
  );
};

export default ImageLibrary;
