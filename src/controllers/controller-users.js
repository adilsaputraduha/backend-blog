const config = require("../config/database");
const moment = require("moment");
const bcrypt = require("bcrypt");

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
                SELECT * FROM table_user;
                `,
                function (error, results) {
                    console.log(results);
                    if (error) throw error;
                    res.render("users", {
                        url: URL,
                        urlFront: URLFRONT,
                        userName: req.session.username,
                        userId: req.session.userid,
                        moment: moment,
                        users: results,
                    });
                }
            );
            connection.release();
        });
    },
    save(req, res) {
        let pass = bcrypt.hashSync("123456", 10);
        pool.getConnection(function (err, connection) {
            if (err) throw err;
            connection.query(
                `INSERT INTO table_user SET ? `,
                {
                    user_name: req.body.name,
                    user_email: req.body.email,
                    user_password: pass,
                    user_level: req.body.level,
                    user_status: 1,
                    user_image: "no-photo.png",
                },
                function (error, results) {
                    if (error) throw error;
                    res.redirect("/app/user");
                }
            );
            connection.release();
        });
    },
    update(req, res) {
        pool.getConnection(function (err, connection) {
            if (err) throw err;
            connection.query(
                `UPDATE table_user SET 
                user_name = ?,
                user_level = ?,
                user_status = ?
            WHERE user_id = ?`,
                [req.body.name, req.body.level, req.body.status, req.body.id],
                function (error, results) {
                    if (error) throw error;
                    res.redirect("/app/user");
                }
            );
            connection.release();
        });
    },
    reset(req, res) {
        let pass = bcrypt.hashSync("123456", 10);
        pool.getConnection(function (err, connection) {
            if (err) throw err;
            connection.query(
                `UPDATE table_user SET 
                user_password = ?
            WHERE user_id = ?`,
                [pass, req.body.iduser],
                function (error, results) {
                    if (error) throw error;
                    res.redirect("/app/user");
                }
            );
            connection.release();
        });
    },
};
