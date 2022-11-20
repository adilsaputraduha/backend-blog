const config = require("../config/database");

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
                SELECT * FROM table_tags;
                SELECT * FROM table_stack;
                `,
                function (error, results) {
                    if (error) throw error;
                    res.render("tags", {
                        url: URL,
                        urlFront: URLFRONT,
                        userName: req.session.username,
                        userId: req.session.userid,
                        category: results[0],
                        stack: results[1],
                    });
                }
            );
            connection.release();
        });
    },
    save(req, res) {
        pool.getConnection(function (err, connection) {
            if (err) throw err;
            connection.query(
                `INSERT INTO table_tags SET ? `,
                {
                    tagar_name: req.body.name,
                },
                function (error, results) {
                    if (error) throw error;
                    res.redirect("/app/tags-stack");
                }
            );
            connection.release();
        });
    },
    update(req, res) {
        pool.getConnection(function (err, connection) {
            if (err) throw err;
            connection.query(
                `UPDATE table_tags SET 
                tagar_name = ?
            WHERE tagar_id = ?`,
                [req.body.name, req.body.id],
                function (error, results) {
                    if (error) throw error;
                    res.redirect("/app/tags-stack");
                }
            );
            connection.release();
        });
    },
};
