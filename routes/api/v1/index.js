const express = require("express");
var router = express.Router();
const authController = require("../../../src/utils/authentication");
const userController = require("../../../src/controllers/userController.js");
const PhotoMiddleware = require("../../../src/middlewares/photoUploads");
const gamesController = require("../../../src/controllers/gamesController/gamesController")
const locationController = require("../../../src/utils/geocoder");
const postController = require("../../../src/controllers/postController/postController");

router.post("/signup", userController.signup);
router.post("/signin", userController.signin);
router.get("/getallusers", authController.authMiddleware, userController.getallusers);
router.delete("/deleteuser/:id", authController.authMiddleware, userController.deleteuser);
router.get("/:id", userController.getuserbyid);
router.get("/profile/:id", authController.authMiddleware, userController.userProfile);
router.put("/updateprofile/:id", authController.authMiddleware, userController.updateProfile);
router.put("/updatePassword/:id", authController.authMiddleware, userController.updatePassword);
router.post("/follow", authController.authMiddleware, userController.followUser);
router.post("/unfollowuser", authController.authMiddleware, userController.unfollowUser);
router.put("/block-user/:id", authController.authMiddleware, userController.blockUser);
router.put("/unblock-user/:id", authController.authMiddleware, userController.unblockUser);
router.post("/sendmail", authController.authMiddleware, userController.generateVerificationTokenController);
router.post("/verifyaccount", authController.authMiddleware, userController.accountVerificationController);
router.post("/forgotpassword", userController.forgotPasswordToken);
router.put("/resetpassword", userController.passwordReset);
router.post("/logout", authController.authMiddleware, userController.logout);
router.put("/profilephotoupload", authController.authMiddleware, PhotoMiddleware.photoUpload.single("image"), PhotoMiddleware.profilePhotoSize, userController.profilePhotoUpload);
router.post("/addgame", gamesController.addGame);
router.get("/all/allgames", authController.authMiddleware, gamesController.allGames);
router.get("/game/gamedetails/:id", gamesController.gameDetail);
router.get("/players/:gameid", gamesController.players);
router.get("/filter/games/:genre",authController.authMiddleware, gamesController.filterByCategory)
router.post("/add/addtoplaying", authController.authMiddleware, gamesController.addToPlaying);
router.get("/all/allplayers", authController.authMiddleware ,userController.getallusers);
router.get("/location/getcity", locationController.getCity);
router.post("/post",authController.authMiddleware,postController.createPost);
router.get("/all/allposts",authController.authMiddleware, postController.fetchAllPosts);
router.get("/post/:id", authController.authMiddleware, postController.fetchPost);
router.put("/post/:id",authController.authMiddleware, postController.updatePost);
router.delete("/post/:id", authController.authMiddleware,postController.deletePost);
router.post("/likepost",authController.authMiddleware,postController.toggleAddLiketoPost);
router.post("/dislikepost",authController.authMiddleware,postController.toggleAddDisliketoPost);

// router.post("/posts", authController.authMiddleware, PhotoMiddleware.photoUpload.single("image"), PhotoMiddleware.postImgResize, postController.createPost)
// router.post("/allposts", authController.authMiddleware, postController.fetchAllPosts);

module.exports = router;
