var express = require('express');
var router = express.Router();
var User = require('../models/user')

/* GET users listing. */
router.post('/register', function(req, res, next) {
  const {email, password, retypepassword} = req.body;
  let response = {
    status: true,
    message: "",
    data: null
  }
  if(password == retypepassword){
    let user = new User({email, password});
    user.save((err)=>{
      response.message = "user has been created"
      response.data = {
        user,
        token: user.token
      }
      res.json(response);
    })
  }else{
    response.status = false;
    response.message = "password doesn't match";
    res.json(response);
  }
});

router.post('/login', function(req, res, next) {
  const {email, password} = req.body;
  let response = {
    status: true,
    message: "",
    data: null
  }
  User.findOne({email}, (err, user)=>{
    if(!user){
      response.status = false;
      response.message = "email doesn't exist";
      return res.json(response);
    }
    user.comparePassword(password, (isValid)=>{
      if(isValid){
        response.message = "user is valid"
        user.password = undefined;
        console.log(user);
        response.data = {
          user,
          token: user.generateToken()
        }
        res.json(response);
      }else{
        response.status = false;
        response.message = "password wrong";
        res.json(response);
      }
    })
  })
});

router.post('/check', function(req, res, next) {
  const token = req.body.token;
  try{
    let data = User.decodeToken(token);
    console.log("coba print data",data);
    if(data){
      User.findOne({email : data.email}, (err, user)=>{
        if(!user){
          res.json({valid: false})
        }else{
          res.json({valid: true})
        }
      });
    }else{
      res.json({valid: false})
    }

  }catch(e){
    res.json({valid: false})
  }
});

module.exports = router;
