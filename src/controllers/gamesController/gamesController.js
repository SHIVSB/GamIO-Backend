const Games = require('../../models/games/games');
const User = require('../../models/user/user');
const expressAsyncHandler = require('express-async-handler');

const gamesController = {};

gamesController.addGame = expressAsyncHandler(async (req, res) => {
	const responseData = {
		msg: 'Error in adding the game',
		success: false,
		result: '',
	};

	const {gamename, imagelink, genre, multiplayer, singleplayer, onlinegame}
    = req.body;

	try {
		const game = await Games.create({
			gamename,
			imagelink,
			genre,
			multiplayer,
			singleplayer,
			onlinegame,
		});

		responseData.msg = 'Game added successfully';
		responseData.success = true;
		responseData.result = game;

		return res.status(200).send(responseData);
	} catch (error) {
		console.log(error);
		return res.status(500).send(responseData);
	}
});

gamesController.allGames = expressAsyncHandler(async (req, res) => {
	const responseData = {
		msg: 'Error in fetching the games',
		success: false,
		result: '',
	};

	try {
		const games = await Games.find({});

		responseData.msg = 'All games fetched successfully';
		responseData.success = true;
		responseData.result = games;

		return res.status(200).send(responseData);
	} catch (error) {
		console.log(error);
		return res.status(500).send(responseData);
	}
});

gamesController.addToPlaying = expressAsyncHandler(async (req, res) => {
	const responseData = {
		msg: 'Error in adding the game to playing list',
		success: false,
		result: '',
	};

	const {_id} = req.user;
	const {gameid} = req.body;

	// Let loginUserId = _id;

	const target = await Games.findById(gameid);

	const alreadyFollowing = target.players.find(
		user => user.toString() == _id.toString(),
	);

	console.log(alreadyFollowing);

	if (alreadyFollowing) {
		try {
			// Console.log(_id);
			// console.log(gameid);
			await Games.findByIdAndUpdate(
				gameid,
				{
					$pull: {players: _id},
				},
				{
					new: true,
				},
			);

			await User.findByIdAndUpdate(
				_id,
				{
					$pull: {games: gameid},
				},
				{
					new: true,
				},
			);

			responseData.msg = 'Successfully removed from the playing list';
			responseData.success = true;
			responseData.result = '';

			return res.status(200).send(responseData);
		} catch (error) {
			console.log(error);
			return res.status(500).send(responseData);
		}

		return res.status(500).send('Already following');
	}

	try {
		// Console.log(_id);
		// console.log(gameid);
		await Games.findByIdAndUpdate(
			gameid,
			{
				$push: {players: _id},
			},
			{
				new: true,
			},
		);

		await User.findByIdAndUpdate(
			_id,
			{
				$push: {games: gameid},
			},
			{
				new: true,
			},
		);

		responseData.msg = 'Successfully added to playing list';
		responseData.success = true;
		responseData.result = '';

		return res.status(200).send(responseData);
	} catch (error) {
		console.log(error);
		return res.status(500).send(responseData);
	}
});

gamesController.gameDetail = expressAsyncHandler(async (req, res) => {
	const responseData = {
		msg: 'Error in fetching the game details',
		success: false,
		result: '',
	};

	const {id} = req.params;

	try {
		const detail = await Games.findById(id);
		responseData.msg = 'Game details fetched successfully';
		responseData.success = true;
		responseData.result = detail;

		return res.status(200).send(responseData);
	} catch (error) {
		return res.status(500).send(responseData);
	}
});

gamesController.players = expressAsyncHandler(async (req, res) => {
	const responseData = {
		msg: 'Error in fetching the players',
		success: false,
		result: '',
	};

	const {gameid} = req.params;

	try {
		const detail = await Games.findById(gameid);
		// Console.log(detail);
		const {players} = detail;
		responseData.msg = 'Players fetched successfully';
		responseData.success = true;
		responseData.result = players;

		return res.status(200).send(responseData);
	} catch (error) {
		console.log(error);
		return res.status(500).send(responseData);
	}
});

gamesController.filterByCategory = expressAsyncHandler(async (req, res) => {
	const responseData = {
		msg: 'Error in filtering the search',
		success: false,
		result: '',
	};

	const {genre} = req.params;

	try {
		console.log(genre);
		const filteredGames = await Games.find({
			genre: {$regex: genre, $options: 'si'},
		});

		responseData.msg = 'Games categorized successfully';
		responseData.success = true;
		responseData.result = filteredGames;

		return res.status(200).send(responseData);
	} catch (error) {
		console.log(error);
		return res.status(500).send(responseData);
	}
});

module.exports = gamesController;
