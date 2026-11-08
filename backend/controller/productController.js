const Product = require("../routes/models/Product");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// get all products
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

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

        if (!image) {
            return res.status(400).json({ message: "Product image is required" });
        }

        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload(image.path);
        const imageUrl = result.secure_url;

        // Clean up temporary upload file if exists
        if (image.path && fs.existsSync(image.path)) {
            try { fs.unlinkSync(image.path); } catch (e) { /* ignore cleanup error */ }
        }

        // Create new product
        const product = new Product({
            name,
            description,
            price: Number(price),
            category,
            stock: Number(stock),
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
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (name) product.name = name;
        if (description) product.description = description;
        if (price !== undefined) product.price = Number(price);
        if (category) product.category = category;
        if (stock !== undefined) product.stock = Number(stock);

        if (image) {
            // Upload new image to Cloudinary
            const result = await cloudinary.uploader.upload(image.path);
            product.imageUrl = result.secure_url;

            // Clean up temporary upload file if exists
            if (image.path && fs.existsSync(image.path)) {
                try { fs.unlinkSync(image.path); } catch (e) { /* ignore cleanup error */ }
            }
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
};

module.exports = { getAllProducts, createProduct, getProductById, updateProduct, deleteProduct };
