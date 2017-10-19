function tool() {
    this.disablePanOnSpacebar = false;
}
tool.prototype.startDraw = function (mouse, toolOptions) {
    return null;
};
tool.prototype.stopDraw = function (toolOptions) {
    return null;
};
tool.prototype.start = function () { };
tool.prototype.exit = function () { return null; };
tool.prototype.close = function () { };
tool.prototype.undo = function () {
    return true;
};
tool.prototype.redraw = function () { };
tool.prototype.keyPressed = function (type) {
    return null;
};
tool.prototype.hasContent = function () {
    return false;
};
tool.prototype.hover = function (mouse) { };
tool.prototype.copyContents = function () {
};
tool.prototype.toolOptionsUpdated = function (toolOptions) { };

export default tool;