"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var types_1 = require("./types");
var bbox_1 = require("../util/bbox");
var min = Math.min, max = Math.max, round = Math.round;
var Layoutable = /** @class */ (function () {
    function Layoutable() {
        this._bbox = new bbox_1.BBox();
        this._inner_bbox = new bbox_1.BBox();
        var layout = this;
        this._top = { get value() { return layout.bbox.top; } };
        this._left = { get value() { return layout.bbox.left; } };
        this._width = { get value() { return layout.bbox.width; } };
        this._height = { get value() { return layout.bbox.height; } };
        this._right = { get value() { return layout.bbox.right; } };
        this._bottom = { get value() { return layout.bbox.bottom; } };
        this._hcenter = { get value() { return layout.bbox.hcenter; } };
        this._vcenter = { get value() { return layout.bbox.vcenter; } };
    }
    Object.defineProperty(Layoutable.prototype, "bbox", {
        get: function () {
            return this._bbox;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Layoutable.prototype, "inner_bbox", {
        get: function () {
            return this._inner_bbox;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Layoutable.prototype, "sizing", {
        get: function () {
            return this._sizing;
        },
        enumerable: true,
        configurable: true
    });
    Layoutable.prototype.set_sizing = function (sizing) {
        var width_policy = sizing.width_policy || "fit";
        var width = sizing.width;
        var min_width = sizing.min_width != null ? sizing.min_width : 0;
        var max_width = sizing.max_width != null ? sizing.max_width : Infinity;
        var height_policy = sizing.height_policy || "fit";
        var height = sizing.height;
        var min_height = sizing.min_height != null ? sizing.min_height : 0;
        var max_height = sizing.max_height != null ? sizing.max_height : Infinity;
        var aspect = sizing.aspect;
        var margin = sizing.margin || { top: 0, right: 0, bottom: 0, left: 0 };
        var visible = sizing.visible !== false;
        var halign = sizing.halign || "start";
        var valign = sizing.valign || "start";
        this._sizing = {
            width_policy: width_policy, min_width: min_width, width: width, max_width: max_width,
            height_policy: height_policy, min_height: min_height, height: height, max_height: max_height,
            aspect: aspect,
            margin: margin,
            visible: visible,
            halign: halign,
            valign: valign,
            size: { width: width, height: height },
            min_size: { width: min_width, height: min_height },
            max_size: { width: max_width, height: max_height },
        };
        this._init();
    };
    Layoutable.prototype._init = function () { };
    Layoutable.prototype._set_geometry = function (outer, inner) {
        this._bbox = outer;
        this._inner_bbox = inner;
    };
    Layoutable.prototype.set_geometry = function (outer, inner) {
        this._set_geometry(outer, inner || outer);
    };
    Layoutable.prototype.is_width_expanding = function () {
        return this.sizing.width_policy == "max";
    };
    Layoutable.prototype.is_height_expanding = function () {
        return this.sizing.height_policy == "max";
    };
    Layoutable.prototype.apply_aspect = function (viewport, _a) {
        var width = _a.width, height = _a.height;
        var aspect = this.sizing.aspect;
        if (aspect != null) {
            var _b = this.sizing, width_policy = _b.width_policy, height_policy = _b.height_policy;
            var gt = function (width, height) {
                var policies = { max: 4, fit: 3, min: 2, fixed: 1 };
                return policies[width] > policies[height];
            };
            if (width_policy != "fixed" && height_policy != "fixed") {
                if (width_policy == height_policy) {
                    var w_width = width;
                    var w_height = round(width / aspect);
                    var h_width = round(height * aspect);
                    var h_height = height;
                    var w_diff = Math.abs(viewport.width - w_width) + Math.abs(viewport.height - w_height);
                    var h_diff = Math.abs(viewport.width - h_width) + Math.abs(viewport.height - h_height);
                    if (w_diff <= h_diff) {
                        width = w_width;
                        height = w_height;
                    }
                    else {
                        width = h_width;
                        height = h_height;
                    }
                }
                else if (gt(width_policy, height_policy)) {
                    height = round(width / aspect);
                }
                else {
                    width = round(height * aspect);
                }
            }
            else if (width_policy == "fixed") {
                height = round(width / aspect);
            }
            else if (height_policy == "fixed") {
                width = round(height * aspect);
            }
        }
        return { width: width, height: height };
    };
    Layoutable.prototype.measure = function (viewport_size) {
        var _this = this;
        if (!this.sizing.visible)
            return { width: 0, height: 0 };
        var exact_width = function (width) {
            return _this.sizing.width_policy == "fixed" && _this.sizing.width != null ? _this.sizing.width : width;
        };
        var exact_height = function (height) {
            return _this.sizing.height_policy == "fixed" && _this.sizing.height != null ? _this.sizing.height : height;
        };
        var viewport = new types_1.Sizeable(viewport_size)
            .shrink_by(this.sizing.margin)
            .map(exact_width, exact_height);
        var computed = this._measure(viewport);
        var clipped = this.clip_size(computed);
        var width = exact_width(clipped.width);
        var height = exact_height(clipped.height);
        var size = this.apply_aspect(viewport, { width: width, height: height });
        return tslib_1.__assign({}, computed, size);
    };
    Layoutable.prototype.compute = function (viewport) {
        if (viewport === void 0) { viewport = {}; }
        var size_hint = this.measure({
            width: viewport.width != null && this.is_width_expanding() ? viewport.width : Infinity,
            height: viewport.height != null && this.is_height_expanding() ? viewport.height : Infinity,
        });
        var width = size_hint.width, height = size_hint.height;
        var outer = new bbox_1.BBox({ left: 0, top: 0, width: width, height: height });
        var inner = undefined;
        if (size_hint.inner != null) {
            var _a = size_hint.inner, left = _a.left, top_1 = _a.top, right = _a.right, bottom = _a.bottom;
            inner = new bbox_1.BBox({ left: left, top: top_1, right: width - right, bottom: height - bottom });
        }
        this.set_geometry(outer, inner);
    };
    Object.defineProperty(Layoutable.prototype, "xview", {
        get: function () {
            return this.bbox.xview;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Layoutable.prototype, "yview", {
        get: function () {
            return this.bbox.yview;
        },
        enumerable: true,
        configurable: true
    });
    Layoutable.prototype.clip_width = function (width) {
        return max(this.sizing.min_width, min(width, this.sizing.max_width));
    };
    Layoutable.prototype.clip_height = function (height) {
        return max(this.sizing.min_height, min(height, this.sizing.max_height));
    };
    Layoutable.prototype.clip_size = function (_a) {
        var width = _a.width, height = _a.height;
        return {
            width: this.clip_width(width),
            height: this.clip_height(height),
        };
    };
    return Layoutable;
}());
exports.Layoutable = Layoutable;
var LayoutItem = /** @class */ (function (_super) {
    tslib_1.__extends(LayoutItem, _super);
    function LayoutItem() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /*
    constructor(readonly measure_fn: (viewport: Size) => Size) {
      super()
    }
    protected _measure(viewport: Size): SizeHint {
      return this.measure_fn(viewport)
    }
    protected _measure(viewport: Size): SizeHint {
      return {
        width: viewport.width != Infinity ? viewport.width : this.sizing.min_width,
        height: viewport.height != Infinity ? viewport.height : this.sizing.min_width,
      }
    }
    */
    LayoutItem.prototype._measure = function (viewport) {
        var _a = this.sizing, width_policy = _a.width_policy, height_policy = _a.height_policy;
        var width;
        if (viewport.width == Infinity) {
            width = this.sizing.width != null ? this.sizing.width : 0;
        }
        else {
            if (width_policy == "fixed")
                width = this.sizing.width != null ? this.sizing.width : 0;
            else if (width_policy == "min")
                width = this.sizing.width != null ? min(viewport.width, this.sizing.width) : 0;
            else if (width_policy == "fit")
                width = this.sizing.width != null ? min(viewport.width, this.sizing.width) : viewport.width;
            else if (width_policy == "max")
                width = this.sizing.width != null ? max(viewport.width, this.sizing.width) : viewport.width;
            else
                throw new Error("unrechable");
        }
        var height;
        if (viewport.height == Infinity) {
            height = this.sizing.height != null ? this.sizing.height : 0;
        }
        else {
            if (height_policy == "fixed")
                height = this.sizing.height != null ? this.sizing.height : 0;
            else if (height_policy == "min")
                height = this.sizing.height != null ? min(viewport.height, this.sizing.height) : 0;
            else if (height_policy == "fit")
                height = this.sizing.height != null ? min(viewport.height, this.sizing.height) : viewport.height;
            else if (height_policy == "max")
                height = this.sizing.height != null ? max(viewport.height, this.sizing.height) : viewport.height;
            else
                throw new Error("unrechable");
        }
        return { width: width, height: height };
    };
    return LayoutItem;
}(Layoutable));
exports.LayoutItem = LayoutItem;
var ContentLayoutable = /** @class */ (function (_super) {
    tslib_1.__extends(ContentLayoutable, _super);
    function ContentLayoutable() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ContentLayoutable.prototype._measure = function (viewport) {
        var _this = this;
        var content_size = this._content_size();
        var bounds = viewport.bounded_to(this.sizing.size)
            .bounded_to(content_size);
        var width = (function () {
            switch (_this.sizing.width_policy) {
                case "fixed":
                    return _this.sizing.width != null ? _this.sizing.width : content_size.width;
                case "min":
                    return content_size.width;
                case "fit":
                    return bounds.width;
                case "max":
                    return Math.max(content_size.width, bounds.width);
                default:
                    throw new Error("unexpected");
            }
        })();
        var height = (function () {
            switch (_this.sizing.height_policy) {
                case "fixed":
                    return _this.sizing.height != null ? _this.sizing.height : content_size.height;
                case "min":
                    return content_size.height;
                case "fit":
                    return bounds.height;
                case "max":
                    return Math.max(content_size.height, bounds.height);
                default:
                    throw new Error("unexpected");
            }
        })();
        return { width: width, height: height };
    };
    return ContentLayoutable;
}(Layoutable));
exports.ContentLayoutable = ContentLayoutable;
