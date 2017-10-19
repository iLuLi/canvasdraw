let TOOL_NAMES = {};
TOOL_NAMES[TOOL_NAMES["BRUSH"] = 0] = "BRUSH";
TOOL_NAMES[TOOL_NAMES["ERASER"] = 1] = "ERASER";
TOOL_NAMES[TOOL_NAMES["SHAPE_TOOL"] = 2] = "SHAPE_TOOL";
TOOL_NAMES[TOOL_NAMES["TRANSFORM_TOOL"] = 3] = "TRANSFORM_TOOL";
TOOL_NAMES[TOOL_NAMES["LINE_TRANSFORM_TOOL"] = 4] = "LINE_TRANSFORM_TOOL";
TOOL_NAMES[TOOL_NAMES["TEXT_TOOL"] = 5] = "TEXT_TOOL";
TOOL_NAMES[TOOL_NAMES["PAN_TOOL"] = 6] = "PAN_TOOL";
TOOL_NAMES[TOOL_NAMES["COLOR_PICKER"] = 7] = "COLOR_PICKER";
TOOL_NAMES[TOOL_NAMES["SELECTOR"] = 8] = "SELECTOR";
TOOL_NAMES[TOOL_NAMES["POP_STACK"] = 9] = "POP_STACK";

let RENDER_TYPES = {};
RENDER_TYPES[RENDER_TYPES["SHAPE"] = 0] = "SHAPE";
RENDER_TYPES[RENDER_TYPES["STROKE"] = 1] = "STROKE";
RENDER_TYPES[RENDER_TYPES["TEXT"] = 2] = "TEXT";

let TRANSFORM_TYPE = {};
TRANSFORM_TYPE[TRANSFORM_TYPE["TRANSLATE"] = 0] = "TRANSLATE";
TRANSFORM_TYPE[TRANSFORM_TYPE["STRETCH"] = 1] = "STRETCH";
TRANSFORM_TYPE[TRANSFORM_TYPE["STRETCH_X"] = 2] = "STRETCH_X";
TRANSFORM_TYPE[TRANSFORM_TYPE["STRETCH_Y"] = 3] = "STRETCH_Y";

let SHAPE_TYPES = {};
SHAPE_TYPES[SHAPE_TYPES["SQUARE"] = 0] = "SQUARE";
SHAPE_TYPES[SHAPE_TYPES["CIRCLE"] = 1] = "CIRCLE";
SHAPE_TYPES[SHAPE_TYPES["ARROW"] = 2] = "ARROW";
SHAPE_TYPES[SHAPE_TYPES["LINE"] = 3] = "LINE";
SHAPE_TYPES[SHAPE_TYPES["CLOUD"] = 4] = "CLOUD";
SHAPE_TYPES[SHAPE_TYPES["TEXT"] = 5] = "TEXT";

let COMMANDS = {};
COMMANDS[COMMANDS["ERASED_OBJECTS"] = 0] = "ERASED_OBJECTS";
COMMANDS[COMMANDS["ADDED_OBJECTS"] = 1] = "ADDED_OBJECTS";
COMMANDS[COMMANDS["TRANSFORM_OBJECTS"] = 2] = "TRANSFORM_OBJECTS";

let KEY_TYPES = {};
KEY_TYPES[KEY_TYPES["LEFT"] = 0] = "LEFT";
KEY_TYPES[KEY_TYPES["RIGHT"] = 1] = "RIGHT";
KEY_TYPES[KEY_TYPES["UP"] = 2] = "UP";
KEY_TYPES[KEY_TYPES["DOWN"] = 3] = "DOWN";
KEY_TYPES[KEY_TYPES["ESC"] = 4] = "ESC";
KEY_TYPES[KEY_TYPES["BACKSPACE"] = 5] = "BACKSPACE";
KEY_TYPES[KEY_TYPES["HARD_ENTER"] = 6] = "HARD_ENTER";

let CURSORS = {};
CURSORS.GRABBER = "all-scroll";
CURSORS.GRAB = "grabbing";
CURSORS.MOVE = "all-scroll";
CURSORS.STRETCH_HORIZONTAL = "ns-resize";
CURSORS.STRETCH_VERTICAL = "ew-resize";
CURSORS.STRETCH_TL = "nwse-resize";
CURSORS.STRETCH_TR = "nesw-resize";
CURSORS.STRETCH_BL = "nesw-resize";
CURSORS.STRETCH_BR = "nwse-resize";
CURSORS.DEFAULT = "default";
CURSORS.BRUSH = "url('/assets/images/draw_stroke.png') 7 25, crosshair";
CURSORS.ERASER = "url('/assets/images/erase_cursor.png') 2 25, crosshair";
CURSORS.TEXT = "text";
CURSORS.CROSSHAIR = "crosshair";
CURSORS.POINTER = "pointer";
CURSORS.COLOR_PICKER = "url('/assets/images/erase_cursor.png') 2 25, crosshair";
CURSORS.INVALID = "not-allowed";

export {TOOL_NAMES};
export {RENDER_TYPES};
export {TRANSFORM_TYPE};
export {SHAPE_TYPES};
export {COMMANDS};
export {KEY_TYPES};
export {CURSORS};