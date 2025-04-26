import React, { useState } from 'react';
import { Slide } from '../types';
import { Image, Film, Palette } from 'lucide-react';
import ImageLibrary from './ImageLibrary';

interface BackgroundOptionsProps {
  slide: Slide;
  onUpdate: (updatedSlide: Slide) => void;
}

const BackgroundOptions: React.FC<BackgroundOptionsProps> = ({ slide, onUpdate }) => {
  const [backgroundType, setBackgroundType] = useState<'color' | 'image' | 'video'>(slide.background.type);
  const [backgroundColor, setBackgroundColor] = useState(
    slide.background.type === 'color' ? slide.background.value : '#ffffff'
  );
  const [backgroundImage, setBackgroundImage] = useState(
    slide.background.type === 'image' ? slide.background.value : ''
  );
  const [backgroundVideo, setBackgroundVideo] = useState(
    slide.background.type === 'video' ? slide.background.value : ''
  );
  const [showImageLibrary, setShowImageLibrary] = useState(false);

  const handleUpdate = () => {
    const updatedSlide: Slide = {
      ...slide,
      background: {
        type: backgroundType,
        value: backgroundType === 'color' 
          ? backgroundColor 
          : backgroundType === 'image' 
            ? backgroundImage 
            : backgroundVideo
      }
    };
    
    onUpdate(updatedSlide);
  };

  const handleSelectImage = (imageUrl: string) => {
    setBackgroundImage(imageUrl);
    setBackgroundType('image');
    setShowImageLibrary(false);
    
    // Auto-update when image is selected
    const updatedSlide: Slide = {
      ...slide,
      background: {
        type: 'image',
        value: imageUrl
      }
    };
    
    onUpdate(updatedSlide);
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-200">Background Options</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Background Type
        </label>
        <div className="flex space-x-2 mb-4">
          <button
            className={`flex items-center px-3 py-2 rounded ${
              backgroundType === 'color' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
            onClick={() => setBackgroundType('color')}
          >
            <Palette size={16} className="mr-1" />
            Color
          </button>
          <button
            className={`flex items-center px-3 py-2 rounded ${
              backgroundType === 'image' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
            onClick={() => setBackgroundType('image')}
          >
            <Image size={16} className="mr-1" />
            Image
          </button>
          <button
            className={`flex items-center px-3 py-2 rounded ${
              backgroundType === 'video' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
            onClick={() => setBackgroundType('video')}
          >
            <Film size={16} className="mr-1" />
            Video
          </button>
        </div>
        
        {backgroundType === 'color' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Background Color
            </label>
            <div className="flex items-center">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-10 h-10 border-0 p-0 mr-2 bg-transparent"
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="flex-1 p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-200"
              />
            </div>
          </div>
        )}
        
        {backgroundType === 'image' && (
          <div>
            {backgroundImage ? (
              <div className="relative mb-4">
                <img 
                  src={backgroundImage} 
                  alt="Background" 
                  className="w-full h-48 object-cover rounded-md"
                />
                <button 
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                  onClick={() => setBackgroundImage('')}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="mb-4">
                <button
                  className="w-full p-4 border-2 border-dashed border-gray-600 rounded-md text-gray-400 hover:bg-gray-700 flex flex-col items-center justify-center"
                  onClick={() => setShowImageLibrary(true)}
                >
                  <Image size={24} className="mb-2" />
                  <span>Select Background Image</span>
                </button>
              </div>
            )}
            
            {showImageLibrary && (
              <div className="mt-2">
                <ImageLibrary onSelectImage={handleSelectImage} />
              </div>
            )}
          </div>
        )}
        
        {backgroundType === 'video' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Video URL
            </label>
            <input
              type="text"
              placeholder="Enter video URL"
              value={backgroundVideo}
              onChange={(e) => setBackgroundVideo(e.target.value)}
              className="w-full p-2 border border-gray-600 rounded-md mb-2 bg-gray-700 text-gray-200"
            />
            {backgroundVideo && (
              <div className="relative">
                <video 
                  src={backgroundVideo} 
                  className="w-full h-48 object-cover rounded-md" 
                  controls
                />
              </div>
            )}
          </div>
        )}
      </div>
      
      {(backgroundType === 'color' || backgroundType === 'video') && (
        <div className="flex justify-end">
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            onClick={handleUpdate}
          >
            Apply Background
          </button>
        </div>
      )}
    </div>
  );
};

export default BackgroundOptions;
