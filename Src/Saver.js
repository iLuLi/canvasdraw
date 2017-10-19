import PositionGenerator from './PositionGenerator';

function saver(utils, grid, canvas, loader, renderer) {
    this.utils = utils;
    this.grid = grid;
    this.canvas = canvas;
    this.loader = loader;
    this.renderer = renderer;
}
saver.prototype.createSimpleData = function () {
    var _this = this;
    var maxRes = this.canvas.getMaxResolution();
    var dimensions = {
        width: maxRes.width,
        height: maxRes.height,
        zoom: maxRes.ratio
    };
    var _a = this.canvas.createSaveableRenderData(dimensions), renderData = _a.renderData, canvas = _a.canvas;
    return this.renderer.forceRender(renderData).then(function () {
        return _this.utils.getImageBlob(canvas);
    }).then(function (thumbnailImage) {
        var position = PositionGenerator.simplePosition(_this.canvas.srcWidth, _this.canvas.srcHeight, 1);
        var layers = _this.grid.getSaveData(position);
        return {
            layers: layers,
            thumbnailImage: thumbnailImage
        };
    });
};
saver.prototype.createPDFSaveData = function (generateThumbnail) {
    var _this = this;
    var promise;
    if (generateThumbnail) {
        promise = this.createPDFThumbnail();
    }
    else {
        promise = this.utils.promise.resolve();
    }
    return promise.then(function (thumbnail) {
        var position = PositionGenerator.simplePosition(_this.canvas.srcWidth, _this.canvas.srcHeight);
        var layers = _this.grid.getSaveData(position);
        var submitData = {
            layers: layers,
            thumbnailImage: thumbnail
        };
        return submitData;
    });
};
saver.prototype.createPDFThumbnail = function () {
    var _this = this;
    var tempCanvas;
    return this.loader.openPDFPage(1, "FIT", 1000, 1000).then(function (size) {
        var _a = _this.canvas.createSaveableRenderData(size), renderData = _a.renderData, canvas = _a.canvas;
        tempCanvas = canvas;
        return _this.renderer.forceRender(renderData);
    }).then(function () {
        return _this.utils.getImageBlob(tempCanvas);
    });
};

export default saver;