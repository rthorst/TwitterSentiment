"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var categorical_scale_1 = require("../scales/categorical_scale");
var linear_scale_1 = require("../scales/linear_scale");
var log_scale_1 = require("../scales/log_scale");
var range1d_1 = require("../ranges/range1d");
var data_range1d_1 = require("../ranges/data_range1d");
var factor_range_1 = require("../ranges/factor_range");
var layout_1 = require("../../core/layout");
var CartesianFrame = /** @class */ (function (_super) {
    tslib_1.__extends(CartesianFrame, _super);
    function CartesianFrame(x_scale, y_scale, x_range, y_range, extra_x_ranges, extra_y_ranges) {
        if (extra_x_ranges === void 0) { extra_x_ranges = {}; }
        if (extra_y_ranges === void 0) { extra_y_ranges = {}; }
        var _this = _super.call(this) || this;
        _this.x_scale = x_scale;
        _this.y_scale = y_scale;
        _this.x_range = x_range;
        _this.y_range = y_range;
        _this.extra_x_ranges = extra_x_ranges;
        _this.extra_y_ranges = extra_y_ranges;
        _this._configure_scales();
        return _this;
    }
    CartesianFrame.prototype.map_to_screen = function (x, y, x_name, y_name) {
        if (x_name === void 0) { x_name = "default"; }
        if (y_name === void 0) { y_name = "default"; }
        var sx = this.xscales[x_name].v_compute(x);
        var sy = this.yscales[y_name].v_compute(y);
        return [sx, sy];
    };
    CartesianFrame.prototype._get_ranges = function (range, extra_ranges) {
        var ranges = {};
        ranges.default = range;
        if (extra_ranges != null) {
            for (var name_1 in extra_ranges)
                ranges[name_1] = extra_ranges[name_1];
        }
        return ranges;
    };
    /*protected*/ CartesianFrame.prototype._get_scales = function (scale, ranges, frame_range) {
        var scales = {};
        for (var name_2 in ranges) {
            var range = ranges[name_2];
            if (range instanceof data_range1d_1.DataRange1d || range instanceof range1d_1.Range1d) {
                if (!(scale instanceof log_scale_1.LogScale) && !(scale instanceof linear_scale_1.LinearScale))
                    throw new Error("Range " + range.type + " is incompatible is Scale " + scale.type);
                // XXX: special case because CategoricalScale is a subclass of LinearScale, should be removed in future
                if (scale instanceof categorical_scale_1.CategoricalScale)
                    throw new Error("Range " + range.type + " is incompatible is Scale " + scale.type);
            }
            if (range instanceof factor_range_1.FactorRange) {
                if (!(scale instanceof categorical_scale_1.CategoricalScale))
                    throw new Error("Range " + range.type + " is incompatible is Scale " + scale.type);
            }
            if (scale instanceof log_scale_1.LogScale && range instanceof data_range1d_1.DataRange1d)
                range.scale_hint = "log";
            var s = scale.clone();
            s.setv({ source_range: range, target_range: frame_range });
            scales[name_2] = s;
        }
        return scales;
    };
    CartesianFrame.prototype._configure_frame_ranges = function () {
        // data to/from screen space transform (left-bottom <-> left-top origin)
        this._h_target = new range1d_1.Range1d({ start: this._left.value, end: this._right.value });
        this._v_target = new range1d_1.Range1d({ start: this._bottom.value, end: this._top.value });
    };
    CartesianFrame.prototype._configure_scales = function () {
        this._configure_frame_ranges();
        this._x_ranges = this._get_ranges(this.x_range, this.extra_x_ranges);
        this._y_ranges = this._get_ranges(this.y_range, this.extra_y_ranges);
        this._xscales = this._get_scales(this.x_scale, this._x_ranges, this._h_target);
        this._yscales = this._get_scales(this.y_scale, this._y_ranges, this._v_target);
    };
    CartesianFrame.prototype._update_scales = function () {
        this._configure_frame_ranges();
        for (var name_3 in this._xscales) {
            var scale = this._xscales[name_3];
            scale.target_range = this._h_target;
        }
        for (var name_4 in this._yscales) {
            var scale = this._yscales[name_4];
            scale.target_range = this._v_target;
        }
    };
    CartesianFrame.prototype._set_geometry = function (outer, inner) {
        _super.prototype._set_geometry.call(this, outer, inner);
        this._update_scales();
    };
    Object.defineProperty(CartesianFrame.prototype, "x_ranges", {
        get: function () {
            return this._x_ranges;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CartesianFrame.prototype, "y_ranges", {
        get: function () {
            return this._y_ranges;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CartesianFrame.prototype, "xscales", {
        get: function () {
            return this._xscales;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CartesianFrame.prototype, "yscales", {
        get: function () {
            return this._yscales;
        },
        enumerable: true,
        configurable: true
    });
    return CartesianFrame;
}(layout_1.LayoutItem));
exports.CartesianFrame = CartesianFrame;
