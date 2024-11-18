require('dotenv').config();

const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const cors = require('cors');

const app = express();
const port = 3050;
app.use(cors());

// Initialize the Spotify API with credentials from environment variables.
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URL
});

app.get('/login', (req, res) => {
    const scopes = ['user-read-private', 'user-read-email', 'user-read-playback-state', 'user-modify-playback-state'];
    res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

app.get('/callback', (req, res) => {
    const code = req.query.code;

    // exchange the authorization code for an access token and refresh token
    spotifyApi.authorizationCodeGrant(code).then(data => {
        const accessToken = data.body['access_token'];
        const refreshToken = data.body['refresh_token'];
        const expiresIn = data.body['expires_in'];

        // set the access token and refresh token on the Spotify API object
        spotifyApi.setAccessToken(accessToken);
        spotifyApi.setRefreshToken(refreshToken);

        // debug
        // console.log('The access token is ' + accessToken);
        // console.log('The refresh token is ' + refreshToken);

        // redirect back to the React app with the access token as a query parameter
        const redirectUrl = `http://localhost:5173/home?accessToken=${accessToken}`;
        res.redirect(redirectUrl);

        // Refresh the access token periodically before it expires
        setInterval(async () => {
            const data = await spotifyApi.refreshAccessToken();
            const newAccessToken = data.body['access_token'];
            spotifyApi.setAccessToken(newAccessToken);
        }, expiresIn / 2 * 1000);

    }).catch(error => {
        console.error('Error getting tokens:', error);
        res.status(500).json({ error: 'Error getting tokens' });
    });
});

app.get('/getTracksFromPlaylist/:playlistId', async (req, res) => {
    const playlistId = req.params.playlistId;

    try {
        const playlistData = await spotifyApi.getPlaylistTracks(playlistId);
        const tracks = playlistData.body.items;

        const trackIds = tracks.map(item => item.track.id).filter(Boolean); // Filter to remove any null values

        // fetch audio features for the tracks
        const audioFeaturesData = await spotifyApi.getAudioFeaturesForTracks(trackIds);
        const audioFeatures = audioFeaturesData.body.audio_features;

        // Combine tracks with their corresponding audio features
        const tracksWithFeatures = tracks.map((item, index) => {
            return {
                name: item.track.name,
                image: item.track.album.images[2].url,
                audioFeatures: audioFeatures[index],
            };
        });

        // Send the combined data back to the client
        res.json(tracksWithFeatures);
    } catch (error) {
        console.error('Error fetching playlist tracks or audio features:', error);
        res.status(500).json({ error: 'Error fetching playlist tracks or audio features' });
    }
});

// app.get('/getAudioFeatures')


// Start the Express server.
app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});