const appJson = require('./app.json');

const googleMapsApiKey =
  process.env.GOOGLE_MAPS_API_KEY ||
  appJson.expo?.android?.config?.googleMaps?.apiKey;

module.exports = {
  ...appJson,
  expo: {
    ...appJson.expo,
    plugins: [
      ...appJson.expo.plugins,
      [
        'react-native-maps',
        {
          androidGoogleMapsApiKey: googleMapsApiKey,
        },
      ],
    ],
  },
};
