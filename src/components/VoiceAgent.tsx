
import React, { useState, useEffect } from 'react';
import { useConversation } from '@11labs/react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

const VoiceAgent = () => {
  const [language, setLanguage] = useState<'en' | 'ta'>('en');
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([]);
  
  // Initialize API key - using a public constant since this is a front-end only application
  // Note: In production, this should be managed with a secure backend service
  const API_KEY = "sk_3f1044e1633bef80fb3a7d671521df9588e377e042e91df7";

  useEffect(() => {
    // Set the API key in localStorage for the @11labs/react package to use
    localStorage.setItem('xi-api-key', API_KEY);
    
    // Log to help debugging
    console.log('API key set in localStorage');
    
    // Clean up function
    return () => {
      localStorage.removeItem('xi-api-key');
    };
  }, []);

  const conversation = useConversation({
    overrides: {
      agent: {
        prompt: {
          prompt: "You are a helpful assistant who can communicate fluently in both English and Tamil. Always respond in the same language as the user's query. Be concise but friendly.",
        },
        language: language,
      },
      tts: {
        voiceId: "pFZP5JQG7iQjIQuC4Bku", // Using Lily's voice which works well for both languages
      },
    },
    onMessage: (message) => {
      console.log('Message received:', message);
      if (message.type === 'transcription' || message.type === 'response') {
        setMessages(prev => [...prev, { text: message.text, isUser: message.type === 'transcription' }]);
      }
    },
    onError: (error) => {
      console.error('Conversation error:', error);
    },
    onConnect: () => {
      console.log('Connected to ElevenLabs');
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs');
      setIsListening(false);
    },
  });

  const toggleRecording = async () => {
    if (!isListening) {
      try {
        console.log('Requesting microphone access');
        await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('Starting session with agent ID: YsPaIlxCwOfFJVodfkpI');
        await conversation.startSession({
          agentId: "YsPaIlxCwOfFJVodfkpI", // Using the provided agent ID
        });
        setIsListening(true);
        console.log('Recording started');
      } catch (error) {
        console.error('Error starting recording:', error);
      }
    } else {
      console.log('Ending session');
      await conversation.endSession();
      setIsListening(false);
      console.log('Recording ended');
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    conversation.setVolume({ volume: isMuted ? 1 : 0 });
    console.log(`Volume set to ${isMuted ? '1' : '0'}`);
  };

  const toggleLanguage = () => {
    setLanguage(prev => {
      const newLanguage = prev === 'en' ? 'ta' : 'en';
      console.log(`Language switched to ${newLanguage}`);
      return newLanguage;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-4">
            <h1 className="text-2xl font-semibold text-gray-900">Voice Assistant</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleLanguage}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                {language === 'en' ? 'Switch to Tamil' : 'Switch to English'}
              </button>
              <button
                onClick={toggleMute}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto space-y-4 px-2">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 pt-32">
                <p>Press the microphone button to start speaking</p>
                <p className="text-sm mt-2">{language === 'en' ? 'Currently using English' : 'தமிழில் பேசவும்'}</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-4 rounded-lg max-w-[80%]",
                    message.isUser
                      ? "bg-blue-50 ml-auto"
                      : "bg-gray-50"
                  )}
                >
                  <p className="text-gray-800">{message.text}</p>
                </div>
              ))
            )}
          </div>

          {/* Controls */}
          <div className="flex justify-center pt-4 border-t">
            <button
              onClick={toggleRecording}
              className={cn(
                "p-4 rounded-full transition-all duration-300 transform hover:scale-105",
                isListening
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-blue-500 hover:bg-blue-600"
              )}
            >
              {isListening ? (
                <MicOff className="w-6 h-6 text-white animate-pulse" />
              ) : (
                <Mic className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAgent;
