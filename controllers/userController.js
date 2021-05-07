const mysql = require('../mysql')
const bcrypt = require('bcrypt');
const EncryptDep = require('../controllers/encryption')
const ServerDetails = require('../ServerError') 
const BadWords = require('../controllers/badWords')
const IMG_USER = 'https://www.kauavitorio.com/host-itens/Default_Profile_Image_palacepetz.png';
var requestId = 0;

//  Method for login user
exports.Login = async (req, res, next) => {
    try{
        showRequestId()
        const resultList = await mysql.execute('SELECT * FROM tbl_account;')
        if(resultList.length > 0){
            for(var i = 0 ; i < resultList.length; i++){
                var email = EncryptDep.Decrypt(resultList[i].email);
                if(email == req.body.email ){
                    console.log('\nEmail found\n')
                        const response = {
                            id_user: resultList[i].id_user,
                            name_user: EncryptDep.Decrypt(resultList[i].name_user),
                            email: EncryptDep.Decrypt(resultList[i].email),
                            cpf_user: EncryptDep.Decrypt(resultList[i].cpf_user),
                            address_user: EncryptDep.Decrypt(resultList[i].address_user),
                            complement: EncryptDep.Decrypt(resultList[i].complement),
                            zipcode: EncryptDep.Decrypt(resultList[i].zipcode),
                            phone_user: EncryptDep.Decrypt(resultList[i].phone_user),
                            birth_date: EncryptDep.Decrypt(resultList[i].birth_date),
                            user_type: resultList[i].user_type,
                            img_user: EncryptDep.Decrypt(resultList[i].img_user)
                        }
                        return res.status(200).send(response);
                }
            }
        }else{
            ServerDetails.RegisterServerError("Search for user email", "No email on database");
            console.log('No email on database')
            return res.status(500).send({ error: "No email on database"})
        }
    }catch (error){
        ServerDetails.RegisterServerError("Login User", error.toString());
        return res.status(500).send({ error: error})
    }
}

//  Method for register new user
exports.RegisterUsers = async (req, res, next) => {
    try {
        showRequestId()
        if(BadWords.VerifyUsername(req.body.name_user)){
            return res.status(406).send({ error: "Username not allowed"})
        }else{
            var Emailcollection = [];
            const resultList = await mysql.execute('SELECT email FROM tbl_account;')
            if(resultList.length > 0){
                for(var i = 0 ; i < resultList.length; i++){
                var email = EncryptDep.Decrypt(resultList[i].email);
                    if(email == req.body.email ){
                        Emailcollection.push(i)
                    }
                }
            if(Emailcollection.length > 0){
                return res.status(409).send({ message: 'User already registered' })
            }else{
                const hash = await bcrypt.hashSync(req.body.password, 12);
                query = 'INSERT INTO tbl_account (name_user, email, cpf_user, password, img_user) VALUES (?,?,?,?,?)';
                var results = await mysql.execute(query, [ EncryptDep.Encrypto(req.body.name_user), EncryptDep.Encrypto(req.body.email),
                    EncryptDep.Encrypto(req.body.cpf_user), hash, EncryptDep.Encrypto(IMG_USER)])
                //  Creating resposto to return
                const response = {
                    message: 'User created successfully',
                    createdUser: {
                        userId: results.insertId,
                        name_user: req.body.name_user
                    }
                }
                    return res.status(201).send(response);
            }
        }else{
            const hash = await bcrypt.hashSync(req.body.password, 12);
                query = 'INSERT INTO tbl_account (name_user, email, cpf_user, password, img_user) VALUES (?,?,?,?,?)';
                var results = await mysql.execute(query, [ EncryptDep.Encrypto(req.body.name_user), EncryptDep.Encrypto(req.body.email),
                    EncryptDep.Encrypto(req.body.cpf_user), hash, EncryptDep.Encrypto(IMG_USER)])
                //  Creating resposto to return
                const response = {
                    message: 'User created successfully',
                    createdUser: {
                        userId: results.insertId,
                        name_user: req.body.name_user
                    }
                }
                    return res.status(201).send(response);
        }
        }
    } catch (error) {
        ServerDetails.RegisterServerError("Register User", error.toString());
        return res.status(500).send( { error: error } )
    }
}

// Method for Register Address
exports.UpdateAddress = async (req, res, next) => {
    try {
        showRequestId()
        var queryUser = `SELECT * FROM tbl_account where id_user = ?`
        var result  = await mysql.execute(queryUser, [req.body.id_user])
        if(result.length > 0){
            var query = `UPDATE tbl_account SET address_user = ?,
            complement = ?, zipcode = ? WHERE id_user = ?`
            await mysql.execute(query, [ EncryptDep.Encrypto(req.body.address_user), EncryptDep.Encrypto(req.body.complement), EncryptDep.Encrypto(req.body.zipcode), req.body.id_user ])
            return res.status(202).send({ message: 'Address updated successfully !!'})
        }else{
            return res.status(400).send({ message: 'User not registered update Address' })
        }
    } catch (error) {
        ServerDetails.RegisterServerError("Update Address", error.toString());
        return res.status(500).send( { error: error } )
    }
}

