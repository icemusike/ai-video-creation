import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Slide, TextElement } from '../types';
import { 
  AlignCenter, 
  AlignLeft, 
  AlignRight, 
  Bold,
  Italic,
  Underline,
  Type,
  ChevronDown,
  Plus,
  Trash2,
  Layers
} from 'lucide-react';

interface TextSlideEditorProps {
  slide: Slide;
  onUpdate: (updatedSlide: Slide) => void;
}

// Font options
const fontOptions = [
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Cal Sans', value: "'Cal Sans', sans-serif" },
  { name: 'Roboto', value: "'Roboto', sans-serif" },
  { name: 'Cascadia Code', value: "'Cascadia Code', monospace" },
  { name: 'Playwrite Romania', value: "'Playwrite Romania', cursive" },
  { name: 'Bebas Neue', value: "'Bebas Neue', sans-serif" },
  { name: 'DynaPuff', value: "'DynaPuff', cursive" },
  { name: 'Chewy', value: "'Chewy', cursive" },
  { name: 'Limelight', value: "'Limelight', cursive" },
  { name: 'Permanent Marker', value: "'Permanent Marker', cursive" },
  { name: 'Cabin Sketch', value: "'Cabin Sketch', cursive" },
  { name: 'Notable', value: "'Notable', sans-serif" },
  { name: 'Times New Roman', value: "'Times New Roman', serif" },
  { name: 'Courier New', value: "'Courier New', monospace" },
  { name: 'Georgia', value: "'Georgia', serif" },
  { name: 'Verdana', value: "'Verdana', sans-serif" }
];

// Font size options in px (10 to 150px in even numbers)
const fontSizeOptions = [
  { name: '10px', value: '10px' },
  { name: '12px', value: '12px' },
  { name: '14px', value: '14px' },
  { name: '16px', value: '16px' },
  { name: '18px', value: '18px' },
  { name: '20px', value: '20px' },
  { name: '24px', value: '24px' },
  { name: '28px', value: '28px' },
  { name: '32px', value: '32px' },
  { name: '36px', value: '36px' },
  { name: '40px', value: '40px' },
  { name: '48px', value: '48px' },
  { name: '56px', value: '56px' },
  { name: '64px', value: '64px' },
  { name: '72px', value: '72px' },
  { name: '80px', value: '80px' },
  { name: '96px', value: '96px' },
  { name: '112px', value: '112px' },
  { name: '128px', value: '128px' },
  { name: '144px', value: '144px' },
  { name: '150px', value: '150px' }
];

// Font weight options
const fontWeightOptions = [
  { name: 'Normal', value: 'normal' },
  { name: 'Bold', value: 'bold' }
];

