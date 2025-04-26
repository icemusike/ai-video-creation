import React, { useRef, useState, useEffect } from 'react';
import { Slide, TextElement } from '../types';
import { ChevronLeft, ChevronRight, Play, Pause, Maximize2, ZoomIn, ZoomOut, Edit3, Move } from 'lucide-react';

interface SlidePreviewProps {
  slides: Slide[];
  currentSlideIndex: number;
  onSlideChange: (index: number) => void;
  onPlay: () => void;
  isPlaying: boolean;
  onUpdateSlide: (updatedSlide: Slide) => void;
}

const SlidePreview: React.FC<SlidePreviewProps> = ({ 
  slides, 
  currentSlideIndex, 
  onSlideChange,
  onPlay,
  isPlaying,
  onUpdateSlide
}) => {
  if (slides.length === 0) return null;
  
  const currentSlide = slides[currentSlideIndex];
  const slideRef = useRef<HTMLDivElement>(null);
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null);
  const [resizingElementId, setResizingElementId] = useState<string | null>(null);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [updatedElements, setUpdatedElements] = useState<TextElement[] | undefined>(
    currentSlide.textElements
  );
  const [zoomLevel, setZoomLevel] = useState(100);
  const [startResizeWidth, setStartResizeWidth] = useState(0);
  const [startResizeX, setStartResizeX] = useState(0);
  const editableTextRef = useRef<HTMLDivElement>(null);
  
  // Update local state when slide changes
  useEffect(() => {
    setUpdatedElements(currentSlide.textElements);
    setEditingElementId(null);
    setDraggedElementId(null);
    setResizingElementId(null);
  }, [currentSlide]);

  // Save changes when editing is complete
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (editingElementId && editableTextRef.current && !editableTextRef.current.contains(e.target as Node)) {
        finishEditing();
      }
    };

    if (editingElementId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingElementId]);
  
  const renderBackground = () => {
    switch (currentSlide.background.type) {
      case 'color':
        return (
          <div 
            className="absolute inset-0" 
            style={{ backgroundColor: currentSlide.background.value }}
          />
        );
      case 'image':
        return (
          <img 
            src={currentSlide.background.value} 
            alt="Background" 
            className="absolute inset-0 w-full h-full object-cover"
          />
        );
      case 'video':
        return (
          <video 
            src={currentSlide.background.value} 
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            loop
            muted
          />
        );
      default:
        return null;
    }
  };
  
  const getTextPositionClasses = () => {
    switch (currentSlide.textPosition) {
      case 'top':
        return 'items-start';
      case 'bottom':
        return 'items-end';
      case 'left':
        return 'justify-start items-center';
      case 'right':
        return 'justify-end items-center';
      default:
        return 'items-center justify-center';
    }
  };
  
  const getTextAlignClass = () => {
    switch (currentSlide.textAlign) {
      case 'left':
        return 'text-left';
      case 'right':
        return 'text-right';
      default:
        return 'text-center';
    }
  };
  
  // Calculate the content width based on padding
  const contentWidth = `calc(100% - ${(currentSlide.textPadding || 8) * 2}px)`;
  
  // Sort text elements by z-index
  const sortedTextElements = updatedElements 
    ? [...updatedElements].sort((a, b) => a.zIndex - b.zIndex)
    : [];
  
  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); // Prevent default behavior
    e.stopPropagation(); // Stop event propagation
    
    if (editingElementId) return;
    
    setDraggedElementId(id);
    
    // Add event listeners for drag operations
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e: MouseEvent) => {
    if (!draggedElementId || !slideRef.current) return;
    
    const rect = slideRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate position as percentage
    const xPercent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const yPercent = Math.max(0, Math.min(100, (y / rect.height) * 100));
    
    // Update the element position
    setUpdatedElements(prev => 
      prev?.map(el => 
        el.id === draggedElementId 
          ? { ...el, position: { x: xPercent, y: yPercent } } 
          : el
      )
    );
  };

  // Handle mouse up for dragging
  const handleMouseUp = () => {
    if (!draggedElementId && !resizingElementId) return;
    
    // Create an updated slide with the new element positions
    const updatedSlide = {
      ...currentSlide,
      textElements: updatedElements
    };
    
    // Update the slide
    onUpdateSlide(updatedSlide);
    
    // Reset drag state
    setDraggedElementId(null);
    setResizingElementId(null);
    
    // Remove event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('mousemove', handleResizeMove);
  };

  // Handle start resizing
  const handleStartResize = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (editingElementId) return;
    
    const element = updatedElements?.find(el => el.id === id);
    if (!element) return;
    
    setResizingElementId(id);
    setStartResizeWidth(element.width);
    setStartResizeX(e.clientX);
    
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle resize move
  const handleResizeMove = (e: MouseEvent) => {
    if (!resizingElementId || !slideRef.current) return;
    
    const element = updatedElements?.find(el => el.id === resizingElementId);
    if (!element) return;
    
    const deltaX = e.clientX - startResizeX;
    const rect = slideRef.current.getBoundingClientRect();
    
    // Convert pixel change to percentage change
    const percentageDelta = (deltaX / rect.width) * 100;
    const newWidth = Math.max(10, Math.min(100, startResizeWidth + percentageDelta));
    
    setUpdatedElements(prev => 
      prev?.map(el => 
        el.id === resizingElementId 
          ? { ...el, width: newWidth } 
          : el
      )
    );
  };

  // Handle double click to edit text
  const handleDoubleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setEditingElementId(id);
    
    // Focus the editable element after it's rendered
    setTimeout(() => {
      if (editableTextRef.current) {
        editableTextRef.current.focus();
        
        // Place cursor at the end of the text
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(editableTextRef.current);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }, 0);
  };

  // Handle text content change
  const handleTextChange = (e: React.FormEvent<HTMLDivElement>) => {
    if (!editingElementId) return;
    
    const newContent = e.currentTarget.innerText;
    
    setUpdatedElements(prev => 
      prev?.map(el => 
        el.id === editingElementId 
          ? { ...el, content: newContent } 
          : el
      )
    );
  };

  // Finish editing and save changes
  const finishEditing = () => {
    if (!editingElementId) return;
    
    // Update the slide with the new content
    const updatedSlide = {
      ...currentSlide,
      textElements: updatedElements,
      // Also update the main content for voiceover sync
      content: updatedElements?.find(el => el.id === editingElementId)?.content || currentSlide.content
    };
    
    // Update the slide
    onUpdateSlide(updatedSlide);
    
    // Reset editing state
    setEditingElementId(null);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 150));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 50));
  };

  const handleResetZoom = () => {
    setZoomLevel(100);
  };
  
  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      {/* Toolbar */}
      <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <button 
            className="p-1.5 rounded hover:bg-gray-700 text-gray-300"
            onClick={handleZoomOut}
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          
          <span className="text-xs text-gray-300">{zoomLevel}%</span>
          
          <button 
            className="p-1.5 rounded hover:bg-gray-700 text-gray-300"
            onClick={handleZoomIn}
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          
          <button 
            className="p-1.5 rounded hover:bg-gray-700 text-gray-300"
            onClick={handleResetZoom}
            title="Reset Zoom"
          >
            <Maximize2 size={16} />
          </button>
        </div>
        
        <div className="text-xs text-gray-400">
          Slide {currentSlideIndex + 1} of {slides.length}
        </div>
      </div>
      
      {/* Preview Area */}
      <div className="flex-1 flex items-center justify-center bg-gray-900 relative">
        <div 
          ref={slideRef}
          className="relative rounded-lg overflow-hidden shadow-xl transition-transform duration-200"
          style={{ 
            width: `${80 * (zoomLevel / 100)}%`, 
            height: `${80 * (zoomLevel / 100)}%`,
            maxWidth: '1200px',
            maxHeight: '675px'
          }}
        >
          {/* Slide background */}
          <div className="absolute inset-0 bg-gray-800"></div>
          {renderBackground()}
          
          {/* Legacy content rendering for backward compatibility */}
          {!currentSlide.textElements?.length && (
            <div className={`absolute inset-0 flex ${getTextPositionClasses()}`}>
              <div 
                className={`${getTextAlignClass()} z-10`}
                style={{ 
                  color: currentSlide.textColor,
                  width: contentWidth,
                  maxWidth: contentWidth,
                  padding: `${currentSlide.textPadding || 8}px`
                }}
                dangerouslySetInnerHTML={{ __html: currentSlide.content }} 
              />
            </div>
          )}
          
          {/* Multiple text elements rendering */}
          {sortedTextElements.map((element: TextElement) => (
            <div
              key={element.id}
              className={`absolute group ${
                draggedElementId === element.id || resizingElementId === element.id 
                  ? 'ring-2 ring-indigo-500 ring-opacity-80' 
                  : 'hover:ring-2 hover:ring-indigo-500 hover:ring-opacity-50'
              }`}
              style={{
                left: `${element.position.x}%`,
                top: `${element.position.y}%`,
                transform: 'translate(-50%, -50%)',
                width: `${element.width}%`,
                fontFamily: element.fontFamily,
                fontSize: element.fontSize,
                fontWeight: element.fontWeight,
                color: element.color,
                textAlign: element.textAlign,
                zIndex: element.zIndex
              }}
            >
              {/* Drag handle */}
              <div 
                className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-move"
                onMouseDown={(e) => handleMouseDown(e, element.id)}
                title="Drag to move"
              >
                <Move size={14} />
              </div>
              
              {/* Resize handle */}
              <div 
                className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-8 bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-ew-resize rounded-r-full"
                onMouseDown={(e) => handleStartResize(e, element.id)}
                title="Drag to resize"
              ></div>
              
              {/* Edit button */}
              <div 
                className="absolute -top-6 -right-6 bg-indigo-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={(e) => handleDoubleClick(e, element.id)}
                title="Edit text"
              >
                <Edit3 size={14} />
              </div>
              
              {/* Text content - editable or static */}
              {editingElementId === element.id ? (
                <div
                  ref={editableTextRef}
                  contentEditable
                  suppressContentEditableWarning
                  className="outline-none min-h-[1em] px-2 py-1 border border-indigo-500 bg-black bg-opacity-20"
                  onInput={handleTextChange}
                  onBlur={finishEditing}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.shiftKey === false) {
                      e.preventDefault();
                      finishEditing();
                    }
                  }}
                >
                  {element.content}
                </div>
              ) : (
                <div 
                  className="cursor-move px-2 py-1"
                  onMouseDown={(e) => handleMouseDown(e, element.id)}
                  onDoubleClick={(e) => handleDoubleClick(e, element.id)}
                >
                  {element.content}
                </div>
              )}
            </div>
          ))}
          
          {/* Instruction overlay - only shown when there are elements but none are being edited/dragged/resized */}
          {sortedTextElements.length > 0 && !draggedElementId && !resizingElementId && !editingElementId && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white text-xs py-1 px-3 rounded-full pointer-events-none">
              Hover over text to edit, move, or resize
            </div>
          )}
        </div>
        
        {/* Navigation buttons */}
        <button 
          className="absolute left-4 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-full p-2 shadow-lg transition-colors"
          onClick={() => onSlideChange(Math.max(0, currentSlideIndex - 1))}
          disabled={currentSlideIndex === 0}
        >
          <ChevronLeft size={20} />
        </button>
        
        <button 
          className="absolute right-4 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-full p-2 shadow-lg transition-colors"
          onClick={() => onSlideChange(Math.min(slides.length - 1, currentSlideIndex + 1))}
          disabled={currentSlideIndex === slides.length - 1}
        >
          <ChevronRight size={20} />
        </button>
        
        {/* Play/Pause button */}
        <button 
          className="absolute bottom-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-3 shadow-lg transition-colors"
          onClick={onPlay}
        >
          {isPlaying ? (
            <Pause size={24} />
          ) : (
            <Play size={24} fill="white" />
          )}
        </button>
      </div>
      
      {/* Progress bar */}
      <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
    </div>
  );
};

export default SlidePreview;
