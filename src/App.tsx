import React, { useState, useCallback, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import SlidePreview from './components/SlidePreview';
import Timeline from './components/Timeline';
import TextSlideEditor from './components/TextSlideEditor';
import BackgroundOptions from './components/BackgroundOptions';
import AIVoiceover from './components/AIVoiceover';
import { Slide, AudioTrack, TextElement } from './types';
import { useApiKey } from './context/ApiKeyContext';

// Sample initial slides
const initialSlides: Slide[] = [
  {
    id: uuidv4(),
    content: 'THIS VIDEO PRESENTATION CONTAINS ADULT THEMES AND IS NOT SUITABLE FOR MINORS UNDER THE AGE OF 18',
    duration: 5,
    background: {
      type: 'color',
      value: '#ff0000'
    },
    textColor: '#ffffff',
    textPosition: 'center',
    textPadding: 8,
    textElements: [
      {
        id: uuidv4(),
        content: 'THIS VIDEO PRESENTATION CONTAINS ADULT THEMES AND IS NOT SUITABLE FOR MINORS UNDER THE AGE OF 18',
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#ffffff',
        position: { x: 50, y: 50 },
        width: 80,
        textAlign: 'center',
        zIndex: 1
      }
    ]
  },
  {
    id: uuidv4(),
    content: 'And I felt so much joy. My body and my heart were finally happy.',
    duration: 4,
    background: {
      type: 'color',
      value: '#ffffff'
    },
    textColor: '#000000',
    textPosition: 'center',
    textPadding: 8,
    textElements: [
      {
        id: uuidv4(),
        content: 'And I felt so much joy. My body and my heart were finally happy.',
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        fontWeight: 'normal',
        color: '#000000',
        position: { x: 50, y: 50 },
        width: 80,
        textAlign: 'center',
        zIndex: 1
      }
    ]
  },
  {
    id: uuidv4(),
    content: 'Science: eating across a desk is like the best thing.',
    duration: 4,
    background: {
      type: 'color',
      value: '#ffffff'
    },
    textColor: '#000000',
    textPosition: 'center',
    textPadding: 8,
    textElements: [
      {
        id: uuidv4(),
        content: 'Science: eating across a desk is like the best thing.',
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        fontWeight: 'normal',
        color: '#000000',
        position: { x: 50, y: 50 },
        width: 80,
        textAlign: 'center',
        zIndex: 1
      }
    ]
  },
  {
    id: uuidv4(),
    content: 'I wondered where he went.',
    duration: 3,
    background: {
      type: 'color',
      value: '#ffffff'
    },
    textColor: '#000000',
    textPosition: 'center',
    textPadding: 8,
    textElements: [
      {
        id: uuidv4(),
        content: 'I wondered where he went.',
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        fontWeight: 'normal',
        color: '#000000',
        position: { x: 50, y: 50 },
        width: 80,
        textAlign: 'center',
        zIndex: 1
      }
    ]
  },
  {
    id: uuidv4(),
    content: 'And I felt so much joy. My body and my heart were finally happy.',
    duration: 4,
    background: {
      type: 'color',
      value: '#ffffff'
    },
    textColor: '#000000',
    textPosition: 'center',
    textPadding: 8,
    textElements: [
      {
        id: uuidv4(),
        content: 'And I felt so much joy. My body and my heart were finally happy.',
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        fontWeight: 'normal',
        color: '#000000',
        position: { x: 50, y: 50 },
        width: 80,
        textAlign: 'center',
        zIndex: 1
      }
    ]
  }
];

// Sample initial audio tracks
const initialAudioTracks: AudioTrack[] = [];

function App() {
  const { elevenLabsApiKey } = useApiKey();
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>(initialAudioTracks);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePanel, setActivePanel] = useState<'textEditor' | 'backgroundOptions' | 'aiVoiceover'>('textEditor');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const playbackTimerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const elapsedTimeRef = useRef<number>(0);
  const audioElementsRef = useRef<{[key: string]: HTMLAudioElement}>({});
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  // Handle playback
  useEffect(() => {
    if (isPlaying) {
      startTimeRef.current = Date.now() - elapsedTimeRef.current * 1000;
      
      // Find the audio track that should be playing at the current time
      const currentAudio = findAudioForCurrentTime();
      if (currentAudio && currentAudio !== currentAudioRef.current) {
        // Stop any currently playing audio
        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
        }
        
        // Start the new audio
        currentAudio.play();
        currentAudioRef.current = currentAudio;
      }
      
      playbackTimerRef.current = window.setInterval(() => {
        try {
          const elapsed = (Date.now() - startTimeRef.current) / 1000;
          elapsedTimeRef.current = elapsed;
          
          // Calculate which slide should be active
          let timeSum = 0;
          let activeSlideIndex = 0;
          let foundActiveSlide = false;
          
          for (let i = 0; i < slides.length; i++) {
            timeSum += slides[i].duration;
            if (elapsed < timeSum) {
              activeSlideIndex = i;
              foundActiveSlide = true;
              break;
            }
          }
          
          // If we've gone through all slides, stop playback
          if (!foundActiveSlide) {
            setIsPlaying(false);
            elapsedTimeRef.current = 0;
            setCurrentSlideIndex(0);
            
            // Stop all audio
            Object.values(audioElementsRef.current).forEach(audio => {
              audio.pause();
              audio.currentTime = 0;
            });
            currentAudioRef.current = null;
            
            if (playbackTimerRef.current) {
              clearInterval(playbackTimerRef.current);
              playbackTimerRef.current = null;
            }
            return;
          }
          
          // Update current slide if needed
          if (activeSlideIndex !== currentSlideIndex) {
            // Check if we need to change audio
            const newAudio = findAudioForTime(elapsed);
            if (newAudio && newAudio !== currentAudioRef.current) {
              // Stop current audio if playing
              if (currentAudioRef.current) {
                currentAudioRef.current.pause();
              }
              
              // Start the new audio
              newAudio.play();
              currentAudioRef.current = newAudio;
            }
            
            setCurrentSlideIndex(activeSlideIndex);
          }
        } catch (error) {
          console.error('Error in playback timer:', error);
          setIsPlaying(false);
          
          // Stop all audio
          Object.values(audioElementsRef.current).forEach(audio => {
            audio.pause();
          });
          currentAudioRef.current = null;
          
          if (playbackTimerRef.current) {
            clearInterval(playbackTimerRef.current);
            playbackTimerRef.current = null;
          }
        }
      }, 100);
    } else {
      // Pause all audio when playback is stopped
      Object.values(audioElementsRef.current).forEach(audio => {
        audio.pause();
      });
      currentAudioRef.current = null;
      
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
    }
    
    return () => {
      // Clean up on unmount
      Object.values(audioElementsRef.current).forEach(audio => {
        audio.pause();
      });
      currentAudioRef.current = null;
      
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
    };
  }, [isPlaying, currentSlideIndex, slides]);

  // Find the audio that should be playing at the current time
  const findAudioForCurrentTime = () => {
    const elapsed = elapsedTimeRef.current;
    return findAudioForTime(elapsed);
  };

  // Find the audio that should be playing at a specific time
  const findAudioForTime = (time: number) => {
    // Find the audio track that corresponds to the current time
    for (const track of audioTracks) {
      const trackEndTime = track.startTime + track.duration;
      if (time >= track.startTime && time < trackEndTime) {
        const audio = audioElementsRef.current[track.id];
        if (audio) {
          // Set the current time within the audio
          const audioTime = time - track.startTime;
          audio.currentTime = audioTime;
          return audio;
        }
      }
    }
    return null;
  };

  // Load audio elements for slides with voiceovers
  useEffect(() => {
    // Create audio elements for slides with voiceovers
    slides.forEach(slide => {
      if (slide.voiceover && !audioElementsRef.current[slide.id]) {
        const audio = new Audio(slide.voiceover);
        audioElementsRef.current[slide.id] = audio;
        
        // Add ended event listener
        audio.addEventListener('ended', () => {
          // If this is the last slide, stop playback
          if (currentSlideIndex === slides.length - 1) {
            setIsPlaying(false);
          }
        });
      }
    });
    
    // Create audio elements for audio tracks
    audioTracks.forEach(track => {
      if (!audioElementsRef.current[track.id]) {
        const audio = new Audio(track.src);
        audioElementsRef.current[track.id] = audio;
        
        // Add ended event listener
        audio.addEventListener('ended', () => {
          // Find the next audio track to play
          const nextTrack = audioTracks.find(t => t.startTime > track.startTime);
          if (nextTrack) {
            const nextAudio = audioElementsRef.current[nextTrack.id];
            if (nextAudio) {
              nextAudio.play();
              currentAudioRef.current = nextAudio;
            }
          }
        });
      }
    });
    
    // Clean up audio elements for slides that no longer have voiceovers
    Object.keys(audioElementsRef.current).forEach(id => {
      const slide = slides.find(s => s.id === id);
      const track = audioTracks.find(t => t.id === id);
      if ((!slide || !slide.voiceover) && !track) {
        audioElementsRef.current[id].pause();
        delete audioElementsRef.current[id];
      }
    });
  }, [slides, audioTracks, currentSlideIndex]);

  // Update audio track start times when slide durations change
  useEffect(() => {
    // Recalculate audio track start times based on slide durations
    setAudioTracks(prev => {
      const newTracks = [...prev];
      
      // First, associate each track with its slide
      const trackSlideMap = new Map<string, string>();
      slides.forEach(slide => {
        if (slide.voiceover) {
          const track = newTracks.find(t => t.src === slide.voiceover);
          if (track) {
            trackSlideMap.set(track.id, slide.id);
          }
        }
      });
      
      // Now recalculate start times based on slide order and durations
      let currentTime = 0;
      
      slides.forEach(slide => {
        const trackIds = Array.from(trackSlideMap.entries())
          .filter(([_, slideId]) => slideId === slide.id)
          .map(([trackId]) => trackId);
        
        trackIds.forEach(trackId => {
          const trackIndex = newTracks.findIndex(t => t.id === trackId);
          if (trackIndex !== -1) {
            newTracks[trackIndex] = {
              ...newTracks[trackIndex],
              startTime: currentTime
            };
          }
        });
        
        currentTime += slide.duration;
      });
      
      return newTracks;
    });
  }, [slides]);

  const handleAddTextSlide = useCallback(() => {
    const newSlide: Slide = {
      id: uuidv4(),
      content: 'New Slide',
      duration: 5,
      background: {
        type: 'color',
        value: '#ffffff'
      },
      textColor: '#000000',
      textPosition: 'center',
      textPadding: 8,
      textElements: [
        {
          id: uuidv4(),
          content: 'New Slide',
          fontFamily: 'Arial, sans-serif',
          fontSize: '24px',
          fontWeight: 'normal',
          color: '#000000',
          position: { x: 50, y: 50 },
          width: 80,
          textAlign: 'center',
          zIndex: 1
        }
      ]
    };
    
    setSlides(prev => [...prev, newSlide]);
    setCurrentSlideIndex(prev => prev + 1);
    setActivePanel('textEditor');
  }, []);

  const handleUpdateSlide = useCallback((updatedSlide: Slide) => {
    setSlides(prev => prev.map(slide => 
      slide.id === updatedSlide.id ? updatedSlide : slide
    ));
  }, []);

  const handleUpdateTextElement = useCallback((slideId: string, elementId: string, updates: Partial<TextElement>) => {
    setSlides(prev => 
      prev.map(slide => {
        if (slide.id !== slideId) return slide;
        
        const updatedElements = slide.textElements?.map(el => 
          el.id === elementId ? { ...el, ...updates } : el
        );
        
        return {
          ...slide,
          textElements: updatedElements
        };
      })
    );
  }, []);

  const handleSlideDurationChange = useCallback((id: string, duration: number) => {
    setSlides(prev => prev.map(slide => 
      slide.id === id ? { ...slide, duration } : slide
    ));
    
    // This will trigger the useEffect that updates audio track start times
  }, []);

  const handleGenerateVoiceover = useCallback((audioUrl: string, audioDuration: number) => {
    setSlides(prev => {
      if (currentSlideIndex < 0 || currentSlideIndex >= prev.length) {
        return prev;
      }
      
      const newSlides = [...prev];
      newSlides[currentSlideIndex] = {
        ...newSlides[currentSlideIndex],
        voiceover: audioUrl
      };
      
      // Adjust slide duration to match audio if needed
      if (audioDuration > newSlides[currentSlideIndex].duration) {
        newSlides[currentSlideIndex].duration = Math.ceil(audioDuration);
      }
      
      return newSlides;
    });
    
    // Calculate start time based on previous slides
    const startTime = slides
      .slice(0, currentSlideIndex)
      .reduce((sum, slide) => sum + slide.duration, 0);
    
    // Add to audio tracks
    const newAudioTrack: AudioTrack = {
      id: uuidv4(),
      src: audioUrl,
      startTime,
      duration: audioDuration
    };
    
    setAudioTracks(prev => [...prev, newAudioTrack]);
  }, [currentSlideIndex, slides]);

  const handleTogglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const handleReorderSlides = useCallback((startIndex: number, endIndex: number) => {
    setSlides(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
    
    // Update current slide index if needed
    if (currentSlideIndex === startIndex) {
      setCurrentSlideIndex(endIndex);
    } else if (
      (currentSlideIndex > startIndex && currentSlideIndex <= endIndex) ||
      (currentSlideIndex < startIndex && currentSlideIndex >= endIndex)
    ) {
      // Adjust current slide index if it's in the affected range
      const direction = startIndex < endIndex ? -1 : 1;
      setCurrentSlideIndex(prev => prev + direction);
    }
    
    // Audio track start times will be updated by the useEffect
  }, [currentSlideIndex]);

  const renderActivePanel = () => {
    if (currentSlideIndex < 0 || currentSlideIndex >= slides.length) {
      return null;
    }
    
    const currentSlide = slides[currentSlideIndex];
    
    switch (activePanel) {
      case 'textEditor':
        return <TextSlideEditor slide={currentSlide} onUpdate={handleUpdateSlide} />;
      
      case 'backgroundOptions':
        return <BackgroundOptions slide={currentSlide} onUpdate={handleUpdateSlide} />;
      
      case 'aiVoiceover':
        return (
          <AIVoiceover 
            caption={currentSlide.content} 
            onGenerateVoiceover={handleGenerateVoiceover} 
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          onAddSlide={handleAddTextSlide} 
          collapsed={sidebarCollapsed} 
          toggleSidebar={toggleSidebar} 
        />
        
        <div className="flex flex-col flex-1">
          <div className="flex flex-1 overflow-hidden">
            {/* Main content area */}
            <div className="flex-1 flex">
              <SlidePreview 
                slides={slides}
                currentSlideIndex={currentSlideIndex}
                onSlideChange={setCurrentSlideIndex}
                onPlay={handleTogglePlay}
                isPlaying={isPlaying}
              />
            </div>
            
            {/* Right sidebar */}
            <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto">
              <div className="p-4">
                <div className="flex space-x-2 mb-4">
                  <button 
                    className={`px-3 py-1 rounded ${activePanel === 'textEditor' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                    onClick={() => setActivePanel('textEditor')}
                  >
                    Text
                  </button>
                  <button 
                    className={`px-3 py-1 rounded ${activePanel === 'backgroundOptions' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                    onClick={() => setActivePanel('backgroundOptions')}
                  >
                    Background
                  </button>
                  <button 
                    className={`px-3 py-1 rounded ${activePanel === 'aiVoiceover' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                    onClick={() => setActivePanel('aiVoiceover')}
                  >
                    Voice
                  </button>
                </div>
                
                {renderActivePanel()}
              </div>
            </div>
          </div>
          
          <Timeline 
            slides={slides}
            audioTracks={audioTracks}
            currentSlideIndex={currentSlideIndex}
            isPlaying={isPlaying}
            onSlideSelect={setCurrentSlideIndex}
            onSlideDurationChange={handleSlideDurationChange}
            onTogglePlay={handleTogglePlay}
            onReorderSlides={handleReorderSlides}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
