const express = require("express");
var router = express.Router();
const authController = require("../../../src/utils/authentication");
const userController = require("../../../src/controllers/userController.js");
const PhotoMiddleware = require("../../../src/middlewares/photoUploads");
const gamesController = require("../../../src/controllers/gamesController/gamesController")
// const postController = require("../../../src/controllers/postController");

router.post("/signup", userController.signup);
router.post("/signin", userController.signin);
router.get("/getallusers", authController.authMiddleware, userController.getallusers);
router.delete("/deleteuser/:id", authController.authMiddleware, userController.deleteuser);
router.get("/:id", userController.getuserbyid);
router.get("/profile/:id", authController.authMiddleware, userController.userProfile);
router.put("/:id", authController.authMiddleware, userController.updateProfile);
router.put("/updatePassword/:id", authController.authMiddleware, userController.updatePassword);
router.post("/follow", authController.authMiddleware, userController.followUser);
router.post("/unfollowuser", authController.authMiddleware, userController.unfollowUser);
router.put("/block-user/:id", authController.authMiddleware, userController.blockUser);
router.put("/unblock-user/:id", authController.authMiddleware, userController.unblockUser);
router.post("/sendmail", authController.authMiddleware, userController.generateVerificationTokenController);
router.post("/verifyaccount", authController.authMiddleware, userController.accountVerificationController);
router.post("/forgotpassword", userController.forgotPasswordToken);
router.put("/resetpassword", userController.passwordReset);
router.put("/profilephotoupload", authController.authMiddleware, PhotoMiddleware.photoUpload.single("image"), PhotoMiddleware.profilePhotoSize, userController.profilePhotoUpload);
router.post("/addgame", gamesController.addGame);
router.get("/all/allgames", authController.authMiddleware, gamesController.allGames);
router.get("/game/gamedetails/:id", gamesController.gameDetail);
router.get("/players/:gameid", gamesController.players);
router.post("/add/addtoplaying", authController.authMiddleware, gamesController.addToPlaying);
// router.post("/posts", authController.authMiddleware, PhotoMiddleware.photoUpload.single("image"), PhotoMiddleware.postImgResize, postController.createPost)
// router.post("/allposts", authController.authMiddleware, postController.fetchAllPosts);

module.exports = router;
