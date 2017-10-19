import {TRANSFORM_TYPE, RENDER_TYPES} from './Constants';
import Renderer from './Renderer';


function transformToolRenderer(grid) {
    this.grid = grid;
}
transformToolRenderer.prototype.drawTool = function (renderData, renderObject, type) {
    if (renderObject.isLineType) {
        this.drawLineTool(renderData, renderObject);
    }
    else {
        this.drawShapeTool(renderData, renderObject, type);
    }
};
transformToolRenderer.prototype.drawShapeTool = function (_a, shape, type) {
    var context = _a.context, viewport = _a.viewport;
    Renderer.setRenderValues(shape.p1, viewport);
    Renderer.setRenderValues(shape.p2, viewport);
    var x1 = Math.min(shape.p1.xDraw, shape.p2.xDraw);
    var x2 = Math.max(shape.p1.xDraw, shape.p2.xDraw);
    var y1 = Math.min(shape.p1.yDraw, shape.p2.yDraw);
    var y2 = Math.max(shape.p1.yDraw, shape.p2.yDraw);
    context.save();
    context.strokeStyle = "#544E51";
    context.lineWidth = 0.5;
    context.globalAlpha = 1.0;
    context.beginPath();
    context.translate(x1, y1);
    var distX = x2 - x1;
    var distY = y2 - y1;
    context.rect(0, 0, distX, distY);
    context.stroke();
    context.closePath();
    context.strokeStyle = "black";
    var rectSize = 14;
    // don't draw the handles if we are moving or if its a stroke
    if (type !== TRANSFORM_TYPE.TRANSLATE && shape.type !== RENDER_TYPES.STROKE) {
        this._drawHandle(context, 0, 0, rectSize);
        this._drawHandle(context, 0, distY, rectSize);
        this._drawHandle(context, distX, 0, rectSize);
        this._drawHandle(context, distX, distY, rectSize);
        // only draw middle handles if we have lots of space
        if (distX > 30) {
            this._drawHandle(context, distX / 2, 0, rectSize);
            this._drawHandle(context, distX / 2, distY, rectSize);
        }
        if (distY > 30) {
            this._drawHandle(context, 0, distY / 2, rectSize);
            this._drawHandle(context, distX, distY / 2, rectSize);
        }
    }
    context.restore();
};
transformToolRenderer.prototype.drawLineTool = function (_a, shape) {
    var context = _a.context, viewport = _a.viewport;
    Renderer.setRenderValues(shape.p1, viewport);
    Renderer.setRenderValues(shape.p2, viewport);
    this._drawHandle(context, shape.p1.xDraw, shape.p1.yDraw);
    this._drawHandle(context, shape.p2.xDraw, shape.p2.yDraw);
};
transformToolRenderer.prototype._drawHandle = function (context, x, y, rectSize) {
    if (rectSize === void 0) { rectSize = 14; }
    context.save();
    context.globalAlpha = 1;
    context.lineWidth = 1;
    context.strokeStyle = "rgba(0,0,0,1.0)";
    context.fillStyle = "white";
    context.beginPath();
    context.translate(x - rectSize / 2, y - rectSize / 2);
    context.rect(0, 0, rectSize, rectSize);
    context.fill();
    context.stroke();
    context.closePath();
    context.restore();
};

export default transformToolRenderer;