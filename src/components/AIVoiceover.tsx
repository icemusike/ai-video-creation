import React, { useState, useEffect, useRef } from 'react';
import { Mic, Volume2, Pause, Play, Settings, Clock, Sliders } from 'lucide-react';
import { useApiKey } from '../context/ApiKeyContext';

interface AIVoiceoverProps {
  caption: string;
  onGenerateVoiceover: (audioUrl: string, audioDuration: number) => void;
}

interface Voice {
  voice_id: string;
  name: string;
  category: string;
}

const AIVoiceover: React.FC<AIVoiceoverProps> = ({ caption, onGenerateVoiceover }) => {
  const { elevenLabsApiKey, setElevenLabsApiKey } = useApiKey();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceId, setVoiceId] = useState('21m00Tcm4TlvDq8ikWAM');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Voice settings
  const [stability, setStability] = useState(0.5);
  const [similarityBoost, setSimilarityBoost] = useState(0.75);
  const [style, setStyle] = useState(0.0);
  const [speakingRate, setSpeakingRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [pauseMs, setPauseMs] = useState(0);
  
  const animationRef = useRef<number | null>(null);

  // Load voices if API key is available
  useEffect(() => {
    if (elevenLabsApiKey) {
      fetchVoices();
    }
  }, [elevenLabsApiKey]);

  // Handle audio element
  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      
      // Wait for metadata to load to get duration
      audio.addEventListener('loadedmetadata', () => {
        setAudioDuration(audio.duration);
      });
      
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
      });
      
      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime);
      });
      
      setAudioElement(audio);
      
      return () => {
        audio.pause();
        audio.removeEventListener('ended', () => {
          setIsPlaying(false);
        });
        audio.removeEventListener('loadedmetadata', () => {});
        audio.removeEventListener('timeupdate', () => {});
        
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
      };
    }
  }, [audioUrl]);

  const fetchVoices = async () => {
    try {
      setErrorMessage(null);
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        method: 'GET',
        headers: {
          'xi-api-key': elevenLabsApiKey,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setVoices(data.voices || []);
    } catch (error) {
      console.error('Error fetching voices:', error);
      setErrorMessage('Failed to fetch voices. Please check your API key.');
    }
  };

  const handleGenerateVoiceover = async () => {
    if (!elevenLabsApiKey) {
      setShowApiKeyInput(true);
      return;
    }
    
    setIsGenerating(true);
    setErrorMessage(null);
    
    try {
      // Prepare the request body
      const requestBody = {
        text: caption,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability,
          similarity_boost: similarityBoost,
          style,
          use_speaker_boost: true
        }
      };
      
      // Make the API call to ElevenLabs
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': elevenLabsApiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate voiceover: ${response.status} ${response.statusText}`);
      }
      
      // Get the audio blob
      const audioBlob = await response.blob();
      
      // Create a URL for the blob
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      
      // Create a temporary audio element to get the duration
      const tempAudio = new Audio(url);
      tempAudio.addEventListener('loadedmetadata', () => {
        const duration = tempAudio.duration;
        setAudioDuration(duration);
        onGenerateVoiceover(url, duration);
        setIsGenerating(false);
      });
      
      // Handle error if audio can't be loaded
      tempAudio.addEventListener('error', () => {
        console.error('Error loading audio to determine duration');
        // Use an estimated duration based on text length as fallback
        const estimatedDuration = Math.max(3, caption.length * 0.05);
        setAudioDuration(estimatedDuration);
        onGenerateVoiceover(url, estimatedDuration);
        setIsGenerating(false);
      });
      
    } catch (error) {
      console.error('Error generating voiceover:', error);
      setErrorMessage('Failed to generate voiceover. Please try again.');
      setIsGenerating(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioElement) return;
    
    if (isPlaying) {
      audioElement.pause();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      setIsPlaying(false);
    } else {
      audioElement.play();
      setIsPlaying(true);
      
      // Start animation for progress bar
      const animate = () => {
        setCurrentTime(audioElement.currentTime);
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveApiKey = () => {
    setElevenLabsApiKey(elevenLabsApiKey);
    setShowApiKeyInput(false);
    fetchVoices();
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
      <div className="flex items-center mb-3">
        <Mic className="text-red-600 mr-2" size={20} />
        <h3 className="text-lg font-semibold text-gray-200">AI Voiceover Generator</h3>
      </div>
      
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-900 bg-opacity-50 text-red-200 rounded-md border border-red-800">
          {errorMessage}
        </div>
      )}
      
      {showApiKeyInput || !elevenLabsApiKey ? (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            ElevenLabs API Key
          </label>
          <input
            type="password"
            className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-200"
            value={elevenLabsApiKey}
            onChange={(e) => setElevenLabsApiKey(e.target.value)}
            placeholder="Enter your ElevenLabs API key"
          />
          <p className="text-xs text-gray-500 mt-1">
            Your API key is stored locally and never sent to our servers.
          </p>
          <button
            className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            onClick={handleSaveApiKey}
          >
            Save API Key
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Voice Selection
            </label>
            <select
              className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-200"
              value={voiceId}
              onChange={(e) => setVoiceId(e.target.value)}
            >
              {voices.length > 0 ? (
                <>
                  <optgroup label="Premade Voices">
                    {voices
                      .filter(voice => !voice.category || voice.category === 'premade')
                      .map(voice => (
                        <option key={voice.voice_id} value={voice.voice_id}>
                          {voice.name}
                        </option>
                      ))
                    }
                  </optgroup>
                  {voices.some(voice => voice.category === 'cloned') && (
                    <optgroup label="Your Custom Voices">
                      {voices
                        .filter(voice => voice.category === 'cloned')
                        .map(voice => (
                          <option key={voice.voice_id} value={voice.voice_id}>
                            {voice.name}
                          </option>
                        ))
                      }
                    </optgroup>
                  )}
                </>
              ) : (
                <option value="21m00Tcm4TlvDq8ikWAM">Rachel (Default)</option>
              )}
            </select>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-300">
                Text to Convert
              </label>
              <button
                className="text-sm text-indigo-400 flex items-center"
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              >
                <Settings size={14} className="mr-1" />
                {showAdvancedSettings ? 'Hide' : 'Show'} Advanced Settings
              </button>
            </div>
            <textarea
              className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-200"
              rows={3}
              value={caption}
              readOnly
            />
          </div>
          
          {showAdvancedSettings && (
            <div className="mb-4 p-3 bg-gray-900 rounded-md border border-gray-700">
              <h4 className="font-medium text-sm mb-2 text-gray-300">Voice Settings</h4>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Stability ({stability.toFixed(2)})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={stability}
                    onChange={(e) => setStability(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Similarity Boost ({similarityBoost.toFixed(2)})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={similarityBoost}
                    onChange={(e) => setSimilarityBoost(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Style ({style.toFixed(2)})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={style}
                    onChange={(e) => setStyle(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Speaking Rate ({speakingRate.toFixed(2)}x)
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.01"
                    value={speakingRate}
                    onChange={(e) => setSpeakingRate(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Pitch ({pitch.toFixed(2)})
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.01"
                    value={pitch}
                    onChange={(e) => setPitch(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Pause Duration ({pauseMs}ms)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="100"
                    value={pauseMs}
                    onChange={(e) => setPauseMs(parseInt(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}
          
          {audioUrl && (
            <div className="mb-4 p-3 bg-gray-900 rounded-md border border-gray-700">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <button
                    className="p-2 bg-gray-700 rounded-full mr-2 hover:bg-gray-600"
                    onClick={togglePlayPause}
                  >
                    {isPlaying ? <Pause size={16} className="text-gray-200" /> : <Play size={16} className="text-gray-200" />}
                  </button>
                  <span className="text-sm text-gray-300">Preview Voiceover</span>
                </div>
                <div className="flex items-center">
                  <Clock size={14} className="text-gray-500 mr-1" />
                  <span className="text-xs text-gray-500">
                    {formatTime(currentTime)} / {formatTime(audioDuration)}
                  </span>
                </div>
              </div>
              <div className="mt-2 h-8 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  style={{ width: `${(currentTime / audioDuration) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
          
          <div className="flex justify-between">
            <button
              className="bg-gray-700 text-gray-300 px-4 py-2 rounded-md hover:bg-gray-600 flex items-center"
              onClick={() => setShowApiKeyInput(true)}
            >
              Change API Key
            </button>
            
            <button
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center"
              onClick={handleGenerateVoiceover}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Volume2 size={18} className="mr-2" />
                  Generate Voiceover
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AIVoiceover;
