const express = require('express');
const mongoose = require('mongoose');
const app = express()
// imports the connection function from db.js
const { connectToDb } = require('./db');

connectToDb();

//  Connecting Database
//mongoose.connect('mongodb://localhost:27017/cat_blog')
    //.then(() => console.log("MongoDB Connected Successfully")) 
    //.catch(err => console.log("Database Error:", err));
    

    //Middleware that allows us to read from the data
app.use(express.urlencoded({ extended: true })); 
//settings
app.set('view engine', 'ejs');

// informs where to search for the css files
app.use('/css', express.static(__dirname + '/css')); 

// Models

const Post = mongoose.model('Post', { 
    title: String, 
    content: String, 
    image: String 
});

const Breed = mongoose.model('Breed', {
    name: String,
    description: String,
    temperament: String,
    reference_image_id: String
});

//Main Page
app.get('/', async (req, res) => {
  try {
    // Helps to grab the most recent post based on the _id 
    const posts = await Post.find({}).sort({ _id: -1 });
    res.render('index', { posts: posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.render('index', { posts: [] });
  }
});

//Posting Page
app.get('/admin', (req, res) => {
  res.render('admin');
});


app.post('/admin', async (req, res) => {
  const { title, content, image } = req.body;
  //saves data to MongoDB
  await new Post({ title, content, image }).save();
  res.redirect('/');
});

// Breeds Page
app.get('/breeds', async (req, res) => {
    try {
      // Grabs the searched term by user
        const search = req.query.search || "";
        
        // Checks if there is already this cat in MongoDB using regex
        const localBreeds = await Breed.find({
            name: { $regex: search, $options: 'i' }
        });

        // If there is none then search in API
        if (localBreeds.length === 0 && search !== "") {
            
            // fetches data from cat API
            const response = await fetch(`https://api.thecatapi.com/v1/breeds/search?q=${search}`);

            // Checks for an error
            if (!response.ok) {
                throw new Error("Could not fetch Data from a cat API");
            }

            //acts as a translator between APIs data and JS 
            const data = await response.json();

            if (data.length > 0) {
                //Applying the data to existing schema
                const newCat = new Breed({
                    name: data[0].name,
                    description: data[0].description,
                    temperament: data[0].temperament,
                    reference_image_id: data[0].reference_image_id
                });

                // Saves it to MongoDB
                await newCat.save();
                
                // Refreshes in order to show newly saved Cat
                return res.redirect(`/breeds?search=${search}`);
            }
        }

        // Renders the page with the returned result
        res.render('breeds', { breeds: localBreeds, searchTerm: search });

    } catch (error) {
        // catches an error
        console.error("Fetch Error:", error);
        res.status(500).send("Error fetching cat data");
    }
});


const PORT = process.env.PORT || 3019;

// starts the server and listens

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
