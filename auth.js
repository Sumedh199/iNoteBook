
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fetchuser=require('../middleware/fetchuser');

const JWT_SECRET= 'Sumedhisagoodb$oy';

//route 1: create a user post "/api/auth/createuser" no login requried
router.post('/createuser',[
   body('name','enter a valid name').isLength({min:3}),
   body('email','enter a valid email').isEmail(),
   body('password','enter a valid password').isLength({min:5}),
] , async(req,res)=>{
   //if there are error return bad request
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
     return res.status(400).json({ errors: errors.array() });
   }
   
   try {
      
      // check whether the email exist already

   let user = await User.findOne({email:req.body.email});
   if(user){
      return res.status(400).json({error:"sorry the user with this email already exist"})
   } 

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password,salt)
         //  create new user
      user= await  User.create({
      name: req.body.name,
      password: secPass,
      email: req.body.email,
   })

      const data={
         user:{
            id: user.id
         }
      }


    const authtoken = jwt.sign(data,JWT_SECRET);
    

    res.json({authtoken})

    
   } catch (error) {
    
      console.error(error.message);
      res.status(500).send("some error occured");
   }
   
})



      //route 2: create a login "/api/auth/login"  login requried
router.post('/login',[
   body('email','enter a valid email').isEmail(),
   body('password','password cannot be blank').exists(),
    
] , async(req,res)=>{



   //if there are error return bad request
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
     return res.status(400).json({ errors: errors.array() });
   }
   
   const {email,password}= req.body;

   try {
      
      let user= await User.findOne({email});
      if(!user) {
         return res.status(400).json({error:"please try to login with correct information"})
      }

      const passwordCompare = await bcrypt.compare(password,user.password);
      if(!passwordCompare){
         return res.status(400).json({error:"please try to login with correct information"})
      }

      const data={
         user:{
            id: user.id
         }
      }

      
    const authtoken = jwt.sign(data,JWT_SECRET);

      
    res.json({authtoken})


   }  catch (error) {
    
      console.error(error.message);
      res.status(500).send("internal server error");
   }


})


//route 3: get user details "/api/auth/getuser" no login requried

router.post('/getuser',fetchuser, async(req,res)=>{
   try {

      userId=req.user.id;
      const user =await User.findById(userId).select("-password");
      res.send(user)

   } catch (error) {
    
      console.error(error.message);
      res.status(500).send("internal server error");
   }
   })


   module.exports=router
