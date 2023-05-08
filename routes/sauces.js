// routes.js pour définir quelle fonction va être appelée selon la méthode (GET/POST..) et l'url //

const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
// const fs = require('fs');

const saucesCtrl = require('../controllers/sauces');

// CRUD
// Pour récupérer tous les objets //
router.get('/',auth,saucesCtrl.getAllSauces);

 // Pour créer l'objet //
  router.post('/',auth,multer,saucesCtrl.createSauce);

  // Pour recupérer un objet //
  router.get('/:id',auth,saucesCtrl.getOneSauce);

// Pour modifié l'objet //
  router.put('/:id',auth,multer,saucesCtrl.modifySauce);

// Pour supprimer l'objet // 
  router.delete('/:id',auth,saucesCtrl.deleteSauce);

  // Like & Dislike
  router.post("/:id/like", auth, saucesCtrl.likeSauce);
   
module.exports = router;