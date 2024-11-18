import React, { useState, useEffect } from 'react';

const LinkPlaylists = () => {
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3050/getPlaylists')
      .then(response => response.json())
      .then(data => {
        setPlaylists(data.playlists);
      })
      .catch(error => console.error('Error fetching playlists:', error));
  }, []);

  return (
    <div>
      <h2>Your Spotify Playlists</h2>
      <ul>
        {playlists.map(playlist => (
          <li key={playlist.id}>
            {playlist.name} - <a href={playlist.external_urls.spotify}>Open in Spotify</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LinkPlaylists;
