const express = require('express');
const mongoose = require('mongoose');
var generator = require('generate-password');
const Password = require('./models/passwordList');
const User = require('./models/userList');
const bodyParser = require('body-parser');
const passwordRoutes = require('./routes/passwordRoutes');
//var cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoDBsession = require("connect-mongoDB-session")(session);
const bcrypt =  require('bcrypt');
var morgan = require("morgan");
const path= require('path');
//express app
const app = express();
const router = express.Router();
//connect mongodb
const dbURI = 'mongodb+srv://Nirodha:niro123@cluster0.kfbtx.mongodb.net/PasswordList?retryWrites=true&w=majority'

mongoose.connect(dbURI, { useNewUrlParser:true,useCreateIndex:true,useFindAndModify: false  ,useUnifiedTopology:true})
   .then((result) => app.listen(3500))
   .catch((err) => console.log(err));

 
//register view engine
app.set('view engine','ejs');

const store =  new MongoDBsession({
    uri:dbURI,
    collection:"mySessions",
});

app.use(session({secret:'keyboard cat',saveUninitialized:false,resave: false,store:store}));
app.use(bodyParser.json());  

//app.listen(3500);
app.use(express.urlencoded({extended: true}));

app.use(express.static('public'));

var passwords = generator.generateMultiple(5, {
	length: 8,
	uppercase: true,
    numbers:true,

});

app.use(morgan("dev"));

//app.use(cookieParser());
const isAuth = (req,res,next)=>{
   if(req.session.isAuth){
       next()
   }
   else{
       res.redirect('/login');
   }
}

//signup
app.get("/signup",(req,res)=>{
    res.render("signup", { title:"signup Page"});
});

// Register Handle
app.post('/signup', async (req, res) => {
    const { name, email, password, repassword,phonenumber} = req.body;

    // Check required fields
    if(!name || !email || !password || !repassword || !phonenumber){
        console.log('Please fill in all fields');
    }

    // Check if passwords match
    else if(password !== repassword) {
        console.log('Passwords do not match');
    }

    // Check password length
    else if(password.length < 8) {
        console.log('Password should be at least 8 characters');
    }

        // Passed Validation
    else { User.findOne({ email: email })
            .then(user => {
                if(user) {
                    // User exists
                    res.send('<p>Email already registered</p>');
                    res.redirect('/signup');

                } else {
                   // const hashedPw = bcrypt.hash(password,10);
                    const userdata = new User(req.body);
                    
                    userdata.save()
                      .then(result=>{
                           res.redirect("/login");
                        })
                      .catch((err) =>{
                         console.log(err);
         });
                }
            }
)            
            .catch(err=>{
              console.log(err);
            })
    }
})

//var sess; // global session, NOT recommended

// route for user Login
app.get("/login", (req, res) => { 
    res.render('login', { title:"login Page"});
});

// route for user Login
app.post("/login", async (req, res) => {
    const {email, password} = req.body;
 
    // Check required fields
    if(!email || !password){
        console.log('Please fill in all fields');
        
    }

        // Passed Validation
    User.findOne({ email: email })
            .then(user => {
                if(user) {
                    // User exists
                    bcrypt.compare(password, user.password, function(err, isMatch) {
                    if (err) {
                        throw err
                    } else if (!isMatch) {
                        console.log("Password incorrect!");
                        res.redirect('/login')
                    } else {
                        req.session.isAuth = true;   
                        req.session.user = user;                                   
                        res.redirect('/secret');
                    }
                    })

                }
                if(!user){
                    res.redirect('/login');
                    console.log('new member');
                }
            })
            .catch(err=>{
              console.log(err);
            })}
   
);

app.get('/secret',isAuth,(req,res)=>{ 
   res.render('secret', { title:"Home Page",profiledata:req.session.user}); 
  
});

//all details
app.get('/detalis',(req,res,next)=>{    
    res.redirect('/check');
  });

app.use('/details', passwordRoutes);

app.get('/:id',(req,res)=>{   
   //const id = req.params.id;

   User.findById(req.session.user._id)
    .then((result) =>{
     
       res.render('userprofile',{title:'profile page',profiledata:req.session.user});
    })
    .catch((err) =>{
      console.log(err);
    });
}  
    

  );

//profile data update
app.post('/:id',(req,res,next)=>{     
   let updatedProfile = {
      name:req.body.name,
      email:req.body.email,
      phonenumber:req.body.phonenumber
    }

   User.findByIdAndUpdate(req.session.user._id, {$set: updatedProfile},{ new: true })
    .then((result) =>{
       req.session.user = result;
       console.log(req.session.user);
       res.redirect('/'+req.session.user._id);   
       
    })
    .catch((err) =>{
      console.log(err);
    });
});



/*app.delete('/:id',(req,res,next)=>{
    
  User.findByIdAndRemove(req.session.user._id)
  .then((result) =>{
    res.json({redirect:'/'+req.session.user._id});
  })
  .catch((err) =>{
    console.log(err);
  });
})
*/

//logout session
app.get('/logout',(req,res) => {
    req.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        res.redirect('/');
    });

});


app.get('/',(req,res)=>{  
    res.render('index', { title:"Home Page" });   
});


//404
app.use((req,res)=>{
   res.render('404', { title:"404" });
});


