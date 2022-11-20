const config = require("../config/database");
const slug = require("slug");

const multer = require("multer");
const path = require("path");
const randomstring = require("randomstring");

require("dotenv").config();
const { NODE_ENV, URL_BE_DEV, URL_BE_PRO, URL_FE_DEV, URL_FE_PRO } =
    process.env;
if (NODE_ENV === "production") {
    URL = URL_BE_PRO;
    URLFRONT = URL_FE_PRO;
} else {
    URL = URL_BE_DEV;
    URLFRONT = URL_FE_DEV;
}

const storageThumb = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "uploads/project");
    },
    filename: function (req, file, cb) {
        cb(null, randomstring.generate() + path.extname(file.originalname));
    },
});

const uploadThumb = multer({
    storage: storageThumb,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if (ext !== ".png" && ext !== ".jpg" && ext !== ".webp") {
            return callback(new Error("Only images"));
        }
        callback(null, true);
    },
});

const uploadFileThumb = uploadThumb.single("image");

let mysql = require("mysql");
let pool = mysql.createPool(config);

pool.on("error", (err) => {
    console.error(err);
});

module.exports = {
    list(req, res) {
        pool.getConnection(function (err, connection) {
            if (err) throw err;
            connection.query(
                `
                SELECT * FROM table_project;
                SELECT * FROM table_stack;
                `,
                function (error, results) {
                    if (error) throw error;
                    res.render("project", {
                        url: URL,
                        urlFront: URLFRONT,
                        userName: req.session.username,
                        userId: req.session.userid,
                        project: results[0],
                        stack: results[1],
                    });
                }
            );
            connection.release();
        });
    },
    save(req, res) {
        let projectSlug = slug(req.body.name);
        let stack = new Array(req.body["stack[]"]);
        pool.getConnection(function (err, connection) {
            if (err) throw err;
            connection.query(
                `INSERT INTO table_project SET ? `,
                {
                    project_name: req.body.name,
                    project_slug: projectSlug,
                    project_desc: req.body.desc,
                    project_stack: stack.join(),
                    project_url: req.body.url,
                },
                function (error, results) {
                    if (error) throw error;
                    res.redirect("/app/project");
                }
            );
            connection.release();
        });
    },
    update(req, res) {
        let projectSlug = slug(req.body.name);
        let stack = new Array(req.body["stack[]"]);
        pool.getConnection(function (err, connection) {
            if (err) throw err;
            connection.query(
                `UPDATE table_project SET 
                project_name = ?,
                project_slug = ?,
                project_desc = ?,
                project_stack = ?,
                project_url = ?
            WHERE project_id = ?`,
                [
                    req.body.name,
                    projectSlug,
                    req.body.desc,
                    stack.join(),
                    req.body.url,
                    req.body.id,
                ],
                function (error, results) {
                    if (error) throw error;
                    res.redirect("/app/project");
                }
            );
            connection.release();
        });
    },
    uploadImageThumb(req, res) {
        uploadFileThumb(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                req.flash("message", "Someting wrong !");
                res.redirect("/app/project");
            } else if (err) {
                req.flash("message", "Someting wrong !");
                res.redirect("/app/project");
            }
            pool.getConnection(function (err, connection) {
                if (err) throw err;
                connection.query(
                    `UPDATE table_project SET 
                    project_image = ?
                WHERE project_id = ?`,
                    [req.file.filename, req.body.id],
                    function (error, results) {
                        if (error) throw error;
                        res.redirect("/app/project");
                    }
                );
                connection.release();
            });
        });
    },
    viewGallery(req, res) {
        let slug = req.params.id;
        pool.getConnection(function (err, connection) {
            if (err) throw err;
            connection.query(
                `
                SELECT * FROM table_project_detail WHERE detail_project_slug = '${slug}';
                `,
                function (error, results) {
                    if (error) throw error;
                    res.render("project-gallery", {
                        url: URL,
                        userName: req.session.username,
                        userId: req.session.userid,
                        slugProject: slug,
                        project: results,
                    });
                }
            );
            connection.release();
        });
    },
    uploadImageGallery(req, res) {
        let slugProject = req.body.slug;
        uploadFileThumb(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                req.flash("message", "Someting wrong !");
                res.redirect("/app/project/" + slugProject);
            } else if (err) {
                req.flash("message", "Someting wrong !");
                res.redirect("/app/project/" + slugProject);
            }
            pool.getConnection(function (err, connection) {
                if (err) throw err;
                connection.query(
                    `INSERT INTO table_project_detail SET ? `,
                    {
                        detail_project_slug: req.body.slug,
                        detail_image: req.file.filename,
                    },
                    function (error, results) {
                        if (error) throw error;
                        res.redirect("/app/project/" + req.body.slug);
                    }
                );
                connection.release();
            });
        });
    },
    deleteImageGallery(req, res) {
        let slug = req.body.slug;
        let idDetail = req.body.iddetail;
        pool.getConnection(function (err, connection) {
            if (err) throw err;
            connection.query(
                `DELETE FROM table_project_detail WHERE detail_id = ?;`,
                [idDetail],
                function (error, results) {
                    if (error) throw error;
                    res.redirect("/app/project/" + slug);
                }
            );
            connection.release();
        });
    },
};
