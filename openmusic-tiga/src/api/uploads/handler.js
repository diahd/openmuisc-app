class UploadsHandler {
  constructor(uploadService, albumsService, validator) {
    this._uploadService = uploadService;
    this._albumsService = albumsService;
    this._validator = validator;
  }

  async postUploadCoverHandler(request, h) {
    const { cover } = request.payload;
    const { albumId } = request.params;

    this._validator.validateImageHeaders(cover.hapi.headers);

    const filename = await this._uploadService.writeFile(cover, cover.hapi);
    const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`;
    console.log(albumId, fileLocation);
    await this._albumsService.addCover(albumId, fileLocation);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }
}

module.exports = UploadsHandler;
