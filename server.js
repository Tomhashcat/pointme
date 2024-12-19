const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const Nodemailer = require("nodemailer");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

let db;
async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db('pointmeDB');  // Utilisation de la base de données pointmeDB
    console.log('Connected to MongoDB!');
  }
  return db;
}

// Route POST pour l'inscription sans génération de token JWT
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const db = await connectDB();
    const collection = db.collection('User');
    const existingUser = await collection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Utilisateur déjà existant' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insérer l'utilisateur sans avoir besoin de générer un token JWT
    await collection.insertOne({ name, email, password: hashedPassword, verified: true });

    // Envoyer un email de confirmation
    const mailOptions = {
      from: "hello@example.com",
      to: email,
      subject: 'Confirmation de votre inscription',
      html: `
        <p>Bienvenue ${name},</p>
        <p>Merci de vous être inscrit ! Votre compte a été créé avec succès.</p>
        <p>Cordialement,</p>
        <p>L'équipe PointMe</p>
      `,
    };

    // Envoyer l'email via Nodemailer si nécessaire.
    const transporter = Nodemailer.createTransport({
      service: 'gmail', // ou un autre fournisseur de votre choix
      auth: {
        user: 'votre-email@gmail.com',
        pass: 'votre-mot-de-passe',
      },
    });

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'email.' });
      } else {
        console.log('Email envoyé: ' + info.response);
      }
    });

    res.status(200).json({ message: "Inscription réussie ! Un email de confirmation a été envoyé." });

  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Route pour la connexion
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const db = await connectDB();
    const collection = db.collection('User');
    const user = await collection.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Mot de passe invalide' });
    }

    // Connexion réussie, répondre avec un message de succès
    res.status(200).json({ message: "Connexion réussie !" });

  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get('/api/User', async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Non autorisé" });
  }

  try {
    const decoded = jwt.verify(token, "votre_clé_secrète"); // Si vous utilisez JWT
    const db = await connectDB();
    const user = await db.collection('User').findOne({ email: decoded.email });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    res.status(200).json({
      username: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("Erreur de récupération de l'utilisateur :", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
});
