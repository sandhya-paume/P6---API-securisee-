// Permet de configurer et lancer une application web

const express = require('express');                                 // Importation du module express (:framework web pour node.js)
const bodyParser = require("body-parser");      
const helmet = require("helmet");                                   // Importation du module helmet (:permet de sécuriser l'application Express en ajoutant des en-têtes HTTP sécurisées qui aident à protéger notre site web des attaques)
const cors = require('cors');                                       // Importation du module cors (:permet aux sites web de demander des ressources à un serveur situé sur un autre domaine)
const mongoose = require('mongoose');                               // Connexion à la base de données mongoDB
const path = require('path');                                       // Importation du module path (:fournit des utilitaires pour travailler avec des chemins de fichiers et de repertoires)
const userRoutes = require('./routes/user');
const saucesRoutes = require('./routes/sauces');
const { rateLimit } = require('express-rate-limit');                // Importation du module rate limiter (:permet limiter le nombre de requêtes qu'un utilisateur peut envoyer à un serveur dans un certain délai)


const dotenv = require("dotenv");                                   // Bibliothèque pour applications node.js qui permet de stocker les variables sensibles en toute sécurité dans un fichier local et de les charger dynamiquement lors de l'exécution de l'application

dotenv.config();

const MY_PORT = process.env.PORT;
const LOGIN= process.env.LOGIN;
const PASSWORD= process.env.PASSWORD;

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,                                         // Option de temps: 15 minutes
	max: 100,                                                         // 100 requêtes maximum autorisées pour une adresse IP pendant la période windowMs (15mins)
	standardHeaders: true,                                            // Renvoyer les informations de limite de taux dans les en-têtes `RateLimit-
	legacyHeaders: false,                                             // Désactive les en-têtes `X-RateLimit
})

mongoose.connect('mongodb+srv://'+LOGIN+':'+PASSWORD+'@cluster0.pmt698x.mongodb.net/?retryWrites=true&w=majority', 
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));


  const app = express();                                             // Initialise express ( app est alors utilisé pour définir les routes et les middleware nécessaires pour l'application)
 

  app.use((req, res, next) => {                                      // Système de sécurité qui bloque les appels HTTP entre des serveurs différents
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

 
app.use(                                                              // Permet de sécuriser les images présentes sur le site
  helmet.contentSecurityPolicy({
    directives: {   
      "img-src": ["'self'", "data:", "http://localhost:"+MY_PORT+"/images"]
    },
  })
);          
               
app.use(cors());                                   
app.use(express.json());                                              // Permet de gérer les données de requête JSON 
app.use(bodyParser.json());
app.use('/images', express.static(path.join(__dirname, "images")));  // Permet de définir un middleware pour servir des fichiers statiques dans l'application Express
app.use("/api/auth", userRoutes);
app.use("/api/sauces", saucesRoutes);
app.use(limiter);




module.exports = app;

