const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary").v2;

// get all products
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
    // get product by id

const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// create product

const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock } = req.body;
        const image = req.file;
        const imageUrl = ''

        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload(image.path);
        imageUrl = result.secure_url;

        // Create new product
        const product = new Product({
            name,
            description,
            price,
            category,
            stock,
            imageUrl
        });

        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// update product

const updateProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock } = req.body;
        const image = req.file;
        let imageUrl = '';
        const product = await Product.findById(req.params.id);
        if (product) {
            product.name = name || product.name;
            product.description = description || product.description;
            product.price = price || product.price;
            product.category = category || product.category;
            product.stock = stock || product.stock;
        }
        if (image) {

            // Upload new image to Cloudinary
            const result = await cloudinary.uploader.upload(image.path);
            imageUrl = result.secure_url;
            product.imageUrl = imageUrl;
        }else{
            product.imageUrl = product.imageUrl;
        }
        await product.save();
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// delete product
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        await product.deleteOne();
        res.status(200).json({ message: "Product removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { getAllProducts, createProduct, getProductById, updateProduct, deleteProduct };

