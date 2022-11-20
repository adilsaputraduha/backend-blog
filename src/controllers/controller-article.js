const config = require('../config/database');
const moment = require('moment');

const multer  = require('multer');
const path = require('path');
const fs = require('fs')
const randomstring  = require("randomstring");

require('dotenv').config();
const {
    NODE_ENV,
    URL_BE_DEV,
    URL_BE_PRO,
    URL_FE_DEV,
    URL_FE_PRO
} = process.env;
if (NODE_ENV === 'production') {
    URL = URL_BE_PRO
    URLFRONT = URL_FE_PRO
} else {
    URL = URL_BE_DEV
    URLFRONT = URL_FE_DEV
}

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'uploads');
    },
    filename: function (req, file, cb) {
        cb(null, randomstring.generate() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.webp') {
            return callback(new Error('Only images'))
        }
        callback(null, true)
    }
});

const storageThumb = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'uploads/large');
    },
    filename: function (req, file, cb) {
        cb(null, randomstring.generate() + path.extname(file.originalname));
    }
});

const uploadThumb = multer({
    storage: storageThumb,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.webp') {
            return callback(new Error('Only images'))
        }
        callback(null, true)
    }
});

const uploadFile = upload.single('image');
const uploadFileThumb = uploadThumb.single('image');

let mysql = require('mysql');
let pool = mysql.createPool(config);

pool.on('error',(err)=> {
    console.error(err);
});

module.exports ={
    list(req,res){
        pool.getConnection(function(err, connection) {
            if (err) throw err;
            connection.query(
                `
                -- Article
                SELECT * FROM table_article JOIN table_category ON category_id = article_category;
                `
            , function (error, results) {
                if(error) throw error;  
                res.render("article-list",{
                    url: URL,
                    urlFront: URLFRONT,
                    expressFlash: req.flash('message'),
                    userName: req.session.username,
                    userId: req.session.userid,
                    moment: moment,
                    article: results,
                });
            });
            connection.release();
        })
    },
    new(req,res){
        pool.getConnection(function(err, connection) {
            if (err) throw err;
            connection.query(
                `
                SELECT * FROM table_tags;
                SELECT * FROM table_category;
                `
            , function (error, results) {
                if(error) throw error;  
                res.render("article-new",{
                    url: URL,
                    urlFront: URLFRONT,
                    userName: req.session.username,
                    userId: req.session.userid,
                    moment: moment,
                    tags: results[0],
                    category: results[1],
                });
            });
            connection.release();
        })
    },
    viewEdit(req,res){
        let id = req.params.id;
        pool.getConnection(function(err, connection) {
            if (err) throw err;
            connection.query(
                `
                SELECT * FROM table_tags;
                SELECT * FROM table_category;
                SELECT * FROM table_article WHERE article_id = ${id};
                `
            , function (error, results) {
                if(error) throw error;  
                res.render("article-edit",{
                    url: URL,
                    urlFront: URLFRONT,
                    userName: req.session.username,
                    userId: req.session.userid,
                    moment: moment,
                    tags: results[0],
                    category: results[1],
                    article: {
                        article_id : results[2][0]['article_id'],
                        article_title : results[2][0]['article_title'],
                        article_slug : results[2][0]['article_slug'],
                        article_content : results[2][0]['article_content'],
                        article_category : results[2][0]['article_category'],
                        article_tags : results[2][0]['article_tags'],
                        article_desc : results[2][0]['article_description'],
                        article_key : results[2][0]['article_keyword'],
                        article_status : results[2][0]['article_status'],
                        article_read : results[2][0]['article_read_time'],
                    },
                });
                // console.log(results[2][0]['article_tags']);
            });
            connection.release();
        })
    },
    save(req,res){
        let tags = new Array(req.body['tag[]']);
        // console.log(tags.join())
        pool.getConnection(function(err, connection) {
            if (err) throw err;
            connection.query(`INSERT INTO table_article SET ? `,{
                article_title : req.body.title,
                article_slug : req.body.slug,
                article_content : req.body.content,
                article_keyword : req.body.metakey,
                article_description : req.body.metadesc,
                article_category : req.body.category,
                article_tags: tags.join(),
                article_status : req.body.status,
                article_user_post : req.session.userid,
            }, function (error, results) {
                if(error) throw error;  
                res.redirect('/app/article');
            });
            connection.release();
        })
    },
    update(req,res){
        let tags = new Array(req.body['tag[]']);
        pool.getConnection(function(err, connection) {
            if (err) throw err;
            connection.query(`UPDATE table_article SET 
                article_title = ?, 
                article_slug = ?, 
                article_content = ?,
                article_category = ?, 
                article_tags = ?, 
                article_description = ?, 
                article_keyword = ?,
                article_status = ?,
                article_read_time = ? ,
                article_last_post = CURDATE()
            WHERE article_id = ?`,
            [req.body.title,req.body.slug,req.body.content,req.body.category,tags.join(),req.body.metadesc,req.body.metakey,req.body.status,req.body.time,req.body.id],
            function (error, results) {
                if(error) throw error;  
                res.redirect(`/app/article/edit/${req.body.id}`);
            });
            connection.release();
        })
    },
    autoUpdate(req,res){
        res.end()
        pool.getConnection(function(err, connection) {
            if (err) throw err;
            connection.query(`UPDATE table_article SET 
                article_title = ?, 
                article_slug = ?, 
                article_content = ?,
                article_description = ?, 
                article_keyword = ?, 
                article_read_time = ?
            WHERE article_id = ?`,
            [req.body.title,req.body.slug,req.body.content,req.body.desc,req.body.key,req.body.time,req.body.id],
            function (error, results) {
                if(error) throw error;
                res.status(200).end();
            });
            connection.release();
        })
    },
    uploadImageThumb(req,res){
        uploadFileThumb(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                req.flash('message', 'Someting wrong !');
                res.redirect('/app/article');
            } else if (err) {
                req.flash('message', 'Someting wrong !');
                res.redirect('/app/article');
            }
            pool.getConnection(function(err, connection) {
                if (err) throw err;
                connection.query(`UPDATE table_article SET 
                    article_image = ?
                WHERE article_id = ?`,
                [req.file.filename,req.body.id],
                function (error, results) {
                    if(error) throw error;
                    res.redirect('/app/article');
                });
                connection.release();
            })
        })
    },
    editImageThumbName(req,res){
        console.log(req.body);
        pool.getConnection(function(err, connection) {
            if (err) throw err;
            connection.query(`UPDATE table_article SET 
                article_image = ?
            WHERE article_id = ?`,
            [req.body.imageName,req.body.id],
            function (error, results) {
                if(error) throw error;  
                res.redirect(`/app/article`);
            });
            connection.release();
        })
    },
    uploadImageSummernote(req,res){
        uploadFile(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                console.log(err)
            } else if (err) {
                console.log(err)
            }
            res.end(`${URL}uploads/${req.file.filename}`);
        })
    },
    deleteImageSummernote(req,res){
        let paths = req.body.src.replace(URL, "");
        console.log(paths);
        fs.unlink(paths, (err) => {
            if (err) {
                console.error(err)
                // return
                res.end(err);
            }
            res.end(paths);
        })
    }
}