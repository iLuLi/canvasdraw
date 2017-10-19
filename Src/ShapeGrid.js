import {SHAPE_TYPES, RENDER_TYPES} from './Constants';
import RenderObjectCreator from './RenderObjectCreator';
import _ from 'lodash';

function shapeGrid() {
    var self = this;
    self.width = 0;
    self.height = 0;
    self.hitBoxTest = (_a = {},
        _a[SHAPE_TYPES.SQUARE] = self._squareHitBox.bind(self),
        _a[SHAPE_TYPES.CIRCLE] = self._circleHitBox.bind(self),
        _a[SHAPE_TYPES.ARROW] = self._lineBox.bind(self),
        _a[SHAPE_TYPES.LINE] = self._lineBox.bind(self),
        _a[SHAPE_TYPES.CLOUD] = self._squareHitBox.bind(self),
        _a[SHAPE_TYPES.TEXT] = self._squareFullHitBox.bind(self),
        _a);
    var _a;
}
shapeGrid.prototype.initialize = function (width, height) {
    this.width = width;
    this.height = height;
};
shapeGrid.prototype.searchAt = function (page, x, y, radius) {
    var _this = this;
    var shapesErased = [];
    _.forEach(page.shapes, function (shape) {
        // first see if
        var isTouching = false;
        // just check if its in the bounding box first
        if (x + radius >= shape.x1 && x - radius <= shape.x2 &&
            y + radius >= shape.y1 && y - radius <= shape.y2) {
            isTouching = _this.hitBoxTest[shape.shapeType](x, y, radius, shape);
        }
        if (isTouching) {
            shapesErased.push(shape);
        }
        return !isTouching;
    });
    return shapesErased;
};
shapeGrid.prototype.removeObject = function (page, object) {
    _.pull(page.shapes, object);
};
shapeGrid.prototype.addObject = function (page, object) {
    var shape = object;
    shape.x1 = Math.min(shape.p1.x, shape.p2.x);
    shape.x2 = Math.max(shape.p1.x, shape.p2.x);
    shape.y1 = Math.min(shape.p1.y, shape.p2.y);
    shape.y2 = Math.max(shape.p1.y, shape.p2.y);
    page.shapes.push(shape);
};
shapeGrid.prototype.clear = function (page) {
    page.shapes = [];
};
shapeGrid.prototype.getObjects = function (page) {
    return page.shapes;
};
shapeGrid.prototype.loadPage = function (layerId, page, layerData) {
    var _this = this;
    var objects = [];
    var shapes = _.filter(layerData.objects, { type: RENDER_TYPES.SHAPE });
    shapes.forEach(function (shapeData) {
        var shape = RenderObjectCreator.createShape(shapeData);
        shape.brushSize = shape.brushSize;
        objects.push(shape);
    });
    var textObjects = _.filter(layerData.objects, { type: RENDER_TYPES.TEXT });
    textObjects.forEach(function (textObjectData) {
        var textObject = RenderObjectCreator.createTextObject(textObjectData);
        textObject.fontSize = textObject.fontSize;
        objects.push(textObject);
    });
    objects.forEach(function (object) {
        object.layerId = layerId;
        object.pageNum = page.pageNum;
        _this.addObject(page, object);
    });
};
shapeGrid.prototype.getSavableObjects = function (page, position) {
    var savableShapes = [];
    page.shapes.forEach(function (shape) {
        var savableShape = {
            type: shape.type,
            shapeType: shape.shapeType,
            p1: RenderObjectCreator.createSavablePoint(shape.p1, position),
            p2: RenderObjectCreator.createSavablePoint(shape.p2, position),
            color: shape.color,
            zIndex: shape.zIndex
        };
        if (shape.type === RENDER_TYPES.SHAPE) {
            savableShape.brushSize = shape.brushSize;
        }
        else if (shape.type === RENDER_TYPES.TEXT) {
            var textObject = shape;
            savableShape.text = textObject.text;
            savableShape.fontSize = textObject.fontSize * position.zoomRatio;
        }
        savableShapes.push(savableShape);
    });
    return savableShapes;
};
shapeGrid.prototype.savePosition = function (object) {
    var shape = object;
    shape.savedPosition = {
        p1: _.clone(shape.p1),
        p2: _.clone(shape.p2)
    };
};
shapeGrid.prototype._circleHitBox = function (x, y, radius, shape) {
    var circleRadiusX = (shape.p2.x - shape.p1.x) / 2;
    var circleRadiusY = (shape.p2.y - shape.p1.y) / 2;
    var radiusRatio = (circleRadiusX / circleRadiusY);
    // get centre point
    var cx = shape.p1.x + circleRadiusX;
    var cy = shape.p1.y + circleRadiusY;
    // Get distance from the center
    var a = x - cx;
    // scale up the Y value so we can pretend its a perfect circle
    var b = (y - cy) * radiusRatio;
    var dist = Math.sqrt(a * a + b * b);
    return Math.abs(dist - circleRadiusX) < radius;
};
shapeGrid.prototype._squareFullHitBox = function (x, y, radius, shape) {
    return x + radius > shape.p1.x && x - radius < shape.p2.x &&
        y + radius > shape.p1.y && y - radius < shape.p2.y;
};
shapeGrid.prototype._squareHitBox = function (x, y, radius, shape) {
    var isTouchingHorizontalLines = (x - shape.p1.x <= radius || shape.p2.x - x <= radius);
    var isTouchingVerticalLines = (y - shape.p1.y <= radius || shape.p2.y - y <= radius);
    return isTouchingHorizontalLines || isTouchingVerticalLines;
};
// used this a reference http://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
shapeGrid.prototype._lineBox = function (x, y, radius, shape) {
    var x1 = shape.p1.x;
    var x2 = shape.p2.x;
    var y1 = shape.p1.y;
    var y2 = shape.p2.y;
    var A = x - x1;
    var B = y - y1;
    var C = x2 - x1;
    var D = y2 - y1;
    var dot = A * C + B * D;
    var len_sq = C * C + D * D;
    var param = len_sq ? (dot / len_sq) : -1;
    var xx, yy;
    if (param < 0) {
        xx = x1;
        yy = y1;
    }
    else if (param > 1) {
        xx = x2;
        yy = y2;
    }
    else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }
    var dx = x - xx;
    var dy = y - yy;
    var dist = Math.sqrt(dx * dx + dy * dy);
    return dist < radius;
};

export default shapeGrid;