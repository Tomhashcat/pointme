import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.scss";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Charger les informations de l'utilisateur
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login"); // Si l'utilisateur n'est pas connecté, redirige vers la page de login
      }

      try {
        const response = await fetch("http://localhost:5000/api/User", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (response.ok) {
          setUser(data);
          setNewUsername(data.username);
          setNewEmail(data.email);
        } else {
          setError(data.message || "Erreur lors du chargement des données.");
        }
      } catch (err) {
        setError("Erreur de connexion au serveur.");
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Vous devez être connecté pour mettre à jour votre profil.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/users/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: newUsername, email: newEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Profil mis à jour avec succès !");
        setUser(data);
      } else {
        setError(data.message || "Erreur lors de la mise à jour.");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur.");
    }
  };

  const handleDeleteAccount = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Vous devez être connecté pour supprimer votre compte.");
      return;
    }

    const confirmation = window.confirm(
      "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible."
    );

    if (confirmation) {
      try {
        const response = await fetch("http://localhost:5000/api/users/delete", {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.removeItem("token");
          alert("Compte supprimé avec succès.");
          navigate("/login");
        } else {
          setError(data.message || "Erreur lors de la suppression du compte.");
        }
      } catch (err) {
        setError("Erreur de connexion au serveur.");
      }
    }
  };

  if (!user) return <div>Chargement...</div>;

  return (
    <div className="profile-container">
      <h2>Mon Profil</h2>
      <form onSubmit={handleProfileUpdate} className="profile-form">
        <div className="form-group">
          <label htmlFor="username">Nom d'utilisateur</label>
          <input
            type="text"
            id="username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="Modifiez votre nom d'utilisateur"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Modifiez votre email"
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="update-button">
          Mettre à jour
        </button>
      </form>

      <button onClick={handleDeleteAccount} className="delete-button">
        Supprimer mon compte
      </button>
    </div>
  );
};

export default ProfilePage;
