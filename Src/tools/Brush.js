
import {CURSORS} from '../Constants';
import RenderObjectCreator from '../RenderObjectCreator';
import tool from './Tool';
import __extends from '../__extends';

__extends(brush, tool);

function brush(renderer, canvas, grid) {
    var _this = tool.call(this) || this;
    _this.renderer = renderer;
    _this.canvas = canvas;
    _this.grid = grid;
    _this.isStackTool = false;
    return _this;
}
brush.prototype.startDraw = function (mouse, toolOptions) {
    var strokePoint = {
        x: mouse.x,
        y: mouse.y
    };
    var isHighlight = toolOptions.isHighlightMode;
    var opacity = isHighlight ? 0.5 : 1;
    var brushSize = isHighlight ? toolOptions.highlightSize : toolOptions.brushSize;
    var color = isHighlight ? toolOptions.highlightColor : toolOptions.color;
    this.stroke = RenderObjectCreator.createStroke({
        opacity: opacity,
        brushSize: brushSize,
        color: color,
        points: [strokePoint]
    });
    return null;
};
brush.prototype.draw = function (mouse, toolOptions) {
    var point = this.stroke.points[this.stroke.points.length - 1];
    var strokePoint = {
        x: mouse.x,
        y: mouse.y
    };
    if (point) {
        var a = (strokePoint.x - point.x) * (strokePoint.x - point.x);
        var b = (strokePoint.y - point.y) * (strokePoint.y - point.y);
        var d = Math.sqrt(a + b);
        if (d <= 1) {
            return;
        }
    }
    this.stroke.points.push(strokePoint);
    this.renderer.renderTempObject(this.stroke);
};
brush.prototype.stopDraw = function (toolOptions) {
    //  we only want strokes not dots
    if (this.stroke.points.length > 1) {
        this.grid.addRenderObject(this.stroke);
        this.renderer.render();
    }
    this.renderer.clearTemp();
    return null;
};
brush.prototype.start = function () {
    this.canvas.updateCursor(CURSORS.BRUSH);
};


export default brush;