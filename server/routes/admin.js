require('dotenv').config();

const express = require("express");
const router = express.Router();
const Post = require("../models/Post");

const User = require("../models/User");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const adminLayout = '../views/layouts/admin'
const jwtSecret = process.env.JWT_SECRET || 'MY_SECRET'


const authMiddleWare = (req,res,next) => {
  const token = req.cookies.token;

  if(!token) {
    return res.status(401).json({ message: 'unauthorized'})
  }

  try {
    const decoded = jwt.verify(token, jwtSecret)
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({message: 'Unauthorized'})
  }
}

router.get("/admin", async (req, res) => {
    try {
      const locals = {
        title: "Nodejs blog",
        description: "Simple blog created with nodejs, express, mongo",
      };
  
   
  
      // let data = await Post.find();
      res.render("admin/index", {
        locals,layout: adminLayout
        
      });
    } catch (error) {
      console.log("error", error);
    }
  });

  // Post/admin - check login
router.post("/admin", async (req, res) => {
    try {
      // console.log('working', req);
      
      const {username, password} = req.body;

      const user = await User.findOne({username});
    

      if(!user){
        return res.status(401).json({message: 'Invalid credentials'});
      }

      // console.log(req.body);
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('working user', user, password, isPasswordValid);

      if(!isPasswordValid) {
        return res.status(401).json({message: 'Invalid credentials'})
      }


      const token = jwt.sign({userId: user._id}, jwtSecret)

      res.cookie('token', token, {httpOnly: true})

      res.redirect('/dashboard');
      // let data = await Post.find();
      // res.render("admin/index", {
      //   layout: adminLayout
        
      // });
      console.log('login success');
      
    } catch (error) {
      console.log("error", error);
    }
  });

  router.get("/dashboard", authMiddleWare,  async (req, res) => { 
    try {
      const locals = {
        title: 'Dashboard',
        description: 'Simple Blog created with NodeJs, Express & MongoDb.'
      }
  
      const data = await Post.find();
      res.render('admin/dashboard', {
        locals,
        data,
        layout: adminLayout
      });
      
    } catch (error) {
      
    }
    // res.render('admin/dashboard')
  })

  // Register check
router.post("/register", async (req, res) => {
    try {
   
      const {username, password} = req.body;
      console.log(req.body);
      const hashedPassword = await bcrypt.hash(password, 10)
      
      // let data = await Post.find();
      res.render("admin/index", {
        layout: adminLayout
        
      });

      const user = await User.create({username: username, password: hashedPassword})
      res.status(201).json({message: 'User Created', user})
    } catch (error) {
      if(error.code === 11000) {
        res.status(409).json({message: 'User already in use'});
      }
      res.status(500).json({message: 'Internal Server error'});
      console.log("error", error);
    }
  });


  router.get("/add-post", authMiddleWare,  async (req, res) => { 
try {
  const locals = {
    title: 'Dashboard',
    description: 'Simple Blog created with NodeJs, Express & MongoDb.'
  }

  const data = await Post.find();
  res.render('admin/add-post',{
    locals,
    layout: adminLayout
  })
} catch (error) {
  
}
  })

  router.post("/add-post", authMiddleWare,  async (req, res) => { 
    try {
      const locals = {
        title: 'Dashboard',
        description: 'Simple Blog created with NodeJs, Express & MongoDb.'
      }
    
      const newPost = new Post({
        title: req.body.title,
        body: req.body.body
      });
    
      await Post.create(newPost);
    
      res.redirect('/dashboard')
    } catch (error) {
      console.log('error', error);
      
    }
      })

      router.put("/edit-post/:id", authMiddleWare,  async (req, res) => { 
        try {
         
          await Post.findByIdAndUpdate(req.params.id,{
            title: req.body.title,
            body: req.body.body,
            updateAt: Date.now()
    
          })
         
        
          res.redirect(`/edit-post/${req.params.id}`)
        } catch (error) {
          console.log('error', error);
          
        }
          })
  router.get("/edit-post/:id", authMiddleWare,  async (req, res) => { 
    try {
     
      const data = await Post.findOne({
        _id: req.params.id

      })
     
    
      res.render(`admin/edit-post`,{
        data,layout: adminLayout
      })
    } catch (error) {
      console.log('error', error);
      
    }
      })
  router.delete("/delete-post/:id", authMiddleWare,  async (req, res) => { 
    try {
     
      const data = await Post.deleteOne({
        _id: req.params.id
      })
    
      res.redirect(`/dashboard`)
    } catch (error) {
      console.log('error', error);
      
    }
      })

      router.get("/logout", authMiddleWare,  async (req, res) => { 
        try {
          res.clearCookie('token')
          res.redirect(`/`)
        } catch (error) {
          console.log('error', error);
          
        }
          })


  
  module.exports = router;