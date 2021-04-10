const express = require('express');
const Password = require('../models/passwordList');
const passwordcontroller = require("../controllers/passwordControllers.js");
const router = express.Router();

//redirects
router.get('/add',passwordcontroller.password_create_get);

router.post('/',passwordcontroller.password_create_post);


router.get('/', passwordcontroller.password_details);

/*router.get('/single-password-edit/:id',(req,res)=>{
  const id = req.params.id;
  var body=req.body;
  
   Password.findById(id)
    .then((body) =>{
       res.render('edit', { title:"All Blogs", selection:body })
    })
    .catch((err) =>{
      console.log(err);
    });
})*/

router.post('/:id',passwordcontroller.password_update);

router.get('/:id',passwordcontroller.password_single);

router.delete('/:id',passwordcontroller.password_delete);


module.exports = router;