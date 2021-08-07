const express = require('express');
const router = express.Router();
const {Book} = require('../models/Book');

router.get('/', async (request,response)=>{
    const bestseller = await Book.find().sort({salescount: -1}).limit(4);
    const newbooks = await Book.find().sort({_id: -1}).limit(4) ;
    
    response.json({
        status:process.env.STATUS_SUCCESS,
        message:'success',
        data:{
            bestseller,
            newbooks
        }
    });
});






module.exports = router