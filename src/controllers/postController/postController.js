const expressAsyncHandler = require("express-async-handler");
const fs = require("fs");
const Filter = require("bad-words");
const Post = require("../../models/post/post.js");
const validateMongodbId = require("../../utils/validateMongodbID");
const User = require("../../models/user/user.js");
const cloudinaryUploadImg = require("../../utils/cloudinary");
const { findByIdAndUpdate } = require("../../models/post/post.js");

const postController = {};

postController.createPost = expressAsyncHandler(async (req, res) => {
  let responseData = {
    msg: "Error in creating the post",
    success: false,
    result: "",
  };

  const { _id } = req.user;
  //   validateMongodbId(req.body.user);

  //check for bad words

  const filter = new Filter();
  const profmsg = req.body.title + " " + req.body.description;
  const isProfane = filter.isProfane(profmsg);
  //console.log(isProfane);
  if (isProfane) {
    await User.findByIdAndUpdate(_id, {
      isBlocked: true,
    });

    responseData.msg =
      "You have been blocked because of the use of profane words";
    return res.status(500).send(responseData);
  }

  // const localPath = `public/images/posts/${req.file.filename}`;

  //uploading to cloudinary

  // const imgUploaded = await cloudinaryUploadImg(localPath);

  //   responseData.img = imgUploaded;
  try {
    const post = await Post.create({
      ...req.body,
      // image: imgUploaded?.url,
      user: _id,
    }); //because image not coming from body
    responseData.msg = "Post created successfully";
    responseData.success = true;
    responseData.result = post;
    res.status(200).send(responseData);
    // res.json(imgUploaded);
    //remove uploaded images
    //fs.unlinkSync(localPath);
  } catch (error) {
    res.status(500).send(error);
  }
});

//fetch all posts

postController.fetchAllPosts = async (req, res) => {
  let responseData = {
    msg: "Could not fetch all the posts",
    success: false,
    result: "",
  };

  try {
    const posts = await Post.find({}).populate("user");
    responseData.msg = "All posts fetched successfully";
    responseData.success = true;
    responseData.result = posts;

    return res.status(200).send(responseData);
  } catch (error) {
    return res.status(500).send(responseData);
  }
};

postController.fetchPost = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;

  validateMongodbId(id);

  try {
    const post = await Post.findById(id)
      .populate("user")
      .populate("disLikes")
      .populate("likes");

    //updating number of views
    await Post.findByIdAndUpdate(
      id,
      {
        $inc: { numViews: 1 },
      },
      {
        new: true,
      }
    );

    return res.status(200).send(post);
  } catch (error) {
    return res.status(500).send("Error in fetching sinle post");
  }
});

postController.updatePost = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;

  validateMongodbId(id);

  try {
    const post = await Post.findByIdAndUpdate(
      id,
      {
        ...req.body,
        user: req.user._id,
      },
      {
        new: true,
      }
    );

    return res.status(200).send(post);
  } catch (error) {
    return res.status(500).send(error);
  }
});

postController.deletePost = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;

  validateMongodbId(id);
  try {
    await Post.findByIdAndDelete(id);

    return res.status(200).send("Post deleted successfully");
  } catch (error) {
    return res.status(500).send("Error in deleting the post");
  }
});

postController.toggleAddLiketoPost = expressAsyncHandler(async (req, res) => {
  const { postId } = req.body;

  const post = await Post.findById(postId);

  const loginUserId = req.user._id;

  const isLiked = post.isLiked;

  const alreadyDisliked = post?.disLikes?.find(
    (userId) => userId.toString() === loginUserId.toString()
  );

  //remove the user from dislikes if exists
  if (alreadyDisliked) {
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { disLikes: loginUserId },
        isDisliked: false,
      },
      {
        new: true,
      }
    );
  }

  //remove the user if he has liked the post
  if (isLiked) {
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { likes: loginUserId },
        isLiked: false,
      },
      {
        new: true,
      }
    );
    res.json(post);
  } else {
    //add to likes
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: { likes: loginUserId },
        isLiked: true,
      },
      {
        new: true,
      }
    );

    res.json(post);
  }
});

//dislike post controller

postController.toggleAddDisliketoPost = expressAsyncHandler(
  async (req, res) => {
    const { postId } = req.body;

    const loginUserId = req.user._id;

    const post = await Post.findById(postId);

    const isDisliked = post?.isDisLiked;

    const alreadyLiked = post?.likes?.find(
      (userId) => userId.toString() === loginUserId.toString()
    );

    if (alreadyLiked) {
      const post = await Post.findByIdAndUpdate(
        postId,
        {
          $pull: { likes: loginUserId },
          isLiked: false,
        },
        {
          new: true,
        }
      );
    }
    if (isDisliked) {
      const post = await Post.findByIdAndUpdate(
        postId,
        {
          $pull: { disLikes: loginUserId },
          isDisLiked: false,
        },
        {
          new: true,
        }
      );

      res.json(post);
    } else {
      const post = await Post.findByIdAndUpdate(
        postId,
        {
          $push: { disLikes: loginUserId },
          isDisLiked: true,
        },
        {
          new: true,
        }
      );

      res.json(post);
    }
  }
);

module.exports = postController;
