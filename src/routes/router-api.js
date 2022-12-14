const router = require("express").Router();
const apiController = require("../controllers").api;

router.get("/article", apiController.allArticle);
router.get("/article/:id", apiController.detailArticle);
router.get("/popular-article", apiController.popularArticle);

router.get("/project", apiController.allProject);
router.get("/project/:id", apiController.detailProject);
router.get("/popular-project", apiController.popularProject);

router.get("/category", apiController.allCategory);
router.get("/category/:id", apiController.detailCategory);

module.exports = router;
