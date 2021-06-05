const mysql = require('../mysql')
const EncryptDep = require('./encryption')
const Server = require('../ServerInfo') 
const badWords = require('./badWords')
const _IMG_DEFAULT = 'https://www.kauavitorio.com/host-itens/Default_Profile_Image_palacepetz.png';

//  Method to insert new Pet
exports.Insert_New_Pet = async (req, res, next) => {
    try {
        Server.showRequestId();
        var nm_animal = req.body.nm_animal;
        var id_user = req.body.id_user;
        var animalList = [];
        var image_animal = req.body.image_animal;
        if(image_animal == null || image_animal == "" || image_animal == " " || image_animal.length <= 12 )
            image_animal = _IMG_DEFAULT
            
        var resultPets = await mysql.execute('SELECT * FROM tbl_pets WHERE id_user = ?', id_user)
        if(resultPets.length > 0){
            for(let i = 0; i < resultPets.length; i++){
                if(nm_animal == EncryptDep.Decrypt(resultPets[i].nm_animal))
                    animalList.push(nm_animal)
            }
            if(animalList.length < 0){
                if(!badWords.VerifyUsername(nm_animal)){
                    var resultInsert = await mysql.execute('INSERT INTO tbl_pets (nm_animal, id_user, breed_animal, age_animal, weight_animal, species_animal, image_animal) VALUES (?, ?, ?, ?, ?, ?, ?)', [ EncryptDep.Encrypto(nm_animal), id_user, EncryptDep.Encrypto(req.body.breed_animal), EncryptDep.Encrypto(req.body.age_animal), EncryptDep.Encrypto(req.body.weight_animal), EncryptDep.Encrypto(req.body.species_animal), EncryptDep.Encrypto(image_animal)])
                    const response = {
                        message: 'Pet successfully inserted',
                        insertPet: {
                            cd_animal: resultInsert.insertId,
                            nm_animal: nm_animal
                        }
                    }
                    return res.status(201).send(response)
                }else
                    return res.status(406).send({ error: "Pet name not allowed"})
            }else
                return res.status(409).send({ message: 'Pet already inserted' })
        }else{
            if(!badWords.VerifyUsername(nm_animal)){
                var resultInsert = await mysql.execute('INSERT INTO tbl_pets (nm_animal, id_user, breed_animal, age_animal, weight_animal, species_animal, image_animal) VALUES (?, ?, ?, ?, ?, ?, ?)', [ EncryptDep.Encrypto(nm_animal), id_user, EncryptDep.Encrypto(req.body.breed_animal), EncryptDep.Encrypto(req.body.age_animal), EncryptDep.Encrypto(req.body.weight_animal), EncryptDep.Encrypto(req.body.species_animal), EncryptDep.Encrypto(image_animal)])
                const response = {
                    message: 'Pet successfully inserted',
                    insertPet: {
                        cd_animal: resultInsert.insertId,
                        nm_animal: nm_animal
                    }
                }
                return res.status(201).send(response)
            }else
                return res.status(406).send({ error: "Pet name not allowed"})
        }
    } catch (error) {
        Server.RegisterServerError("Insert New Pet", error.toString());
        return res.status(500).send({ error: error.toString()})
    }
}

//  Method to get all User Pets
exports.GetPets = async (req, res, next) => {
    try {
        var id_user = req.params.id_user
        var result = await mysql.execute('SELECT * FROM tbl_pets WHERE id_user = ?', id_user)
        if(result.length > 0){
            const response = {
                Search: result.map(pets => {
                    return {
                        cd_animal: parseInt(pets.cd_animal),
                        nm_animal: EncryptDep.Decrypt(pets.nm_animal),
                        id_user: parseInt(pets.id_user),
                        breed_animal: EncryptDep.Decrypt(pets.breed_animal),
                        age_animal: parseInt(EncryptDep.Decrypt(pets.age_animal)),
                        weight_animal: EncryptDep.Decrypt(pets.weight_animal),
                        species_animal: EncryptDep.Decrypt(pets.species_animal),
                        image_animal: EncryptDep.Decrypt(pets.image_animal)
                    }
                })
                }
            return res.status(200).send(response)
        }else
            return res.status(204).send('This user dont have any pet')
    } catch (error) {
        Server.RegisterServerError("Get Pets", error.toString());
        return res.status(500).send({ error: error.toString()})
    }
}