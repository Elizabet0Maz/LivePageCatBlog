// Import mongoose library
const mongoose = require('mongoose');

// function that manages the database connection
const connectToDb = async () => {
const dbURI = 'mongodb+srv://Elimasvika:Elmin%401UCY2005@cluster0.wdhopoc.mongodb.net/cat_blog?retryWrites=true&w=majority&appName=Cluster0';

    try {
        // attempts to connect to the database
        await mongoose.connect(dbURI);
        console.log("Database Connected Successfully");
    } catch (err) {
        // log the error if connection fails
        console.error("Database Connection Error:", err);
        // exit if cannot connect
        process.exit(1);
    }
};

// exporta the function so server.js can use it
module.exports = { connectToDb };