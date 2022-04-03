const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema(
  {
    gamename: {
      type: String,
      required: true,
    },
    imagelink: {
      type: String,
      required: true,
    },
    genre: {
      type: String,
      required: true,
    },
    multiplayer: {
      type: Boolean,
      required: true,
    },
    singleplayer: {
      type: Boolean,
      required: true,
    },
    onlinegame: {
      type: Boolean,
      required: true,
    },
    creator: {
      type: String,
      default: "Unknown",
    },
    players: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

const Games = mongoose.model("Games", gameSchema);

module.exports = Games;
