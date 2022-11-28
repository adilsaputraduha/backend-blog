const router = require("express").Router();
const verifyUser = require("../config/verify");
const homeController = require("../controllers").home;
const articleController = require("../controllers").article;
const categoryController = require("../controllers").category;
const tagsController = require("../controllers").tags;
const usersController = require("../controllers").users;
const projectController = require("../controllers").project;
const stackController = require("../controllers").stack;
const profilController = require("../controllers").profil;

router.get("/", verifyUser.isLogin, homeController.home);
// Article
router.get("/article", verifyUser.isLogin, articleController.list);
router.get("/article/new", verifyUser.isLogin, articleController.new);
router.get("/article/edit/:id", verifyUser.isLogin, articleController.viewEdit);
router.post("/article/save", verifyUser.isLogin, articleController.save);
router.post("/article/update", verifyUser.isLogin, articleController.update);
router.post(
    "/article/auto-update",
    verifyUser.isLogin,
    articleController.autoUpdate
);
router.post(
    "/article/upload-thumb",
    verifyUser.isLogin,
    articleController.uploadImageThumb
);
router.post(
    "/article/edit-thumb-name",
    verifyUser.isLogin,
    articleController.editImageThumbName
);
router.post(
    "/article/upload-images",
    verifyUser.isLogin,
    articleController.uploadImageSummernote
);
router.post(
    "/article/delete-images",
    verifyUser.isLogin,
    articleController.deleteImageSummernote
);
// Category
router.get("/category", verifyUser.isLogin, categoryController.list);
router.post("/category/save", verifyUser.isLogin, categoryController.save);
router.post("/category/update", verifyUser.isLogin, categoryController.update);
// Tags & Stack
router.get("/tags-stack", verifyUser.isLogin, tagsController.list);
router.post("/tags/save", verifyUser.isLogin, tagsController.save);
router.post("/tags/update", verifyUser.isLogin, tagsController.update);
router.post("/stack/save", verifyUser.isLogin, stackController.save);
router.post("/stack/update", verifyUser.isLogin, stackController.update);
// Project
router.get("/project", verifyUser.isLogin, projectController.list);
router.post("/project/save", verifyUser.isLogin, projectController.save);
router.post("/project/update", verifyUser.isLogin, projectController.update);
router.post(
    "/project/upload-thumb",
    verifyUser.isLogin,
    projectController.uploadImageThumb
);
router.get("/project/:id", verifyUser.isLogin, projectController.viewGallery);
router.post(
    "/project/upload-gallery",
    verifyUser.isLogin,
    projectController.uploadImageGallery
);
router.post(
    "/project/remove-gallery",
    verifyUser.isLogin,
    projectController.deleteImageGallery
);
// User List
router.get("/user", verifyUser.isLogin, usersController.list);
router.post("/user/save", verifyUser.isLogin, usersController.save);
router.post("/user/update", verifyUser.isLogin, usersController.update);
router.post("/user/reset", verifyUser.isLogin, usersController.reset);
// Profil
router.get("/profil", verifyUser.isLogin, profilController.list);
router.post("/profil/update", verifyUser.isLogin, profilController.update);

module.exports = router;
