useEffect(() => {
    fetch('http://localhost:5000/api/photos')
      .then((res) => res.json())
      .then((data) => {
        data.forEach((photo) => {
          L.marker([photo.location.latitude, photo.location.longitude])
            .addTo(map)
            .bindPopup(`<img src="${photo.imageURL}" alt="photo" width="100px"/>`);
        });
      });
  }, []);
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    L.marker([latitude, longitude]).addTo(map).bindPopup('Vous êtes ici');
  });
  