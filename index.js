import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(
  "mongodb+srv://asifaminisonline:inventorymanagementsystem@cluster0.g1gqffn.mongodb.net/test",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "vendor",
  },
  category: {
    type: String,
  },
});

const User = mongoose.model("User", userSchema);

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();
    res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Registration Failed" });
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, "_id username email role category");

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

app.delete("/users/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting user" });
  }
});

// Route for updating a user's role by ID
app.put("/users/:userId", async (req, res) => {
  const userId = req.params.userId;
  const { role } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role; // Update the user's role
    await user.save();

    res.status(200).json({ message: "User role updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating user role" });
  }
});

// Route for updating a user's category by ID
app.put("/users/:userId/category", async (req, res) => {
  const userId = req.params.userId;
  const { category } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.category = category; // Update the user's category
    await user.save();

    res.status(200).json({ message: "User category updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating user category" });
  }
});

// +++++++++++++++++++++++++++++++++Product Routes++++++++++++++++++++++++++++++++//

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
  },
  buyNowLink: {
    type: String,
  },
  category: {
    type: String, // Add the category field here
  },
});

const Product = mongoose.model("Product", productSchema);

// Create a new product
app.post("/products", async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating product" });
  }
});

// Get all products
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching products" });
  }
});

// Get a product by ID
app.get("/products/:productId", async (req, res) => {
  const productId = req.params.productId;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching product" });
  }
});

// Update a product by ID
app.put("/products/:productId", async (req, res) => {
  const productId = req.params.productId;

  try {
    const product = await Product.findByIdAndUpdate(productId, req.body, {
      new: true,
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating product" });
  }
});

// Delete a product by ID
app.delete("/products/:productId", async (req, res) => {
  const productId = req.params.productId;

  try {
    const product = await Product.findByIdAndRemove(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting product" });
  }
});

app.get("/products-by-category", async (req, res) => {
  const category = req.query.category; // Get the category from the query parameters

  try {
    if (!category || category === "All") {
      const allProducts = await Product.find();
      res.status(200).json(allProducts);
    } else {
      const filteredProducts = await Product.find({ category: category });
      res.status(200).json(filteredProducts);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching products by category" });
  }
});

// +++++++++++++++++++++++++++++++++End Product Routes++++++++++++++++++++++++++++++++//

// ...

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      const token = jwt.sign(
        { email, role: user.role, category: user.category }, // Include user's category
        "your-secret-key",
        {
          expiresIn: "1h",
        }
      );
      res.status(200).json({ token, category: user.category }); // Include category in the response
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Error logging in" });
  }
});

// Add this new route to get the user's category
app.get("/user-category", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, "your-secret-key");
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ category: user.category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user category" });
  }
});

// In your backend API route
// Import necessary modules and schemas here

// Define an "Order" schema
const orderSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId, // Assuming you're storing product ID
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String, // Assuming you're storing product image URL
    required: true,
  },
});

const Order = mongoose.model("Order", orderSchema);

// In your backend API route
app.post("/orders", async (req, res) => {
  try {
    const { productId, name, address, quantity, price, image } = req.body;

    // Create a new order using the "Order" schema
    const order = new Order({
      productId,
      name,
      address,
      quantity,
      price,
      image,
    });

    // Save the order to the database
    await order.save();

    console.log("Order placed:", order);

    res.status(201).json({ message: "Order placed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error placing order" });
  }
});

app.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching orders" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
