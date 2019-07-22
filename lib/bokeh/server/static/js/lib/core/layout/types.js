"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var min = Math.min, max = Math.max;
var Sizeable = /** @class */ (function () {
    function Sizeable(size) {
        if (size === void 0) { size = {}; }
        this.width = size.width != null ? size.width : 0;
        this.height = size.height != null ? size.height : 0;
    }
    Sizeable.prototype.bounded_to = function (_a) {
        var width = _a.width, height = _a.height;
        return new Sizeable({
            width: this.width == Infinity && width != null ? width : this.width,
            height: this.height == Infinity && height != null ? height : this.height,
        });
    };
    Sizeable.prototype.expanded_to = function (_a) {
        var width = _a.width, height = _a.height;
        return new Sizeable({
            width: width != Infinity ? max(this.width, width) : this.width,
            height: height != Infinity ? max(this.height, height) : this.height,
        });
    };
    Sizeable.prototype.expand_to = function (_a) {
        var width = _a.width, height = _a.height;
        this.width = max(this.width, width);
        this.height = max(this.height, height);
    };
    Sizeable.prototype.narrowed_to = function (_a) {
        var width = _a.width, height = _a.height;
        return new Sizeable({
            width: min(this.width, width),
            height: min(this.height, height),
        });
    };
    Sizeable.prototype.narrow_to = function (_a) {
        var width = _a.width, height = _a.height;
        this.width = min(this.width, width);
        this.height = min(this.height, height);
    };
    Sizeable.prototype.grow_by = function (_a) {
        var left = _a.left, right = _a.right, top = _a.top, bottom = _a.bottom;
        var width = this.width + left + right;
        var height = this.height + top + bottom;
        return new Sizeable({ width: width, height: height });
    };
    Sizeable.prototype.shrink_by = function (_a) {
        var left = _a.left, right = _a.right, top = _a.top, bottom = _a.bottom;
        var width = max(this.width - left - right, 0);
        var height = max(this.height - top - bottom, 0);
        return new Sizeable({ width: width, height: height });
    };
    Sizeable.prototype.map = function (w_fn, h_fn) {
        return new Sizeable({
            width: w_fn(this.width),
            height: (h_fn != null ? h_fn : w_fn)(this.height),
        });
    };
    return Sizeable;
}());
exports.Sizeable = Sizeable;
