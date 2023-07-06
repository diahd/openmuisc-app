const mapDBToModel = ({
  title, year, genre, performer, duration, albumid,
}) => ({
  title, year, genre, performer, duration, albumId: albumid,
});

const mapDBToModelGetAlbum = ({
  id,
  name,
  cover,
}) => ({
  id,
  name,
  coverUrl: cover,
});

module.exports = { mapDBToModel, mapDBToModelGetAlbum };
