function screenManager(utils) {
    this.utils = utils;
    this.offsetLeft = 0;
    this.offsetTop = 0;
}
screenManager.prototype.onTouchStart = function (e) {
    this.prevPos = {
        x: e.touches[0].pageX,
        y: e.touches[0].pageY
    };
};
screenManager.prototype.onTouchMove = function (e) {
    var newPos = {
        x: e.touches[0].pageX,
        y: e.touches[0].pageY
    };
    var delta = {
        deltaX: newPos.x - this.prevPos.x,
        deltaY: newPos.y - this.prevPos.y
    };
    this.prevPos = newPos;
    this.utils.emitEvent("pan", delta);
};
screenManager.prototype.setOffset = function (left, top) {
    this.offsetLeft = left;
    this.offsetTop = top;
};
screenManager.prototype.getOffset = function () {
    return {
        left: this.offsetLeft,
        top: this.offsetTop
    };
};

export default screenManager;