//  Method for Update Profile Image
exports.UpdateProfileImage = async (req, res, next) => {
    try{
        showRequestId()
        var query;
        var URL_ProfileImage = EncryptDep.Encrypto(req.body.img_user)
        var ID_User = req.body.id_user
        query = `SELECT * FROM tbl_account WHERE id_user = ?`
        var result = await mysql.execute(query, ID_User)

        if(result.length > 0){
            if(URL_ProfileImage != "" || URL_ProfileImage.length >= 8 || URL_ProfileImage != null){
                query = 'UPDATE tbl_account SET img_user = ? WHERE id_user = ?'
                await mysql.execute(query, [URL_ProfileImage, ID_User])
                return res.status(200).send({ message: 'Update Image successfully !!' })
            }
        }else{
            return res.status(404).send({ message: 'User not registered' })
        }
    }catch(error){
        ServerDetails.RegisterServerError("Update Profile Image", error.toString());
        return res.status(500).send( { error: error } )
    }
}

//  Method for Update Profile
exports.UpdateProfile = async (req, res, next) => {
    try{
        showRequestId()
        var queryUser = `SELECT * FROM tbl_account WHERE id_user = ?;`
        var result = await mysql.execute(queryUser, req.body.id_user)
        if(result.length > 0){
            if(BadWords.VerifyUsername(req.body.name_user)){
                return res.status(406).send({ error: "Username not allowed"})                
            }else{
                var query = `UPDATE tbl_account SET 
                name_user = ?,
                cpf_user = ?,
                address_user = ?, 
                complement = ?, 
                zipcode = ?, 
                phone_user = ?, 
                birth_date = ?
                    WHERE id_user = ?;`
                await mysql.execute(query, [EncryptDep.Encrypto(req.body.name_user), EncryptDep.Encrypto(req.body.cpf_user), EncryptDep.Encrypto(req.body.address_user), EncryptDep.Encrypto(req.body.complement), EncryptDep.Encrypto(req.body.zipcode), EncryptDep.Encrypto(req.body.phone_user), EncryptDep.Encrypto(req.body.birth_date), req.body.id_user])
                return res.status(200).send( { message: 'User information successfully update'} )
            }
        }else{
            return res.status(404).send( { message: 'User not registered' } )
        }
    }catch(error){
        ServerDetails.RegisterServerError("Update Profile", error.toString());
        return res.status(500).send( { error: error } )
    }
}

//  Method for register new card
exports.RegisterNewCard = async (req, res, next) => {
    var nmUser_card = req.body.nmUser_card;
    var id_user = req.body.id_user;
    try {
        showRequestId()
        var queryUser = `SELECT * FROM tbl_account WHERE id_user = ?;`
        var resultUser = await mysql.execute(queryUser, id_user)
        if(resultUser.length > 0){
            var queryCardVerify = `SELECT number_card FROM tbl_cards WHERE id_user = ?;`
            var resultCardVerify = await mysql.execute(queryCardVerify, id_user)
            if(resultCardVerify.length > 0){
                var NumberCardList = [];
                for(var i = 0 ; i < resultCardVerify.length; i++){
                    var number_card = EncryptDep.Decrypt(resultCardVerify[i].number_card);
                        if(number_card == req.body.number_card ){
                            NumberCardList.push(i)
                        }
                    }
            if(NumberCardList.length > 0){
                return res.status(409).send({ message: 'Card already registered' })
            }else{
                if(BadWords.VerifyUsername(nmUser_card)){
                    return res.status(406).send({ error: "Card name not allowed"})                
                }else{
                    const query = `INSERT INTO tbl_cards (id_user, flag_card, number_card, shelflife_card, cvv_card, nmUser_card) VALUES (?,?,?,?,?,?)`
                    var result  = await mysql.execute(query, [ id_user, EncryptDep.Encrypto(req.body.flag_card), EncryptDep.Encrypto(req.body.number_card), EncryptDep.Encrypto(req.body.shelflife_card), EncryptDep.Encrypto(req.body.cvv_card), EncryptDep.Encrypto(nmUser_card) ] )
                    const response = {
                        message: "User created successfully",
                        cd_card: result.insertId
                    }
                    return res.status(201).send(response);
                }
            }
            }else{
                if(BadWords.VerifyUsername(nmUser_card)){
                    return res.status(406).send({ error: "Card name not allowed"})                
                }else{
                    const query = `INSERT INTO tbl_cards (id_user, flag_card, number_card, shelflife_card, cvv_card, nmUser_card) VALUES (?,?,?,?,?,?)`
                    var result  = await mysql.execute(query, [ id_user, EncryptDep.Encrypto(req.body.flag_card), EncryptDep.Encrypto(req.body.number_card), EncryptDep.Encrypto(req.body.shelflife_card), EncryptDep.Encrypto(req.body.cvv_card), EncryptDep.Encrypto(nmUser_card) ] )
                    const response = {
                        message: "User created successfully",
                        cd_card: result.insertId
                    }
                    return res.status(201).send(response);
                }
            }
        }else{
            return res.status(404).send( { message: 'User not registered' } )
        }
    } catch (error) {
        ServerDetails.RegisterServerError("Register New Card", error.toString());
        return res.status(500).send( { error: error } )
    }
}

function showRequestId(){
    requestId++;
    console.log("---------------------\n-- Request Id: " + requestId + "\n---------------------")
}