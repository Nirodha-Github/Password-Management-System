const express = require('express');
const mongoose = require('mongoose');
var generator = require('generate-password');
const Password = require('./models/passwordList');
const User = require('./models/userList');
const bodyParser = require('body-parser');
const passwordRoutes = require('./routes/passwordRoutes');
const sendEmail = require('./email/email');
//var cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoDBsession = require("connect-mongoDB-session")(session);
const bcrypt =  require('bcrypt');
const crypto = require('crypto');
var morgan = require("morgan");
//const path= require('path');


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
    else{ User.findOne({ email: email })
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
            })
        }
}
   
);

app.get('/secret',isAuth,(req,res)=>{ 
   res.render('secret', { title:"Home Page",profiledata:req.session.user}); 
  
});

//all details
app.get('/detalis',(req,res,next)=>{    
    res.redirect('/check');
  });

app.use('/details', passwordRoutes);

app.get('/profile',(req,res)=>{   
   //const id = req.params.id;

   User.findById(req.session.user._id)
    .then((result) =>{
      if(!result){
          console.log('new member');
      }
       res.render('userprofile',{title:'profile page',profiledata:req.session.user});
    })
    .catch((err) =>{
      console.log(err);
    });
}  
    

  );

//profile data update
app.post('/profile',(req,res,next)=>{     
   let updatedProfile = {
      name:req.body.name,
      email:req.body.email,
      phonenumber:req.body.phonenumber
    }

   User.findByIdAndUpdate(req.session.user._id, {$set: updatedProfile},{ new: true })
    .then((result) =>{
       req.session.user = result;
       
       res.redirect('/profile');   
       
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
app.post('/logout',(req,res) => {
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

app.get('/forgotPassword',(req,res)=>{  
    res.render('forgotPassword', { title:"Forgot Password Page" });   
});

app.post('/forgotPassword',async(req,res,next)=>{  
    //1.get user based on posted email
    const user = await User.findOne({email:req.body.email});

    if(!user){
        console.log('There is no emali');
    }
 
    //2.generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave:false});

    //3. send it to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/resetPassword/${resetToken}`;

    const message  = `forgot your password? Submit a patch request with your new password and repassword to :\n${resetURL} \nIf you did not forget tour password,please ignore this email`;
  
    try{
        await sendEmail({
        email:user.email,
        subject:'Your password reset token (valid for 10 min)',
        message,
        
    });
       console.log('email sent!');
       res.redirect('/forgotPassword')

    }catch(err){
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave:false});
      //  console.log(err);
    }
    //res.render('index', { title:"Home Page" });   
});

app.get('/resetPassword/:token',(req,res,next)=>{  
    const token = req.params.token;
  
    // User.findOne({token:token})
    //    .then(() =>{  
             res.render('resetPassword', { title:"Reset Password Page",tokendata:token});        
    //    })
    //    .catch(err=>{
    //        console.log(err);
    //    })
    
     
});


app.post('/resetPassword/:token',async (req,res,next)=>{  

    
    //1.get user based on the token
    const hashedToken =  crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({passwordResetToken:hashedToken,passwordResetExpires:{$gt:Date.now()}});

    //2.If token has not expired,and there is user,set the new password
    if(!user){
        console.log('Token is invalid or has expected');
    }

 
   if(req.body.password===req.body.repassword){
        
       user.password = req.body.password;
       user.repassword = req.body.repassword;

       await user.save();
   
   }
   
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;


    //.3Update changePasswordAt property for the user
    //4.log te user in,send JWT
   const token = user._id;
   
    // res.status(200).json({
    //     status:'success',
    //     token
    // });
    console.log('success');
    res.redirect('/login');
    
});

//404
app.use((req,res)=>{
   res.render('404', { title:"404" });
});


