import tool from './Tool';
import __extends from '../__extends';
import RenderObjectCreator from '../RenderObjectCreator';
import {TOOL_NAMES, RENDER_TYPES, KEY_TYPES, SHAPE_TYPES, CURSORS} from '../Constants';
import _ from 'lodash';


__extends(textTool, tool);
function textTool(renderer, canvas, grid, transformTool) {
    var _this = tool.call(this) || this;
    _this.renderer = renderer;
    _this.canvas = canvas;
    _this.grid = grid;
    _this.transformTool = transformTool;
    _this.typingEnabled = false;
    _this.ignoreNextClick = false;
    _this.isStackTool = false;
    _this.disablePanOnSpacebar = true;
    return _this;
}
textTool.prototype.startDraw = function (toolPosition, toolOptions) {
    // check if we should select another text box
    var textObjects = this.grid.searchFor(toolPosition.x, toolPosition.y, 5, RENDER_TYPES.TEXT);
    if (this.typingEnabled && textObjects.length) {
        this.setTypingEnabled(false);
        if (this.textObject.text !== "") {
            this.grid.addRenderObject(this.textObject);
        }
        this.textObject = textObjects[textObjects.length - 1];
        this.textObject.isEditing = true;
        this.renderer.render();
        this.setTypingEnabled(true);
        return null;
    }
    else if (this.typingEnabled) {
        this.setTypingEnabled(false);
        if (this.textObject.text !== "") {
            this.setTransformTool();
            return TOOL_NAMES.TRANSFORM_TOOL;
        }
    }
    else if (textObjects.length) {
        this.textObject = textObjects[textObjects.length - 1];
        this.textObject.isEditing = true;
        this.renderer.render();
        this.setTypingEnabled(true);
        return null;
    }
    this.textObject = null;
    var strokePoint = {
        x: toolPosition.x,
        y: toolPosition.y
    };
    this.selectionBox = RenderObjectCreator.createShape({
        shapeType: SHAPE_TYPES.SQUARE,
        p1: strokePoint,
        p2: _.clone(strokePoint),
        color: "black",
        brushSize: 1.5,
    });
    return null;
};
textTool.prototype.draw = function (toolPosition, toolOptions) {
    if (this.textObject) {
        return;
    }
    // let the user drag out the selection space
    this.selectionBox.p2 = {
        x: toolPosition.x,
        y: toolPosition.y
    };
    this.renderer.renderTempObject(this.selectionBox);
};
textTool.prototype.stopDraw = function (toolOptions) {
    if (this.textObject) {
        return null;
    }
    this.renderer.clearTemp();
    var p1 = this.selectionBox.p1;
    var p2 = this.selectionBox.p2;
    var x1 = Math.min(p1.x, p2.x);
    var x2 = Math.max(p1.x, p2.x);
    var y1 = Math.min(p1.y, p2.y);
    var y2 = Math.max(p1.y, p2.y);
    var fontSize = toolOptions.fontSize;
    var width = Math.max(x2 - x1, textTool.MIN_TEXTBOX_WIDTH);
    var height = Math.max(y2 - y1, textTool.MIN_TEXTBOX_HEIGHT);
    this.textObject = RenderObjectCreator.createTextObject({
        p1: { x: x1, y: y1 },
        p2: { x: x1 + width, y: y1 + height },
        fontSize: fontSize,
        color: toolOptions.color,
        text: ""
    });
    this.setTypingEnabled(true);
    return null;
};
textTool.prototype.start = function () {
    this.canvas.updateCursor(CURSORS.CROSSHAIR);
    this.setTypingEnabled(false);
    this.textObject = null;
};
textTool.prototype.redraw = function () {
    if (this.typingEnabled) {
        this.setTextAreaPosition();
    }
};
textTool.prototype.close = function () {
    if (this.typingEnabled) {
        this.setTypingEnabled(false);
        this.grid.addRenderObject(this.textObject);
        this.renderer.render();
        this.textObject = null;
    }
};
textTool.prototype.undo = function () {
    if (this.typingEnabled) {
        this.disableTextBox();
        this.typingEnabled = false;
        this.textObject = null;
        return false;
    }
    else {
        return true;
    }
};
textTool.prototype.toolOptionsUpdated = function (toolOptions) {
    if (this.typingEnabled) {
        // this is so the user can change the font size without exiting
        this.ignoreNextClick = true;
        this.textObject.color = toolOptions.color;
        this.textObject.fontSize = toolOptions.fontSize;
        this.setTextAreaOptions();
    }
};
textTool.prototype.keyPressed = function (key) {
    if ((key === KEY_TYPES.ESC || key === KEY_TYPES.HARD_ENTER) && this.typingEnabled) {
        this.setTypingEnabled(false);
        if (this.textObject.text !== "") {
            this.setTransformTool();
            return TOOL_NAMES.TRANSFORM_TOOL;
        }
    }
    return null;
};
textTool.prototype.hasContent = function () {
    return this.typingEnabled && this.getText() !== "";
};
textTool.prototype.hover = function (mouse) {
    var textObjects = this.grid.searchFor(mouse.x, mouse.y, 5, RENDER_TYPES.TEXT);
    if (textObjects.length > 0) {
        this.canvas.updateCursor(CURSORS.TEXT);
    }
    else {
        this.canvas.updateCursor(CURSORS.CROSSHAIR);
    }
};
textTool.prototype.setTransformTool = function () {
    this.transformTool.setShape(this.textObject);
    this.textObject = null;
};
textTool.prototype.getText = function () {
    var $input = this._getInputbox();
    return $input.val().trim();
};
textTool.prototype.disableTextBox = function () {
    var $input = this._getInputbox();
    $input.unbind("keydown");
    $input.css({
        display: "none"
    });
    $input.val("");
};
textTool.prototype.setTypingEnabled = function (enabled) {
    if (!this.typingEnabled && enabled) {
        this.setTextAreaPosition();
        this.setTextAreaOptions();
        var $input = this._getInputbox();
        $input.val(this.textObject.text);
        $input.focus();
    }
    else if (this.typingEnabled && !enabled && this.textObject) {
        this.textObject.text = this.getText();
        this.disableTextBox();
        var maxWidth = this.textObject.p2.x - this.textObject.p1.x;
        var maxHeight = this.textObject.p2.y - this.textObject.p1.y;
        var textSize = this.renderer.getTextSize(this.textObject, maxWidth, maxHeight);
        var p1 = this.textObject.p1;
        p1 = { x: p1.x, y: p1.y };
        this.textObject.p1 = p1;
        this.textObject.p2 = { x: p1.x + textSize.width, y: p1.y + textSize.height + 2 };
    }
    this.typingEnabled = enabled;
};
textTool.prototype.setTextAreaOptions = function () {
    var $input = this._getInputbox();
    $input.css({
        color: this.textObject.color,
        "font-size": this.textObject.fontSize * this.canvas.zoomRatio + "px"
    });
};
textTool.prototype.setTextAreaPosition = function () {
    var width = this.textObject.p2.x - this.textObject.p1.x;
    var height = this.textObject.p2.y - this.textObject.p1.y;
    var leftPos = this.textObject.p1.x * this.canvas.zoomRatio;
    var topPos = this.textObject.p1.y * this.canvas.zoomRatio;
    var $input = this._getInputbox();
    $input.css({
        display: "inline-block",
        left: leftPos,
        top: topPos,
        width: (width / this.canvas.ratio) * this.canvas.zoomRatio + 26,
        height: (height / this.canvas.ratio) * this.canvas.zoomRatio + 22
    });
};
textTool.prototype._getInputbox = function () {
    return $(".sketch-toolkit__input");
};
textTool.MIN_TEXTBOX_WIDTH = 340;
textTool.MIN_TEXTBOX_HEIGHT = 100;

export default textTool;