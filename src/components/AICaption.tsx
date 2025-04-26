import React, { useState, useEffect } from 'react';
import { MessageSquare, Sun, Moon } from 'lucide-react';

interface AICaptionProps {
  slideContent: string;
  onGenerateCaption: (caption: string, captionColor: 'light' | 'dark') => void;
}

const AICaption: React.FC<AICaptionProps> = ({ slideContent, onGenerateCaption }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [caption, setCaption] = useState('');
  const [captionColor, setCaptionColor] = useState<'light' | 'dark'>('light');
  
  // Reset caption when slide content changes
  useEffect(() => {
    setCaption('');
  }, [slideContent]);

  const handleGenerateCaption = async () => {
    setIsGenerating(true);
    
    // Simulate AI caption generation
    setTimeout(() => {
      // This would be replaced with actual API call to an AI service
      const generatedCaption = `Did you know that 92% of the top-selling products on Clickbank ${slideContent.substring(0, 30)}...`;
      setCaption(generatedCaption);
      setIsGenerating(false);
    }, 1500);
  };

  const handleApplyCaption = () => {
    if (caption) {
      onGenerateCaption(caption, captionColor);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex items-center mb-3">
        <MessageSquare className="text-purple-600 mr-2" size={20} />
        <h3 className="text-lg font-semibold">AI Caption Generator</h3>
      </div>
      
      <div className="mb-4">
        <textarea
          className="w-full p-3 border border-gray-300 rounded-md"
          rows={3}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Generated caption will appear here..."
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Caption Text Color
        </label>
        <div className="flex space-x-2">
          <button
            className={`flex items-center px-3 py-2 rounded ${
              captionColor === 'light' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setCaptionColor('light')}
          >
            <Sun size={16} className="mr-1" />
            Light
          </button>
          <button
            className={`flex items-center px-3 py-2 rounded ${
              captionColor === 'dark' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setCaptionColor('dark')}
          >
            <Moon size={16} className="mr-1" />
            Dark
          </button>
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center"
          onClick={handleGenerateCaption}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate Caption'}
        </button>
        
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          onClick={handleApplyCaption}
          disabled={!caption}
        >
          Apply Caption
        </button>
      </div>
    </div>
  );
};

export default AICaption;
