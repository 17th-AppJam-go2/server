const mongoose = require('mongoose');

const FlowerSchema = new mongoose.Schema({
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'shops'},
  name: String,
  price: Number,
  desc: String,
  image: String
});

const Flower = mongoose.model('flowers', FlowerSchema);

module.exports = Flower;
