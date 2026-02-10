const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

/* ========== AUTHENTIFICATION ========== */
/* ✅ CONNEXION */
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email et mot de passe requis" });
  }

  // Vérifier dans la table admin
  db.query(
    "SELECT * FROM admin WHERE email = ? AND password = ?",
    [email, password],
    (err, result) => {
      if (err) {
        console.error("Erreur BD:", err);
        return res.status(500).json({ message: "Erreur serveur" });
      }

      if (result.length === 0) {
        return res.status(401).json({ message: "Email ou mot de passe incorrect" });
      }

      // Utilisateur trouvé
      const user = result[0];
      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username || user.email.split('@')[0]
        }
      });
    }
  );
});

/* ========== UTILISATEURS ========== */
/* ✅ VOIR TOUS LES UTILISATEURS */
app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

/* ✅ AJOUTER UN UTILISATEUR */
app.post("/users", (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).send("Nom requis");
  }

  db.query(
    "INSERT INTO users (username) VALUES (?)",
    [username],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({ id: result.insertId, username });
    }
  );
});

/* ✅ SUPPRIMER UN UTILISATEUR */
app.delete("/users/:id", (req, res) => {
  const userId = req.params.id;

  // Vérifier que l'utilisateur existe
  db.query("SELECT * FROM users WHERE id = ?", [userId], (err, result) => {
    if (err) {
      console.error("Erreur vérification utilisateur:", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Supprimer d'abord les messages liés à cet utilisateur
    db.query(
      "DELETE FROM messages WHERE sender_id = ?",
      [userId],
      (err) => {
        if (err) {
          console.error("Erreur suppression messages:", err);
          return res.status(500).json({ message: "Erreur lors de la suppression des messages" });
        }

        // Supprimer les conversations liées
        db.query(
          "DELETE FROM conversations WHERE user1 = ? OR user2 = ?",
          [userId, userId],
          (err) => {
            if (err) {
              console.error("Erreur suppression conversations:", err);
              return res.status(500).json({ message: "Erreur lors de la suppression des conversations" });
            }

            // Enfin, supprimer l'utilisateur
            db.query(
              "DELETE FROM users WHERE id = ?",
              [userId],
              (err) => {
                if (err) {
                  console.error("Erreur suppression utilisateur:", err);
                  return res.status(500).json({ message: "Erreur lors de la suppression" });
                }
                
                console.log(`✅ Utilisateur ${userId} supprimé avec succès`);
                res.json({ 
                  success: true, 
                  message: "Utilisateur supprimé avec succès" 
                });
              }
            );
          }
        );
      }
    );
  });
});

/* ========== CONVERSATION ========== */
app.post("/conversation", (req, res) => {
  const { user1, user2 } = req.body;

  db.query(
    "SELECT * FROM conversations WHERE (user1=? AND user2=?) OR (user1=? AND user2=?)",
    [user1, user2, user2, user1],
    (err, result) => {
      if (err) return res.status(500).send(err);

      if (result.length > 0) {
        res.json(result[0]);
      } else {
        db.query(
          "INSERT INTO conversations (user1, user2) VALUES (?, ?)",
          [user1, user2],
          (err, r) => {
            if (err) return res.status(500).send(err);
            res.json({ id: r.insertId });
          }
        );
      }
    }
  );
});

/* ========== MESSAGES ========== */
app.get("/messages/:conversationId", (req, res) => {
  db.query(
    "SELECT * FROM messages WHERE conversation_id=? ORDER BY created_at",
    [req.params.conversationId],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json(result);
    }
  );
});

app.post("/messages", (req, res) => {
  const { conversation_id, sender_id, content } = req.body;

  db.query(
    "INSERT INTO messages (conversation_id, sender_id, content) VALUES (?,?,?)",
    [conversation_id, sender_id, content],
    (err) => {
      if (err) return res.status(500).send(err);
      res.send("Message envoyé");
    }
  );
});

app.listen(5000, () => {
  console.log("✅ Serveur démarré sur http://localhost:5000");
});