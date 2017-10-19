import {SHAPE_TYPES} from './Constants';
import Renderer from './Renderer';

function shapeRenderer(grid) {
    this.grid = grid;
    this.drawType = (_a = {},
        _a[SHAPE_TYPES.SQUARE] = this.drawSquare.bind(this),
        _a[SHAPE_TYPES.CIRCLE] = this.drawCircle.bind(this),
        _a[SHAPE_TYPES.ARROW] = this.drawArrow.bind(this),
        _a[SHAPE_TYPES.LINE] = this.drawLine.bind(this),
        _a[SHAPE_TYPES.CLOUD] = this.drawCloud.bind(this),
        _a);
    var _a;
}
shapeRenderer.prototype.render = function (_a, shape) {
    var context = _a.context, viewport = _a.viewport;
    Renderer.setRenderValues(shape.p1, viewport);
    Renderer.setRenderValues(shape.p2, viewport);
    shape.lineWidth = shape.brushSize * viewport.zoomRatio * viewport.pixelRatio;
    this.draw(context, shape);
};
shapeRenderer.prototype.draw = function (context, shape) {
    var self = this;
    var p1 = shape.p1;
    var p2 = shape.p2;
    var shapeType = shape.shapeType;
    context.save();
    context.strokeStyle = shape.color;
    context.fillStyle = shape.color;
    context.lineWidth = shape.lineWidth;
    context.beginPath();
    context.translate(p1.xDraw, p1.yDraw);
    self.drawType[shapeType](context, p1, p2);
    context.closePath();
    context.restore();
};
shapeRenderer.prototype.drawCloud = function (context, p1, p2) {
    context.beginPath();
    var x1 = Math.min(p1.xDraw, p2.xDraw);
    var x2 = Math.max(p1.xDraw, p2.xDraw);
    var y1 = Math.min(p1.yDraw, p2.yDraw);
    var y2 = Math.max(p1.yDraw, p2.yDraw);
    var distX = (x2 - x1);
    var distY = (y2 - y1);
    context.translate(p1.xDraw > p2.xDraw ? -distX : 0, p1.yDraw > p2.yDraw ? -distY : 0);
    var ringDist;
    // use a smaller ring size for smaller clouds
    if (distX < 50 || distY < 50) {
        ringDist = 10;
    }
    else if (distX < 150 || distY < 150) {
        ringDist = 16;
    }
    else {
        ringDist = 20;
    }
    distX = distX - ringDist;
    distY = distY - ringDist;
    var increments = ringDist / 2;
    var bulge = increments;
    var xRings = parseInt(distX / ringDist);
    var yRings = parseInt(distY / ringDist);
    // we need to scale it a little bit so it fits better
    var scaleX = distX / (ringDist * xRings);
    var scaleY = distY / (ringDist * yRings);
    context.scale(Math.abs(scaleX), Math.abs(scaleY));
    var pos = { x: increments, y: increments };
    context.moveTo(pos.x, pos.y);
    this._drawCloudLineVertical(context, pos, increments, bulge, yRings);
    this._drawCloudLineHorizontal(context, pos, bulge, -increments, xRings);
    this._drawCloudLineVertical(context, pos, -increments, -bulge, yRings);
    this._drawCloudLineHorizontal(context, pos, -bulge, increments, xRings);
    context.stroke();
    context.closePath();
};
shapeRenderer.prototype._drawCloudLineHorizontal = function (context, pos, incrementX, blugeY, repeat) {
    for (var i = 0; i < repeat; i++) {
        context.bezierCurveTo(pos.x, pos.y, pos.x += incrementX, pos.y - blugeY, pos.x += incrementX, pos.y);
    }
};
shapeRenderer.prototype._drawCloudLineVertical = function (context, pos, incrementY, blugeX, repeat) {
    for (var i = 0; i < repeat; i++) {
        context.bezierCurveTo(pos.x, pos.y, pos.x - blugeX, pos.y += incrementY, pos.x, pos.y += incrementY);
    }
};
shapeRenderer.prototype.drawSquare = function (context, p1, p2) {
    var distX = p2.xDraw - p1.xDraw;
    var distY = p2.yDraw - p1.yDraw;
    context.rect(0, 0, distX, distY);
    context.stroke();
};
shapeRenderer.prototype.drawCircle = function (context, p1, p2) {
    var distX = (p2.xDraw - p1.xDraw) / 2;
    var distY = (p2.yDraw - p1.yDraw) / 2;
    context.ellipse(distX, distY, Math.abs(distX), Math.abs(distY), Math.PI * 2, 0, Math.PI * 2);
    context.stroke();
};
shapeRenderer.prototype.drawLine = function (context, p1, p2) {
    var distX = p2.xDraw - p1.xDraw;
    var distY = p2.yDraw - p1.yDraw;
    context.moveTo(0, 0);
    // this is to prevent the line sticking out at the edge of the triangle
    context.lineTo(distX, distY);
    context.closePath();
    context.stroke();
};
shapeRenderer.prototype.drawArrow = function (context, p1, p2) {
    var distX = p2.xDraw - p1.xDraw;
    var distY = p2.yDraw - p1.yDraw;
    var rad = Math.atan2(distY, distX); // rotate the arrow head to object
    var xOffset = p2.xDraw > p1.xDraw ? 1 : -1;
    var yOffset = p2.yDraw > p1.yDraw ? 1 : -1;
    var arrowHeadSize = context.lineWidth * 3;
    // TODO: find a more scalable solution
    var xOffsetRatio = Math.abs(distY / distX);
    var yOffsetRatio = Math.abs(distX / distY);
    var offRatioCalc = function (ratio) {
        if (ratio > 6) {
            return 0;
        }
        else if (ratio > 2) {
            return 1;
        }
        else {
            return 2;
        }
    };
    xOffset = xOffset * offRatioCalc(xOffsetRatio);
    yOffset = yOffset * offRatioCalc(yOffsetRatio);
    context.moveTo(0, 0);
    // this is to prevent the line sticking out at the edge of the triangle
    context.lineTo(distX - xOffset, distY - yOffset);
    context.translate(distX + xOffset, distY + yOffset);
    context.closePath();
    context.stroke();
    context.rotate(rad);
    context.beginPath();
    context.lineTo(-arrowHeadSize, -arrowHeadSize);
    context.lineTo(-arrowHeadSize, +arrowHeadSize);
    context.lineTo(0, 0);
    context.fill();
    context.closePath();
};

export default shapeRenderer;