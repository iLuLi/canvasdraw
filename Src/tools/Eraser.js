import __extends from '../__extends';
import tool from './Tool';
import {TRANSFORM_TYPE, CURSORS} from '../Constants';

__extends(eraser, tool);
function eraser(renderer, canvas, grid) {
    var _this = tool.call(this) || this;
    _this.renderer = renderer;
    _this.canvas = canvas;
    _this.grid = grid;
    _this.eraserSize = 20;
    _this.isStackTool = false;
    return _this;
}
eraser.prototype.startDraw = function (mouse, toolOptions) {
    if (this.selectedObj) {
        this.grid.eraseObjects([this.selectedObj]);
        this.renderer.render();
    }
    this.findObject(mouse);
    return null;
};
eraser.prototype.draw = function (mouse, toolOptions) {
    if (this.selectedObj) {
        this.grid.eraseObjects([this.selectedObj]);
        this.renderer.render();
    }
    this.findObject(mouse);
};
eraser.prototype.start = function () {
    this.selectedObj = null;
    this.canvas.updateCursor(CURSORS.ERASER);
};
eraser.prototype.hover = function (mouse) {
    this.findObject(mouse);
};
eraser.prototype.findObject = function (mouse) {
    var objectsFound = this.grid.searchAt(mouse.x, mouse.y, this.eraserSize);
    if (objectsFound.length > 0) {
        this.selectedObj = objectsFound[0];
        this.renderer.renderTempObject(this.selectedObj, true, TRANSFORM_TYPE.TRANSLATE);
        this.canvas.updateCursor(CURSORS.POINTER);
    }
    else {
        this.selectedObj = null;
        this.renderer.clearTemp();
        this.canvas.updateCursor(CURSORS.DEFAULT);
    }
};

export default eraser;