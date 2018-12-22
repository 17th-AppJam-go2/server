const mongoose = require('mongoose');
const ShopSchema = new mongoose.Schema({
    adminId: String,
    name: String,
    address: String,
    desc: {type: String, default: ""},
    number: String,
    lat: String,
    lon: String,
    thumbnail: String,
    flowers : [{ type: mongoose.Schema.Types.ObjectId, ref: 'flowers'}]
});

const Shop = mongoose.model('shops', ShopSchema);

module.exports = Shop;
