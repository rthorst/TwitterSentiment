"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var area_1 = require("./area");
var spatial_1 = require("../../core/util/spatial");
var p = require("../../core/properties");
var VAreaView = /** @class */ (function (_super) {
    tslib_1.__extends(VAreaView, _super);
    function VAreaView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    VAreaView.prototype._index_data = function () {
        var points = [];
        for (var i = 0, end = this._x.length; i < end; i++) {
            var x = this._x[i];
            var y1 = this._y1[i];
            var y2 = this._y2[i];
            if (isNaN(x + y1 + y2) || !isFinite(x + y1 + y2))
                continue;
            points.push({ minX: x, minY: Math.min(y1, y2), maxX: x, maxY: Math.max(y1, y2), i: i });
        }
        return new spatial_1.SpatialIndex(points);
    };
    VAreaView.prototype._inner = function (ctx, sx, sy1, sy2, func) {
        ctx.beginPath();
        for (var i = 0, end = sy1.length; i < end; i++) {
            ctx.lineTo(sx[i], sy1[i]);
        }
        // iterate backwards so that the upper end is below the lower start
        for (var start = sy2.length - 1, i = start; i >= 0; i--) {
            ctx.lineTo(sx[i], sy2[i]);
        }
        ctx.closePath();
        func.call(ctx);
    };
    VAreaView.prototype._render = function (ctx, _indices, _a) {
        var _this = this;
        var sx = _a.sx, sy1 = _a.sy1, sy2 = _a.sy2;
        if (this.visuals.fill.doit) {
            this.visuals.fill.set_value(ctx);
            this._inner(ctx, sx, sy1, sy2, ctx.fill);
        }
        this.visuals.hatch.doit2(ctx, 0, function () { return _this._inner(ctx, sx, sy1, sy2, ctx.fill); }, function () { return _this.renderer.request_render(); });
    };
    VAreaView.prototype.scenterx = function (i) {
        return this.sx[i];
    };
    VAreaView.prototype.scentery = function (i) {
        return (this.sy1[i] + this.sy2[i]) / 2;
    };
    VAreaView.prototype._map_data = function () {
        this.sx = this.renderer.xscale.v_compute(this._x);
        this.sy1 = this.renderer.yscale.v_compute(this._y1);
        this.sy2 = this.renderer.yscale.v_compute(this._y2);
    };
    return VAreaView;
}(area_1.AreaView));
exports.VAreaView = VAreaView;
var VArea = /** @class */ (function (_super) {
    tslib_1.__extends(VArea, _super);
    function VArea(attrs) {
        return _super.call(this, attrs) || this;
    }
    VArea.initClass = function () {
        this.prototype.type = 'VArea';
        this.prototype.default_view = VAreaView;
        this.define({
            x: [p.CoordinateSpec],
            y1: [p.CoordinateSpec],
            y2: [p.CoordinateSpec],
        });
    };
    return VArea;
}(area_1.Area));
exports.VArea = VArea;
VArea.initClass();
