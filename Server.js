import mongoose from 'mongoose'
import express from 'express'
import multer from 'multer';
import path from 'path';
import { config } from 'dotenv';

// env setup 
config({path:'.env'})

import { v2 as cloudinary } from 'cloudinary';

  // Configuration
  cloudinary.config({ 
    cloud_name: 'dne1k25yx', 
    api_key: '253549964422943', 
    api_secret: 'bTGMpqS4QfCs-Vjrzb02d4IzRV8' // Click 'View API Keys' above to copy your API secret
});

const  app = express()

app.use(express.urlencoded({extended:true}))

// mongoose.connect(
//         "mongodb+srv://codesnippet02:nq0sdJL2Jc3QqZba@cluster0.zmf40.mongodb.net/",
//         {
//         dbname : "Node_js_mastery_course"
//     }
// ).then(()=>console.log("Mongo db is connected...!")).catch((err)=>console.log(err))


mongoose.connect(  process.env.MONGO_URI, {
  dbName: 'NodeJs_Mastery_Course'
})
.then(() => {
  console.log("✅ Connected to MongoDB");
})
.catch((err) => {
  console.error("❌ MongoDB connection error:");
  console.error(err); // This shows the full error object
});

const port = 3000

// rendering login file

app.get('/',(req,res )=>{
res.render("login.ejs",{url:null})
})

// rendering register file

app.get('/register',(req,res )=>{
    res.render("register.ejs",{url:null})
    })



const storage = multer.diskStorage({
      destination: './public/uploads',
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + path.extname(file.originalname);
        cb(null, file.fieldname + "-" + uniqueSuffix);
      },
    });
    
    const upload = multer({ storage: storage });


    const UserSchema = new mongoose.Schema({
      name:String,
      email:String,
      password:String,
      filename: String,
      public_id: String,
      imgUrl: String,
    });

    
const User = mongoose.model("User", UserSchema);

app.post("/register", upload.single("file"), async (req, res) => {
  
    const file = req.file.path;
    const { name, email, password } = req.body;

    const cloudinaryRes = await cloudinary.uploader.upload(file, {
      folder: "NodeJS_Mastery_Course",
    });

    const db = await User.create({
      name,
      email,
      password,
      filename: req.file.originalname,
      public_id: cloudinaryRes.public_id,
      imgUrl: cloudinaryRes.secure_url,
    });

   


    res.redirect("/");

   
  
   
  });
  

  app.post('/login',async(req,res)=>{
    const{email,password} = req.body;

    let user = await User.findOne({email});
    if(!email) res.render("login.ejs");
    else if (user.password != password){
      res.render("login.ejs");
    }
    else {
      res.render('profile.ejs',{user})
    }
  })

  

  



app.listen(port,()=>console.log(`server is running at ${port}`))