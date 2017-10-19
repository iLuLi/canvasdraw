import _ from 'lodash';
import Renderer from './Renderer';


function lineRenderer(grid) {
    this.grid = grid;
}
lineRenderer.prototype.renderTransparent = function (_a, strokes) {
    var context = _a.context, viewport = _a.viewport;
    strokes.forEach(function (stroke) {
        _.forEach(stroke.points, function (point) {
            Renderer.setRenderValues(point, viewport);
        });
        stroke.lineWidth = stroke.brushSize * viewport.zoomRatio * viewport.pixelRatio;
    });
    this._drawLinesWithOpacity(context, strokes);
};
lineRenderer.prototype.render = function (_a, stroke) {
    var context = _a.context, viewport = _a.viewport;
    var self = this;
    _.forEach(stroke.points, function (point) {
        Renderer.setRenderValues(point, viewport);
    });
    stroke.lineWidth = stroke.brushSize * viewport.zoomRatio;
    self._drawLine(context, stroke);
};
lineRenderer.prototype._drawLinesWithOpacity = function (context, strokes) {
    var self = this;
    if (!strokes.length) {
        return;
    }
    var currentColor = strokes[0].color;
    var currentSize = strokes[0].lineWidth;
    var lastStrokes = [];
    var groupedStrokes = [];
    strokes.forEach(function (stroke) {
        if (currentColor === stroke.color &&
            currentSize === stroke.lineWidth) {
            lastStrokes.push(stroke);
        }
        else {
            currentColor = stroke.color;
            currentSize = stroke.lineWidth;
            groupedStrokes.push(lastStrokes);
            lastStrokes = [];
            lastStrokes.push(stroke);
        }
    });
    groupedStrokes.push(lastStrokes);
    groupedStrokes.forEach(function (groupStrokes) {
        context.lineWidth = groupStrokes[0].lineWidth;
        context.strokeStyle = groupStrokes[0].color;
        context.globalAlpha = groupStrokes[0].opacity;
        context.beginPath();
        groupStrokes.forEach(function (stroke) {
            self.drawJustLine(context, stroke.points);
        });
        context.stroke();
        context.closePath();
    });
    context.globalAlpha = 1;
};
lineRenderer.prototype._drawLine = function (context, stroke) {
    var self = this;
    context.lineWidth = stroke.lineWidth;
    context.strokeStyle = stroke.color;
    context.fillStyle = stroke.color;
    context.globalAlpha = stroke.opacity;
    var points = stroke.points;
    if (points.length < 3) {
        var b = points[0];
        context.beginPath();
        context.arc(b.xDraw, b.yDraw, context.lineWidth / 2, 0, Math.PI * 2, !0);
        context.fill();
        context.closePath();
        return;
    }
    context.beginPath();
    self.drawJustLine(context, points);
    context.stroke();
    context.closePath();
    context.globalAlpha = 1;
};
lineRenderer.prototype.drawJustLine = function (context, points) {
    context.moveTo(points[0].xDraw, points[0].yDraw);
    if (points.length < 3) {
        return;
    }
    var i;
    for (i = 1; i < points.length - 2; ++i) {
        var c = (points[i].xDraw + points[i + 1].xDraw) / 2;
        var d = (points[i].yDraw + points[i + 1].yDraw) / 2;
        context.quadraticCurveTo(points[i].xDraw, points[i].yDraw, c, d);
    }
    // For the last 2 points
    context.quadraticCurveTo(points[i].xDraw, points[i].yDraw, points[i + 1].xDraw, points[i + 1].yDraw);
};

export default lineRenderer;