const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {body, validationResult} = require('express-validator');
const User = require('../models/user');
require('dotenv').config();
const router = express.Router();

router.post('/register', [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({min:6}).withMessage('Password must be at least 6 characters long')
], async (req, res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({message : errors.array().map(error=>error.msg).join(',')});
    }

    try{
        const {name, email, password} = req.body;
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message:"User already exists"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        let user = new User({name, email, password:hashedPassword});
        await user.save();

        res.status(201).json({ message: "User registered successfully" });



        // const token = jwt.sign({userId:user._id}, process.env.JWT_SECRET, {expiresIn: '1h'});
        // res.json({message:"User registered successfully", token});
    }catch(error){
        res.status(500).json({message:"Internal server error"});
    }
});

router.post("/login", [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage("Password is required"),
], async(req, res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

    try{
        const {email, password} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"User not found"});
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(400).json({message:"Invalid credentials"});
        }

        const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn:'1h'});
        res.json({message:"Login successful", token, user: {_id : user._id, name: user.name, email: user.email}});
    }catch(error){
        res.status(500).json({message:"Internal server error"});
    }
});

router.get('/:userid', async(req, res)=>{
    try{
        const user = await User.findById(req.params.userid).select("-password");

        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        res.json(user);
    }catch(error){
        res.status(500).json({message: "Internal Server Error"});
    }
});

module.exports = router;
