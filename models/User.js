const mongoose = require ('mongoose');                          // collecte les informations et les stockes dans une base de données
const uniqueValidator = require ('mongoose-unique-validator');  // rend les champs uniques
const mongooseError = require('mongoose-error');                // Intercepte les erreurs renvoyées par Mongoose
 

const userSchema = mongoose.Schema({
    email:{type: String, required : true, unique: true},
    password :{type: String, require:  true}
});


userSchema.plugin(uniqueValidator, { message: 'L\'{PATH} doit être unique.' });

mongoose.plugin(mongooseError, { overwrite: true });           

module.exports = mongoose.model('User', userSchema);