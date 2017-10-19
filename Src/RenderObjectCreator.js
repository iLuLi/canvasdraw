import {SHAPE_TYPES, RENDER_TYPES} from './Constants';

function RenderObjectCreator() {
}
RenderObjectCreator.createTextObject = function (initData) {
    return {
        shapeType: SHAPE_TYPES.TEXT,
        isLineType: false,
        type: RENDER_TYPES.TEXT,
        p1: initData.p1,
        p2: initData.p2,
        fontSize: initData.fontSize,
        color: initData.color,
        text: initData.text || "",
        isEditing: false
    };
};
RenderObjectCreator.createStroke = function (initData) {
    return {
        type: RENDER_TYPES.STROKE,
        points: initData.points,
        brushSize: initData.brushSize,
        color: initData.color,
        opacity: initData.opacity || 1,
        isEditing: false
    };
};
RenderObjectCreator.createShape = function (initData) {
    var type = initData.shapeType;
    return {
        type: RENDER_TYPES.SHAPE,
        isLineType: type === SHAPE_TYPES.LINE || type === SHAPE_TYPES.ARROW,
        p1: initData.p1,
        p2: initData.p2,
        brushSize: initData.brushSize,
        color: initData.color,
        shapeType: initData.shapeType,
        isEditing: false
    };
};
// we need to be careful about what information we expose
RenderObjectCreator.createExportableObject = function (object) {
    var shape = object;
    return {
        type: RENDER_TYPES[shape.type],
        color: shape.color,
        size: shape.type === RENDER_TYPES.TEXT ? shape.fontSize : shape.brushSize,
        opacity: shape.opacity,
        hasOpacity: shape.opacity && shape.opacity !== 1
    };
};
RenderObjectCreator.createSavablePoint = function (point, position) {
    var x = point.x * position.zoomRatio + position.xOffset;
    var y = point.y * position.zoomRatio + position.yOffset;
    return {
        x: Number(x.toFixed(2)),
        y: Number(y.toFixed(2))
    };
};

export default RenderObjectCreator;