import lineRenderer from './LineRenderer';
import shapeRenderer from './ShapeRenderer';
import textRenderer from './TextRenderer';
import transformToolRenderer from './TransformToolRendererer';
import pdfRenderer from './PDFRenderer';
import {RENDER_TYPES} from './Constants';


function Renderer(utils, grid, canvas, pdfCanvas) {
    this.utils = utils;
    this.grid = grid;
    this.canvas = canvas;
    this.pdfCanvas = pdfCanvas;
    this.lineRenderer = new lineRenderer(this.grid);
    this.textRenderer = new textRenderer(this.grid, this.canvas);
    this.shapeRenderer = new shapeRenderer(this.grid);
    this.transformToolRenderer = new transformToolRenderer(this.grid);
    this.pdfRenderer = new pdfRenderer(this.utils, this.pdfCanvas);
}
Renderer.prototype.forceRender = function (renderData) {
    var _this = this;
    var pages = this.grid.getAllVisiblePages();
    return this.pdfRenderer.forceRender(renderData).then(function () {
        if (renderData.background) {
            _this.applyBackground(renderData);
        }
        pages.forEach(function (page) {
            var renderObject = _this.grid.getAllRenderObjects(page);
            _this.renderObjects(renderData, renderObject);
        });
    });
};
Renderer.prototype.render = function () {
    var _this = this;
    var renderData = this.canvas.getRenderData();
    this.clearContext(renderData);
    var pages = this.grid.getAllVisiblePages();
    this.pdfRenderer.render(renderData);
    pages.forEach(function (page) {
        var renderObject = _this.grid.getAllRenderObjects(page);
        _this.renderObjects(renderData, renderObject);
    });
};
Renderer.prototype.renderTempObject = function (renderObject, drawTool, type) {
    if (drawTool === void 0) { drawTool = false; }
    var renderData = this.canvas.getTempRenderData();
    this.clearContext(renderData);
    this.renderObject(renderData, renderObject);
    if (drawTool) {
        this.transformToolRenderer.drawTool(renderData, renderObject, type);
    }
};
Renderer.prototype.clearTemp = function () {
    var renderData = this.canvas.getTempRenderData();
    this.clearContext(renderData);
};
Renderer.prototype.getTextSize = function (textObject, maxWidth, maxHeight) {
    var context = this.canvas.context;
    return this.textRenderer.getTextSize(context, textObject.text, textObject.fontSize, maxWidth, maxHeight);
};
Renderer.prototype.renderObjects = function (renderData, renderObject) {
    var _this = this;
    var transparentObjects = [];
    var solidObjects = [];
    renderObject.forEach(function (renderObject) {
        if (renderObject.isEditing) {
            return;
        }
        if (!renderObject.opacity || renderObject.opacity === 1) {
            solidObjects.push(renderObject);
        }
        else {
            transparentObjects.push(renderObject);
        }
    });
    // only lines can be transparent for now
    this.lineRenderer.renderTransparent(renderData, transparentObjects);
    solidObjects.forEach(function (renderObject) {
        _this.renderObject(renderData, renderObject);
    });
};
Renderer.prototype.clearContext = function (renderData) {
    if (renderData.background) {
        this.applyBackground(renderData);
    }
    else {
        renderData.context.clearRect(0, 0, renderData.viewport.width, renderData.viewport.height);
    }
};
Renderer.prototype.applyBackground = function (renderData) {
    var _a = renderData.viewport, zoomRatio = _a.zoomRatio, pixelRatio = _a.pixelRatio;
    var _b = renderData.background, width = _b.width, height = _b.height, image = _b.image;
    renderData.context.drawImage(image, 0, 0, width * zoomRatio * pixelRatio, height * zoomRatio * pixelRatio);
};
Renderer.prototype.renderObject = function (renderData, renderObject) {
    if (renderObject.type === RENDER_TYPES.SHAPE) {
        this.shapeRenderer.render(renderData, renderObject);
    }
    else if (renderObject.type === RENDER_TYPES.STROKE) {
        this.lineRenderer.render(renderData, renderObject);
    }
    else if (renderObject.type === RENDER_TYPES.TEXT) {
        this.textRenderer.render(renderData, renderObject);
    }
};
Renderer.setRenderValues = function (point, position) {
    point.xDraw = point.x * position.zoomRatio * position.pixelRatio + position.xOffset;
    point.yDraw = point.y * position.zoomRatio * position.pixelRatio + position.yOffset;
};

export default Renderer;