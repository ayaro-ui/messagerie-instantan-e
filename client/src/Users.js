import { useEffect, useState } from "react";
import axios from "axios";

function Users({ me, setConversation, darkMode, setDarkMode, onLogout }) {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);

  const loadUsers = () => {
    axios
      .get("http://localhost:5000/users")
      .then(res => setUsers(res.data))
      .catch(err => console.error("Erreur chargement users:", err));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const addUser = () => {
    if (!newUser.trim()) return;

    axios
      .post("http://localhost:5000/users", { username: newUser })
      .then(() => {
        setNewUser("");
        loadUsers();
        setShowAddUser(false);
      })
      .catch(err => console.error("Erreur ajout user:", err));
  };

  const deleteUser = (userId, username) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${username}" ?\n\nCette action supprimera également toutes les conversations et messages associés.`)) {
      axios
        .delete(`http://localhost:5000/users/${userId}`)
        .then(() => {
          console.log(`✅ Contact "${username}" supprimé`);
          loadUsers();
          setConversation(null); // Fermer la conversation si elle était ouverte
          setContextMenu(null);
        })
        .catch(err => {
          console.error("Erreur suppression:", err);
          alert("Erreur lors de la suppression du contact");
        });
    }
  };

  const startConversation = (user) => {
    axios
      .post("http://localhost:5000/conversation", {
        user1: me.id,
        user2: user.id
      })
      .then(res => {
        setConversation(res.data);
      })
      .catch(err => console.error("Erreur conversation:", err));
  };

  const handleLogout = () => {
    if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
      localStorage.removeItem("loggedUser");
      if (typeof onLogout === 'function') {
        onLogout();
      } else {
        window.location.reload();
      }
    }
  };

  const handleContextMenu = (e, user) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      user: user
    });
  };

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const filteredUsers = users
    .filter(u => u.id !== me.id)
    .filter(u => u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="users">
      {/* HEADER */}
      <div className="users-header">
        <div className="user-profile-section">
          <div className="user-profile-info" onClick={() => setShowUserMenu(!showUserMenu)}>
            <div className="user-avatar-main">
              {me.username ? me.username.charAt(0).toUpperCase() : (me.email ? me.email.charAt(0).toUpperCase() : 'U')}
            </div>
            <div className="user-details">
              <h2>{me.username || me.email || 'Utilisateur'}</h2>
              <span className="user-status">En ligne</span>
            </div>
          </div>
          
          {showUserMenu && (
            <div className="user-dropdown-menu">
              <button onClick={handleLogout} className="logout-btn">
                <span className="logout-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span>Se déconnecter</span>
              </button>
            </div>
          )}
        </div>

        <div className="header-actions-users">
          {/* TOGGLE DARK MODE */}
          <button 
            className="theme-toggle-btn" 
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? "Mode clair" : "Mode sombre"}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
          
          {/* AJOUTER CONTACT */}
          <button 
            className="add-contact-btn" 
            onClick={() => setShowAddUser(!showAddUser)}
            title="Ajouter un contact"
          >
            +
          </button>

          {/* BOUTON DE DÉCONNEXION */}
          <button 
            className="logout-btn-header"
            onClick={handleLogout}
            title="Se déconnecter"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* AJOUTER CONTACT */}
      {showAddUser && (
        <div className="add-contact-box">
          <input
            placeholder="Nom d'utilisateur"
            value={newUser}
            onChange={e => setNewUser(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addUser()}
          />
          <button onClick={addUser}>✓</button>
          <button onClick={() => setShowAddUser(false)}>✕</button>
        </div>
      )}

      {/* RECHERCHE */}
      <div className={`search-box ${isSearchFocused ? 'focused' : ''}`}>
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Rechercher un contact..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        />
        {searchTerm && (
          <button 
            className="clear-btn"
            onClick={() => setSearchTerm("")}
          >
            ✕
          </button>
        )}
      </div>

      {/* LISTE CONTACTS */}
      <div className="contacts-list">
        {filteredUsers.length > 0 ? (
          filteredUsers.map(u => (
            <div
              key={u.id}
              className="contact-item-wrapper"
            >
              <div
                className="contact-item"
                onClick={() => startConversation(u)}
                onContextMenu={(e) => handleContextMenu(e, u)}
              >
                <div className="contact-avatar">
                  {u.username ? u.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="contact-info">
                  <div className="contact-name">{u.username}</div>
                  <div className="contact-status">En ligne</div>
                </div>
              </div>
              
              {/* BOUTON DE SUPPRESSION */}
              <button
                className="delete-contact-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteUser(u.id, u.username);
                }}
                title="Supprimer ce contact"
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          ))
        ) : (
          <div className="no-contacts">
            <div className="no-contacts-icon">
              {searchTerm ? "🔍" : "👥"}
            </div>
            <p>{searchTerm ? "Aucun résultat" : "Aucun contact"}</p>
          </div>
        )}
      </div>

      {/* MENU CONTEXTUEL */}
      {contextMenu && (
        <div 
          className="context-menu"
          style={{
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`
          }}
        >
          <button
            className="context-menu-item context-menu-delete"
            onClick={() => deleteUser(contextMenu.user.id, contextMenu.user.username)}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Supprimer le contact</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default Users;