import tool from './Tool';
import __extends from '../__extends';
import {CURSORS, TRANSFORM_TYPE} from '../Constants';


__extends(selectorTool, tool);
function selectorTool(renderer, canvas, grid, utils, toolUtils) {
    var _this = tool.call(this) || this;
    _this.renderer = renderer;
    _this.canvas = canvas;
    _this.grid = grid;
    _this.utils = utils;
    _this.toolUtils = toolUtils;
    _this.eraserSize = 20;
    _this.isStackTool = false;
    return _this;
}
selectorTool.prototype.draw = function (mouse, toolOptions) { };
selectorTool.prototype.stopDraw = function (toolOptions) {
    if (!this.lastObj) {
        return null;
    }
    var obj = this.lastObj;
    this.lastObj = null;
    return this.toolUtils.selectObject(obj);
};
selectorTool.prototype.start = function () {
    this.utils.emitEvent("object-selected", null);
    this.canvas.updateCursor(CURSORS.DEFAULT);
};
selectorTool.prototype.hover = function (mouse) {
    var objectsFound = this.grid.searchAt(mouse.x, mouse.y, this.eraserSize);
    if (objectsFound.length > 0) {
        this.lastObj = objectsFound[0];
        this.renderer.renderTempObject(this.lastObj, true, TRANSFORM_TYPE.TRANSLATE);
        this.canvas.updateCursor(CURSORS.POINTER);
    }
    else {
        this.lastObj = null;
        this.renderer.clearTemp();
        this.canvas.updateCursor(CURSORS.DEFAULT);
    }
};

export default selectorTool;