import tool from './Tool';
import __extends from '../__extends';
import {TOOL_NAMES, KEY_TYPES, CURSORS} from '../Constants';
import _ from 'lodash';

let LINE_TRANSFORM_TYPE = {};
LINE_TRANSFORM_TYPE[LINE_TRANSFORM_TYPE["POINT_1"] = 0] = "POINT_1";
LINE_TRANSFORM_TYPE[LINE_TRANSFORM_TYPE["POINT_2"] = 1] = "POINT_2";
LINE_TRANSFORM_TYPE[LINE_TRANSFORM_TYPE["TRANSLATE"] = 2] = "TRANSLATE";

__extends(lineTransformTool, tool);
function lineTransformTool(renderer, canvas, grid) {
    var _this = tool.call(this) || this;
    _this.renderer = renderer;
    _this.canvas = canvas;
    _this.grid = grid;
    _this.isStackTool = true;
    _this.shape = null;
    _this.exitOnRelease = false;
    _this.firstPoint = null;
    _this.transformTypes = (_a = {},
        _a[LINE_TRANSFORM_TYPE.TRANSLATE] = _this._translate.bind(_this),
        _a[LINE_TRANSFORM_TYPE.POINT_1] = _this._movePoint1.bind(_this),
        _a[LINE_TRANSFORM_TYPE.POINT_2] = _this._movePoint2.bind(_this),
        _a);
    return _this;
    var _a;
}
lineTransformTool.prototype.hasContent = function () {
    return true;
};
lineTransformTool.prototype.setShape = function (shape) {
    if (shape.layerId) {
        this.grid.removeObjects([shape]);
    }
    this.shape = shape;
    this.grid.savePosition(this.shape);
    this.renderer.render();
    this.renderer.renderTempObject(shape, true);
};
lineTransformTool.prototype.startDraw = function (mouse, toolOptions) {
    this.exitOnRelease = false;
    var handle = this._getHandle(mouse);
    if (handle.isHandle1) {
        this.transformType = LINE_TRANSFORM_TYPE.POINT_1;
    }
    else if (handle.isHandle2) {
        this.transformType = LINE_TRANSFORM_TYPE.POINT_2;
    }
    else if (handle.inBox) {
        this.transformType = LINE_TRANSFORM_TYPE.TRANSLATE;
    }
    else {
        this.exitOnRelease = true;
        this.renderer.renderTempObject(this.shape);
    }
    if (!this.exitOnRelease) {
        this.canvas.updateCursor(CURSORS.GRAB);
    }
    return null;
};
lineTransformTool.prototype.draw = function (mouse, toolOptions) {
    var self = this;
    if (self.exitOnRelease) {
        return;
    }
    var strokePoint = {
        x: mouse.x,
        y: mouse.y
    };
    var tempShape = _.cloneDeep(this.shape);
    self.transformTypes[self.transformType](tempShape, self.firstPoint, strokePoint);
    // clear the drawing canvas and redraw stroke
    this._drawTempShape(tempShape);
    this.lastPoint = strokePoint;
};
lineTransformTool.prototype.stopDraw = function (toolOptions) {
    var self = this;
    if (self.exitOnRelease) {
        return TOOL_NAMES.POP_STACK;
    }
    // only transform if the mouse moved
    if (self.lastPoint) {
        self.transformTypes[self.transformType](this.shape, self.firstPoint, self.lastPoint);
        // redraw
        this._drawTempShape(this.shape);
    }
    self.firstPoint = null;
    self.lastPoint = null;
    return null;
};
lineTransformTool.prototype.close = function () {
    if (this.shape) {
        this.grid.addRenderObject(this.shape);
        this.grid.transformApplied(this.shape);
        this.renderer.render();
    }
    this.renderer.clearTemp();
};
lineTransformTool.prototype.copyContents = function () {
    this.grid.addToCopyBuffer(this.shape);
};
lineTransformTool.prototype.start = function () {
    this.canvas.updateCursor(CURSORS.DEFAULT);
};
lineTransformTool.prototype.exit = function () {
    this.canvas.updateCursor(CURSORS.DEFAULT);
    // only transform if the mouse moved
    if (this.lastPoint) {
        this.transformTypes[this.transformType](this.shape, this.firstPoint, this.lastPoint);
    }
    return TOOL_NAMES.POP_STACK;
};
lineTransformTool.prototype.hover = function (mouse) {
    var handle = this._getHandle(mouse);
    if (handle.isHandle1 || handle.isHandle2) {
        this.canvas.updateCursor(CURSORS.STRETCH_TL);
    }
    else if (handle.inBox) {
        this.canvas.updateCursor(CURSORS.MOVE);
    }
    else {
        this.canvas.updateCursor(CURSORS.DEFAULT);
    }
};
lineTransformTool.prototype.toolOptionsUpdated = function (toolOptions) {
    this.shape.color = toolOptions.color;
    this.shape.brushSize = toolOptions.shapeSize;
    this._drawTempShape(this.shape);
};
lineTransformTool.prototype.keyPressed = function (key) {
    if (key === KEY_TYPES.ESC) {
        return TOOL_NAMES.POP_STACK;
    }
    else if (key === KEY_TYPES.BACKSPACE) {
        this._deleteShape();
        return TOOL_NAMES.POP_STACK;
    }
    else if (key === KEY_TYPES.DOWN) {
        this._moveShape(0, 5);
    }
    else if (key === KEY_TYPES.UP) {
        this._moveShape(0, -5);
    }
    else if (key === KEY_TYPES.LEFT) {
        this._moveShape(-5, 0);
    }
    else if (key === KEY_TYPES.RIGHT) {
        this._moveShape(5, 0);
    }
    return null;
};
lineTransformTool.prototype.redraw = function () {
    this._drawTempShape(this.shape);
};
lineTransformTool.prototype._deleteShape = function () {
    if (this.shape.layerId) {
        this.shape.isEditing = false;
        this.grid.eraseObjects([this.shape]);
    }
    this.shape = null;
};
lineTransformTool.prototype._moveShape = function (xOffset, yOffset) {
    this.shape.p1.x += xOffset;
    this.shape.p1.y += yOffset;
    this.shape.p2.x += xOffset;
    this.shape.p2.y += yOffset;
    this._drawTempShape(this.shape);
};
lineTransformTool.prototype._drawTempShape = function (shape) {
    this.renderer.renderTempObject(shape, true);
};
lineTransformTool.prototype._translate = function (shape, p1, p2) {
    var deltaX = p2.x - p1.x;
    var deltaY = p2.y - p1.y;
    shape.p1.x += deltaX;
    shape.p1.y += deltaY;
    shape.p2.x += deltaX;
    shape.p2.y += deltaY;
};
lineTransformTool.prototype._movePoint1 = function (shape, p1, p2) {
    var deltaX = p2.x - p1.x;
    var deltaY = p2.y - p1.y;
    shape.p1.x += deltaX;
    shape.p1.y += deltaY;
};
lineTransformTool.prototype._movePoint2 = function (shape, p1, p2) {
    var deltaX = p2.x - p1.x;
    var deltaY = p2.y - p1.y;
    shape.p2.x += deltaX;
    shape.p2.y += deltaY;
};
lineTransformTool.prototype._getHandle = function (mouse) {
    var self = this;
    var strokePoint = {
        x: mouse.x,
        y: mouse.y
    };
    self.firstPoint = strokePoint;
    var handleSize = 8;
    var isHandle1 = Math.abs(self.shape.p1.x - strokePoint.x) < handleSize &&
        Math.abs(self.shape.p1.y - strokePoint.y) < handleSize;
    var isHandle2 = Math.abs(self.shape.p2.x - strokePoint.x) < handleSize &&
        Math.abs(self.shape.p2.y - strokePoint.y) < handleSize;
    var x1 = Math.min(self.shape.p1.x, self.shape.p2.x);
    var x2 = Math.max(self.shape.p1.x, self.shape.p2.x);
    var y1 = Math.min(self.shape.p1.y, self.shape.p2.y);
    var y2 = Math.max(self.shape.p1.y, self.shape.p2.y);
    var inBox = (mouse.x + 5 > x1 && mouse.x < x2 + 5) && (mouse.y + 5 > y1 && mouse.y < y2 + 5);
    return {
        isHandle1: isHandle1,
        isHandle2: isHandle2,
        inBox: inBox
    };
};

export default lineTransformTool;