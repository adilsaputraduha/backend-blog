const config = require("../config/database");
const bcrypt = require("bcrypt");

let mysql = require("mysql");
let pool = mysql.createPool(config);

require("dotenv").config();
const { NODE_ENV, URL_BE_DEV, URL_BE_PRO } = process.env;
if (NODE_ENV === "production") {
    URL = URL_BE_PRO;
} else {
    URL = URL_BE_DEV;
}

pool.on("error", (err) => {
    console.error(err);
});

module.exports = {
    login(req, res) {
        res.render("login", {
            url: URL,
            expressFlash: req.flash("message"),
        });
    },
    loginAuth(req, res) {
        let username = req.body.username;
        let password = req.body.password;
        if (username && password) {
            pool.getConnection(function (err, connection) {
                if (err) throw err;
                connection.query(
                    `SELECT * FROM table_user WHERE user_email = ?`,
                    [username],
                    function (error, results) {
                        if (error) throw error;
                        if (results.length > 0) {
                            let validPassword = bcrypt.compareSync(
                                password,
                                results[0]["user_password"]
                            );
                            if (!validPassword) {
                                req.flash("message", "Wrong password!");
                                res.redirect("/login");
                            } else {
                                if (results[0].user_status == 1) {
                                    req.session.loggedin = true;
                                    req.session.userid = results[0].user_id;
                                    req.session.username = results[0].user_name;
                                    res.redirect("/app");
                                } else {
                                    req.flash(
                                        "message",
                                        "Your account is banned !"
                                    );
                                    res.redirect("/login");
                                }
                            }
                        } else {
                            req.flash("message", "Account not found");
                            res.redirect("/login");
                        }
                    }
                );
                connection.release();
            });
        } else {
            res.redirect("/login");
            res.end();
        }
    },
};
