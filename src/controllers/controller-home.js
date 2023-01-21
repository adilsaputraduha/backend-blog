const config = require("../config/database");
const moment = require("moment");

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
    home(req, res) {
        pool.getConnection(function (err, connection) {
            if (err) throw err;
            connection.query(
                `
                -- Quote
                SELECT * FROM table_quote ORDER BY RAND() LIMIT 1;
                -- Count
                SELECT COUNT(*) AS count FROM table_article;
                SELECT COUNT(*) AS count FROM table_project;
                SELECT COUNT(*) AS count FROM table_category;
                SELECT COALESCE(SUM(article_views),0) AS count FROM table_article;
                -- Top Query
                SELECT * FROM table_keyword_user ORDER BY id DESC LIMIT 10;
                -- Latest Article
                SELECT * FROM table_article ORDER BY article_date_post DESC LIMIT 5;
                `,
                function (error, results) {
                    if (error) throw error;
                    res.render("home", {
                        url: URL,
                        urlFront: URLFRONT,
                        userName: req.session.username,
                        userId: req.session.userid,
                        moment: moment,
                        quote: results[0],
                        countArticle: results[1][0]["count"],
                        countProject: results[2][0]["count"],
                        countCategory: results[3][0]["count"],
                        countVisit: 0,
                        topKeyword: results[5],
                        topLatest: results[6],
                    });
                }
            );
            connection.release();
        });
    },
};
