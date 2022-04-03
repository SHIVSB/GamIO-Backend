const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
    {
        firstName: {
            required: [true, "First name is required"],
            type: String,
        },
        lastName: {
            required: [true, "Last name is required"],
            type: String,
        },
        profilePhoto: {
            type: String,
            default:
                "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png",
        },
        email: {
            type: String,
            required: [true, "Email is required"],
        },
        bio: {
            type: String,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        postCount: {
            type: Number,
            default: 0,
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        role: {
            type: String,
            enum: ["Admin", "Guest", "Blogger"],
        },
        isfollowing: {
            type: Boolean,
            default: false,
        },
        isUnFollowing: {
            type: Boolean,
            default: false,
        },
        isAccountVerified: {
            type: Boolean,
            default: false,
        },
        accountVerificationToken: String,
        accountVerificationTokenExpires: Date,
        viewedBy: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "user",
                },
            ],
        },

        followers: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "user",
                },
            ],
        },

        games:{
            type : [
                {
                    type : mongoose.Schema.Types.ObjectId,
                    ref : "games"
                }
            ]
        },

        following: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "user",
                },
            ],
        },

        passwordChangedAt: Date,
        passwordResetToken: String,
        PasswordResetExpires: Date,

        active: {
            type: Boolean,
            default: false,
        },
    },
    {
        toJSON: {
            virtuals: true,
        },
        toObject: {
            virtuals: true,
        },
        timestamps: true,
    }
);

//before saving in database
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    //console.log(this);
    //hashpassword

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

//match password over here methods basically exports the isPasswordMAtched function
userSchema.methods.isPasswordMatched = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

//verify user account
userSchema.methods.createAccountVerificationToken = async function () {
    const verificationToken = crypto.randomBytes(32).toString("hex");
    this.accountVerificationToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex");

    this.accountVerificationTokenExpires = Date.now() + 30 * 60 * 1000;

    return verificationToken;
};

//forgot Password

userSchema.methods.createPasswordResetToken = async function () {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    this.PasswordResetExpires = Date.now() + 30 * 60 * 1000;

    return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
