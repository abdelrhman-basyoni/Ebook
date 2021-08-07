const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator');
const {cloudinary} = require('../config/cloudinary');
const AuthorSchema = new mongoose.Schema({
    authorname:{
        type:String,
        required:[true, "please enter author name"],
        unique:true
    }
});

const CategorySchema = new mongoose.Schema({
    categoryname:{
        type:String,
        required:[true, "please enter category name"],
        unique:true
    }
});

const BookSchema = new mongoose.Schema({
    bookname:{
        type:String,
        required:[true, "please enter bookname"],

    },
    salescount:{
        type:Number,
        default:0
    },
    bookcover:{
        type:String,
        required:[true, "book cover is missing"],
    },
    bookcover_public_id:{
        type:String,
    },
    price:{
        type:Number,
        required:[true, "please enter the book price"]
    },
    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref : 'Author',

    },
    publisher:{
        type: mongoose.Schema.Types.ObjectId,
        ref : 'User',

    },
    categories:[{
        type: mongoose.Schema.Types.ObjectId,
        ref : 'Category',
    }],







});
// delte the image if it got deleted
BookSchema.post('remove', async () => {
    cloudinary.uploader.destroy(`${this.bookcover_public_id}`,(result) =>{
        console.log(`image of id ${this.bookcover_public_id} has been deleted`)
        console.log(result);

    })

})
BookSchema.plugin(uniqueValidator, { message: 'Error, expected {PATH} to be unique.' });
AuthorSchema.plugin(uniqueValidator, { message: 'Error, expected {PATH} to be unique.' });
CategorySchema.plugin(uniqueValidator, { message: 'Error, expected {PATH} to be unique.' });
module.exports = {
   Author: mongoose.model('Author',AuthorSchema),
   Category: mongoose.model('Category',CategorySchema),
   Book: mongoose.model('Book',BookSchema),
}