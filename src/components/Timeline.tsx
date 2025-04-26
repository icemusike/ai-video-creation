import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Slide, AudioTrack } from '../types';
import { Play, Pause, ChevronLeft, ChevronRight, GripHorizontal, Volume2, Clock } from 'lucide-react';

interface TimelineProps {
  slides: Slide[];
  audioTracks: AudioTrack[];
  currentSlideIndex: number;
  isPlaying: boolean;
  onSlideSelect: (index: number) => void;
  onSlideDurationChange: (id: string, duration: number) => void;
  onTogglePlay: () => void;
  onReorderSlides: (startIndex: number, endIndex: number) => void;
}

const Timeline: React.FC<TimelineProps> = ({
  slides,
  audioTracks,
  currentSlideIndex,
  isPlaying,
  onSlideSelect,
  onSlideDurationChange,
  onTogglePlay,
  onReorderSlides
}) => {
  const [editingDurationId, setEditingDurationId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState('00:00:00');
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const elapsedTimeRef = useRef<number>(0);

  // Calculate total duration for display
  const totalDuration = slides.reduce((sum, slide) => sum + slide.duration, 0);
  const minutes = Math.floor(totalDuration / 60);
  const seconds = totalDuration % 60;
  const formattedTime = `00:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Calculate current slide start time (in seconds)
  const currentSlideStartTime = slides
    .slice(0, currentSlideIndex)
    .reduce((sum, slide) => sum + slide.duration, 0);

  // Animate playback position
  useEffect(() => {
    if (isPlaying) {
      // Initialize the start time based on the current slide's start time
      if (elapsedTimeRef.current === 0) {
        elapsedTimeRef.current = currentSlideStartTime;
      }
      
      startTimeRef.current = Date.now() - elapsedTimeRef.current * 1000;
      
      const animate = () => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        elapsedTimeRef.current = elapsed;
        
        // Update current time display
        const minutes = Math.floor(elapsed / 60);
        const seconds = Math.floor(elapsed % 60);
        setCurrentTime(`00:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        
        // Update playback position (percentage)
        const position = Math.min(elapsed / totalDuration, 1);
        setPlaybackPosition(position);
        
        // Continue animation
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animationRef.current = requestAnimationFrame(animate);
    } else {
      // Stop animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isPlaying, totalDuration, currentSlideIndex, currentSlideStartTime]);

  // Update playback position when current slide changes
  useEffect(() => {
    if (!isPlaying) {
      elapsedTimeRef.current = currentSlideStartTime;
      const position = currentSlideStartTime / totalDuration;
      setPlaybackPosition(position);
      
      // Update current time display
      const minutes = Math.floor(currentSlideStartTime / 60);
      const seconds = Math.floor(currentSlideStartTime % 60);
      setCurrentTime(`00:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }
  }, [currentSlideIndex, totalDuration, currentSlideStartTime, isPlaying]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    if (sourceIndex === destinationIndex) return;
    
    onReorderSlides(sourceIndex, destinationIndex);
  };

  const handleDurationChange = (id: string, newDuration: number) => {
    onSlideDurationChange(id, Math.max(1, newDuration));
    setEditingDurationId(null);
  };

  // Format time in MM:SS format
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-72 bg-gray-800 border-t border-gray-700">
      <div className="p-2 font-semibold text-gray-300">Synchronization Workspace</div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="slides" direction="horizontal">
          {(provided, snapshot) => (
            <div 
              className={`flex overflow-x-auto p-2 min-h-[96px] ${snapshot.isDraggingOver ? 'bg-blue-900 bg-opacity-20' : ''}`}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {slides.map((slide, index) => (
                <Draggable key={slide.id} draggableId={slide.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex-shrink-0 w-32 h-20 mr-2 rounded overflow-hidden border-2 relative ${
                        index === currentSlideIndex ? 'border-green-500' : snapshot.isDragging ? 'border-blue-400' : 'border-transparent'
                      } ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                      onClick={() => onSlideSelect(index)}
                    >
                      <div className="w-full h-full relative">
                        {slide.background.type === 'color' && (
                          <div 
                            className="absolute inset-0" 
                            style={{ backgroundColor: slide.background.value }}
                          />
                        )}
                        
                        {slide.background.type === 'image' && (
                          <img 
                            src={slide.background.value} 
                            alt={`Slide ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                        )}
                        
                        {slide.background.type === 'video' && (
                          <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white text-xs">
                            <span>Video</span>
                          </div>
                        )}
                        
                        <div className="absolute inset-0 flex items-center justify-center p-1 text-xs">
                          <div 
                            style={{ color: slide.textColor }}
                            className="line-clamp-3 text-center"
                          >
                            {slide.content}
                          </div>
                        </div>
                        
                        {/* Voice indicator */}
                        {slide.voiceover && (
                          <div className="absolute top-1 right-1 bg-blue-500 rounded-full p-1">
                            <Volume2 size={12} className="text-white" />
                          </div>
                        )}
                      </div>
                      
                      {/* Drag handle */}
                      <div 
                        {...provided.dragHandleProps}
                        className="absolute top-0 left-0 right-0 h-5 bg-black bg-opacity-30 flex items-center justify-center cursor-grab active:cursor-grabbing"
                      >
                        <GripHorizontal size={14} className="text-white" />
                      </div>
                      
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 flex justify-between items-center">
                        <span>
                          Slide {index + 1}
                          {index === currentSlideIndex && <span className="ml-1">• Begin</span>}
                        </span>
                        
                        {editingDurationId === slide.id ? (
                          <input
                            type="number"
                            className="w-8 h-5 text-xs text-black"
                            value={slide.duration}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              if (!isNaN(value)) {
                                handleDurationChange(slide.id, value);
                              }
                            }}
                            onBlur={() => setEditingDurationId(null)}
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span 
                            className="cursor-pointer hover:bg-gray-700 px-1 rounded"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingDurationId(slide.id);
                            }}
                          >
                            {slide.duration}s
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      
      {/* Audio visualization */}
      <div className="px-4 py-2">
        <div className="flex items-center mb-2">
          <button 
            className="bg-gray-800 text-white p-2 rounded-md mr-2"
            onClick={onTogglePlay}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <div className="text-sm text-gray-400">{currentTime} / {formattedTime}</div>
          
          <div className="ml-auto flex items-center">
            <button 
              className="bg-gray-700 hover:bg-gray-600 p-1 rounded mr-1"
              onClick={() => onSlideSelect(Math.max(0, currentSlideIndex - 1))}
              disabled={currentSlideIndex === 0}
            >
              <ChevronLeft size={16} className="text-gray-300" />
            </button>
            <button 
              className="bg-gray-700 hover:bg-gray-600 p-1 rounded"
              onClick={() => onSlideSelect(Math.min(slides.length - 1, currentSlideIndex + 1))}
              disabled={currentSlideIndex === slides.length - 1}
            >
              <ChevronRight size={16} className="text-gray-300" />
            </button>
          </div>
        </div>
        
        {/* Audio waveform visualization */}
        <div className="relative">
          {/* Timeline markers */}
          <div className="flex border-b border-gray-600 mb-1">
            {slides.map((slide, index) => {
              // Calculate the width percentage based on duration
              const widthPercentage = (slide.duration / totalDuration) * 100;
              return (
                <div 
                  key={slide.id}
                  className={`text-xs text-gray-500 flex items-center justify-center ${
                    index === currentSlideIndex ? 'font-bold text-blue-400' : ''
                  }`}
                  style={{ width: `${widthPercentage}%` }}
                >
                  {index + 1}
                </div>
              );
            })}
          </div>
          
          {/* Audio visualization */}
          <div className="h-16 bg-gray-700 rounded relative">
            {/* Playback position indicator */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
              style={{ left: `${playbackPosition * 100}%` }}
            ></div>
            
            {/* Slide duration segments */}
            <div className="flex h-full">
              {slides.map((slide, index) => {
                // Calculate the width percentage based on duration
                const widthPercentage = (slide.duration / totalDuration) * 100;
                
                // Find audio track for this slide
                const audioTrack = audioTracks.find(track => 
                  track.src === slide.voiceover
                );
                
                return (
                  <div 
                    key={slide.id}
                    className={`h-full relative ${
                      index === currentSlideIndex ? 'bg-blue-900 bg-opacity-30' : index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'
                    }`}
                    style={{ width: `${widthPercentage}%` }}
                  >
                    {/* Audio waveform for slides with voiceover */}
                    {slide.voiceover && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full px-2">
                          <div className="w-full h-8 flex items-center">
                            {/* Simulated waveform */}
                            {Array.from({ length: 20 }).map((_, i) => {
                              const height = Math.random() * 100;
                              return (
                                <div 
                                  key={i}
                                  className="flex-1 mx-px bg-blue-500"
                                  style={{ height: `${height}%` }}
                                ></div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Voice indicator and duration */}
                    {slide.voiceover && audioTrack && (
                      <div className="absolute bottom-1 w-full flex justify-center">
                        <div className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full flex items-center">
                          <Clock size={10} className="mr-1" />
                          {formatTime(audioTrack.duration)}
                        </div>
                      </div>
                    )}
                    
                    {/* Voice indicator */}
                    {slide.voiceover && (
                      <div className="absolute top-1 right-1">
                        <Volume2 size={14} className="text-blue-400" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
