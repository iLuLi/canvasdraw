import RenderObjectCreator from '../RenderObjectCreator';
import {TOOL_NAMES, RENDER_TYPES} from '../Constants';

function toolUtils(utils, transformTool, lineTransformTool) {
    this.utils = utils;
    this.transformTool = transformTool;
    this.lineTransformTool = lineTransformTool;
}
toolUtils.prototype.selectObject = function (object) {
    var exportObject = RenderObjectCreator.createExportableObject(object);
    this.utils.emitEvent("object-selected", exportObject);
    switch (object.type) {
        case RENDER_TYPES.TEXT:
            var textObj = object;
            this.transformTool.setShape(textObj);
            return TOOL_NAMES.TRANSFORM_TOOL;
        case RENDER_TYPES.SHAPE:
            var shape = object;
            if (shape.isLineType) {
                this.lineTransformTool.setShape(shape);
                return TOOL_NAMES.LINE_TRANSFORM_TOOL;
            }
            else {
                this.transformTool.setShape(shape);
                return TOOL_NAMES.TRANSFORM_TOOL;
            }
        case RENDER_TYPES.STROKE:
            var stroke = object;
            this.transformTool.setShape(stroke);
            return TOOL_NAMES.TRANSFORM_TOOL;
        default:
            return null;
    }
};

export default toolUtils;