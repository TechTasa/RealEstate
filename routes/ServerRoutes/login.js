//More Readable Login.js
const express = require("express");
const { redirect } = require("express/lib/response");
const { MongoClient } = require("mongodb");
const router = express.Router();
const bcrypt = require("bcrypt");
const { connect, getCollection } = require("../../db");
const path = require("path");

(async () => {
  try {
    // Get a reference to the users collection
    const userCollection = await getCollection("users");

    // Define the /login endpoint for GET requests
    router.get("/login", (req, res) => {
      // Display the login File
      res.sendFile(
        path.join(__dirname, "..", "../", "public", "pages", "login.html")
      );
    });

    router.post("/login", async (req, res) => {
      const data = req.body;
    
      // Check if the login field is provided
      if (!data.name) {
        return res.status(400).send("Please enter username, email address, or phone number.");
      }
    
      // Attempt to find the user based on the provided value
      let user = await userCollection.findOne({ $or: [{ name: data.name }, { email: data.name }, { phone: data.name }] });
    
      if (!user) {
        return res.status(401).send("Invalid login credentials.");
      }
    
      const isPasswordValid = await bcrypt.compare(
        data.password,
        user.password
      );
    
      if (!isPasswordValid) {
        return res.status(401).send("Invalid login credentials.");
      }
    
      console.log("Login successful for user:", user);
      req.session.isAuthenticated = true;
      req.session.username = user._id;
      req.session.role = user.role;
      req.session.save((err) => {
        if (err) {
          console.log(err);
          return res.status(500).send("Internal Server Error"); // Handle error more gracefully
        } else {
          if (user.role == "admin") {
            console.log(`Admin account redirected to dashboard ${user.role}`);
            res.redirect("/dashboard");
          } else if (user.role == "visitor") {
            console.log(`Visitor account redirected to landing ${user.role}`);
            res.redirect("/");
          } else if (user.role == "company") {
            console.log(`Company account redirected to landing ${user.role}`);
            res.redirect("/");
          } else {
            // Handle unexpected role scenario (optional)
          }
        }
      });
    });
    
  } catch (error) {
    console.error("Error in login route:", error);
    res.status(500).send("Internal server error");
  } finally {
  }
})();

module.exports = router;
