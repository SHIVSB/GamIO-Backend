const User = require("../models/user/user");
const auth = require("../utils/authentication");
const sgMail = require("@sendgrid/mail");
const validateMongodbId = require("../utils/validateMongodbID");
const expressAsyncHandler = require("express-async-handler");
sgMail.setApiKey(process.env.SEND_GRID_API_KEY);
const crypto = require("crypto");
const { findOne } = require("../models/user/user");
const fs = require("fs");
const cloudinaryUploadImg = require("../utils/cloudinary");

const userController = {};

userController.signup = expressAsyncHandler(async (req, res) => {
  let responseData = {
    msg: "Error in creating the user",
    success: false,
    result: "",
  };
  const { firstName, lastName, email, password } = req.body;
  //check if user exist
  const userExists = await User.findOne({ email });

  if (userExists) throw new Error("User already exists");

  try {
    const newUser = await User.create({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
    });

    responseData.msg = "User created successfully";
    responseData.success = true;
    responseData.result = newUser;

    return res.status(200).send(responseData);
  } catch (error) {
    console.log("error in creating the user");

    return res.status(500).send(responseData);
  }
});

userController.signin = async (req, res) => {
  let data = req.body;

  let responseData = {
    msg: "Error in signing in the user",
    success: false,
    result: "",
  };

  if (data.email && data.password) {
    try {
      const userFound = await User.findOne({ email: data.email });
      // console.log(data.email);
      //console.log(data.password);

      if (userFound.isPasswordMatched(data.password)) {
        await User.findByIdAndUpdate(
          userFound._id,
          {
            active: true,
          },
          {
            new: true,
          }
        );

        responseData.msg = "User logged in successfully";
        responseData.success = true;
        responseData.result = userFound;
        responseData.token = auth.generateToken(userFound._id);
        return res.status(200).send(responseData);
      } else {
        return res.status(500).send(responseData);
      }
    } catch (error) {
      console.log("Invalid email or password");
      responseData.msg = "Invalid email or password";
      return res.status(500).send(responseData);
    }
  } else {
    responseData.msg = "Insufficient data for login";

    return res.status(500).send(responseData);
  }
};

userController.logout = expressAsyncHandler(async (req, res) => {
  let responseData = {
    msg: "Error in loging out the user",
    success: false,
    result: "",
  };

  const { _id } = req.user;

  try {
    await User.findByIdAndUpdate(
      _id,
      {
        active: false,
      },
      {
        new: true,
      }
    );

    responseData.msg = "Logged out successfuly";
    responseData.success = true;

    return res.status(200).send(responseData);
  } catch (error) {
    return res.status(500).send(responseData);
  }
});

userController.getallusers = async (req, res) => {
  let responseData = {
    msg: "Error in signing in the user",
    success: false,
    result: "",
  };

  try {
    const users = await User.find({});

    responseData.msg = "User fetched successsfully";
    responseData.success = true;
    responseData.result = users;

    return res.status(200).send(responseData);
  } catch (error) {
    console.log("Error in fetching users");

    return res.status(500).send(responseData);
  }
};

userController.deleteuser = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  let responseData = {
    msg: "Error in deleting the user",
    success: false,
    result: "",
  };

  validateMongodbId(id);

  try {
    const deleteduser = await User.findByIdAndDelete(id);

    responseData.msg = "User deleted successfully";
    responseData.success = true;
    responseData.result = deleteduser;

    return res.status(200).send(responseData);
  } catch (error) {
    return res.status(500).send(responseData);
  }
});

userController.getuserbyid = expressAsyncHandler(async (req, res) => {
  let { id } = req.params;

  let responseData = {
    msg: "User could not be fetched",
    success: false,
    result: "",
  };

  //validate id
  validateMongodbId(id);

  try {
    const user = await User.findById(id);

    responseData.msg = "User fetched successfully";
    responseData.success = true;
    responseData.result = user;

    return res.status(200).send(responseData);
  } catch (error) {
    return res.status(500).send(responseData);
  }
});

userController.userProfile = expressAsyncHandler(async (req, res) => {
  let { id } = req.params;

  let responseData = {
    msg: "User could not be fetched",
    success: false,
    result: "",
  };

  //validate id
  validateMongodbId(id);

  try {
    const user = await User.findById(id);

    responseData.msg = "User fetched successfully";
    responseData.success = true;
    responseData.result = user;

    return res.status(200).send(responseData);
  } catch (error) {
    return res.status(500).send(responseData);
  }
});

