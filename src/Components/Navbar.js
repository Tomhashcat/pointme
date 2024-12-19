import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  // Vérifiez si l'utilisateur est connecté en recherchant le token dans localStorage
  const isAuthenticated = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token'); // Supprimer le token de l'utilisateur
    window.location.href = "/login"; // Rediriger vers la page de login
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <ul className="navbar-links">
          <li>
            <Link to="/">Accueil</Link>
          </li>
          {!isAuthenticated && ( // N'affichez ces liens que si l'utilisateur n'est pas connecté
            <>
              <li>
                <Link to="/login">Connexion</Link>
              </li>
              <li>
                <Link to="/register">S'inscrire</Link>
              </li>
            </>
          )}
          {isAuthenticated && ( // Affichez ces liens uniquement si l'utilisateur est connecté
            <>
              <li>
                <Link to="/profile">Mon Profil</Link>
              </li>
              <li>
                <button className="logout-button" onClick={handleLogout}>
                  X
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
