import { useEffect, useState, useRef } from "react";
import axios from "axios";

function Chat({ me, conversation, darkMode }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const emojis = [
    "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃",
    "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙",
    "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤔", "🤐",
    "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥", "😌", "😔",
    "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "🥵",
    "🥶", "😎", "🤓", "🧐", "😕", "😟", "🙁", "☹️", "😮", "😯",
    "😲", "😳", "🥺", "😦", "😧", "😨", "😰", "😥", "😢", "😭",
    "😱", "😖", "😣", "😞", "😓", "😩", "😫", "🥱", "😤", "😡",
    "😠", "🤬", "👍", "👎", "👏", "🙌", "👌", "✌️", "🤞", "🤟",
    "🤘", "🤙", "💪", "🙏", "❤️", "🧡", "💛", "💚", "💙", "💜",
    "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖",
    "💘", "💝", "🔥", "✨", "💫", "⭐", "🌟", "✅", "❌", "⚠️",
    "🎉", "🎊", "🎈", "🎁", "🏆", "🥇", "🥈", "🥉", "⚽", "🏀"
  ];

  // Réponses automatiques
  const autoResponses = [
    "Merci pour ton message ! 😊",
    "Je te réponds bientôt !",
    "Super ! J'ai bien reçu ton message 👍",
    "Message reçu ! 📨",
    "Merci ! Je reviens vers toi rapidement ⚡",
    "Bien noté ! 📝",
    "D'accord, compris ! ✅",
    "Parfait ! Je m'en occupe 🎯",
    "Reçu 5/5 ! 📡",
    "OK ! Je te tiens au courant 💬"
  ];

  const loadMessages = () => {
    axios
      .get(`http://localhost:5000/messages/${conversation.id}`)
      .then(res => {
        setMessages(res.data);
        scrollToBottom();
      });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    loadMessages();
  }, [conversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fonction pour envoyer une réponse automatique
  const sendAutoResponse = () => {
    // Récupérer l'autre utilisateur dans la conversation
    const otherUserId = conversation.user1 === me.id ? conversation.user2 : conversation.user1;
    
    // Choisir une réponse aléatoire
    const randomResponse = autoResponses[Math.floor(Math.random() * autoResponses.length)];

    // Afficher l'indicateur "en train d'écrire"
    setIsTyping(true);

    // Simuler un délai de frappe (1-3 secondes)
    const typingDelay = Math.random() * 2000 + 1000;

    setTimeout(() => {
      setIsTyping(false);

      // Envoyer le message automatique
      axios
        .post("http://localhost:5000/messages", {
          conversation_id: conversation.id,
          sender_id: otherUserId,
          content: randomResponse
        }, {
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          }
        })
        .then(() => {
          loadMessages();
        })
        .catch(error => {
          console.error("Erreur réponse auto:", error);
        });
    }, typingDelay);
  };

  const send = () => {
    if (!text.trim()) return;

    axios
      .post("http://localhost:5000/messages", {
        conversation_id: conversation.id,
        sender_id: me.id,
        content: text
      }, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      })
      .then(() => {
        setText("");
        loadMessages();
        inputRef.current?.focus();
        
        // Déclencher la réponse automatique
        sendAutoResponse();
      })
      .catch(error => {
        console.error("Erreur d'envoi:", error);
      });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const addEmoji = (emoji) => {
    setText(prevText => prevText + emoji);
    inputRef.current?.focus();
  };

  return (
    <div className="chat">
      <div className="chat-header">
        <div className="header-content">
          <div className="user-info-header">
            <div className="avatar-header">
              <div className="avatar-circle">
                <span>👤</span>
              </div>
              <div className="status-indicator"></div>
            </div>
            <div className="header-details">
              <h3>Conversation</h3>
              <span className="status-text">
                <span className="status-dot"></span>
                {isTyping ? "En train d'écrire..." : "En ligne"}
              </span>
            </div>
          </div>
          <div className="header-actions">
            <button className="header-btn" title="Rechercher">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>
            <button className="header-btn" title="Plus d'options">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="12" cy="5" r="1"></circle>
                <circle cx="12" cy="19" r="1"></circle>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="messages">
        {messages.map((m, index) => (
          <div
            key={m.id}
            className={`message-wrapper ${m.sender_id === me.id ? "sent" : "received"}`}
          >
            {m.sender_id !== me.id && (
              <div className="message-avatar">
                <div className="avatar-small">👤</div>
              </div>
            )}
            <div className="message-group">
              <div className="message">
                <div className="message-content">{m.content}</div>
              </div>
              <div className="message-meta">
                <span className="message-time">
                  {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                {m.sender_id === me.id && (
                  <span className="message-status">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5"></path>
                    </svg>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* INDICATEUR "EN TRAIN D'ÉCRIRE" */}
        {isTyping && (
          <div className="message-wrapper received">
            <div className="message-avatar">
              <div className="avatar-small">👤</div>
            </div>
            <div className="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <div className="chat-input">
          <div className="input-actions-left">
            <div className="emoji-container">
              <button 
                className="action-btn emoji-btn"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                type="button"
                title="Emojis"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                  <line x1="9" y1="9" x2="9.01" y2="9"></line>
                  <line x1="15" y1="9" x2="15.01" y2="9"></line>
                </svg>
              </button>
              
              {showEmojiPicker && (
                <div className="emoji-picker">
                  <div className="emoji-picker-header">
                    <span>Emojis</span>
                    <button 
                      className="close-emoji"
                      onClick={() => setShowEmojiPicker(false)}
                      type="button"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="emoji-grid">
                    {emojis.map((emoji, index) => (
                      <button
                        key={index}
                        className="emoji-item"
                        onClick={() => addEmoji(emoji)}
                        type="button"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button className="action-btn" type="button" title="Pièce jointe">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
              </svg>
            </button>
          </div>

          <div className="input-wrapper">
            <input
              ref={inputRef}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Écrire un message..."
              className="message-input"
            />
          </div>

          <button 
            onClick={send} 
            type="button" 
            className={`send-btn ${text.trim() ? 'active' : ''}`}
            disabled={!text.trim()}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;