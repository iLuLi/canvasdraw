import {COMMANDS} from './Constants';

function CommandManager(grid, utils) {
    this.grid = grid;
    this.utils = utils;
    this.previousActions = [];
    this.undidActions = [];
}
CommandManager.prototype.initialize = function () {
    this.previousActions = [];
    this.undidActions = [];
};
CommandManager.prototype.addAction = function (action) {
    this.utils.emitEvent("historyState", { canUndo: true, canRedo: false });
    // if we add an action you can no longer redo
    this.undidActions = [];
    this.previousActions.push(action);
};
CommandManager.prototype.undoLastAction = function () {
    var lastAction = this.previousActions.pop();
    if (lastAction) {
        lastAction = this._switchAction(lastAction);
        this._doAction(lastAction);
        this.undidActions.push(lastAction);
        this.utils.emitEvent("historyState", {
            canUndo: this.previousActions.length > 0,
            canRedo: true
        });
    }
};
CommandManager.prototype.redoLastAction = function () {
    var lastAction = this.undidActions.pop();
    if (lastAction) {
        lastAction = this._switchAction(lastAction);
        this._doAction(lastAction);
        this.previousActions.push(lastAction);
        this.utils.emitEvent("historyState", {
            canUndo: true,
            canRedo: this.undidActions.length > 0
        });
    }
};
CommandManager.prototype._doAction = function (action) {
    switch (action.command) {
        case COMMANDS.ADDED_OBJECTS:
            this.grid.addObjects(action.objects);
            break;
        case COMMANDS.ERASED_OBJECTS:
            this.grid.removeObjects(action.objects);
            break;
        case COMMANDS.TRANSFORM_OBJECTS:
            this.grid.applyTransforms(action.objects, action.transforms);
            break;
    }
};
CommandManager.prototype._switchAction = function (action) {
    var _this = this;
    switch (action.command) {
        case COMMANDS.ADDED_OBJECTS:
            action.command = COMMANDS.ERASED_OBJECTS;
            break;
        case COMMANDS.ERASED_OBJECTS:
            action.command = COMMANDS.ADDED_OBJECTS;
            break;
        case COMMANDS.TRANSFORM_OBJECTS:
            action.transforms.forEach(function (transform) {
                _this._swapVars(transform, "startP1", "endP1");
                _this._swapVars(transform, "startP2", "endP2");
            });
            break;
    }
    return action;
};
CommandManager.prototype._swapVars = function (object, prop1, prop2) {
    var saveProp1 = object[prop1];
    object[prop1] = object[prop2];
    object[prop2] = saveProp1;
};

export default CommandManager;