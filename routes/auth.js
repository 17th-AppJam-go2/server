const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Shop = require('../models/Shop');

router.post('/signup', function (req, res) {
  if(req.body.id === undefined){
    res.status(400).json({message:"id가 비어있습니다"})
  }
  if(req.body.password === undefined){
    res.status(400).json({message:"password가 비어있습니다"})
  }
  if(req.body.type === undefined){
    res.status(400).json({message:"type이 비어있습니다"})
  }

  if(req.body.type === "Admin"){
    if(req.body.shopName === undefined){
      res.status(400).json({message:"shopName이 비어있습니다."})
    }
    if(req.body.shopAddress === undefined){
      res.status(400).json({message:"shopAddress가 비어있습니다."})
    }
    if(req.body.shopNumber === undefined){
      res.status(400).json({message:"shopNumber가 비어있습니다."})
    }
  }
  User.findOne({id: req.body.id}, function (err, users) {
    if (err) {
      console.log("db err in signup");
      next(err)
    }
    if (users === null) {
      let user = new User();
      user.id = req.body.id;
      user.password = req.body.password;
      user.type = req.body.type;
      user.save();

      if (req.body.type === "Admin"){
        let shop = new Shop();
        shop.adminId = user._id;
        shop.name = req.body.shopName;
        shop.address = req.body.shopAddress;
        shop.number = req.body.shopNumber;
        shop.save();
      }

      res.json({result: true, data: user});
    } else {
      res.status(400).json({message:"이미 있는 유저입니다."})
    }
  });
});

router.post('/signin', function (req, res, next) {
  User.findOne({id: req.body.id}, function (err, users) {
    if (err) {
      console.log("db err in signin");
      next(err)
    }

    if (users === null) {
      res.status(400).json({message:"아이디가 틀립니다."})
    } else {
      if (users.password === req.body.password) {
        res.json({result: true, data: users})
      } else {
        res.status(400).json({message:"비밀번호가 틀립니다."})
      }
    }
  })
});

router.get('/:id', async (req, res)=>{
  try {
    const user = await User.findOne({_id:req.query.id})
    res.status(200).json({data:user})
  } catch (e) {
    res.status(400).json({message:e.message});
  }
})

module.exports = router;
