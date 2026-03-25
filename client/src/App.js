import { useState } from "react";
import Users from "./Users";
import Chat from "./Chat";
import Login from "./Login";
import "./App.css";

function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [me] = useState({ id: 1, username: "Moi" });
  const [conversation, setConversation] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  if (!isAuth) return <Login setIsAuth={setIsAuth} />;

  return (
    <div className={`app ${darkMode ? "dark-mode" : ""}`}>
      <Users
        me={me}
        setConversation={setConversation}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
      {conversation ? (
        <Chat me={me} conversation={conversation} darkMode={darkMode} />
      ) : (
        <div className="no-conversation">
          <h2>Sélectionnez une conversation</h2>
          <p>Choisissez un contact pour commencer à discuter</p>
        </div>
      )}
    </div>
  );
}

export default App;
