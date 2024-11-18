import React, { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import './App.css';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [tracks, setTracks] = useState([]);

  const handleLogin = () => {
    window.location.href = 'http://localhost:3050/login'; // Trigger Spotify login
  };

  const handleUrlChange = (event) => {
    setPlaylistUrl(event.target.value);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('accessToken');

    if (token) {
      setAccessToken(token);  
      setIsLoggedIn(true);
      window.history.replaceState({}, document.title, "/home");
    }
  }, []);

  const fetchTracksFromPlaylist = (url) => {
    const playlistId = extractPlaylistId(url);
    if (playlistId) {
        fetch(`http://localhost:3050/getTracksFromPlaylist/${playlistId}`)
            .then(response => response.json())
            .then(data => {
                console.log('Tracks with Features:', data);
                setTracks(data); // Set the tracks with features directly
            })
            .catch(error => console.error('Error fetching tracks:', error));
    } else {
        console.error('Invalid playlist URL');
    }
  };

  const handleSubmit = (event) => {
      event.preventDefault(); // Prevent the page from refreshing
      fetchTracksFromPlaylist(playlistUrl);
  };


  return (
    <div className='main-page'>
      {!isLoggedIn ? (
        <div>
          <h1>Spotify Login</h1>
          <button onClick={handleLogin}>Login with Spotify</button>
        </div>
      ) : (
        <div>
            <h1>Spotify Playlist Tracker</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={playlistUrl}
                    onChange={handleUrlChange}
                    placeholder="Enter Spotify Playlist URL"
                    required
                />
                <button type="submit">Get Tracks</button>
            </form>
            <ul>
                {tracks.map((trackWithFeatures, index) => (
                    <li key={index}>
                      <Card sx={{
                         width: '18vw', 
                         height: '45vh', 
                         paddingTop: '4vh', 
                         borderRadius: '30px', 
                         backgroundColor: 'rgba(255, 255, 255, 0.5)',
                         alignItems: 'center',
                          

                        }}>
                        <div className='card-info'>
                          <h1 style={{fontSize: '24px'}}>{trackWithFeatures.name}</h1>
                          <br />
                          {trackWithFeatures.audioFeatures && (
                              <span>
                                <img className='card-image' src={trackWithFeatures.image} alt="image" />
                                <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14, flexDirection:'column' }}>
                                  <div>Danceability: {trackWithFeatures.audioFeatures.danceability}</div>
                                  <div>Energy: {trackWithFeatures.audioFeatures.energy}</div>
                                  <div>Tempo: {trackWithFeatures.audioFeatures.tempo}</div>
                                </Typography>
                              </span>
                          )}
                        </div>
                      </Card>
                    </li>
                ))}
            </ul>
        </div>
      )}
    </div>
  );
};

export default App;

const extractPlaylistId = (url) => {
  const regex = /\/playlist\/([a-zA-Z0-9]+)/;
  const match = url.match(regex);
  return match ? match[1] : null; // Return the ID or null if not found
};