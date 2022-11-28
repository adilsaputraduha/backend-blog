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
        res.render("profil", {
            url: URL,
            userName: req.session.username,
            userEmail: req.session.useremail,
            userId: req.session.userid,
            moment: moment,
        });
    },
    update(req, res) {
        let password = req.body.password;

        if (password === "") {
            pool.getConnection(function (err, connection) {
                if (err) throw err;
                connection.query(
                    `UPDATE table_user SET
                    user_name = ?
                WHERE user_id = ?`,
                    [req.body.nama, req.session.userid],
                    function (error, results) {
                        if (error) throw error;
                        req.session.destroy((err) => {
                            if (err) {
                                return console.log(err);
                            }
                            res.clearCookie("secretname");
                            res.redirect("/login");
                        });
                    }
                );
                connection.release();
            });
        } else {
            let pass = bcrypt.hashSync(password, 10);
            pool.getConnection(function (err, connection) {
                if (err) throw err;
                connection.query(
                    `UPDATE table_user SET
                    user_name = ?,
                    user_password = ?
                WHERE user_id = ?`,
                    [req.body.nama, pass, req.session.userid],
                    function (error, results) {
                        if (error) throw error;
                        req.session.destroy((err) => {
                            if (err) {
                                return console.log(err);
                            }
                            res.clearCookie("secretname");
                            res.redirect("/login");
                        });
                    }
                );
                connection.release();
            });
        }
    },
};
