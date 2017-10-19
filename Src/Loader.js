import PositionGenerator from './PositionGenerator';


// Loader MUST NOT KNOW ABOUT THE RENDERER
function loader(grid, canvas, pdfCanvas, utils, pdfWorkerSrc) {
    this.grid = grid;
    this.canvas = canvas;
    this.pdfCanvas = pdfCanvas;
    this.utils = utils;
    this.pdfWorkerSrc = pdfWorkerSrc;
}
loader.prototype.openHtmlImage = function (image, openMode, maxWidth, maxHeight, layers) {
    var ratio = Math.max(Math.ceil(image.width / 2000), Math.ceil(image.height / 2000));
    var width = image.width / ratio;
    var height = image.height / ratio;
    var size = PositionGenerator.getNewDimensions({
        openMode: openMode,
        width: width,
        height: height,
        zoom: this.canvas.zoomRatio,
        maxWidth: maxWidth,
        maxHeight: maxHeight
    });
    this.grid.initialize(width, height);
    this.canvas.setBackground(image, width, height);
    if (layers) {
        this.grid.load(layers);
    }
    this.canvas.resize(size.width, size.height, size.zoom);
    return {
        width: size.width,
        height: size.height,
        zoom: size.zoom,
        numPages: 1
    };
};
loader.prototype.openPDF = function (pdfPath, passwordFn, openMode, maxWidth, maxHeight, layers) {
    var _this = this;
    PDFJS.workerSrc = this.pdfWorkerSrc;
    // the typescript binding are a little out of date
    // returns PDFDocumentLoadingTask not just a normal promise
    var loadingTask = PDFJS.getDocument(pdfPath);
    loadingTask.onPassword = function (func, type) {
        passwordFn(func, type === 1 ? "NEED_PASSWORD" : "INCORRECT_PASSWORD");
    };
    return loadingTask.then(function (pdf) {
        _this.pdfCanvas.setEnabled(true);
        _this.pdfCanvas.setPDFDoc(pdf);
        _this.grid.initialize(maxWidth, maxHeight);
        if (layers) {
            _this.grid.load(layers);
        }
        return _this.openPDFPage(1, openMode, maxWidth, maxHeight);
    });
};
loader.prototype.openPDFPage = function (newPage, openMode, maxWidth, maxHeight) {
    var _this = this;
    var pdf = this.pdfCanvas.pdfDoc;
    return pdf.getPage(newPage).then(function (page) {
        _this.pdfCanvas.setPDFPage(page);
        _this.grid.updatePageNumber(newPage);
        var viewport = page.getViewport(1);
        var size = PositionGenerator.getNewDimensions({
            openMode: openMode,
            width: viewport.width,
            height: viewport.height,
            zoom: _this.canvas.zoomRatio,
            maxWidth: maxWidth,
            maxHeight: maxHeight
        });
        _this.canvas.setOriginalSize(viewport.width, viewport.height);
        _this.canvas.resize(size.width, size.height, size.zoom);
        return {
            width: size.width,
            height: size.height,
            zoom: size.zoom,
            numPages: pdf.numPages
        };
    });
};

export default loader;