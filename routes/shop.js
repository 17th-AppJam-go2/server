const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Shop = require('../models/Shop');
const Flower = require('../models/Flower');
const multer = require('multer');

const storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, 'public/images');
	},
	filename: function(req, file, cb) {
		const type = file.mimetype.split('/')[1];
		cb(null, Date.now() + '-' + file.originalname);
	}
});
const upload = multer({ storage });

router.get('/', async (req, res) => {
	try {
		const shops = await Shop.find({}).populate({path: 'flowers'})
		res.status(200).json({data:shops});
	} catch (e) {
		res.status(400).json({message: e.message });
	}
})

router.post('/desc', async(req, res)=>{
	try {
		const desc = req.body.desc;
		const shopId = req.body.shopId;
		const shop = await Shop.updateOne({_id: shopId}, {$set: {desc: desc}});
		res.json({data:"success"});
	} catch (e) {
		console.log(e);
	}
})

router.post('/thumbnail', upload.fields([{name:'thumbnail'}]),async(req, res) => {
	try {
		const shopId = req.body.shopId;
		const thumbnail = 'images/' + req.files['thumbnail'][0].filename;
		const shop = await Shop.updateOne({_id: shopId}, {$set: {thumbnail: thumbnail}});
		res.json({data:"success"});
	} catch (e) {
		console.log(e)
	}
})

router.post('/',upload.fields([{name:'images'}]) ,async(req, res, next) => {
	try {
		const shopId = req.body.shopId;
		const shop = await Shop.findOne({_id: shopId}).populate({path:'flowers'});
		const imageNames = req.files.images;

		if (!shop) {
			res.status(400).json({message: "가게가 존재 하지 않습니다" });
		}
		let newFlowers = JSON.parse(req.body.flowers);
		const oldFlowers = shop.flowers;
		const sf = intersect(newFlowers, oldFlowers);
		for (const flower of sf) {
			index = getIndexByName(flower.name, imageNames);

			if(index !== -1){
				const imageName = 'images/' + imageNames[index].filename;
				await Flower.updateOne({ _id: flower._id }, {$set: { price : flower.price, desc: flower.desc , image: imageName}});
			}
			else{
				await Flower.updateOne({ _id: flower._id }, {$set: { price : flower.price, desc: flower.desc }});
			}
		}
		const ad1 = array_diff(oldFlowers, newFlowers)
		for (const flower of ad1) {
			console.log(flower)
			await Flower.deleteOne({_id: flower._id})
		}

		const ad2 = array_diff(newFlowers, oldFlowers)
		for (const flower of ad2) {
			const f = new Flower();
			f.shop = shopId;
			f.name = flower.name;
			f.price = flower.price;
			index = getIndexByName(flower.name, imageNames);
			if(index != -1)
			f.image = 'images/'+ imageNames[index].filename;
			await f.save();
			await Shop.updateOne({ _id: shopId }, { $push: { flowers: f._id}});
		}
		const result = await Shop.findOne({_id: shopId}).populate({path:'flowers'});
		res.status(200).json({data:result});
	} catch (e) {
		console.log(e)
		res.status(400).json({message: e.message });
	}
})

router.get('/:shopId', async (req, res)=>{
	try {
		const shop = await Shop.findOne({_id:req.query.shopId}).populate({path:'flowers'});
		res.status(200).json({data:shop})
	} catch (e) {
		res.status(400).json({message: e.message });
	}
})

router.post('/favorite', async(req,res) => {
	try {
		const userId = req.body.userId;
		const shopId = req.body.shopId;
		const user = await User.findOne({_id:userId});
		let has = false;
		for (const id of user.favorites) {
			if(shopId == id){
				has = true;
				break;
			}
		}

		if(has){
			await User.updateOne({_id:userId}, {$pull: {favorites:shopId}});
		}
		else {
			await User.updateOne({_id:userId}, {$push: {favorites:shopId}});
		}

		const result = await User.findOne({_id:userId});
		res.status(200).json({data:result});
	} catch (e) {
		res.status(400).json({message:e.message});
	}
})

function getIndexByName(name, arr){
	for (var i = 0; i < arr.length; i++) {
		let tmp = arr[i].originalname.split(".")
		tmp = tmp.slice(0, tmp.length - 1)
		tmp = tmp.join('')
		if(tmp === name)
		return i
	}
	return -1
}

function makeErr(next, msg) {
	let err = new Error(msg);
	err.statusCode = 400;
	next(err)
}

function intersect(a, b) {
	var tmp={}, res=[];
	for(var i=0;i<a.length;i++) tmp[a[i].name]=1;
	for(var i=0;i<b.length;i++) if(tmp[b[i].name]) res.push(b[i]);
	return res;
}

function array_diff(a, b) {
	var tmp={}, res=[];
	for(var i=0;i<a.length;i++) tmp[a[i].name]=a[i];
	for(var i=0;i<b.length;i++) { if(tmp[b[i].name]) delete tmp[b[i].name]; }
	for(var k in tmp) res.push(tmp[k]);
	return res;
}

module.exports = router;