const TextSlideEditor: React.FC<TextSlideEditorProps> = ({ slide, onUpdate }) => {
  // Legacy content for backward compatibility
  const [content, setContent] = useState(slide.content);
  const [textColor, setTextColor] = useState(slide.textColor);
  const [textPosition, setTextPosition] = useState(slide.textPosition || 'center');
  const [textPadding, setTextPadding] = useState(slide.textPadding || 8);
  const [textAlign, setTextAlign] = useState(slide.textAlign || 'center');
  
  // Multiple text elements support
  const [textElements, setTextElements] = useState<TextElement[]>(
    slide.textElements || []
  );
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  
  // Editor state
  const [selectedFont, setSelectedFont] = useState('Arial');
  const [selectedFontSize, setSelectedFontSize] = useState('16px');
  const [selectedFontWeight, setSelectedFontWeight] = useState('normal');
  const [selectionColor, setSelectionColor] = useState('#000000');
  
  const editorRef = useRef<HTMLDivElement>(null);

  // Initialize text elements if none exist
  useEffect(() => {
    if (textElements.length === 0 && slide.content) {
      // Convert legacy content to a text element
      const newElement: TextElement = {
        id: uuidv4(),
        content: slide.content,
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        fontWeight: 'normal',
        color: slide.textColor,
        position: getPositionFromLegacyPosition(slide.textPosition || 'center'),
        width: 80,
        textAlign: slide.textAlign || 'center',
        zIndex: 1
      };
      
      setTextElements([newElement]);
      setSelectedElementId(newElement.id);
    }
  }, []);

  // Get position coordinates from legacy position value
  const getPositionFromLegacyPosition = (position: string): { x: number, y: number } => {
    switch (position) {
      case 'top':
        return { x: 50, y: 10 };
      case 'bottom':
        return { x: 50, y: 80 };
      case 'left':
        return { x: 20, y: 50 };
      case 'right':
        return { x: 80, y: 50 };
      default: // center
        return { x: 50, y: 50 };
    }
  };

  // Get the currently selected text element
  const getSelectedElement = (): TextElement | undefined => {
    return textElements.find(el => el.id === selectedElementId);
  };

  // Handle adding a new text element
  const handleAddTextElement = () => {
    const newElement: TextElement = {
      id: uuidv4(),
      content: 'New Text',
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      fontWeight: 'normal',
      color: '#ffffff',
      position: { x: 50, y: 50 },
      width: 60,
      textAlign: 'center',
      zIndex: textElements.length + 1
    };
    
    setTextElements([...textElements, newElement]);
    setSelectedElementId(newElement.id);
  };

  // Handle removing a text element
  const handleRemoveTextElement = (id: string) => {
    const updatedElements = textElements.filter(el => el.id !== id);
    setTextElements(updatedElements);
    
    if (selectedElementId === id) {
      setSelectedElementId(updatedElements.length > 0 ? updatedElements[0].id : null);
    }
  };

  // Handle selecting a text element
  const handleSelectElement = (id: string) => {
    setSelectedElementId(id);
    const element = textElements.find(el => el.id === id);
    
    if (element) {
      setSelectedFont(getFontNameFromValue(element.fontFamily));
      setSelectedFontSize(element.fontSize);
      setSelectedFontWeight(element.fontWeight);
      setSelectionColor(element.color);
    }
  };

  // Get font name from font value
  const getFontNameFromValue = (fontValue: string): string => {
    const font = fontOptions.find(f => f.value === fontValue);
    return font ? font.name : 'Arial';
  };

  // Update a text element property
  const updateTextElement = (id: string, updates: Partial<TextElement>) => {
    setTextElements(prev => 
      prev.map(el => el.id === id ? { ...el, ...updates } : el)
    );
  };

  // Handle content change for a text element
  const handleContentChange = (id: string, newContent: string) => {
    updateTextElement(id, { content: newContent });
  };

  // Handle font family change
  const handleFontFamilyChange = (fontName: string) => {
    if (!selectedElementId) return;
    
    setSelectedFont(fontName);
    const fontOption = fontOptions.find(f => f.name === fontName);
    if (fontOption) {
      updateTextElement(selectedElementId, { fontFamily: fontOption.value });
    }
  };

  // Handle font size change
  const handleFontSizeChange = (fontSize: string) => {
    if (!selectedElementId) return;
    
    setSelectedFontSize(fontSize);
    updateTextElement(selectedElementId, { fontSize });
  };

  // Handle font weight change
  const handleFontWeightChange = (fontWeight: string) => {
    if (!selectedElementId) return;
    
    setSelectedFontWeight(fontWeight);
    updateTextElement(selectedElementId, { fontWeight });
  };

  // Handle text color change
  const handleTextColorChange = (color: string) => {
    if (!selectedElementId) return;
    
    setSelectionColor(color);
    updateTextElement(selectedElementId, { color });
  };

  // Handle text alignment change
  const handleTextAlignChange = (textAlign: 'left' | 'center' | 'right') => {
    if (!selectedElementId) return;
    
    updateTextElement(selectedElementId, { textAlign });
  };

  // Handle element width change
  const handleWidthChange = (width: number) => {
    if (!selectedElementId) return;
    
    updateTextElement(selectedElementId, { width: Math.max(10, Math.min(100, width)) });
  };

  // Handle element z-index change
  const handleMoveForward = (id: string) => {
    setTextElements(prev => {
      const element = prev.find(el => el.id === id);
      if (!element) return prev;
      
      const maxZIndex = Math.max(...prev.map(el => el.zIndex));
      return prev.map(el => 
        el.id === id ? { ...el, zIndex: maxZIndex + 1 } : el
      );
    });
  };

  const handleMoveBackward = (id: string) => {
    setTextElements(prev => {
      const element = prev.find(el => el.id === id);
      if (!element) return prev;
      
      const minZIndex = Math.min(...prev.map(el => el.zIndex));
      return prev.map(el => 
        el.id === id ? { ...el, zIndex: Math.max(1, minZIndex - 1) } : el
      );
    });
  };

  // Save all changes to the slide
  const handleUpdate = () => {
    const updatedSlide: Slide = {
      ...slide,
      content,
      textColor,
      textPosition,
      textPadding,
      textAlign,
      textElements
    };
    
    onUpdate(updatedSlide);
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-200">Text Editor</h3>
      
      {/* Text elements list */}
      <div className="mb-4 border border-gray-700 rounded-md p-2 bg-gray-900">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium text-sm text-gray-300">Text Elements</h4>
          <button
            className="bg-indigo-600 text-white px-2 py-1 rounded-md text-sm hover:bg-indigo-700 flex items-center"
            onClick={handleAddTextElement}
          >
            <Plus size={14} className="mr-1" />
            Add Text
          </button>
        </div>
        
        <div className="max-h-40 overflow-y-auto">
          {textElements.length === 0 ? (
            <div className="text-center py-4 text-gray-500 text-sm">
              No text elements. Click "Add Text" to create one.
            </div>
          ) : (
            <div className="space-y-2">
              {textElements.map((element, index) => (
                <div 
                  key={element.id}
                  className={`flex items-center p-2 rounded-md cursor-pointer ${
                    selectedElementId === element.id 
                      ? 'bg-gray-700 border border-indigo-500' 
                      : 'hover:bg-gray-700 border border-transparent'
                  }`}
                  onClick={() => handleSelectElement(element.id)}
                >
                  <div className="flex-1 truncate">
                    <span className="font-medium text-sm mr-2 text-indigo-400">#{index + 1}</span>
                    <span className="text-sm text-gray-300">{element.content.substring(0, 20)}{element.content.length > 20 ? '...' : ''}</span>
                  </div>
                  
                  <div className="flex space-x-1">
                    <button 
                      className="p-1 text-gray-400 hover:text-indigo-400 hover:bg-gray-600 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveForward(element.id);
                      }}
                      title="Bring Forward"
                    >
                      <Layers size={14} />
                    </button>
                    <button 
                      className="p-1 text-gray-400 hover:text-red-400 hover:bg-gray-600 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTextElement(element.id);
                      }}
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Text element editor */}
      {selectedElementId && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Edit Text Content
            </label>
            
            {/* Text formatting toolbar */}
            <div className="flex flex-wrap items-center mb-2 p-1 border border-gray-600 rounded-t-md bg-gray-700">
              {/* Font family dropdown */}
              <div className="flex items-center mr-2 relative group">
                <select
                  className="p-1 text-sm border border-gray-600 rounded appearance-none pr-7 bg-gray-800 text-gray-200"
                  value={selectedFont}
                  onChange={(e) => handleFontFamilyChange(e.target.value)}
                  style={{ fontFamily: fontOptions.find(f => f.name === selectedFont)?.value }}
                >
                  {fontOptions.map((font) => (
                    <option 
                      key={font.name} 
                      value={font.name}
                      style={{ fontFamily: font.value }}
                    >
                      {font.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2 pointer-events-none text-gray-400" />
              </div>
              
              {/* Font size dropdown */}
              <div className="flex items-center mr-2 relative group">
                <select
                  className="p-1 text-sm border border-gray-600 rounded appearance-none pr-7 bg-gray-800 text-gray-200"
                  value={selectedFontSize}
                  onChange={(e) => handleFontSizeChange(e.target.value)}
                >
                  {fontSizeOptions.map((size) => (
                    <option key={size.name} value={size.value}>
                      {size.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2 pointer-events-none text-gray-400" />
              </div>
              
              {/* Font weight dropdown */}
              <div className="flex items-center mr-2 relative group">
                <select
                  className="p-1 text-sm border border-gray-600 rounded appearance-none pr-7 bg-gray-800 text-gray-200"
                  value={selectedFontWeight}
                  onChange={(e) => handleFontWeightChange(e.target.value)}
                >
                  {fontWeightOptions.map((weight) => (
                    <option key={weight.name} value={weight.value}>
                      {weight.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2 pointer-events-none text-gray-400" />
              </div>
              
              <div className="flex items-center ml-2">
                <input
                  type="color"
                  value={selectionColor}
                  onChange={(e) => handleTextColorChange(e.target.value)}
                  className="w-6 h-6 border-0 p-0 mr-1 bg-transparent"
                  title="Text Color"
                />
                <Type size={16} className="text-gray-400" />
              </div>
            </div>
            
            {/* Text content editor */}
            <textarea
              className="w-full p-2 border border-gray-600 rounded-b-md min-h-[100px] focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-800 text-gray-200"
              value={getSelectedElement()?.content || ''}
              onChange={(e) => handleContentChange(selectedElementId, e.target.value)}
              style={{
                fontFamily: getSelectedElement()?.fontFamily || 'Arial, sans-serif',
                fontSize: getSelectedElement()?.fontSize || '16px',
                fontWeight: getSelectedElement()?.fontWeight || 'normal',
                color: getSelectedElement()?.color || '#ffffff'
              }}
            />
          </div>
          
          {/* Text alignment */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Text Alignment
            </label>
            <div className="flex space-x-2">
              <button
                className={`p-2 rounded ${
                  getSelectedElement()?.textAlign === 'left' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'
                }`}
                onClick={() => handleTextAlignChange('left')}
                title="Align Left"
              >
                <AlignLeft size={16} />
              </button>
              <button
                className={`p-2 rounded ${
                  getSelectedElement()?.textAlign === 'center' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'
                }`}
                onClick={() => handleTextAlignChange('center')}
                title="Align Center"
              >
                <AlignCenter size={16} />
              </button>
              <button
                className={`p-2 rounded ${
                  getSelectedElement()?.textAlign === 'right' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'
                }`}
                onClick={() => handleTextAlignChange('right')}
                title="Align Right"
              >
                <AlignRight size={16} />
              </button>
            </div>
          </div>
          
          {/* Text width */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Text Width ({getSelectedElement()?.width || 80}%)
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={getSelectedElement()?.width || 80}
              onChange={(e) => handleWidthChange(parseInt(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
          
          <div className="text-sm text-gray-400 mb-4 p-2 bg-gray-700 border border-gray-600 rounded-md">
            <p>Drag text elements directly on the slide preview to position them.</p>
          </div>
        </>
      )}
      
      {/* Legacy slide settings */}
      <div className="mb-4 border-t border-gray-700 pt-4 mt-4">
        <h4 className="font-medium text-sm mb-2 text-gray-300">Slide Settings</h4>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Slide Padding ({textPadding}px)
          </label>
          <input
            type="range"
            min="0"
            max="32"
            value={textPadding}
            onChange={(e) => setTextPadding(parseInt(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Default Text Color
          </label>
          <div className="flex items-center">
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-10 h-10 border-0 p-0 mr-2 bg-transparent"
            />
            <input
              type="text"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="flex-1 p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-200"
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          onClick={handleUpdate}
        >
          Update Slide
        </button>
      </div>
    </div>
  );
};

export default TextSlideEditor;
