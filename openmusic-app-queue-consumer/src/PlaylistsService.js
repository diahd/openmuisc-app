const { Pool } = require('pg');
 
class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async getPlaylist(playlistId) {
    const queryPlaylist = {
        text: `SELECT playlists.id, playlists.name FROM playlists 
        LEFT JOIN users ON playlists.owner = users.id
        WHERE playlists.id = $1`,
        values: [playlistId],
    };
    const resultPlaylist = await this._pool.query(queryPlaylist);

    const querySongs = {
        text: `SELECT songs.id, songs.title, songs.performer FROM songs
        JOIN playlist_songs ON songs.id = playlist_songs.song_id
        WHERE playlist_songs.playlist_id = $1`,
        values: [playlistId],
    };
    const resultSongs = await this._pool.query(querySongs);
    
    return { playlist: { ...resultPlaylist.rows[0], songs: resultSongs.rows }}
  }
}

module.exports = PlaylistsService;