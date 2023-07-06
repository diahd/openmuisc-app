const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
  constructor(cacheService, songsService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
    this._songsService = songsService;
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    const querySongs = {
      text: 'SELECT id, title, performer FROM songs WHERE "albumId" = $1',
      values: [id],
    };
    const resultSongs = await this._pool.query(querySongs);

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    return { ...result.rows[0], songs: resultSongs.rows };
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }

  async addCover(id, file) {
    const query = {
      text: 'UPDATE albums SET "coverUrl" = $1 WHERE id = $2 RETURNING id',
      values: [file, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Cover gagal ditambahkan. Id tidak ditemukan');
    }

    return result.rows[0].coverUrl;
  }

  async postLikeAlbum(id, credentialId) {
    const checkAlbum = await this._pool.query({
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    });

    if (!checkAlbum.rows.length) {
      throw new NotFoundError('Gagal menyukai album. Id tidak ditemukan');
    }

    const query = {
      text: 'SELECT * FROM user_album_likes WHERE album_id = $1 and user_id = $2',
      values: [id, credentialId],
    };

    const result = await this._pool.query(query);

    if (result.rows.length) {
      throw new InvariantError('Anda telah menyukai album ini.');
    }

    const idLike = `${nanoid(16)}`;
    const queryLike = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [idLike, credentialId, id],
    };

    const resultLike = await this._pool.query(queryLike);

    await this._cacheService.delete(`albumLikes: ${id}`);

    return resultLike.rows[0].id;
  }

  async deleteLikeAlbum(id, credentialId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE album_id = $1 and user_id = $2',
      values: [id, credentialId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Gagal menghapus.');
    }

    const queryDelete = {
      text: 'DELETE FROM user_album_likes WHERE album_id = $1 and user_id = $2 RETURNING album_id',
      values: [id, credentialId],
    };

    const result2 = await this._pool.query(queryDelete);
    const { album_id: albumId } = result2.rows[0];
    await this._cacheService.delete(`albumLikes: ${albumId}`);
  }

  async getLikeAlbum(id) {
    try {
      const result = await this._cacheService.get(`albumLikes: ${id}`);

      return {
        countLikes: JSON.parse(result),
        cache: 1,
      };
    } catch (error) {
      const query = {
        text: 'SELECT * FROM user_album_likes WHERE album_id = $1',
        values: [id],
      };
      const result = await this._pool.query(query);
      await this._cacheService.set(`albumLikes: ${id}`, JSON.stringify(result.rowCount));

      return { countLikes: result.rowCount };
    }
  }
}

module.exports = AlbumsService;