userController.updateProfile = async (req, res) => {
  const { _id } = req.user;

  let responseData = {
    msg: "User profile could not be updated",
    success: false,
    result: "",
  };

  validateMongodbId(_id);
  try {
    const user = await User.findByIdAndUpdate(
      _id,
      {
        firstName: req.body?.firstName,
        lastName: req.body?.lastName,
        email: req.body?.email,
        bio: req.body?.bio,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    responseData.msg = "User updated successfully";
    responseData.success = true;
    responseData.result = user;

    return res.status(200).send(responseData);
  } catch (error) {
    return res.status(500).send(responseData);
  }
};

userController.updatePassword = async (req, res) => {
  let { _id } = req.user;
  let { password } = req.body;
  validateMongodbId(_id);

  let responseData = {};
  responseData.msg = "Password could not be updated";
  responseData.success = true;
  responseData.result = "";

  const user = await User.findById(_id);

  if (password) {
    try {
      user.password = password;
      const updatedUser = await user.save();

      responseData.msg = "User password updated successfully";
      responseData.success = true;
      responseData.result = updatedUser;

      return res.status(200).send(responseData);
    } catch (error) {
      return res.status(500).send(error);
    }
  } else {
    return res.status(500).send(responseData);
  }
};

userController.followUser = async (req, res) => {
  let { followId } = req.body;
  let loginUserId = req.user.id;

  const targetuser = await User.findById(followId);

  const alreadyFollowing = targetuser.followers.find(
    (user) => user.toString() == loginUserId.toString()
  );

  if (alreadyFollowing) {
    return res.status(500).send("Already following");
  } else {
    try {
      await User.findByIdAndUpdate(
        followId,
        {
          $push: { followers: loginUserId },
          isFollowing: true,
        },
        {
          new: true,
        }
      );

      await User.findByIdAndUpdate(
        loginUserId,
        {
          $push: { following: followId },
        },
        {
          new: true,
        }
      );

      res.status(200).send("Started following successfully");
    } catch (error) {
      res.status(500).send("Error in following the user");
    }
  }
};

userController.unfollowUser = async (req, res) => {
  let { unfollowId } = req.body;

  const loginUserId = req.user.id;

  try {
    await User.findByIdAndUpdate(
      unfollowId,
      {
        $pull: { followers: loginUserId },
        isFollowing: false,
      },
      {
        new: true,
      }
    );

    await User.findByIdAndUpdate(
      loginUserId,
      {
        $pull: { following: unfollowId },
      },
      {
        new: true,
      }
    );

    return res.status(200).send("You have successfully unfollowed the user");
  } catch (error) {
    res.status(500).send("Error in unfollowing the user");
  }
};

userController.blockUser = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);

  let responseData = {
    msg: "User has been blocked successfully",
    success: true,
    result: "",
  };

  const user = await User.findByIdAndUpdate(
    id,
    {
      isBlocked: true,
    },
    {
      new: true,
    }
  );

  responseData.result = user;

  res.send(responseData);
});

userController.unblockUser = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;

  validateMongodbId(id);

  let responseData = {
    msg: "User has been unblocked successfully",
    success: true,
    result: "",
  };

  const user = await User.findByIdAndUpdate(
    id,
    {
      isBlocked: false,
    },
    {
      new: true,
    }
  );

  responseData.result = user;

  return res.status(200).send(responseData);
});

userController.generateVerificationTokenController = expressAsyncHandler(
  async (req, res) => {
    let responseData = {
      msg: "Email sent successfully",
      success: true,
      result: "",
    };

    const loginUserId = req.user.id;

    const user = await User.findById(loginUserId);
    try {
      //generate token
      const verificationToken = await user.createAccountVerificationToken();
      //save the user
      await user.save();
      console.log(verificationToken);

      const resetURL = `If you were requested to verify your account, verify within 10 mins . Ignore otherwise <a href="http://localhost:3000/verify-account/${verificationToken}></a>`;
      const msg = {
        to: email, // Change to your recipient
        from: "shivtechnica02@gmail.com", // Change to your verified sender
        subject: "Verify your account",
        html: resetURL,
      };

      //await sgMail.send(msg);

      responseData.result = resetURL;

      res.status(200).send(responseData);
    } catch (error) {
      responseData.msg = "Mail couldn't be send";
      responseData.success = false;
      res.status(500).send(responseData);
    }
  }
);

//Account verification controller

userController.accountVerificationController = expressAsyncHandler(
  async (req, res) => {
    const { token } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // console.log(hashedToken);

    const userFound = await User.findOne({
      accountVerificationToken: hashedToken,
      accountVerificationTokenExpires: { $gt: new Date() },
    });

    if (!userFound) return res.status(500).send("Token expired");

    userFound.isAccountVerified = true;
    userFound.accountVerificationToken = undefined;
    userFound.accountVerificationTokenExpires = undefined;

    await userFound.save();
    return res.status(200).send(userFound);
  }
);

userController.forgotPasswordToken = expressAsyncHandler(async (req, res) => {
  let { email } = req.body;

  let responseData = {
    msg: "User not found",
    success: false,
    result: "",
  };

  const user = await User.findOne({ email });

  if (!user) {
    res.status(500).send(responseData);
  }

  try {
    const token = await user.createPasswordResetToken();
    await user.save();

    const resetURL = `If you were requested to reset your password, verify within 10 mins . Ignore otherwise <a href="http://localhost:3000/resetpassword/${token}></a>`;
    const msg = {
      to: email, // Change to your recipient
      from: "shivtechnica02@gmail.com", // Change to your verified sender
      subject: "Reset your password",
      html: resetURL,
    };

    const emailMsg = await sgMail.send(msg);
    responseData.msg = `Verification email has been sent successfully to the user , ${resetURL}`;
    responseData.success = true;
    responseData.result = emailMsg;

    res.status(200).send(responseData);
  } catch (error) {
    res.status(500).send("Error in reseting the password");
  }
  res.send();
});

userController.passwordReset = expressAsyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user) throw new Error("Token expired, try again later");

  //change password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  return res.status(200).send("Password changed successfully");
});

//profile photo upload controller

userController.profilePhotoUpload = expressAsyncHandler(async (req, res) => {
  // console.log(req.file);

  //console.log(req.user);

  const { _id } = req.user;

  //getting path to the image

  const localPath = `public/images/profile/${req.file.filename}`;

  //uploading to cloudinary

  const imgUploaded = await cloudinaryUploadImg(localPath);

  const foundUser = await User.findByIdAndUpdate(
    _id,
    {
      profilePhoto: imgUploaded.url,
    },
    {
      new: true,
    }
  );

  //remove the saved img
  fs.unlinkSync(localPath);
  console.log(imgUploaded);
  res.json(imgUploaded);
  // let responseData = {
  //   msg: "File uploaded successfully",
  //   success: true,
  //   result: imgUploaded,
  // };

  // return res.status(200).send(responseData);
});

module.exports = userController;
