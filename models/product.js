const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  images: [String],
  price: {
    type: Number,
    required: true,
    validate: {
      validator: (v) => v >= 0,
    },
  },
  discountPrice: {
    type: Number,
  },
  description: {
    type: String,
  },
  stock: {
    type: Number,
    min: 0,
  },
});

//Products Validation
const Product = mongoose.model("Product", productSchema);
productSchema.path("price").validate(async (value) => {
  return value > 0;
}, "Price must be non-zero");
productSchema.path("discountPrice").validate(async (value) => {
  return value > 0;
}, "discount Price must be non-zero");
productSchema.path("name").validate(async (value) => {
  return value.length;
}, "Please Provide product name");
productSchema.path("stock").validate(async (value) => {
  return value >= 0 && value != null;
}, "Please Provide stock details");
productSchema.path("description").validate(async (value) => {
  return value.length;
}, "Please Provide description details about product");
productSchema.path("images").validate(async (value) => {
  let res = value.every((ele) => {
    return ele.length;
  });
  return value.length && res;
}, "Please Upload valid all product image ");
module.exports = Product;
//CRUD of product with a name, image (Multiple), price, discount price, description, stock
