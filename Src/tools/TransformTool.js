import tool from './Tool';
import __extends from '../__extends';
import {TRANSFORM_TYPE,TOOL_NAMES, RENDER_TYPES, KEY_TYPES, SHAPE_TYPES, CURSORS} from '../Constants';
import _ from 'lodash';

let ANCHOR_TYPE_X = {};
let ANCHOR_TYPE_Y = {};
ANCHOR_TYPE_X[ANCHOR_TYPE_X["LEFT"] = 0] = "LEFT";
ANCHOR_TYPE_X[ANCHOR_TYPE_X["RIGHT"] = 1] = "RIGHT";
ANCHOR_TYPE_Y[ANCHOR_TYPE_Y["TOP"] = 0] = "TOP";
ANCHOR_TYPE_Y[ANCHOR_TYPE_Y["BOTTOM"] = 1] = "BOTTOM";

__extends(transformTool, tool);
function transformTool(utils, renderer, canvas, grid) {
    var _this = tool.call(this) || this;
    _this.utils = utils;
    _this.renderer = renderer;
    _this.canvas = canvas;
    _this.grid = grid;
    _this.isStackTool = true;
    _this.shape = null;
    _this.firstPoint = null;
    _this.nextTool = null;
    _this.transformTypes = (_a = {},
        _a[TRANSFORM_TYPE.TRANSLATE] = _this._translate.bind(_this),
        _a[TRANSFORM_TYPE.STRETCH] = _this._stretch.bind(_this),
        _a[TRANSFORM_TYPE.STRETCH_X] = _this._stretchX.bind(_this),
        _a[TRANSFORM_TYPE.STRETCH_Y] = _this._stretchY.bind(_this),
        _a);
    return _this;
    var _a;
}
transformTool.prototype.setShape = function (shape) {
    if (shape.layerId) {
        this.grid.removeObjects([shape]);
    }
    // make p1 top left and p2 bottom right to simplify transforms
    this._optimiseShape(shape);
    this.transformType = TRANSFORM_TYPE.STRETCH;
    this.anchorPointX = ANCHOR_TYPE_X.RIGHT;
    this.anchorPointY = ANCHOR_TYPE_Y.TOP;
    this.shape = shape;
    this.grid.savePosition(this.shape);
    this.renderer.render();
    this.renderer.renderTempObject(shape, true);
};
transformTool.prototype.startDraw = function (mouse, toolOptions) {
    var handle = this._getHandle(mouse);
    this.anchorPointX = handle.anchorX;
    this.anchorPointY = handle.anchorY;
    if (mouse.isDoubleClick || !handle.anchorX && !handle.anchorX && !handle.inBox) {
        // just looks nicer clear the handles
        this.renderer.renderTempObject(this.shape);
        return TOOL_NAMES.POP_STACK;
    }
    else if (handle.anchorX !== null && handle.anchorY !== null) {
        this.transformType = TRANSFORM_TYPE.STRETCH;
    }
    else if (handle.anchorX !== null) {
        this.transformType = TRANSFORM_TYPE.STRETCH_X;
    }
    else if (handle.anchorY !== null) {
        this.transformType = TRANSFORM_TYPE.STRETCH_Y;
    }
    else if (handle.inBox) {
        this.transformType = TRANSFORM_TYPE.TRANSLATE;
    }
    if (this.shape.type === RENDER_TYPES.STROKE) {
        this.transformType = null;
    }
    this.canvas.updateCursor(CURSORS.GRAB);
    return null;
};
transformTool.prototype.draw = function (mouse, toolOptions) {
    if (this.shape.type === RENDER_TYPES.STROKE) {
        return null;
    }
    var strokePoint = {
        x: mouse.x,
        y: mouse.y
    };
    var tempShape = _.cloneDeep(this.shape);
    this.transformTypes[this.transformType](tempShape, this.firstPoint, strokePoint);
    this._drawTempShape(tempShape, this.transformType);
    this.lastPoint = strokePoint;
};
transformTool.prototype.stopDraw = function (toolOptions) {
    if (this.shape.type === RENDER_TYPES.STROKE) {
        return null;
    }
    // only transform if the mouse moved
    if (this.lastPoint) {
        this.transformTypes[this.transformType](this.shape, this.firstPoint, this.lastPoint);
        // reset p1 and p2
        this._optimiseShape(this.shape);
        // redraw
        this._drawTempShape(this.shape);
    }
    this.firstPoint = null;
    this.lastPoint = null;
    return null;
};
transformTool.prototype.close = function () {
    if (!this.shape) {
        this.renderer.clearTemp();
        return;
    }
    this.shape.isEditing = false;
    if (this.shape.shapeType === SHAPE_TYPES.TEXT) {
        this._addToTextGrid(this.shape);
    }
    else {
        this.grid.addRenderObject(this.shape);
    }
    if (this.shape.type !== RENDER_TYPES.STROKE) {
        this.grid.transformApplied(this.shape);
    }
    this.renderer.clearTemp();
    this.renderer.render();
};
transformTool.prototype.start = function () {
    this.canvas.updateCursor(CURSORS.DEFAULT);
};
transformTool.prototype.hasContent = function () {
    return true;
};
transformTool.prototype.exit = function () {
    var self = this;
    self.canvas.updateCursor(CURSORS.DEFAULT);
    // only transform if the mouse moved
    if (self.lastPoint) {
        self.transformTypes[self.transformType](self.shape, self.firstPoint, self.lastPoint);
        // reset p1 and p2
        self._optimiseShape(self.shape);
    }
    return TOOL_NAMES.POP_STACK;
};
transformTool.prototype.hover = function (mouse) {
    var handle = this._getHandle(mouse);
    var newCursor = CURSORS.DEFAULT;
    if (handle.anchorX === ANCHOR_TYPE_X.RIGHT &&
        handle.anchorY === ANCHOR_TYPE_Y.BOTTOM) {
        newCursor = CURSORS.STRETCH_TL;
    }
    else if (handle.anchorX === ANCHOR_TYPE_X.LEFT &&
        handle.anchorY === ANCHOR_TYPE_Y.BOTTOM) {
        newCursor = CURSORS.STRETCH_TR;
    }
    else if (handle.anchorX === ANCHOR_TYPE_X.RIGHT &&
        handle.anchorY === ANCHOR_TYPE_Y.TOP) {
        newCursor = CURSORS.STRETCH_BL;
    }
    else if (handle.anchorX === ANCHOR_TYPE_X.LEFT &&
        handle.anchorY === ANCHOR_TYPE_Y.TOP) {
        newCursor = CURSORS.STRETCH_BR;
    }
    else if (handle.anchorX !== null) {
        newCursor = CURSORS.STRETCH_VERTICAL;
    }
    else if (handle.anchorY !== null) {
        newCursor = CURSORS.STRETCH_HORIZONTAL;
    }
    else if (handle.inBox) {
        newCursor = CURSORS.MOVE;
    }
    else {
        newCursor = CURSORS.DEFAULT;
    }
    if (this.shape.type === RENDER_TYPES.STROKE && newCursor !== CURSORS.DEFAULT) {
        newCursor = CURSORS.INVALID;
    }
    this.canvas.updateCursor(newCursor);
};
transformTool.prototype.toolOptionsUpdated = function (toolOptions) {
    var shape = this.shape;
    // TODO move this logic into a tool utils class
    switch (shape.type) {
        case RENDER_TYPES.TEXT:
            shape.fontSize = toolOptions.fontSize;
            shape.color = toolOptions.color;
            break;
        case RENDER_TYPES.SHAPE:
            shape.color = toolOptions.color;
            shape.brushSize = toolOptions.shapeSize;
            break;
        case RENDER_TYPES.STROKE:
            if (shape.opacity !== 1) {
                shape.color = toolOptions.highlightColor;
                shape.brushSize = toolOptions.highlightSize;
            }
            else {
                shape.color = toolOptions.color;
                shape.brushSize = toolOptions.brushSize;
            }
            break;
    }
    this.redraw();
};
transformTool.prototype.copyContents = function () {
    this.grid.addToCopyBuffer(this.shape);
};
transformTool.prototype.keyPressed = function (key) {
    if (key === KEY_TYPES.ESC) {
        return this.exit();
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
transformTool.prototype.redraw = function () {
    this._drawTempShape(this.shape);
};
transformTool.prototype._drawTempShape = function (shape, transformType) {
    this.renderer.renderTempObject(shape, true, transformType);
};
transformTool.prototype._deleteShape = function () {
    if (this.shape.layerId) {
        this.shape.isEditing = false;
        this.grid.eraseObjects([this.shape]);
    }
    this.shape = null;
};
transformTool.prototype._moveShape = function (xOffset, yOffset) {
    this.shape.p1.x += xOffset;
    this.shape.p1.y += yOffset;
    this.shape.p2.x += xOffset;
    this.shape.p2.y += yOffset;
    this._drawTempShape(this.shape);
};
transformTool.prototype._optimiseShape = function (shape) {
    var x1 = Math.min(shape.p1.x, shape.p2.x);
    var x2 = Math.max(shape.p1.x, shape.p2.x);
    var y1 = Math.min(shape.p1.y, shape.p2.y);
    var y2 = Math.max(shape.p1.y, shape.p2.y);
    shape.p1.x = x1;
    shape.p1.y = y1;
    shape.p2.x = x2;
    shape.p2.y = y2;
};
transformTool.prototype._translate = function (shape, p1, p2) {
    var deltaX = p2.x - p1.x;
    var deltaY = p2.y - p1.y;
    shape.p1.x += deltaX;
    shape.p1.y += deltaY;
    shape.p2.x += deltaX;
    shape.p2.y += deltaY;
};
transformTool.prototype._stretch = function (shape, p1, p2) {
    this._stretchX(shape, p1, p2);
    this._stretchY(shape, p1, p2);
};
transformTool.prototype._stretchX = function (shape, p1, p2) {
    var self = this;
    var deltaX = p2.x - p1.x;
    if (self.anchorPointX === ANCHOR_TYPE_X.LEFT) {
        shape.p2.x += deltaX;
    }
    else if (self.anchorPointX === ANCHOR_TYPE_X.RIGHT) {
        shape.p1.x += deltaX;
    }
};
transformTool.prototype._stretchY = function (shape, p1, p2) {
    var self = this;
    var deltaY = p2.y - p1.y;
    if (self.anchorPointY === ANCHOR_TYPE_Y.TOP) {
        shape.p2.y += deltaY;
    }
    else if (self.anchorPointY === ANCHOR_TYPE_Y.BOTTOM) {
        shape.p1.y += deltaY;
    }
};
transformTool.prototype._getHandle = function (mouse) {
    var self = this;
    var strokePoint = {
        x: mouse.x,
        y: mouse.y
    };
    self.firstPoint = strokePoint;
    var x1 = Math.min(self.shape.p1.x, self.shape.p2.x);
    var x2 = Math.max(self.shape.p1.x, self.shape.p2.x);
    var y1 = Math.min(self.shape.p1.y, self.shape.p2.y);
    var y2 = Math.max(self.shape.p1.y, self.shape.p2.y);
    // mobile needs a bigger hitbox
    var handleSize = self.utils.isMobile ? 10 : 10;
    var distX = x2 - x1;
    var distY = y2 - y1;
    // we need to set the anchor point to the opposite side
    var anchorX = null;
    var isMiddleX = false;
    if (Math.abs(x1 - strokePoint.x) < handleSize) {
        anchorX = ANCHOR_TYPE_X.RIGHT;
    }
    else if (Math.abs((x1 + distX / 2) - strokePoint.x) < handleSize) {
        isMiddleX = true;
    }
    else if (Math.abs(x2 - strokePoint.x) < handleSize) {
        anchorX = ANCHOR_TYPE_X.LEFT;
    }
    var anchorY = null;
    var isMiddleY = false;
    if (Math.abs(y1 - strokePoint.y) < handleSize) {
        anchorY = ANCHOR_TYPE_Y.BOTTOM;
    }
    else if (Math.abs((y1 + distY / 2) - strokePoint.y) < handleSize) {
        isMiddleY = true;
    }
    else if (Math.abs(y2 - strokePoint.y) < handleSize) {
        anchorY = ANCHOR_TYPE_Y.TOP;
    }
    var res = {
        anchorX: null,
        anchorY: null,
        inBox: false
    };
    if ((anchorX !== null || anchorY !== null) && (anchorX !== null || isMiddleX) && (anchorY !== null || isMiddleY)) {
        res.anchorX = anchorX;
        res.anchorY = anchorY;
        res.inBox = true;
    }
    else if ((mouse.x + 5 > x1 && mouse.x < x2 + 5) && (mouse.y + 5 > y1 && mouse.y < y2 + 5)) {
        res.inBox = true;
    }
    return res;
};
transformTool.prototype._addToTextGrid = function (shape) {
    var p1 = shape.p1;
    var p2 = shape.p2;
    var x1 = Math.min(p1.x, p2.x);
    var x2 = Math.max(p1.x, p2.x);
    var y1 = Math.min(p1.y, p2.y);
    var y2 = Math.max(p1.y, p2.y);
    var width = Math.max(x2 - x1, 100);
    var height = Math.max(y2 - y1, 40);
    var textSize = this.renderer.getTextSize(shape, width, height);
    shape.p1.x = x1;
    shape.p1.y = y1;
    // we need to add 1 since there might be some rounding with the zoom
    shape.p2.x = x1 + textSize.width + 1;
    shape.p2.y = y1 + textSize.height + 1;
    this.grid.addRenderObject(shape);
};

export default transformTool;