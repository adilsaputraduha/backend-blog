const config = require("../config/database");
const slug = require("slug");

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
                SELECT * FROM table_category;
                `,
                function (error, results) {
                    if (error) throw error;
                    res.render("category", {
                        url: URL,
                        urlFront: URLFRONT,
                        userName: req.session.username,
                        userId: req.session.userid,
                        category: results,
                    });
                }
            );
            connection.release();
        });
    },
    save(req, res) {
        let categorySlug = slug(req.body.name);
        pool.getConnection(function (err, connection) {
            if (err) throw err;
            connection.query(
                `INSERT INTO table_category SET ? `,
                {
                    category_name: req.body.name,
                    category_slug: categorySlug,
                },
                function (error, results) {
                    if (error) throw error;
                    res.redirect("/app/category");
                }
            );
            connection.release();
        });
    },
    update(req, res) {
        let categorySlug = slug(req.body.name);
        pool.getConnection(function (err, connection) {
            if (err) throw err;
            connection.query(
                `UPDATE table_category SET 
                category_name = ?,
                category_slug = ?
            WHERE category_id = ?`,
                [req.body.name, categorySlug, req.body.id],
                function (error, results) {
                    if (error) throw error;
                    res.redirect("/app/category");
                }
            );
            connection.release();
        });
    },
};
