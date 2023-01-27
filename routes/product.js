const express = require("express");
const router = express.Router();
const Product = require("../models/product");

//create
router.post("/create", async (req, res) => {
  const data = req.body;
  const product = new Product(data);
  try {
    await product.save();
    console.log("Product: " + product);
    res.json({
      msg: "product create successfully",
      request: {
        type: "GET",
        url: "http://localhost:4500/product/" + product._id,
      },
    });
  } catch (e) {
    res.json({
      Error: e.message,
    });
  }
});
//read
router.get("/:id", async (req, res) => {
  const prodId = req.params.id;

  if (!prodId) {
    res.json({
      msg: "Enter Product Name",
    });
  } else {
    const product = await Product.findById({ _id: prodId });

    console.log(product);
    try {
      if (!product) {
        res.json({
          msg: "Prodcut not found",
        });
      } else {
        res.json({
          data: product,
          request: {
            msg: "to see all products",
            type: "GET",
            url: "http://localhost:4500/products",
          },
        });
      }
    } catch (e) {
      res.json({
        Error: e.message,
      });
    }
  }
});

//update
router.post("/edit/:id", async (req, res) => {
  const proId = req.params.id;
  // const disPrice = req.body.discountPrice;
  //   const product = await Product.find({ name: prodouctName });
  //   console.log(product);
  try {
    await Product.findOneAndUpdate({ _id: proId }, { $set: req.body });
    //   await product.save();
    //console.log(product);
    res.json({
      msg: "product updated successfully",
    });
  } catch (e) {
    res.json({
      Error: e.message,
    });
  }
});
//delete product
router.post("/delete/:id", async (req, res) => {
  const prodId = req.params.id;

  try {
    await Product.findByIdAndDelete({ _id: prodId });

    res.json({
      msg: "product deleted successfully>>",
      //status: product.acknowledged,
    });
  } catch (e) {
    console.log(e);
    res.json({
      Msg: "Some Error",
    });
  }
});

//buy
router.post("/buy/:id", async (req, res) => {
  const proId = req.params.id;

  try {
    let product = await Product.findById({ _id: proId });
    if (product) {
      await Product.findByIdAndUpdate({ _id: proId }, { $inc: { stock: -1 } });

      product = await Product.findById({ _id: proId });
      console.log(product);
      if (product.stock > 0) {
        res.json({
          msg: "product In stock",
          stock: product.stock,
        });
      } else {
        res.json({
          msg: "product out of stock",
        });
      }
    } else {
      res.json({
        msg: "product doesn't exists",
      });
    }
  } catch (e) {
    res.json({
      Error: e.message,
    });
  }
});

//all products
//pagination
//localhost:4500/product?page=0&limit=5

router.get("/", async (req, res) => {
  console.log(req.query.page, req.query.limit);
  let pages = req.query.page;
  pages = parseInt(pages) || 0;
  let limit = req.query.limit;
  limit = parseInt(limit) || 10;

  try {
    let products = await Product.find()
      .skip(pages * limit)
      .limit(limit);

    res.json({
      data: products.map((p, i, arr) => {
        return {
          //data: arr,
          product: {
            request: {
              type: "GET",
              url: "http://localhost:4500/product/" + p._id,
            },
            name: p.name,
            price: p.discountPrice,
            stock: p.stock,
          },
        };
      }),
    });
  } catch (e) {
    res.json({
      Error: e.message,
    });
  }
});

module.exports = router;
