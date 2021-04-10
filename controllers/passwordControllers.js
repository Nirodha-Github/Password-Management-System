const Password = require('../models/passwordList');
const bcrypt = require('bcrypt');

//redirects
const password_create_get = (req,res) => {
    res.render('add', { title:"Create a new password"});    
}

//insert data
const password_create_post =  (req,res) =>{
 
 // const passwordHash = await bcrypt.hash(req.body.password,10);
 
  const passwords = new Password(req.body);
   passwords.save()
    .then(result=>{
      res.redirect('/details');
    })
    .catch((err) =>{
      console.log(err);
    });
}

//view all data
const password_details = (req,res,next) =>{
  Password.find().sort({createdAt:-1})
  .then((result) =>{
    res.render('check', { title:"All passwords", details:result });
  })
  .catch((err) =>{
    console.log(err);
  });
} 

//view single data
const password_single = (req,res)=>{
  const id = req.params.id;

   Password.findById(id)
    .then((result) =>{
       res.render('singlePassword', { title:"All Blogs", selection:result })
    })
    .catch((err) =>{
      console.log(err);
    });
}

//update data
const password_update = (req,res,next)=>{
  const id = req.params.id;

    let updatedData = {
      website:req.body.website,
      username:req.body.username,
      password:req.body.password
    }

   Password.findByIdAndUpdate(id, {$set: updatedData},{ new: true })
    .then((result) =>{
       res.redirect('/details');
    })
    .catch((err) =>{
      console.log(err);
    });
}

//delete data
const password_delete = (req,res) =>{
  const id = req.params.id;
  Password.findByIdAndRemove(id)
  .then((result) =>{
    res.json({redirect:'/details'});
  })
  .catch((err) =>{
    console.log(err);
  });
}


module.exports = {
    password_create_get,
    password_create_post,
    password_details,
    password_update,
    password_single,
    password_delete,

};