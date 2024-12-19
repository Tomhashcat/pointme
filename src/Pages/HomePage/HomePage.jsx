import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './HomePage.scss';
import axios from 'axios';

const Home = () => {
  const [map, setMap] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null); // Photo sélectionnée pour la modal
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Initialisation de la carte
    const leafletMap = L.map('map').setView([51.505, -0.09], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="./https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(leafletMap);

    setMap(leafletMap);

    // Récupérer les photos depuis le backend
    fetchPhotos(leafletMap);

    
    return () => {
      leafletMap.remove();
    };
  }, []);

  const fetchPhotos = async (leafletMap) => {
    try {
      const response = await axios.get('/api/photos'); // Route pour récupérer les photos
      setPhotos(response.data);

      // Ajouter chaque photo à la carte
      response.data.forEach((photo) => {
        const marker = L.rectangle(
          [
            [photo.latitude - 0.0005, photo.longitude - 0.0005],
            [photo.latitude + 0.0005, photo.longitude + 0.0005],
          ],
          { color: 'blue', weight: 1 }
        )
          .addTo(leafletMap)
          .on('click', () => handlePhotoClick(photo));
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
    setShowModal(true);
  };

  const handlePostPhoto = async () => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n’est pas prise en charge par ce navigateur.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Exemple d'URL d'image
        const imageURL = prompt('Collez l’URL de votre image ici :');
        if (!imageURL) return;

        const location = prompt('Entrez une description pour votre photo :');

        try {
          const response = await axios.post(
            '/api/photos',
            { latitude, longitude, imageURL, location },
            {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            }
          );
          setPhotos([...photos, response.data]);
          // Ajouter la nouvelle photo sur la carte
          const photo = response.data;
          L.rectangle(
            [
              [photo.latitude - 0.0005, photo.longitude - 0.0005],
              [photo.latitude + 0.0005, photo.longitude + 0.0005],
            ],
            { color: 'blue', weight: 1 }
          )
            .addTo(map)
            .on('click', () => handlePhotoClick(photo));
        } catch (err) {
          console.error(err);
        }
      },
      (error) => {
        console.error(error);
        alert('Impossible de récupérer la position.');
      }
    );
  };

  return (
    <div>
      <h2>! PointMe !</h2>
      <p>Ici tu peux poster et liker des photos !</p>
      {/* Bouton pour poster une photo */}
      <button onClick={handlePostPhoto}>Poster une photo</button>

      {/* Le conteneur de la carte */}
      <div id="map"></div>

      {/* Modal pour afficher les détails de la photo */}
      {showModal && selectedPhoto && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowModal(false)}>
              &times;
            </span>
            <img src={selectedPhoto.imageURL} alt="Photo" style={{ maxWidth: '100%' }} />
            <p>{selectedPhoto.location}</p>
            <button onClick={() => alert('Liker la photo')}>Like</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
