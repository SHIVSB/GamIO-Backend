var NodeGeocoder = require("node-geocoder");

const locationController = {};

locationController.getCity = async (req, res) => {
  var options = {
    provider: "google",
    httpAdapter: "https", // Default
    apiKey: "AIzaSyCZNlij87KQYPzTOGJ-PsgCirnOnUNv5-Q", // for Mapquest, OpenCage, Google Premier
    formatter: "json", // 'gpx', 'string', ...
  };

  var geocoder = NodeGeocoder(options);

  const data = await geocoder.reverse({ lat: 28.5967439, lon: 77.3285038 });

  return res.send(data);
};

module.exports = locationController;
