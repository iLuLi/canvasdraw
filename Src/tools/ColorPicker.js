import tool from './Tool';
import __extends from '../__extends';
import {CURSORS} from '../Constants';

__extends(colorPicker, tool);
function colorPicker(renderer, canvas, grid, utils) {
    var _this = tool.call(this) || this;
    _this.renderer = renderer;
    _this.canvas = canvas;
    _this.grid = grid;
    _this.utils = utils;
    _this.isStackTool = true;
    return _this;
}
colorPicker.prototype.startDraw = function (mouse, toolOptions) {
    this.lastPoint = mouse;
    return null;
};
colorPicker.prototype.hover = function (mouse) {
    var color = this.getPixelColor({ x: mouse.canvasX, y: mouse.canvasY });
    this.utils.emitEvent("hovering-color", color);
};
colorPicker.prototype.draw = function (mouse, toolOptions) {
    this.lastPoint = mouse;
};
colorPicker.prototype.stopDraw = function (toolOptions) {
    var color = this.getPixelColor({ x: this.lastPoint.canvasX, y: this.lastPoint.canvasY });
    this.utils.emitEvent("color-selected", color);
    return null;
};
colorPicker.prototype.start = function () {
    this.canvas.updateCursor(CURSORS.COLOR_PICKER);
};
colorPicker.prototype.getPixelColor = function (point) {
    var pixelData = this.canvas.getPixel(point);
    var rgb = "#";
    for (var i = 0; i < 3; i++) {
        var hex = pixelData[i].toString(16);
        hex = hex.length === 1 ? "0" + hex : hex;
        rgb += hex;
    }
    return rgb;
};

export default colorPicker;