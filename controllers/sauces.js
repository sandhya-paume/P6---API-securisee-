// Pour définir les fonctions et leurs actions concernant les sauces

const Sauce = require('../models/Sauces');
const fs = require('fs');


//Création d'une sauce par l'utilisateur
exports.createSauce = (req, res, next) => { 
  const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId;
    const sauce = new Sauce({
        ...sauceObject,
        likes: 0,
        dislikes: 0,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

    // Enregistrement de la sauce créer
    sauce 
    .save()
    .then(() => { res.status(201).json({message: 'Sauce enregistrée !'})})
    .catch(error => { res.status(400).json( { error })})
};


// Pour modifier une sauce
exports.modifySauce = (req, res) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      }
    : { ...req.body };

  delete sauceObject._userId;
  Sauce.findOne({ _id: req.params.id }).then((sauce) => {
    if (sauce.userId != req.auth.userId) {
      res.status(401).json({ message: 'Not authorized' });
    } else {
      Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
        .then(() => {
          if (req.file) {                                                     // Pour modifier le contenu texte de la sauce, en gardant l'image
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
              res.status(200).json({ message: 'Sauce modifiée!' });
            });
          } else {
            res.status(200).json({ message: 'Sauce modifiée!' });
          }
        })
        .catch((error) => res.status(400).json({ error }));
    }
  }).catch((error) => res.status(400).json({ error }));
};


// Pour selectionner une sauce
exports.getOneSauce =  (req, res, next) => { 
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
};


// Pour suppimer des sauces
exports.deleteSauce =  (req, res, next) => { 
  Sauce.findOne({ _id: req.params.id})
    .then(sauce => {
        if (sauce.userId != req.auth.userId) {
        res.status(401).json({message: 'Not authorized'});
        } else {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({_id: req.params.id})
                    .then(() => { res.status(200).json({message: 'Sauce supprimée !'})})
                    .catch(error => res.status(401).json({ error }));
            });
        }
    })
    .catch( error => {
        res.status(500).json({ error });
    });
};


// Pour selectionner toutes les sauces
exports.getAllSauces = (req, res, next) =>{ 
  Sauce.find()
  .then(sauces => res.status(200).json(sauces))
  .catch(error => res.status(400).json({ error }));
};


// Pour liker une sauce pour la 1ere fois
exports.likeSauce = (req, res, next) =>{ 
  const sauceId = req.params.id;
  const userId = req.body.userId;
  const like = req.body.like;
  if (like === 1) {
    Sauce.updateOne(
      { _id: sauceId },
      {
        $inc: { likes: like },
        $push: { usersLiked: userId },
      }
    )
      .then((sauce) => res.status(200).json({ message: "Sauce aimée" }))
      .catch((error) => res.status(500).json({ error }));
  }

// Pour disliker une sauce pour la 1ere fois
  else if (like === -1) {
    Sauce.updateOne(
      { _id: sauceId },
      {
        $inc: { dislikes: 1 },
        $push: { usersDisliked: userId },
      }
    )
      .then((sauce) => res.status(200).json({ message: "Sauce destestée" }))
      .catch((error) => res.status(500).json({ error }));
  }

// Pour supprimer son avis
  else {
    Sauce.findOne({ _id: sauceId })
      .then((sauce) => {
        if (sauce.usersLiked.includes(userId)) {                                  // Si l'utilisateur avait liker
          Sauce.updateOne(
            { _id: sauceId },
            { $pull: { usersLiked: userId }, $inc: { likes: -1 } }
          )
            .then((sauce) => {
              res.status(200).json({ message: "Pas d'avis" });
            })
            .catch((error) => res.status(500).json({ error }));



      } 
          else if (sauce.usersDisliked.includes(userId)) {                        // si l'utilisateur avait disliker
            Sauce.updateOne(
              { _id: sauceId },
              {
                $pull: { usersDisliked: userId },
                $inc: { dislikes: -1 },
              }
            )
              .then((sauce) => {
                res.status(200).json({ message: "Pas d'avis" });
              })
              .catch((error) => res.status(500).json({ error }));
          }
  })
  .catch((error) => res.status(401).json({ error }));
    }
};

