import tool from './Tool';
import __extends from '../__extends';
import {TOOL_NAMES, CURSORS} from '../Constants';
import RenderObjectCreator from '../RenderObjectCreator';


__extends(shapeTool, tool);
function shapeTool(renderer, canvas, transformTool, lineTransformTool) {
    var _this = tool.call(this) || this;
    _this.renderer = renderer;
    _this.canvas = canvas;
    _this.transformTool = transformTool;
    _this.lineTransformTool = lineTransformTool;
    _this.isStackTool = false;
    _this.firstPoint = null;
    _this.lastShape = null;
    return _this;
}
shapeTool.prototype.startDraw = function (mouse, toolOptions) {
    var strokePoint = {
        x: mouse.x,
        y: mouse.y
    };
    this.firstPoint = strokePoint;
    this.lastShape = null;
    return null;
};
shapeTool.prototype.draw = function (mouse, toolOptions) {
    var shape = RenderObjectCreator.createShape({
        shapeType: toolOptions.shapeType,
        p1: this.firstPoint,
        p2: mouse,
        color: toolOptions.color,
        brushSize: toolOptions.shapeSize
    });
    this.renderer.renderTempObject(shape);
    this.lastShape = shape;
};
shapeTool.prototype.stopDraw = function (toolOptions) {
    var nextTool = null;
    if (this.lastShape) {
        if (this.lastShape.isLineType) {
            this.lineTransformTool.setShape(this.lastShape);
            nextTool = TOOL_NAMES.LINE_TRANSFORM_TOOL;
        }
        else {
            this.transformTool.setShape(this.lastShape);
            nextTool = TOOL_NAMES.TRANSFORM_TOOL;
        }
    }
    this.lastShape = null;
    this.firstPoint = null;
    return nextTool;
};
shapeTool.prototype.start = function () {
    this.canvas.updateCursor(CURSORS.DEFAULT);
};

export default shapeTool;