import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Bot, Sparkles, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import './ChatWidget.css';

const SUGGESTION_PILLS = [
  { text: "Show active campaigns", icon: "🔥" },
  { text: "Check reserve balance", icon: "🏦" },
  { text: "How do I make a contribution?", icon: "💰" },
  { text: "How is transparency maintained?", icon: "🛡️" }
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hi there! 👋 I am the VillageFund AI Assistant. Ask me anything about active campaigns, approved expenses, support tickets, or the village financial reserves!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');

  const messagesEndRef = useRef(null);

  // Generate a random session ID for guest users on mount
  useEffect(() => {
    const localSession = localStorage.getItem('bot_session_id');
    if (localSession) {
      setSessionId(localSession);
    } else {
      const newSession = 'web_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('bot_session_id', newSession);
      setSessionId(newSession);
    }
  }, []);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    // Add user message to state
    const userMsg = { sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const response = await api.post('bot/chat/', {
        message: text,
        session_id: sessionId
      });
      
      const botMsg = { sender: 'bot', text: response.data.response };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Bot API error:', error);
      const errMsg = {
        sender: 'bot',
        text: 'Sorry, I am having trouble connecting to my brain right now. Please try again in a few moments.',
        isError: true
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Lightweight markdown and table parser
  const renderMessageContent = (text) => {
    if (!text) return '';

    const lines = text.split('\n');
    const renderedElements = [];
    let listItems = [];
    let inList = false;
    let tableRows = [];
    let tableHeaders = [];
    let inTable = false;

    const flushList = (key) => {
      if (listItems.length > 0) {
        renderedElements.push(
          <ul key={`ul-${key}`} className="bot-msg-list">
            {listItems.map((item, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
        );
        listItems = [];
        inList = false;
      }
    };

    const flushTable = (key) => {
      if (tableRows.length > 0 || tableHeaders.length > 0) {
        renderedElements.push(
          <div key={`table-wrapper-${key}`} className="bot-msg-table-wrapper">
            <table className="bot-msg-table">
              {tableHeaders.length > 0 && (
                <thead>
                  <tr>
                    {tableHeaders.map((h, i) => (
                      <th key={i}>{h}</th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {tableRows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
        tableHeaders = [];
        inTable = false;
      }
    };

    const processInline = (str) => {
      // Bold **text**
      str = str.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Italics *text*
      str = str.replace(/\*(.*?)\*/g, '<em>$1</em>');
      // Inline code `code`
      str = str.replace(/`(.*?)`/g, '<code>$1</code>');
      return str;
    };

    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx].trim();

      // Table Row Parser (e.g. | Col 1 | Col 2 |)
      if (line.startsWith('|')) {
        flushList(idx);
        inTable = true;
        const cells = line.split('|').map(c => c.trim()).filter((c, i, arr) => i > 0 && i < arr.length - 1);
        
        // Skip table dividers (e.g. |---|---|)
        if (cells.every(c => /^[-:]+$/.test(c))) {
          continue;
        }
        
        if (tableHeaders.length === 0 && tableRows.length === 0) {
          tableHeaders = cells;
        } else {
          tableRows.push(cells);
        }
        continue;
      } else {
        flushTable(idx);
      }

      // Unordered List Parser
      if (line.startsWith('- ') || line.startsWith('* ')) {
        inList = true;
        listItems.push(processInline(line.substring(2)));
        continue;
      } else {
        flushList(idx);
      }

      // Plain Text & Headers
      if (line) {
        if (line.startsWith('### ')) {
          renderedElements.push(<h4 key={idx}>{processInline(line.substring(4))}</h4>);
        } else if (line.startsWith('## ')) {
          renderedElements.push(<h3 key={idx}>{processInline(line.substring(3))}</h3>);
        } else if (line.startsWith('# ')) {
          renderedElements.push(<h2 key={idx}>{processInline(line.substring(2))}</h2>);
        } else {
          renderedElements.push(
            <p key={idx} dangerouslySetInnerHTML={{ __html: processInline(line) }} />
          );
        }
      }
    }

    flushList(lines.length);
    flushTable(lines.length);

    return renderedElements;
  };

  return (
    <div className="bot-chat-container">
      {/* 1. Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`bot-chat-bubble ${isOpen ? 'active' : ''}`}
        aria-label="Open AI Assistant"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        {!isOpen && <span className="bot-notification-pulse" />}
      </button>

      {/* 2. Glassmorphic Chat Dialog Panel */}
      {isOpen && (
        <div className="bot-chat-window">
          {/* Header */}
          <div className="bot-chat-header">
            <div className="bot-chat-avatar-container">
              <Bot size={20} className="bot-icon" />
              <span className="bot-online-indicator" />
            </div>
            <div>
              <h3>VillageFund Assistant</h3>
              <p>AI Helper • Online</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="bot-close-btn">
              <X size={18} />
            </button>
          </div>

          {/* Conversation Area */}
          <div className="bot-chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`bot-chat-bubble-row ${msg.sender}`}>
                <div className="bot-chat-msg-body">
                  {msg.isError && <AlertCircle size={14} className="error-icon" />}
                  <div className="bot-chat-msg-text">
                    {msg.sender === 'bot' ? renderMessageContent(msg.text) : msg.text}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading Indicator */}
            {loading && (
              <div className="bot-chat-bubble-row bot">
                <div className="bot-chat-msg-body loading">
                  <div className="bot-typing-indicator">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Pills */}
          {messages.length === 1 && !loading && (
            <div className="bot-chat-suggestions">
              {SUGGESTION_PILLS.map((pill, idx) => (
                <button 
                  key={idx} 
                  onClick={() => handleSendMessage(pill.text)}
                  className="bot-suggestion-pill"
                >
                  <span className="pill-icon">{pill.icon}</span> {pill.text}
                </button>
              ))}
            </div>
          )}

          {/* Text Input Footer */}
          <div className="bot-chat-footer">
            <input
              type="text"
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button 
              onClick={() => handleSendMessage()} 
              disabled={!input.trim() || loading}
              className="bot-send-btn"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
