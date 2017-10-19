import {TOOL_NAMES, RENDER_TYPES, TRANSFORM_TYPE, SHAPE_TYPES, COMMANDS, KEY_TYPES, CURSORS} from './Constants';
import utils from './Utils';
import canvas from './Canvas';
import loader from './Loader';
import grid from './Grid';
import Renderer from './Renderer';
import toolManager from './tools/ToolManager';
import screenManager from './ScreenManager';
import saver from './Saver';
import pdfCanvas from './PDFCanvas';


function Sketch($p, options, toolOptions) {
    var opts = {
        canvasName: options.canvasName || "",
        pdfCanvasWrapperName: options.pdfCanvasWrapperName || "",
        drawingLayerCanvas: options.drawingLayerCanvas || "",
        width: options.width || 0,
        height: options.height || 0,
        offsetLeft: options.offsetLeft || 0,
        offsetTop: options.offsetTop || 0,
        isMobile: options.isMobile || false,
        createdBy: options.currentUserId || "",
        eventEmitter: options.eventEmitter,
        pdfWorkerSrc: options.pdfWorkerSrc,
    };
    this.TOOLS = TOOL_NAMES;
    this.utils = new utils($p, opts.isMobile, opts.eventEmitter);
    this.grid = new grid(opts.createdBy, this.utils);
    this.pdfCanvas = new pdfCanvas(this.utils, opts.pdfCanvasWrapperName);
    this.canvas = new canvas(this.utils, this.pdfCanvas, opts.canvasName, opts.drawingLayerCanvas, opts.width, opts.height, opts.offsetLeft, opts.offsetTop);
    this.renderer = new Renderer(this.utils, this.grid, this.canvas, this.pdfCanvas);
    this.screenManager = new screenManager(this.utils);
    // tools
    this.toolManager = new toolManager(this.canvas, this.screenManager, this.renderer, this.grid, this.utils, toolOptions);
    this.loader = new loader(this.grid, this.canvas, this.pdfCanvas, this.utils, opts.pdfWorkerSrc);
    this.saver = new saver(this.utils, this.grid, this.canvas, this.loader, this.renderer);
    this.resize.call(this, opts.width, opts.height, opts.offsetLeft, opts.offsetTop);
}
Sketch.prototype.setToolOptions = function (toolOptions) {
    this.toolManager.updateToolOptions(toolOptions);
};
Sketch.prototype.useShapeTool = function (type) {
    this.toolManager.setToolByName(TOOL_NAMES.SHAPE_TOOL, { shapeType: SHAPE_TYPES[type] });
};
Sketch.prototype.useBrush = function () {
    this.toolManager.setToolByName(TOOL_NAMES.BRUSH, { isHighlightMode: false });
};
Sketch.prototype.useHighLighter = function () {
    this.toolManager.setToolByName(TOOL_NAMES.BRUSH, { isHighlightMode: true });
};
Sketch.prototype.useTextTool = function () {
    this.toolManager.setToolByName(TOOL_NAMES.TEXT_TOOL);
};
Sketch.prototype.useEraser = function () {
    this.toolManager.setToolByName(TOOL_NAMES.ERASER);
};
Sketch.prototype.usePanTool = function () {
    this.toolManager.setToolByName(TOOL_NAMES.PAN_TOOL);
};
Sketch.prototype.useColorPickerTool = function () {
    this.toolManager.setToolByName(TOOL_NAMES.COLOR_PICKER);
};
Sketch.prototype.useSelectorTool = function () {
    this.toolManager.setToolByName(TOOL_NAMES.SELECTOR);
};
Sketch.prototype.setTool = function (toolName, toolOptions) {
    this.toolManager.setToolByName(toolName, toolOptions);
};
Sketch.prototype.openHtmlImage = function (url, image, openMode, maxWidth, maxHeight, layers) {
    this.srcImage = url;
    var data = this.loader.openHtmlImage(image, openMode, maxWidth, maxHeight, layers);
    this.renderer.render();
    return data;
};
Sketch.prototype.openPDF = function (url, passwordFn, openMode, maxWidth, maxHeight, layers) {
    var _this = this;
    return this.loader.openPDF(url, passwordFn, openMode, maxWidth, maxHeight, layers).then(function (data) {
        _this.renderer.render();
        return data;
    });
};
Sketch.prototype.setPage = function (pageNum, maxWidth, maxHeight) {
    var _this = this;
    this.toolManager.saveCurrent();
    return this.loader.openPDFPage(pageNum, "CURRENT_ZOOM", maxWidth, maxHeight).then(function (data) {
        _this.renderer.render();
        return data;
    });
};
Sketch.prototype.createImageSaveData = function () {
    this.toolManager.closeTool();
    return this.saver.createSimpleData();
};
Sketch.prototype.createPDFSaveData = function (generateThumbnail) {
    this.toolManager.closeTool();
    return this.saver.createPDFSaveData(generateThumbnail);
};
Sketch.prototype.hasContent = function () {
    return this.grid.hasContent() || this.toolManager.hasContent();
};
Sketch.prototype.getImageURL = function () {
    var urlPromise = this.canvas.getDownloadURL();
    // urlPromise = this.utils.getImageBlob(this.canvas.canvas);
    this.renderer.render();
    return urlPromise;
};
Sketch.prototype.clear = function () {
    this.toolManager.closeTool();
    this.grid.clearAll();
    this.renderer.render();
};
Sketch.prototype.enableKeyBoardEvents = function () {
    this.toolManager.enable();
};
Sketch.prototype.close = function () {
    this.toolManager.close();
    this.canvas.clearImage();
};
Sketch.prototype.resize = function (width, height, offsetLeft, offsetTop) {
    if (offsetLeft === void 0) { offsetLeft = 0; }
    if (offsetTop === void 0) { offsetTop = 0; }
    this.canvas.resize(width, height);
    this.screenManager.setOffset(offsetLeft, offsetTop);
    this.grid.clearAll();
};
Sketch.prototype.updateOffset = function (offsetLeft, offsetTop) {
    if (offsetLeft === void 0) { offsetLeft = 0; }
    if (offsetTop === void 0) { offsetTop = 0; }
    this.screenManager.setOffset(offsetLeft, offsetTop);
};
Sketch.prototype.setScreenSize = function (width, height) {
    this.canvas.setScreenSize(width, height);
};
Sketch.prototype.undo = function () {
    if (this.toolManager.undoLastAction()) {
        this.grid.undo();
    }
    this.renderer.render();
};
Sketch.prototype.redo = function () {
    this.grid.redo();
    this.renderer.render();
};
Sketch.prototype.copy = function () {
    this.toolManager.copyContents();
};
Sketch.prototype.paste = function () {
    this.toolManager.pasteContents();
};
Sketch.prototype.setZoom = function (zoomVal) {
    var pos = this.canvas.setZoom(zoomVal);
    this.renderer.render();
    this.toolManager.redraw();
    return pos;
};
Sketch.TOOL_NAMES = TOOL_NAMES;
Sketch.RENDER_TYPES = RENDER_TYPES;
Sketch.TRANSFORM_TYPE = TRANSFORM_TYPE;
Sketch.SHAPE_TYPES = SHAPE_TYPES;
Sketch.COMMANDS = COMMANDS;
Sketch.KEY_TYPES = KEY_TYPES;
Sketch.CURSORS = CURSORS;

export default Sketch;