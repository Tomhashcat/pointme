// Ajouter une photo avec géolocalisation
router.post('/', authMiddleware, async (req, res) => {
  const { location, imageURL, latitude, longitude } = req.body;
  try {
    const newPhoto = new Photo({
      userId: req.user.id,
      imageURL,
      location,
      latitude,
      longitude,
      likes: [],
      reported: false,
    });
    await newPhoto.save();
    res.json(newPhoto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Récupérer toutes les photos
router.get('/', async (req, res) => {
  try {
    const photos = await Photo.find();
    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
