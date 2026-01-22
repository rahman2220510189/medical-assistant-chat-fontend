import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader, AlertCircle, Activity, Pill, ShieldAlert, User, Bot } from 'lucide-react';

const MedicalChatbot = () => {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: '👋 Hello! I\'m your Medical Assistant. Please describe your symptoms, and I\'ll help identify possible conditions.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    setMessages(prev => [...prev, {
      type: 'user',
      text: userMessage,
      timestamp: new Date()
    }]);

    setLoading(true);

    try {
      // Call your Node.js backend
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await response.json();

      if (data.success) {
        // Add bot response
        setMessages(prev => [...prev, {
          type: 'bot',
          text: data.reply,
          data: data.data,
          timestamp: new Date()
        }]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        type: 'bot',
        text: '❌ Sorry, I encountered an error. Please try again or describe your symptoms differently.',
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessage = (message) => {
    if (!message.data) {
      return <div className="whitespace-pre-line">{message.text}</div>;
    }

    const { data } = message;
    
    return (
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          Based on your symptoms: <span className="font-medium text-gray-800">"{data.input_symptoms[0]}"</span>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Activity className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold text-blue-900 mb-1">Detected Symptoms</div>
              <div className="text-sm text-blue-800">
                {data.matched_symptoms.join(', ')}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-semibold text-red-900 mb-1">
                Possible Condition: {data.disease}
              </div>
              <div className="text-xs text-red-700 mb-2">
                Confidence: {data.confidence}%
              </div>
              <div className="text-sm text-red-800">
                {data.description}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Pill className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-semibold text-green-900 mb-2">Suggested Medicines</div>
              <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
                {data.suggested_medicines.map((med, idx) => (
                  <li key={idx}>{med}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-semibold text-yellow-900 mb-2">Important Precautions</div>
              <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                {data.precautions.map((precaution, idx) => (
                  <li key={idx}>{precaution}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-sm text-purple-800">
            <span className="font-semibold">👨‍⚕️ Recommended Specialist:</span> {data.doctor_specialty}
          </div>
        </div>

        <div className="bg-gray-100 border border-gray-300 rounded-lg p-3">
          <div className="text-xs text-gray-700">
            {data.disclaimer}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'bot' && (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div
                className={`max-w-3xl rounded-2xl px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                    : message.isError
                    ? 'bg-red-50 border border-red-200 text-red-800'
                    : 'bg-white shadow-md border border-gray-200 text-gray-800'
                }`}
              >
                {formatMessage(message)}
                <div className={`text-xs mt-2 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {message.type === 'user' && (
                <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white shadow-md border border-gray-200 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-sm text-gray-600">Analyzing your symptoms...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-2 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your symptoms... (e.g., 'I have fever and headache')"
              className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="2"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Tip: Be as detailed as possible about your symptoms for better results
          </p>
        </div>
      </div>
    </div>
  );
};

export default MedicalChatbot;