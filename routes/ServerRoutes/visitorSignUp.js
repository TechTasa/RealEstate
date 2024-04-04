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
    router.get("/visitorSignUp", (req, res) => {
      // Display the login File
      res.sendFile(
        path.join(
          __dirname,
          "..",
          "../",
          "public",
          "pages",
          "visitorSignUp.html"
        )
      );
    });

    // // Define the /register endpoint for POST requests
    // router.post("/visitorSignUp", async (req, res) => {
    //   // Get the data from the request body
    //   const data = req.body;

    //   // Hash the password
    //   const hashedPassword = await bcrypt.hash(data.password, 10);
    //   // Insert the data into the collection
    //   data.cart = [];
    //   console.log(data);
    //   const result = await userCollection.insertOne({
    //     ...data,
    //     password: hashedPassword,
    //   });
    //   console.log(`Data inserted with _id: ${result} ${data}`);
    //   res.redirect("/login");
    // });
    router.post("/visitorSignUp", async (req, res) => {
      const data = req.body;
    
      // Check for existing username, phone, or email
      const existingUser = await userCollection.findOne({ $or: [
        { name: data.name },
        { phone: data.phone },
        { email: data.email },
      ] });
    
      if (existingUser) {
        // Display error message with specific fields in use (using a popup with client-side JavaScript is recommended)
        const message = [];
        if (existingUser.name === data.name) message.push("username");
        if (existingUser.phone === data.phone) message.push("phone");
        if (existingUser.email === data.email) message.push("email");
        const fieldsInUse = message.join(", "); // Combine fields for the message
    
        // Option 1: Send error message as JSON for client-side handling
        return res.status(400).json({ error: `The ${fieldsInUse} is already linked to another account.` });
    
        // Option 2: Redirect with error message (less secure, requires additional client-side logic)
        // return res.redirect(`/register?error=${fieldsInUse} already in use`);
      }
    
      // Continue with signup if no existing user found
      const hashedPassword = await bcrypt.hash(data.password, 10);
      data.cart = [];
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
