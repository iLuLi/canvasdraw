import {TOOL_NAMES, KEY_TYPES} from '../Constants';
import transformTool from './TransformTool';
import eraser from './Eraser';
import toolUtils from './ToolUtils';
import lineTransformTool from './LineTransformTool';
import shapeTool from './ShapeTool';
import panTool from './Pantool';
import textTool from './TextTool';
import colorPicker from './ColorPicker';
import selectorTool from './SelectorTool';
import brush from './Brush';
import _ from 'lodash';


function toolManager(canvas, screenManager, renderer, grid, utils, toolOptions) {
    this.canvas = canvas;
    this.screenManager = screenManager;
    this.grid = grid;
    this.isDoubleClick = false;
    this.mouseMoved = false;
    this.painting = false;
    var transformTool1 = new transformTool(utils, renderer, canvas, grid);
    var lineTransformTool1 = new lineTransformTool(renderer, canvas, grid);
    var toolUtils1 = new toolUtils(utils, transformTool1, lineTransformTool1);
    this.tools = (_a = {},
        _a[TOOL_NAMES.BRUSH] = new brush(renderer, canvas, grid),
        _a[TOOL_NAMES.ERASER] = new eraser(renderer, canvas, grid),
        _a[TOOL_NAMES.SHAPE_TOOL] = new shapeTool(renderer, canvas, transformTool1, lineTransformTool1),
        _a[TOOL_NAMES.PAN_TOOL] = new panTool(renderer, canvas, utils),
        _a[TOOL_NAMES.TEXT_TOOL] = new textTool(renderer, canvas, grid, transformTool1),
        _a[TOOL_NAMES.TRANSFORM_TOOL] = transformTool1,
        _a[TOOL_NAMES.LINE_TRANSFORM_TOOL] = lineTransformTool1,
        _a[TOOL_NAMES.COLOR_PICKER] = new colorPicker(renderer, canvas, grid, utils),
        _a[TOOL_NAMES.SELECTOR] = new selectorTool(renderer, canvas, grid, utils, toolUtils1),
        _a);
    this.toolUtils = toolUtils1;
    this.toolOptions = toolOptions;
    this.tool = null;
    this.toolStack = [];
    this.waitingToReturnToCanvas = false;
    this._setCanvasEvents();
    this._setOffsetEvents();
    var _a;
}
toolManager.prototype.updateToolOptions = function (toolOptions) {
    _.assign(this.toolOptions, toolOptions);
    if (this.tool) {
        this.tool.toolOptionsUpdated(_.clone(this.toolOptions));
    }
};
toolManager.prototype.setToolByName = function (toolName, toolOptions) {
    if (toolName === TOOL_NAMES.POP_STACK) {
        // need to pop off the current tool and then use
        this.toolStack.pop();
        var newTool = this.toolStack.pop();
        this.setTool(newTool);
    }
    else {
        if (this.tools[toolName] === this.tool && !toolOptions) {
            return;
        }
        this.setTool(this.tools[toolName]);
    }
    if (toolOptions) {
        this.updateToolOptions(toolOptions);
    }
};
;
toolManager.prototype.setTool = function (tool) {
    if (tool.isStackTool) {
        this.toolStack.push(tool);
    }
    else {
        this.toolStack = [tool];
    }
    // close the previous tool
    if (this.tool) {
        this.tool.close();
    }
    this.tool = tool;
    this.tool.start();
};
// TODO think of a better way to do this
toolManager.prototype.closeTool = function () {
    if (this.tool) {
        var nextToolName = this.tool.exit();
        if (nextToolName) {
            this.setToolByName(nextToolName);
        }
    }
};
toolManager.prototype.undoLastAction = function () {
    var shouldUndoGrid = true;
    if (this.tool) {
        // some tools have special undo actions
        shouldUndoGrid = this.tool.undo();
        var nextToolName = this.tool.exit();
        if (nextToolName) {
            this.setToolByName(nextToolName);
        }
    }
    return shouldUndoGrid;
};
toolManager.prototype.redraw = function () {
    if (this.tool) {
        this.tool.redraw();
    }
};
toolManager.prototype.saveCurrent = function () {
    var nextToolName = this.tool.exit();
    if (nextToolName) {
        this.setToolByName(nextToolName);
    }
};
toolManager.prototype.enable = function () {
    this._setKeyboardEvents();
};
toolManager.prototype.hasContent = function () {
    return this.tool && this.tool.hasContent();
};
toolManager.prototype.close = function () {
    this.closeTool();
    document.removeEventListener("keydown", this.keydownFunc);
};
toolManager.prototype.copyContents = function () {
    this.tool && this.tool.copyContents();
};
toolManager.prototype.pasteContents = function () {
    var object = this.grid.pasteCopyBuffer();
    if (object) {
        var nextTool = this.toolUtils.selectObject(object);
        if (nextTool) {
            this.setToolByName(nextTool);
            this.painting = false;
        }
    }
};
toolManager.prototype._keyPressed = function (key) {
    if (!this.tool) {
        return;
    }
    var nextToolName = this.tool.keyPressed(key);
    if (nextToolName) {
        this.setToolByName(nextToolName);
    }
};
toolManager.prototype._setKeyboardEvents = function () {
    var _this = this;
    var keyMapping = [
        { keycodes: [27], type: KEY_TYPES.ESC },
        { keycodes: [8], type: KEY_TYPES.BACKSPACE },
        { keycodes: [38], type: KEY_TYPES.UP },
        { keycodes: [40], type: KEY_TYPES.DOWN },
        { keycodes: [39], type: KEY_TYPES.RIGHT },
        { keycodes: [37], type: KEY_TYPES.LEFT }
    ];
    var SPACEBAR_KEYCODE = 32;
    var ENTER_KEYCODE = 13;
    this.keydownFunc = function (event) {
        keyMapping.forEach(function (mapping) {
            if (event.keyCode === ENTER_KEYCODE && !event.shiftKey) {
                _this._keyPressed(KEY_TYPES.HARD_ENTER);
            }
            else if (_.contains(mapping.keycodes, event.keyCode)) {
                _this._keyPressed(mapping.type);
            }
            else if (event.keyCode === SPACEBAR_KEYCODE && _this.tool && !_this.tool.disablePanOnSpacebar) {
                event.preventDefault();
                _this.setToolByName(TOOL_NAMES.PAN_TOOL);
            }
        });
    };
    document.addEventListener("keydown", this.keydownFunc);
};
toolManager.prototype._setCanvasEvents = function () {
    var _this = this;
    this.canvas.on("mousedown", this.onMouseDown.bind(this));
    this.canvas.on("touchstart", function (e) {
        e.preventDefault();
        e = _this.normalizeTouch(e);
        if (e.touches.length > 1) {
            _this.screenManager.onTouchStart(e);
        }
        else {
            _this.onMouseDown.call(_this, e);
        }
    });
    this.canvas.on("mousemove", function (e) {
        if (_this.waitingToReturnToCanvas) {
            _this.waitingToReturnToCanvas = false;
            if (!e.which) {
                _this.onMouseUp.call(_this, e);
                return;
            }
        }
        _this.onMouseMove.call(_this, e);
    });
    this.canvas.on("touchmove", function (e) {
        e.preventDefault();
        e = _this.normalizeTouch(e);
        if (e.touches.length > 1) {
            _this.screenManager.onTouchMove(e);
        }
        else {
            _this.onMouseMove.call(_this, e);
        }
    });
    this.canvas.on("mouseup", this.onMouseUp.bind(this));
    this.canvas.on("mouseleave", function () {
        _this.waitingToReturnToCanvas = true;
    });
    this.canvas.on("mouseout", function () {
        _this.waitingToReturnToCanvas = true;
    });
    this.canvas.on("touchstop", this.onMouseUp.bind(this));
    this.canvas.on("touchcancel", this.onMouseUp.bind(this));
    this.canvas.on("touchend", this.onMouseUp.bind(this));
    this.canvas.on("touchcancel", this.onMouseUp.bind(this));
};
toolManager.prototype._setOffsetEvents = function () {
    var _this = this;
    this.canvas.on("resize", function () {
        _this.onOffsetEvent();
    });
    window.addEventListener("resize", function () {
        _this.onOffsetEvent();
    });
    document.addEventListener('scroll', function (event) {
        _this.onOffsetEvent();
    }, true /*Capture event*/);
};
toolManager.prototype.onOffsetEvent = function () {
    var canvasOffset = this.canvas.getOffset();
    this.screenManager.setOffset(canvasOffset.left, canvasOffset.top);
};
toolManager.prototype.onMouseDown = function (e) {
    var self = this;
    e.preventDefault();
    this.painting = true;
    this.isDoubleClick = !this.mouseMoved && !this.isDoubleClick;
    this.mouseMoved = false;
    var point = this.getPoint(e);
    if (this.tool) {
        var switchToolName = this.tool.startDraw(point, _.clone(self.toolOptions));
        if (switchToolName) {
            this.setToolByName(switchToolName);
            // if we switch tools we want to reset
            this.painting = false;
        }
    }
};
toolManager.prototype.onMouseUp = function (e) {
    var self = this;
    if (e) {
        e.preventDefault();
    }
    if (self.painting) {
        self.painting = false;
        if (self.tool) {
            var switchToolName = self.tool.stopDraw(_.clone(self.toolOptions));
            if (switchToolName) {
                this.setToolByName(switchToolName);
            }
        }
    }
};
toolManager.prototype.onMouseMove = function (e) {
    this.mouseMoved = true;
    e.preventDefault();
    if (!this.tool) {
        return;
    }
    var point = this.getPoint(e);
    if (this.painting) {
        this.tool.draw(point, _.clone(this.toolOptions));
    }
    else {
        this.tool.hover(point);
    }
};
toolManager.prototype.getPoint = function (e) {
    var offset = this.screenManager.getOffset();
    var canvasX = (e.pageX - offset.left);
    var canvasY = (e.pageY - offset.top);
    return {
        canvasX: (canvasX * this.canvas.ratio),
        canvasY: (canvasY * this.canvas.ratio),
        x: canvasX / this.canvas.zoomRatio,
        y: canvasY / this.canvas.zoomRatio,
        isDoubleClick: this.isDoubleClick
    };
};
toolManager.prototype.normalizeTouch = function (e) {
    // this is for iphone
    if (e.originalEvent && e.originalEvent.targetTouches) {
        e.pageX = e.originalEvent.targetTouches[0].clientX;
        e.pageY = e.originalEvent.targetTouches[0].clientY;
    }
    // this is for android
    if (!e.pageX && e.targetTouches) {
        e.pageX = e.targetTouches[0].clientX;
        e.pageY = e.targetTouches[0].clientY;
    }
    return e;
};

export default toolManager;