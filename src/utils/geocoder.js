const NodeGeocoder = require('node-geocoder');

const locationController = {};

locationController.getCity = async (req, res) => {
	const options = {
		provider: 'google',
		httpAdapter: 'https', // Default
		apiKey: process.env.GOOGLE_MAPS_API_KEY, // For Mapquest, OpenCage, Google Premier
		formatter: 'json', // 'gpx', 'string', ...
	};

	const geocoder = NodeGeocoder(options);

	const data = await geocoder.reverse({lat: 28.5967439, lon: 77.3285038});

	return res.send(data);
};

module.exports = locationController;
