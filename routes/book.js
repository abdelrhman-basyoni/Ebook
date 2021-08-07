
const express = require('express');
const router = express.Router();
const ErrorResponse = require('../utils/errorResponse');
const { ensurePublisher, requiredFields } = require('../middleware/auth');
const config = require('../utils/config.json')

const { Book, Author, Category } = require('../models/Book');
const { cloudinary } = require('../config/cloudinary');



// add book API
// method POST
const reqFields = ['bookname', 'bookauthor', 'bookcategories', 'price']
router.post('/add', ensurePublisher, requiredFields(reqFields), async (request, response, next) => {

    try {
        // get fields and files
        const { bookname, bookauthor, price, bookcategories } = request.body;
        const { bookcover } = request.files;

        // check if the image is loaded
        if (!bookcover) {
            return next(new ErrorResponse('Book cover image is missing', 200));
        }
        var bookcoverUrl;
        var bookcover_public_id;

        // upload to cloduinary
        await cloudinary.uploader.upload(bookcover.path, { folder: "nodejs/images/bookcovers" }, (error, result) => {
            if (error) {
                console.log(error)
            }
            //set the image url and its publick id values
            bookcoverUrl = result.secure_url
            bookcover_public_id = result.public_id;
        })

        //create author or find it
        let author = await Author.findOne({ authorname: bookauthor })
        if (!author) {
            author = await Author.create({ authorname: bookauthor });
        }
        //extract the categories
        let categories = await bookcategories.split(',');

        //create the book
        const book = await Book.create({
            bookname,
            bookcover: bookcoverUrl,
            bookcover_public_id: bookcover_public_id,
            price,
            author: author,
            publisher: request.user,
            categories: categories,
        })

        if (!book) {
            return next(new ErrorResponse('an error has occured', 200));
        }





        response.json({
            status: config.status_success,
            message: 'success',
            data: book
        });
    } catch (error) {
        return next(new ErrorResponse(`${error}`, 200));
    }


});

// get categories API
// method get
router.get('/categories', async (request, response, next) => {
    try {
        let categories = await Category.find({});
        response.json({
            status: config.status_success,
            message: 'success',
            data: categories,

        });

    } catch (error) {
        return next(new ErrorResponse(`${error}`, 200));
    }

})

// get book with id API
// method get 
router.get('/get/:bookId', async (request, response, next) => {
    const bookId = request.params.bookId;
    const book = await Book.findOne({ _id: bookId }).catch((error) => {
        return next(new ErrorResponse('invalid book id', 200));
    });
    if (book) {
        response.json({
            status: process.env.STATUS_SUCCESS,
            message: 'success',
            data: book

        })
    }
    else {
        return next(new ErrorResponse('invalid book id', 200));
    }

});

//delete book API
//metho delete
router.delete('/delete/:bookId', ensurePublisher, async (request, response, next) => {
    const bookId = request.params.bookId;
    const res = await Book.deleteOne({ _id: bookId, publisher: request.user }).catch((error) => {
        return next(new ErrorResponse('invalid book id', 200));
    });
    if (res.ok === 1) {
        response.json({
            status: process.env.STATUS_SUCCESS,
            message: 'book has been deleted',
            data: {}

        })
    }
    else {
        return next(new ErrorResponse('invalid book id', 200));
    }

});


//update book API
//method patch
router.patch('/update/:bookId', ensurePublisher, async (request, response, next) => {
    const bookId = request.params.bookId;
    const book = request.body;
    const { bookcover } = request.files;

    //if he uploaded new pic then upload it and save it in the book query
    if (bookcover) {
        // upload to cloduinary
        await cloudinary.uploader.upload(bookcover.path, { folder: "nodejs/images/bookcovers" }, (error, result) => {
            if (error) {
                console.log(error)
            } else {
                //set the image url and its publick id values
                book['bookcover'] = result.secure_url
                book['bookcover_public_id'] = result.public_id;
            }

        })

    }

    //cleare any field without data in it
    Object.keys(book).forEach(key => {
        if (book[key] === '') {
            delete book[key];
        }

    })

    const newbook = await Book.findOneAndUpdate({ _id: bookId, publisher: request.user }, book).catch((error) => {
        console.log(error)
        return next(new ErrorResponse('invalid book id', 200));
    });

    if (newbook) {
        response.json({
            status: process.env.STATUS_SUCCESS,
            message: 'success',
            data: newbook

        })
    }
    else {
        return next(new ErrorResponse('invalid book id', 200));
    }

});


// get book by categories API
// method get
router.get('/categorybooks/:catID/p=:pagenumber', async (request, response, next) => {
    if (request.params.pagenumber <= 0) {
        return next(new ErrorResponse('invalid page number', 200));
    }
    try {
        let skip = (request.params.pagenumber - 1) * 200; // 20 books per page
        const books = await Book.find({ categories: request.params.catID }).select(['-bookcover_public_id'])
        .populate(
            'author', { 'authorname': 1,'_id':0 }
        ).populate(
            'publisher', { 'username': 1,'_id':0 }
        ).populate(
            'categories', { 'categoryname': 1,'_id':0 }
        ).skip(skip).limit(2);


        response.json({
            status: process.env.STATUS_SUCCESS,
            message: 'success',
            data: books

        });
    } catch (error) {
        next(error)

    }



});


// get publiosher books API
// method get
router.get('/publisherbooks/p=:pagenumber', ensurePublisher, async (request, response, next) => {
    if (request.params.pagenumber <= 0) {
        return next(new ErrorResponse('invalid page number', 200));
    }
    try {
        let skip = (request.params.pagenumber - 1) * 200; // 20 books per page
        const books = await Book.find({ publisher: request.user }).select(['-bookcover_public_id'])
            .populate(
                'author', { 'authorname': 1,'_id':1 }
            ).populate(
                'publisher', { 'username': 1,'_id':1 }
            ).populate(
                'categories', { 'categoryname': 1,'_id':1 }
            ).skip(skip).limit(2);



        response.json({
            status: process.env.STATUS_SUCCESS,
            message: 'success',
            data: books

        });
    } catch (error) {
        next(error)

    }



});






module.exports = router