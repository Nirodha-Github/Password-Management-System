const express = require('express');
const mongoose = require('mongoose');
var generator = require('generate-password');
const Password = require('./models/passwordList');
const User = require('./models/userList');
const bodyParser = require('body-parser');
const passwordRoutes = require('./routes/passwordRoutes');
//var cookieParser = require("cookie-parser");
const session = require("express-session");
var morgan = require("morgan");
const path= require('path');

//express app
const app = express();
const router = express.Router();
//connect mongodb
const dbURI = 'mongodb+srv://Nirodha:niro123@cluster0.kfbtx.mongodb.net/PasswordList?retryWrites=true&w=majority'

mongoose.connect(dbURI, { useNewUrlParser:true, useUnifiedTopology:true})
   .then((result) => app.listen(3500))
   .catch((err) => console.log(err));

 
//register view engine
app.set('view engine','ejs');

app.use(session({secret:'keyboard cat',saveUninitialized: true,resave: true}));
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


//signup
app.get("/signup",(req,res)=>{
    res.render("signup", { title:"signup Page"});
});

// Register Handle
app.post('/signup', (req, res) => {
    const { name, email, password, repassword,phonenumber} = req.body;

    // Check required fields
    if(!name || !email || !password || !repassword || !phonenumber){
        console.log('Please fill in all fields');
    }

    // Check if passwords match
    if(password !== repassword) {
        console.log('Passwords do not match');
    }

    // Check password length
    if(password.length < 3) {
        console.log('Password should be at least 8 characters long');
    }

        // Passed Validation
        User.findOne({ email: email })
            .then(user => {
                if(user) {
                    // User exists
                    res.write('<p>Email already registered</p>');

                } else {
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
   
})

var sess; // global session, NOT recommended

// route for user Login
app.get("/login", (req, res) => { 
    res.render('login', { title:"login Page"});
});

// route for user Login
app.post("/login", (req, res) => {
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
                     if(password=== user.password){
                        
                       // sess = req.session;
                       // sess.email = user.email;                       
                        res.redirect('/secret');
                        
                         
                     }
                     else{
                        res.write('password incorrect');
                     }

                }
            })
            .catch(err=>{
              console.log(err);
            })
   
});

app.get('/',(req,res)=>{       
    res.render('index', { title:"Home Page" });   
});

// app.get('/',(req,res) => {
//     sess = req.session;
//     if(sess.email) {
//         res.redirect('/secret');
        
//     }
//     res.redirect('/index'); 
// });


app.get('/secret',(req,res)=>{ 
//    const id= req.params.id;
   
//     User.findById(id)
//       .then(result=>{    
         res.render('secret', { title:"Home Page"}); 
         
    //  })    
    //   .catch(err=>{
    //     console.log(err);
    //   })
    
});

app.get('/profile',(req,res)=>{    
  sess = req.session;
  
    if(sess.email){
       res.render('userprofile',{title:'profile page'});
    }
       
   else{
       console.log(req.body.session);
   }
      
     
  });

app.get('/logout',(req,res) => {
    req.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        res.redirect('/');
    });

});


//dont change below codes
app.get('/detalis',(req,res)=>{     
        res.redirect('/check');
  });

app.use('/details', passwordRoutes);

//generator
app.get('/generate',(req,res)=>{
  res.render('generate', { title:"Generate Passwords"});
});

//404
app.use((req,res)=>{
   res.render('404', { title:"404" });
});


// app.get('/',(req,res)=>{     
    
//     res.render('index', { title:"Home Page" });
    
// });

// app.get('/secret',(req,res)=>{ 
//    const id= req.params.id;
//     User.findById(id)
//       .then(result=>{    
//          res.render('secret', { title:"Home Page",profiledata:result }); 
         
//      })    
//       .catch(err=>{
//         console.log(err);
//       })
    
// });


// // route for user Login
// app.post("/login", (req, res) => {
//     const {username, password} = req.body;

//     // Check required fields
//     if(!username || !password){
//         console.log('Please fill in all fields');
//     }

//         // Passed Validation
//     User.findOne({ email: username })
//             .then(user => {
//                 if(user) {
//                     // User exists
//                      if(password== user.password){
//                          res.redirect('/secret');
                         
//                      }
//                      else{
//                         res.write('password incorrect');
//                      }

//                 }
//             })
//             .catch(err=>{
//               console.log(err);
//             })
   
// });


//Auth Routes

// route for user logout


/*app.get('/profile',(req,res)=>{    
 
  const {name,email,password,phonenumber} = req.body;

  User.findOne({email:email})
    .then((profile=>{
       res.render('userprofile',{title:'profile page',profile:profile});
    }))
    .catch(err=>{
      console.log(err);
    })   
  });
*/

//password routes


