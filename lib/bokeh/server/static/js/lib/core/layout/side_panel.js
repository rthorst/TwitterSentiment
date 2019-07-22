"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var types_1 = require("./types");
var layoutable_1 = require("./layoutable");
var types_2 = require("../util/types");
// This table lays out the rules for configuring the baseline, alignment, etc. of
// title text, based on it's location and orientation
//
// side    orient        baseline   align     angle   normal-dist
// ------------------------------------------------------------------------------
// above   parallel      bottom     center    0       height
//         normal        middle     left      -90     width
//         horizontal    bottom     center    0       height
//         [angle > 0]   middle     left              width * sin + height * cos
//         [angle < 0]   middle     right             width * sin + height * cos
//
// below   parallel      top        center    0       height
//         normal        middle     right     90      width
//         horizontal    top        center    0       height
//         [angle > 0]   middle     right             width * sin + height * cos
//         [angle < 0]   middle     left              width * sin + height * cos
//
// left    parallel      bottom     center    90      height
//         normal        middle     right     0       width
//         horizontal    middle     right     0       width
//         [angle > 0]   middle     right             width * cos + height * sin
//         [angle < 0]   middle     right             width * cos + height + sin
//
// right   parallel      bottom     center   -90      height
//         normal        middle     left     0        width
//         horizontal    middle     left     0        width
//         [angle > 0]   middle     left              width * cos + height * sin
//         [angle < 0]   middle     left              width * cos + height + sin
var pi2 = Math.PI / 2;
var ALPHABETIC = 'alphabetic';
var TOP = 'top';
var BOTTOM = 'bottom';
var MIDDLE = 'middle';
var HANGING = 'hanging';
var LEFT = 'left';
var RIGHT = 'right';
var CENTER = 'center';
var _angle_lookup = {
    above: {
        parallel: 0,
        normal: -pi2,
        horizontal: 0,
        vertical: -pi2,
    },
    below: {
        parallel: 0,
        normal: pi2,
        horizontal: 0,
        vertical: pi2,
    },
    left: {
        parallel: -pi2,
        normal: 0,
        horizontal: 0,
        vertical: -pi2,
    },
    right: {
        parallel: pi2,
        normal: 0,
        horizontal: 0,
        vertical: pi2,
    },
};
var _baseline_lookup = {
    above: {
        justified: TOP,
        parallel: ALPHABETIC,
        normal: MIDDLE,
        horizontal: ALPHABETIC,
        vertical: MIDDLE,
    },
    below: {
        justified: BOTTOM,
        parallel: HANGING,
        normal: MIDDLE,
        horizontal: HANGING,
        vertical: MIDDLE,
    },
    left: {
        justified: TOP,
        parallel: ALPHABETIC,
        normal: MIDDLE,
        horizontal: MIDDLE,
        vertical: ALPHABETIC,
    },
    right: {
        justified: TOP,
        parallel: ALPHABETIC,
        normal: MIDDLE,
        horizontal: MIDDLE,
        vertical: ALPHABETIC,
    },
};
var _align_lookup = {
    above: {
        justified: CENTER,
        parallel: CENTER,
        normal: LEFT,
        horizontal: CENTER,
        vertical: LEFT,
    },
    below: {
        justified: CENTER,
        parallel: CENTER,
        normal: LEFT,
        horizontal: CENTER,
        vertical: LEFT,
    },
    left: {
        justified: CENTER,
        parallel: CENTER,
        normal: RIGHT,
        horizontal: RIGHT,
        vertical: CENTER,
    },
    right: {
        justified: CENTER,
        parallel: CENTER,
        normal: LEFT,
        horizontal: LEFT,
        vertical: CENTER,
    },
};
var _align_lookup_negative = {
    above: RIGHT,
    below: LEFT,
    left: RIGHT,
    right: LEFT,
};
var _align_lookup_positive = {
    above: LEFT,
    below: RIGHT,
    left: RIGHT,
    right: LEFT,
};
var SidePanel = /** @class */ (function (_super) {
    tslib_1.__extends(SidePanel, _super);
    function SidePanel(side, obj) {
        var _this = _super.call(this) || this;
        _this.side = side;
        _this.obj = obj;
        switch (_this.side) {
            case "above":
                _this._dim = 0;
                _this._normals = [0, -1];
                break;
            case "below":
                _this._dim = 0;
                _this._normals = [0, 1];
                break;
            case "left":
                _this._dim = 1;
                _this._normals = [-1, 0];
                break;
            case "right":
                _this._dim = 1;
                _this._normals = [1, 0];
                break;
            default:
                throw new Error("unreachable");
        }
        if (_this.is_horizontal)
            _this.set_sizing({ width_policy: "max", height_policy: "fixed" });
        else
            _this.set_sizing({ width_policy: "fixed", height_policy: "max" });
        return _this;
    }
    SidePanel.prototype._content_size = function () {
        return new types_1.Sizeable(this.get_oriented_size());
    };
    SidePanel.prototype.get_oriented_size = function () {
        var _a = this.obj.get_size(), width = _a.width, height = _a.height;
        if (!this.obj.rotate || this.is_horizontal)
            return { width: width, height: height };
        else
            return { width: height, height: width };
    };
    SidePanel.prototype.has_size_changed = function () {
        var _a = this.get_oriented_size(), width = _a.width, height = _a.height;
        if (this.is_horizontal)
            return this.bbox.height != height;
        else
            return this.bbox.width != width;
    };
    Object.defineProperty(SidePanel.prototype, "dimension", {
        get: function () {
            return this._dim;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SidePanel.prototype, "normals", {
        get: function () {
            return this._normals;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SidePanel.prototype, "is_horizontal", {
        get: function () {
            return this._dim == 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SidePanel.prototype, "is_vertical", {
        get: function () {
            return this._dim == 1;
        },
        enumerable: true,
        configurable: true
    });
    SidePanel.prototype.apply_label_text_heuristics = function (ctx, orient) {
        var side = this.side;
        var baseline;
        var align;
        if (types_2.isString(orient)) {
            baseline = _baseline_lookup[side][orient];
            align = _align_lookup[side][orient];
        }
        else {
            if (orient === 0) {
                baseline = "whatever"; // XXX: _baseline_lookup[side][orient]
                align = "whatever"; // XXX: _align_lookup[side][orient]
            }
            else if (orient < 0) {
                baseline = 'middle';
                align = _align_lookup_negative[side];
            }
            else {
                baseline = 'middle';
                align = _align_lookup_positive[side];
            }
        }
        ctx.textBaseline = baseline;
        ctx.textAlign = align;
    };
    SidePanel.prototype.get_label_angle_heuristic = function (orient) {
        return _angle_lookup[this.side][orient];
    };
    return SidePanel;
}(layoutable_1.ContentLayoutable));
exports.SidePanel = SidePanel;
