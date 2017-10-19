import RenderObjectCreator from './RenderObjectCreator';
import {RENDER_TYPES} from './Constants';
import _ from 'lodash';

function lineGrid() {
    this.width = 0;
    this.height = 0;
}
lineGrid.prototype.initialize = function (width, height) {
    this.cellSize = 16;
    if (Math.min(width, height) < 16 * 16) {
        this.cellSize = 8;
    }
    this.width = width;
    this.height = height;
};
lineGrid.prototype.searchAt = function (page, x, y, radius) {
    var x0 = Math.max(x - radius, 0);
    var y0 = Math.max(y - radius, 0);
    var x1 = x + radius;
    var y1 = y + radius;
    var j0 = Math.round(x0 / this.cellSize);
    var i0 = Math.round(y0 / this.cellSize);
    var j1 = Math.round(x1 / this.cellSize);
    var i1 = Math.round(y1 / this.cellSize);
    var radiusSquared = radius * radius;
    var strokes = {};
    for (var i = i0; i <= i1; ++i) {
        if (!page.strokeGrid[i]) {
            continue;
        }
        for (var j = j0; j <= j1; ++j) {
            var cell = page.strokeGrid[i][j];
            if (!cell) {
                continue;
            }
            for (var k = 0; k < cell.length; ++k) {
                var dx = cell[k].x - x;
                var dy = cell[k].y - y;
                if ((dx * dx + dy * dy) < radiusSquared) {
                    strokes[cell[k].index] = cell[k].index;
                }
            }
        }
    }
    var strokeIndexes = _.values(strokes);
    var foundStrokes = [];
    strokeIndexes.forEach(function (strokeIndex) {
        var stroke = page.strokes[strokeIndex];
        if (stroke) {
            foundStrokes.push(page.strokes[strokeIndex]);
        }
    });
    return foundStrokes;
};
lineGrid.prototype.addObject = function (page, object) {
    var stroke = object;
    page.strokes.push(stroke);
    var index = page.strokes.length - 1;
    var _a = [stroke.points[0].x, stroke.points[0].x], minX = _a[0], maxX = _a[1];
    var _b = [stroke.points[0].y, stroke.points[0].y], minY = _b[0], maxY = _b[1];
    for (var point in stroke.points) {
        var x = stroke.points[point].x;
        var y = stroke.points[point].y;
        var j = Math.round(x / this.cellSize);
        var i = Math.round(y / this.cellSize);
        if (!page.strokeGrid[i]) {
            page.strokeGrid[i] = [];
        }
        if (!page.strokeGrid[i][j]) {
            page.strokeGrid[i][j] = [];
        }
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        page.strokeGrid[i][j].push({
            index: index,
            x: x,
            y: y
        });
    }
    stroke.p1 = { x: minX, y: minY };
    stroke.p2 = { x: maxX, y: maxY };
};
lineGrid.prototype.removeObject = function (page, object) {
    var stroke = object;
    var strokeIndex = page.strokes.indexOf(stroke);
    if (strokeIndex < 0) {
        return;
    }
    for (var point in stroke.points) {
        var x = stroke.points[point].x;
        var y = stroke.points[point].y;
        var j = Math.round(x / this.cellSize);
        var i = Math.round(y / this.cellSize);
        for (var p in page.strokeGrid[i][j]) {
            if (page.strokeGrid[i][j][p].index === strokeIndex) {
                // Remove the stroke from the grid cell
                page.strokeGrid[i][j].splice(p, 1);
            }
        }
    }
    page.strokes[strokeIndex] = null;
};
lineGrid.prototype.clear = function (page) {
    page.strokes = [];
    page.strokeGrid = [];
};
lineGrid.prototype.getObjects = function (page) {
    return _.filter(page.strokes, _.identity);
};
lineGrid.prototype.loadPage = function (layerId, page, pageData) {
    var _this = this;
    var strokes = _.filter(pageData.objects, { type: RENDER_TYPES.STROKE });
    strokes.forEach(function (strokeData) {
        var stroke = RenderObjectCreator.createStroke(strokeData);
        stroke.brushSize = stroke.brushSize;
        stroke.layerId = layerId;
        stroke.pageNum = page.pageNum;
        stroke.points = stroke.points.map(function (p) { return _.clone(p); });
        _this.addObject(page, stroke);
    });
};
lineGrid.prototype.getSavableObjects = function (page, position) {
    var savableStrokes = [];
    page.strokes.forEach(function (stroke) {
        if (!stroke) {
            return;
        }
        var savableStroke = {
            type: stroke.type,
            points: _.map(stroke.points, function (point) { return RenderObjectCreator.createSavablePoint(point, position); }),
            color: stroke.color,
            opacity: stroke.opacity,
            brushSize: stroke.brushSize,
            zIndex: stroke.zIndex
        };
        savableStrokes.push(savableStroke);
    });
    return savableStrokes;
};
// TODO add implementation
lineGrid.prototype.savePosition = function (object) {
};

export default lineGrid;