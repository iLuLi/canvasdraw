import tool from './Tool';
import __extends from '../__extends';
import {CURSORS} from '../Constants';


__extends(panTool, tool);
function panTool(renderer, canvas, utils) {
    var _this = tool.call(this) || this;
    _this.renderer = renderer;
    _this.canvas = canvas;
    _this.utils = utils;
    _this.isStackTool = false;
    _this.lastAction = new Date().getTime();
    return _this;
}
panTool.prototype.startDraw = function (mouse, toolOptions) {
    this.lastPosition = mouse;
    this.wait = 0;
    return null;
};
panTool.prototype.draw = function (mouse, toolOptions) {
    // when we move the canvas we need to wait for it stabilise before moving again
    if (this.wait > 0) {
        this.wait--;
        this.lastPosition = mouse;
        return;
    }
    var deltaX = mouse.canvasX - this.lastPosition.canvasX;
    var deltaY = mouse.canvasY - this.lastPosition.canvasY;
    this.lastPosition = null;
    this.wait = 2;
    if (deltaY === 0 && deltaX == 0) {
        return;
    }
    this.utils.emitEvent("pan", { deltaX: deltaX, deltaY: deltaY });
};
panTool.prototype.stopDraw = function (toolOptions) {
    this.canvas.updateCursor(CURSORS.GRABBER);
    return null;
};
panTool.prototype.start = function () {
    this.canvas.updateCursor(CURSORS.GRABBER);
};

export default panTool;