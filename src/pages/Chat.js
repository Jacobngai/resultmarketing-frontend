import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  Sparkles,
  User,
  Loader2,
  Mic,
  MicOff,
  Copy,
  Check,
  RefreshCw,
  ChevronDown,
  Square,
} from 'lucide-react';
import { chatApi, voiceApi, contactsApi } from '../lib/api';

// Example prompts for users
const examplePrompts = [
  'Show me all contacts from Kuala Lumpur',
  'Who should I follow up with today?',
  'Find contacts in the Real Estate industry',
  'Summarize my contact activities this week',
  'Which contacts have I not contacted in 30 days?',
];

// Initial welcome message
const welcomeMessage = `I'm your AI assistant for ResultMarketing. I can help you:

- **Find contacts** by name, company, location, or industry
- **Track follow-ups** and suggest who to contact
- **Analyze patterns** in your sales activities
- **Get insights** about your contact database

Just ask me anything about your contacts!`;

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: welcomeMessage,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [userContacts, setUserContacts] = useState([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);

  // Fetch user contacts on mount for context
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await contactsApi.getAll({ limit: 100 });
        if (response.success && response.data) {
          setUserContacts(response.data.contacts || []);
        }
      } catch (error) {
        console.error('Failed to fetch contacts:', error);
      }
    };
    fetchContacts();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle scroll position for scroll-to-bottom button
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
    }
  };

  // Send message
  const handleSend = async (content = inputValue) => {
    if (!content.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Prepare contacts context (limit to 50 for API)
      const contactsContext = userContacts.slice(0, 50).map((c) => ({
        name: c.name,
        company: c.company,
        category: c.category,
        phone: c.phone,
        email: c.email,
      }));

      // Try backend first, fallback to AI service directly
      let response;
      try {
        response = await chatApi.sendMessage(
          content.trim(),
          conversationId,
          { contacts: contactsContext }
        );
      } catch (backendError) {
        console.log('Backend unavailable, trying AI service directly...');
        // Fallback: Call AI service directly (bypasses auth)
        response = await chatApi.query(content.trim(), contactsContext);
      }

      if (response.success || response.response) {
        // Update conversation ID if new
        if (response.data?.conversation_id) {
          setConversationId(response.data.conversation_id);
        }

        const aiMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: response.data?.message || response.data?.response || response.response || 'I received your message.',
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error(response.error?.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again. Make sure the AI service is running.',
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  // Handle keyboard submit
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Copy message to clipboard
  const handleCopy = async (id, content) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Start voice recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());

        // Process the recorded audio
        await processVoiceRecording(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to access microphone. Please check permissions.');
    }
  }, []);

  // Stop voice recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
    }
  }, [isRecording]);

  // Process voice recording with Whisper API
  const processVoiceRecording = async (audioBlob) => {
    setIsLoading(true);

    try {
      // Convert blob to file
      const audioFile = new File([audioBlob], 'voice-message.webm', {
        type: 'audio/webm',
      });

      // Call voice to chat API
      const response = await voiceApi.toChat(audioFile);

      if (response.success && response.transcription) {
        // Add user's voice message as text
        const userMessage = {
          id: Date.now(),
          role: 'user',
          content: response.transcription,
          timestamp: new Date(),
          isVoice: true,
        };

        setMessages((prev) => [...prev, userMessage]);

        // Now send the transcribed text to the chat API
        await handleSend(response.transcription);
      } else {
        throw new Error('Failed to transcribe audio');
      }
    } catch (error) {
      console.error('Voice processing error:', error);
      const errorMessage = {
        id: Date.now(),
        role: 'assistant',
        content: 'Sorry, I could not process your voice message. Please try again or type your message.',
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  // Toggle voice recording
  const handleVoiceToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Format recording time
  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  // Regenerate last response
  const handleRegenerate = () => {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMessage) {
      // Remove last AI response
      setMessages((prev) => prev.slice(0, -1));
      handleSend(lastUserMessage.content);
    }
  };

  // Format timestamp
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-MY', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Render message content with basic markdown
  const renderContent = (content) => {
    // Simple markdown parsing for bold text and lists
    return content.split('\n').map((line, i) => {
      // Bold text
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

      // List items
      if (line.startsWith('- ')) {
        return (
          <li key={i} className="ml-4" dangerouslySetInnerHTML={{ __html: line.slice(2) }} />
        );
      }

      // Numbered items
      const numberedMatch = line.match(/^(\d+)\.\s(.*)$/);
      if (numberedMatch) {
        return (
          <li key={i} className="ml-4" dangerouslySetInnerHTML={{ __html: numberedMatch[2] }} />
        );
      }

      return (
        <p key={i} className={line ? '' : 'h-3'} dangerouslySetInnerHTML={{ __html: line }} />
      );
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">AI Assistant</h1>
            <p className="text-xs text-green-600">Online</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div className={`flex gap-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === 'user'
                  ? 'bg-primary-100 text-primary-600'
                  : 'bg-gradient-primary text-white'
              }`}>
                {message.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
              </div>

              {/* Message Bubble */}
              <div>
                <div className={message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                  <div className="text-sm leading-relaxed space-y-2">
                    {renderContent(message.content)}
                  </div>
                </div>

                {/* Message footer */}
                <div className={`flex items-center gap-2 mt-1 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}>
                  <span className="text-xs text-gray-400">
                    {formatTime(message.timestamp)}
                  </span>

                  {message.role === 'assistant' && (
                    <button
                      onClick={() => handleCopy(message.id, message.content)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Copy message"
                    >
                      {copiedId === message.id ? (
                        <Check size={14} className="text-green-600" />
                      ) : (
                        <Copy size={14} className="text-gray-400" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="flex gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles size={16} className="text-white" />
              </div>
              <div className="chat-bubble-ai">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-sm text-gray-500">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-32 right-4 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <ChevronDown size={20} className="text-gray-600" />
        </button>
      )}

      {/* Example prompts */}
      {messages.length === 1 && (
        <div className="px-4 pb-4">
          <p className="text-xs text-gray-500 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.slice(0, 3).map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleSend(prompt)}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Regenerate button */}
      {messages.length > 1 && !isLoading && (
        <div className="px-4 pb-2">
          <button
            onClick={handleRegenerate}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <RefreshCw size={14} />
            Regenerate response
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3 pb-safe">
        <div className="flex items-end gap-2">
          {/* Voice button */}
          <button
            onClick={handleVoiceToggle}
            disabled={isLoading}
            className={`p-3 rounded-full transition-colors flex-shrink-0 ${
              isRecording
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isRecording ? <Square size={20} /> : <Mic size={20} />}
          </button>

          {/* Recording indicator */}
          {isRecording && (
            <div className="flex items-center gap-2 px-3 py-1 bg-red-50 rounded-full">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm text-red-600 font-medium">
                {formatRecordingTime(recordingTime)}
              </span>
            </div>
          )}

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your contacts..."
              rows={1}
              className="input pr-12 resize-none max-h-32 scrollbar-hide"
              style={{ minHeight: '44px' }}
            />
          </div>

          {/* Send button */}
          <button
            onClick={() => handleSend()}
            disabled={!inputValue.trim() || isLoading}
            className={`p-3 rounded-full transition-colors flex-shrink-0 ${
              inputValue.trim() && !isLoading
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>

        {/* Powered by text */}
        <p className="text-center text-xs text-gray-400 mt-2">
          Powered by Claude AI
        </p>
      </div>
    </div>
  );
};

export default Chat;
