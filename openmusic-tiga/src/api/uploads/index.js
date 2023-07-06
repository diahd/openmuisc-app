const UploadsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'uploads',
  version: '1.0.0',
  register: async (server, { uploadService, albumsService, validator }) => {
    const uploadsHandler = new UploadsHandler(uploadService, albumsService, validator);
    server.route(routes(uploadsHandler));
  },
};
