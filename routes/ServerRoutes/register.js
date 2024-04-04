const express = require("express");
const { MongoClient } = require("mongodb");
const router = express.Router();
const bcrypt = require("bcrypt");
const { connect, getCollection } = require("../../db");
const path = require("path");

(async () => {
  try {
    // Get a reference to the users collection
    const userCollection = await getCollection("users");

    // Define the /register endpoint for GET requests
    router.get("/register", (req, res) => {
      // Display the login File
      res.sendFile(
        path.join(__dirname, "..", "../", "public", "pages", "register.html")
      );
    });

    // // Define the /register endpoint for POST requests
    // router.post("/register", async (req, res) => {
    //   // Get the data from the request body
    //   const data = req.body;

    //   // Hash the password
    //   const hashedPassword = await bcrypt.hash(data.password, 10);

    //   // Insert the data into the collection
    //   const result = await userCollection.insertOne({
    //     ...data,
    //     password: hashedPassword,
    //   });
    //   console.log(`Data inserted with _id: ${result.insertedId}`);
    //   res.redirect("/login");
    // });
    router.post("/register", async (req, res) => {
      const data = req.body;
    
      // Check for existing username, phone, or email
      const existingUser = await userCollection.findOne({ $or: [
        { name: data.name },
        { phone: data.phone },
        { email: data.email },
      ] });
    
      if (existingUser) {
        // Display error message with specific fields in use
        const message = [];
        if (existingUser.name === data.name) message.push("username");
        if (existingUser.phone === data.phone) message.push("phone");
        if (existingUser.email === data.email) message.push("email");
        const fieldsInUse = message.join(", "); // Combine fields for the message
        return res.status(400).send(`The ${fieldsInUse} is already linked to another account.`);
      }
    
      // Hash the password (assuming password field exists)
      const hashedPassword = await bcrypt.hash(data.password, 10);
    
      // Insert the data into the collection with hashed password
      const result = await userCollection.insertOne({
        ...data,
        password: hashedPassword,
      });
    
      console.log(`Data inserted with _id: ${result.insertedId}`);
      res.redirect("/login"); // Or other appropriate redirection based on your application logic
    });
    
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
})();

module.exports = router;
