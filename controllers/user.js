// Permet de gérer toutes les fonctions utilisateur

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const passwordValidator = require('password-validator');

exports.signup = (req, res, next) => {              // Pour enregistrer un utilisateur et crypter son mot de passe

    const passwordSchema = new passwordValidator();

    passwordSchema // Ajout des propriétés 
    .is().min(8)                                    // 8 caractères minimum
    .is().max(100)                                  // 100 caractères maximum 
    .has().uppercase()                              // Doit contenir des lettres en majuscules
    .has().lowercase()                              // Doit contenir des lettres en minuscules                    
    .has().digits(2)                                // Doit contenir au moins 2 chiffres
    .has().not().spaces()                           // Ne doit pas contenir d'espace
    .is().not().oneOf(['Passw0rd', 'Password123']); // Ne pas utiliser ces mots de passe

    if (!passwordSchema.validate(req.body.password)) {
      const error = 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, 2 chiffres et ne doit pas contenir d\'espaces.';
      res.status(401).json({message:error});
    }
    else
    {
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        const user = new User({                      // Création d'un utilisateur
          email: req.body.email,
          password: hash
        });
        user.save()                                 // Pour enregistrer l'utilisateur
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
    }
  };

  exports.test =  (req, res) => {
    res.send('api success!');
  };


exports.login = (req, res, next) =>{                // Pour se connecter on vérifie si le login et/ou le mdp est incorrecte 
    User.findOne({email: req.body.email})
    .then(user =>{
        if(user === null){
            res.status(401).json({message:'Paire identifiant/mot de passe incorrecte'});
        }
        else{
            bcrypt.compare(req.body.password, user.password)
            .then(valid =>{
                if(!valid){
                    res.status(401).json({message: 'Paire identifiant/mot de passe incorrecte !'});
                }
                else{
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            {userId: user._id},
                            'RANDOM_TOKEN_SECRET',
                            {expiresIn: '24h'}
                        )
                    });
                }
            })
            .catch(error =>
                res.status(500).json({error}));
        }
    })
    .catch(error =>{
        res.status(500).json({error});

    })

};