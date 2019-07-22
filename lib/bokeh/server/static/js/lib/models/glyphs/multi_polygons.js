"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var spatial_1 = require("../../core/util/spatial");
var glyph_1 = require("./glyph");
var utils_1 = require("./utils");
var array_1 = require("../../core/util/array");
var arrayable_1 = require("../../core/util/arrayable");
var hittest = require("../../core/hittest");
var types_1 = require("../../core/util/types");
var MultiPolygonsView = /** @class */ (function (_super) {
    tslib_1.__extends(MultiPolygonsView, _super);
    function MultiPolygonsView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MultiPolygonsView.prototype._index_data = function () {
        var points = [];
        for (var i = 0, end = this._xs.length; i < end; i++) {
            for (var j = 0, endj = this._xs[i].length; j < endj; j++) {
                var xs = this._xs[i][j][0]; // do not use holes
                var ys = this._ys[i][j][0]; // do not use holes
                if (xs.length == 0)
                    continue;
                points.push({
                    minX: array_1.min(xs),
                    minY: array_1.min(ys),
                    maxX: array_1.max(xs),
                    maxY: array_1.max(ys),
                    i: i,
                });
            }
        }
        this.hole_index = this._index_hole_data(); // should this be set here?
        return new spatial_1.SpatialIndex(points);
    };
    MultiPolygonsView.prototype._index_hole_data = function () {
        // need advice on how to use this sure if this could be more useful
        var points = [];
        for (var i = 0, end = this._xs.length; i < end; i++) {
            for (var j = 0, endj = this._xs[i].length; j < endj; j++) {
                if (this._xs[i][j].length > 1) {
                    for (var k = 1, endk = this._xs[i][j].length; k < endk; k++) {
                        var xs = this._xs[i][j][k]; // only use holes
                        var ys = this._ys[i][j][k]; // only use holes
                        if (xs.length == 0)
                            continue;
                        points.push({
                            minX: array_1.min(xs),
                            minY: array_1.min(ys),
                            maxX: array_1.max(xs),
                            maxY: array_1.max(ys),
                            i: i,
                        });
                    }
                }
            }
        }
        return new spatial_1.SpatialIndex(points);
    };
    MultiPolygonsView.prototype._mask_data = function () {
        var xr = this.renderer.plot_view.frame.x_ranges.default;
        var _a = [xr.min, xr.max], x0 = _a[0], x1 = _a[1];
        var yr = this.renderer.plot_view.frame.y_ranges.default;
        var _b = [yr.min, yr.max], y0 = _b[0], y1 = _b[1];
        var bbox = hittest.validate_bbox_coords([x0, x1], [y0, y1]);
        var indices = this.index.indices(bbox);
        // TODO this is probably needed in patches as well so that we don't draw glyphs multiple times
        return indices.sort(function (a, b) { return a - b; }).filter(function (value, index, array) {
            return (index === 0) || (value !== array[index - 1]);
        });
    };
    MultiPolygonsView.prototype._inner_loop = function (ctx, sx, sy) {
        ctx.beginPath();
        for (var j = 0, endj = sx.length; j < endj; j++) {
            for (var k = 0, endk = sx[j].length; k < endk; k++) {
                var _sx = sx[j][k];
                var _sy = sy[j][k];
                for (var l = 0, endl = _sx.length; l < endl; l++) {
                    if (l == 0) {
                        ctx.moveTo(_sx[l], _sy[l]);
                        continue;
                    }
                    else
                        ctx.lineTo(_sx[l], _sy[l]);
                }
                ctx.closePath();
            }
        }
    };
    MultiPolygonsView.prototype._render = function (ctx, indices, _a) {
        var _this = this;
        var sxs = _a.sxs, sys = _a.sys;
        if (this.visuals.fill.doit || this.visuals.line.doit) {
            var _loop_1 = function (i) {
                var _a = [sxs[i], sys[i]], sx = _a[0], sy = _a[1];
                if (this_1.visuals.fill.doit) {
                    this_1.visuals.fill.set_vectorize(ctx, i);
                    this_1._inner_loop(ctx, sx, sy);
                    ctx.fill("evenodd");
                }
                this_1.visuals.hatch.doit2(ctx, i, function () {
                    _this._inner_loop(ctx, sx, sy);
                    ctx.fill("evenodd");
                }, function () { return _this.renderer.request_render(); });
                if (this_1.visuals.line.doit) {
                    this_1.visuals.line.set_vectorize(ctx, i);
                    this_1._inner_loop(ctx, sx, sy);
                    ctx.stroke();
                }
            };
            var this_1 = this;
            for (var _i = 0, indices_1 = indices; _i < indices_1.length; _i++) {
                var i = indices_1[_i];
                _loop_1(i);
            }
        }
    };
    MultiPolygonsView.prototype._hit_point = function (geometry) {
        var sx = geometry.sx, sy = geometry.sy;
        var x = this.renderer.xscale.invert(sx);
        var y = this.renderer.yscale.invert(sy);
        var candidates = this.index.indices({ minX: x, minY: y, maxX: x, maxY: y });
        var hole_candidates = this.hole_index.indices({ minX: x, minY: y, maxX: x, maxY: y });
        var hits = [];
        for (var i = 0, end = candidates.length; i < end; i++) {
            var idx = candidates[i];
            var sxs = this.sxs[idx];
            var sys = this.sys[idx];
            for (var j = 0, endj = sxs.length; j < endj; j++) {
                var nk = sxs[j].length;
                if (hittest.point_in_poly(sx, sy, sxs[j][0], sys[j][0])) {
                    if (nk == 1) {
                        hits.push(idx);
                    }
                    else if (hole_candidates.indexOf(idx) == -1) {
                        hits.push(idx);
                    }
                    else if (nk > 1) {
                        var in_a_hole = false;
                        for (var k = 1; k < nk; k++) {
                            var sxs_k = sxs[j][k];
                            var sys_k = sys[j][k];
                            if (hittest.point_in_poly(sx, sy, sxs_k, sys_k)) {
                                in_a_hole = true;
                                break;
                            }
                            else {
                                continue;
                            }
                        }
                        if (!in_a_hole) {
                            hits.push(idx);
                        }
                    }
                }
            }
        }
        var result = hittest.create_empty_hit_test_result();
        result.indices = hits;
        return result;
    };
    MultiPolygonsView.prototype._get_snap_coord = function (array) {
        return arrayable_1.sum(array) / array.length;
    };
    MultiPolygonsView.prototype.scenterx = function (i, sx, sy) {
        if (this.sxs[i].length == 1) {
            // We don't have discontinuous objects so we're ok
            return this._get_snap_coord(this.sxs[i][0][0]);
        }
        else {
            // We have discontinuous objects, so we need to find which
            // one we're in, we can use point_in_poly again
            var sxs = this.sxs[i];
            var sys = this.sys[i];
            for (var j = 0, end = sxs.length; j < end; j++) {
                if (hittest.point_in_poly(sx, sy, sxs[j][0], sys[j][0]))
                    return this._get_snap_coord(sxs[j][0]);
            }
        }
        throw new Error("unreachable code");
    };
    MultiPolygonsView.prototype.scentery = function (i, sx, sy) {
        if (this.sys[i].length == 1) {
            // We don't have discontinuous objects so we're ok
            return this._get_snap_coord(this.sys[i][0][0]);
        }
        else {
            // We have discontinuous objects, so we need to find which
            // one we're in, we can use point_in_poly again
            var sxs = this.sxs[i];
            var sys = this.sys[i];
            for (var j = 0, end = sxs.length; j < end; j++) {
                if (hittest.point_in_poly(sx, sy, sxs[j][0], sys[j][0]))
                    return this._get_snap_coord(sys[j][0]);
            }
        }
        throw new Error("unreachable code");
    };
    MultiPolygonsView.prototype.map_data = function () {
        var self = this;
        for (var _i = 0, _a = this.model._coords; _i < _a.length; _i++) {
            var _b = _a[_i], xname = _b[0], yname = _b[1];
            var sxname = "s" + xname;
            var syname = "s" + yname;
            xname = "_" + xname;
            yname = "_" + yname;
            if (self[xname] != null && (types_1.isArray(self[xname][0]) || types_1.isTypedArray(self[xname][0]))) {
                var ni = self[xname].length;
                self[sxname] = new Array(ni);
                self[syname] = new Array(ni);
                for (var i = 0; i < ni; i++) {
                    var nj = self[xname][i].length;
                    self[sxname][i] = new Array(nj);
                    self[syname][i] = new Array(nj);
                    for (var j = 0; j < nj; j++) {
                        var nk = self[xname][i][j].length;
                        self[sxname][i][j] = new Array(nk);
                        self[syname][i][j] = new Array(nk);
                        for (var k = 0; k < nk; k++) {
                            var _c = this.map_to_screen(self[xname][i][j][k], self[yname][i][j][k]), sx = _c[0], sy = _c[1];
                            self[sxname][i][j][k] = sx;
                            self[syname][i][j][k] = sy;
                        }
                    }
                }
            }
        }
    };
    MultiPolygonsView.prototype.draw_legend_for_index = function (ctx, bbox, index) {
        utils_1.generic_area_legend(this.visuals, ctx, bbox, index);
    };
    return MultiPolygonsView;
}(glyph_1.GlyphView));
exports.MultiPolygonsView = MultiPolygonsView;
var MultiPolygons = /** @class */ (function (_super) {
    tslib_1.__extends(MultiPolygons, _super);
    function MultiPolygons(attrs) {
        return _super.call(this, attrs) || this;
    }
    MultiPolygons.initClass = function () {
        this.prototype.type = 'MultiPolygons';
        this.prototype.default_view = MultiPolygonsView;
        this.coords([['xs', 'ys']]);
        this.mixins(['line', 'fill', 'hatch']);
    };
    return MultiPolygons;
}(glyph_1.Glyph));
exports.MultiPolygons = MultiPolygons;
MultiPolygons.initClass();
