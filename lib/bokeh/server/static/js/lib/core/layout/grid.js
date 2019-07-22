"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var types_1 = require("./types");
var layoutable_1 = require("./layoutable");
var types_2 = require("../util/types");
var bbox_1 = require("../util/bbox");
var array_1 = require("../util/array");
var max = Math.max, round = Math.round;
var DefaultMap = /** @class */ (function () {
    function DefaultMap(def) {
        this.def = def;
        this._map = new Map();
    }
    DefaultMap.prototype.get = function (key) {
        var value = this._map.get(key);
        if (value === undefined) {
            value = this.def();
            this._map.set(key, value);
        }
        return value;
    };
    DefaultMap.prototype.apply = function (key, fn) {
        var value = this.get(key);
        this._map.set(key, fn(value));
    };
    return DefaultMap;
}());
var Container = /** @class */ (function () {
    function Container() {
        this._items = [];
        this._nrows = 0;
        this._ncols = 0;
    }
    Object.defineProperty(Container.prototype, "nrows", {
        get: function () {
            return this._nrows;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Container.prototype, "ncols", {
        get: function () {
            return this._ncols;
        },
        enumerable: true,
        configurable: true
    });
    Container.prototype.add = function (span, data) {
        var r1 = span.r1, c1 = span.c1;
        this._nrows = max(this._nrows, r1 + 1);
        this._ncols = max(this._ncols, c1 + 1);
        this._items.push({ span: span, data: data });
    };
    Container.prototype.at = function (r, c) {
        var selected = this._items.filter(function (_a) {
            var span = _a.span;
            return span.r0 <= r && r <= span.r1 &&
                span.c0 <= c && c <= span.c1;
        });
        return selected.map(function (_a) {
            var data = _a.data;
            return data;
        });
    };
    Container.prototype.row = function (r) {
        var selected = this._items.filter(function (_a) {
            var span = _a.span;
            return span.r0 <= r && r <= span.r1;
        });
        return selected.map(function (_a) {
            var data = _a.data;
            return data;
        });
    };
    Container.prototype.col = function (c) {
        var selected = this._items.filter(function (_a) {
            var span = _a.span;
            return span.c0 <= c && c <= span.c1;
        });
        return selected.map(function (_a) {
            var data = _a.data;
            return data;
        });
    };
    Container.prototype.foreach = function (fn) {
        for (var _i = 0, _a = this._items; _i < _a.length; _i++) {
            var _b = _a[_i], span = _b.span, data = _b.data;
            fn(span, data);
        }
    };
    Container.prototype.map = function (fn) {
        var result = new Container();
        for (var _i = 0, _a = this._items; _i < _a.length; _i++) {
            var _b = _a[_i], span = _b.span, data = _b.data;
            result.add(span, fn(span, data));
        }
        return result;
    };
    return Container;
}());
var Grid = /** @class */ (function (_super) {
    tslib_1.__extends(Grid, _super);
    function Grid(items) {
        if (items === void 0) { items = []; }
        var _this = _super.call(this) || this;
        _this.items = items;
        _this.rows = "auto";
        _this.cols = "auto";
        _this.spacing = 0;
        _this.absolute = false;
        return _this;
    }
    Grid.prototype.is_width_expanding = function () {
        if (_super.prototype.is_width_expanding.call(this))
            return true;
        if (this.sizing.width_policy == "fixed")
            return false;
        var cols = this._state.cols;
        return array_1.some(cols, function (col) { return col.policy == "max"; });
    };
    Grid.prototype.is_height_expanding = function () {
        if (_super.prototype.is_height_expanding.call(this))
            return true;
        if (this.sizing.height_policy == "fixed")
            return false;
        var rows = this._state.rows;
        return array_1.some(rows, function (row) { return row.policy == "max"; });
    };
    Grid.prototype._init = function () {
        var _this = this;
        _super.prototype._init.call(this);
        var items = new Container();
        for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
            var _b = _a[_i], layout = _b.layout, row = _b.row, col = _b.col, row_span = _b.row_span, col_span = _b.col_span;
            if (layout.sizing.visible) {
                var r0 = row;
                var c0 = col;
                var r1 = row + (row_span != null ? row_span : 1) - 1;
                var c1 = col + (col_span != null ? col_span : 1) - 1;
                items.add({ r0: r0, c0: c0, r1: r1, c1: c1 }, layout);
            }
        }
        var nrows = items.nrows, ncols = items.ncols;
        var rows = new Array(nrows);
        var _loop_1 = function (y) {
            var row = (function () {
                var sizing = types_2.isPlainObject(_this.rows) ? _this.rows[y] || _this.rows["*"] : _this.rows;
                if (sizing == null)
                    return { policy: "auto" };
                else if (types_2.isNumber(sizing))
                    return { policy: "fixed", height: sizing };
                else if (types_2.isString(sizing))
                    return { policy: sizing };
                else
                    return sizing;
            })();
            var align = row.align || "auto";
            if (row.policy == "fixed")
                rows[y] = { policy: "fixed", height: row.height, align: align };
            else if (row.policy == "min")
                rows[y] = { policy: "min", align: align };
            else if (row.policy == "fit" || row.policy == "max")
                rows[y] = { policy: row.policy, flex: row.flex || 1, align: align };
            else if (row.policy == "auto") {
                if (array_1.some(items.row(y), function (layout) { return layout.is_height_expanding(); }))
                    rows[y] = { policy: "max", flex: 1, align: align };
                else
                    rows[y] = { policy: "min", align: align };
            }
            else
                throw new Error("unrechable");
        };
        for (var y = 0; y < nrows; y++) {
            _loop_1(y);
        }
        var cols = new Array(ncols);
        var _loop_2 = function (x) {
            var col = (function () {
                var sizing = types_2.isPlainObject(_this.cols) ? _this.cols[x] || _this.cols["*"] : _this.cols;
                if (sizing == null)
                    return { policy: "auto" };
                else if (types_2.isNumber(sizing))
                    return { policy: "fixed", width: sizing };
                else if (types_2.isString(sizing))
                    return { policy: sizing };
                else
                    return sizing;
            })();
            var align = col.align || "auto";
            if (col.policy == "fixed")
                cols[x] = { policy: "fixed", width: col.width, align: align };
            else if (col.policy == "min")
                cols[x] = { policy: "min", align: align };
            else if (col.policy == "fit" || col.policy == "max")
                cols[x] = { policy: col.policy, flex: col.flex || 1, align: align };
            else if (col.policy == "auto") {
                if (array_1.some(items.col(x), function (layout) { return layout.is_width_expanding(); }))
                    cols[x] = { policy: "max", flex: 1, align: align };
                else
                    cols[x] = { policy: "min", align: align };
            }
            else
                throw new Error("unrechable");
        };
        for (var x = 0; x < ncols; x++) {
            _loop_2(x);
        }
        var _c = types_2.isNumber(this.spacing) ? [this.spacing, this.spacing] : this.spacing, rspacing = _c[0], cspacing = _c[1];
        this._state = { items: items, nrows: nrows, ncols: ncols, rows: rows, cols: cols, rspacing: rspacing, cspacing: cspacing };
    };
    Grid.prototype._measure_totals = function (row_heights, col_widths) {
        var _a = this._state, nrows = _a.nrows, ncols = _a.ncols, rspacing = _a.rspacing, cspacing = _a.cspacing;
        return {
            height: array_1.sum(row_heights) + (nrows - 1) * rspacing,
            width: array_1.sum(col_widths) + (ncols - 1) * cspacing,
        };
    };
    Grid.prototype._measure_cells = function (cell_viewport) {
        var _a = this._state, items = _a.items, nrows = _a.nrows, ncols = _a.ncols, rows = _a.rows, cols = _a.cols, rspacing = _a.rspacing, cspacing = _a.cspacing;
        var row_heights = new Array(nrows);
        for (var r = 0; r < nrows; r++) {
            var row = rows[r];
            row_heights[r] = row.policy == "fixed" ? row.height : 0;
        }
        var col_widths = new Array(ncols);
        for (var c = 0; c < ncols; c++) {
            var col = cols[c];
            col_widths[c] = col.policy == "fixed" ? col.width : 0;
        }
        var size_hints = new Container();
        items.foreach(function (span, layout) {
            var r0 = span.r0, c0 = span.c0, r1 = span.r1, c1 = span.c1;
            var rspace = (r1 - r0) * rspacing;
            var cspace = (c1 - c0) * cspacing;
            var height = 0;
            for (var r = r0; r <= r1; r++) {
                height += cell_viewport(r, c0).height;
            }
            height += rspace;
            var width = 0;
            for (var c = c0; c <= c1; c++) {
                width += cell_viewport(r0, c).width;
            }
            width += cspace;
            var size_hint = layout.measure({ width: width, height: height });
            size_hints.add(span, { layout: layout, size_hint: size_hint });
            var size = new types_1.Sizeable(size_hint).grow_by(layout.sizing.margin);
            size.height -= rspace;
            size.width -= cspace;
            var radjustable = [];
            for (var r = r0; r <= r1; r++) {
                var row = rows[r];
                if (row.policy == "fixed")
                    size.height -= row.height;
                else
                    radjustable.push(r);
            }
            if (size.height > 0) {
                var rheight = round(size.height / radjustable.length);
                for (var _i = 0, radjustable_1 = radjustable; _i < radjustable_1.length; _i++) {
                    var r = radjustable_1[_i];
                    row_heights[r] = max(row_heights[r], rheight);
                }
            }
            var cadjustable = [];
            for (var c = c0; c <= c1; c++) {
                var col = cols[c];
                if (col.policy == "fixed")
                    size.width -= col.width;
                else
                    cadjustable.push(c);
            }
            if (size.width > 0) {
                var cwidth = round(size.width / cadjustable.length);
                for (var _a = 0, cadjustable_1 = cadjustable; _a < cadjustable_1.length; _a++) {
                    var c = cadjustable_1[_a];
                    col_widths[c] = max(col_widths[c], cwidth);
                }
            }
        });
        var size = this._measure_totals(row_heights, col_widths);
        return { size: size, row_heights: row_heights, col_widths: col_widths, size_hints: size_hints };
    };
    Grid.prototype._measure_grid = function (viewport) {
        var _a = this._state, nrows = _a.nrows, ncols = _a.ncols, rows = _a.rows, cols = _a.cols, rspacing = _a.rspacing, cspacing = _a.cspacing;
        var preferred = this._measure_cells(function (y, x) {
            var row = rows[y];
            var col = cols[x];
            return {
                width: col.policy == "fixed" ? col.width : Infinity,
                height: row.policy == "fixed" ? row.height : Infinity,
            };
        });
        var available_height;
        if (this.sizing.height_policy == "fixed" && this.sizing.height != null)
            available_height = this.sizing.height;
        else if (viewport.height != Infinity && this.is_height_expanding())
            available_height = viewport.height;
        else
            available_height = preferred.size.height;
        var height_flex = 0;
        for (var y = 0; y < nrows; y++) {
            var row = rows[y];
            if (row.policy == "fit" || row.policy == "max")
                height_flex += row.flex;
            else
                available_height -= preferred.row_heights[y];
        }
        available_height -= (nrows - 1) * rspacing;
        if (height_flex != 0 && available_height > 0) {
            for (var y = 0; y < nrows; y++) {
                var row = rows[y];
                if (row.policy == "fit" || row.policy == "max") {
                    var height = round(available_height * (row.flex / height_flex));
                    available_height -= height;
                    preferred.row_heights[y] = height;
                    height_flex -= row.flex;
                }
            }
        }
        else if (available_height < 0) {
            var nadjustable = 0;
            for (var y = 0; y < nrows; y++) {
                var row = rows[y];
                if (row.policy != "fixed")
                    nadjustable++;
            }
            var overflow_height = -available_height;
            for (var y = 0; y < nrows; y++) {
                var row = rows[y];
                if (row.policy != "fixed") {
                    var height = preferred.row_heights[y];
                    var cutoff = round(overflow_height / nadjustable);
                    preferred.row_heights[y] = max(height - cutoff, 0);
                    overflow_height -= cutoff > height ? height : cutoff;
                    nadjustable--;
                }
            }
        }
        var available_width;
        if (this.sizing.width_policy == "fixed" && this.sizing.width != null)
            available_width = this.sizing.width;
        else if (viewport.width != Infinity && this.is_width_expanding())
            available_width = viewport.width;
        else
            available_width = preferred.size.width;
        var width_flex = 0;
        for (var x = 0; x < ncols; x++) {
            var col = cols[x];
            if (col.policy == "fit" || col.policy == "max")
                width_flex += col.flex;
            else
                available_width -= preferred.col_widths[x];
        }
        available_width -= (ncols - 1) * cspacing;
        if (width_flex != 0 && available_width > 0) {
            for (var x = 0; x < ncols; x++) {
                var col = cols[x];
                if (col.policy == "fit" || col.policy == "max") {
                    var width = round(available_width * (col.flex / width_flex));
                    available_width -= width;
                    preferred.col_widths[x] = width;
                    width_flex -= col.flex;
                }
            }
        }
        else if (available_width < 0) {
            var nadjustable = 0;
            for (var x = 0; x < ncols; x++) {
                var col = cols[x];
                if (col.policy != "fixed")
                    nadjustable++;
            }
            var overflow_width = -available_width;
            for (var x = 0; x < ncols; x++) {
                var col = cols[x];
                if (col.policy != "fixed") {
                    var width = preferred.col_widths[x];
                    var cutoff = round(overflow_width / nadjustable);
                    preferred.col_widths[x] = max(width - cutoff, 0);
                    overflow_width -= cutoff > width ? width : cutoff;
                    nadjustable--;
                }
            }
        }
        var _b = this._measure_cells(function (y, x) {
            return {
                width: preferred.col_widths[x],
                height: preferred.row_heights[y],
            };
        }), row_heights = _b.row_heights, col_widths = _b.col_widths, size_hints = _b.size_hints;
        var size = this._measure_totals(row_heights, col_widths);
        return { size: size, row_heights: row_heights, col_widths: col_widths, size_hints: size_hints };
    };
    Grid.prototype._measure = function (viewport) {
        var size = this._measure_grid(viewport).size;
        return size;
    };
    Grid.prototype._set_geometry = function (outer, inner) {
        _super.prototype._set_geometry.call(this, outer, inner);
        var _a = this._state, nrows = _a.nrows, ncols = _a.ncols, rspacing = _a.rspacing, cspacing = _a.cspacing;
        var _b = this._measure_grid(outer), row_heights = _b.row_heights, col_widths = _b.col_widths, size_hints = _b.size_hints;
        var rows = this._state.rows.map(function (row, r) {
            return tslib_1.__assign({}, row, { top: 0, height: row_heights[r], get bottom() { return this.top + this.height; } });
        });
        var cols = this._state.cols.map(function (col, c) {
            return tslib_1.__assign({}, col, { left: 0, width: col_widths[c], get right() { return this.left + this.width; } });
        });
        var items = size_hints.map(function (_, item) {
            return tslib_1.__assign({}, item, { outer: new bbox_1.BBox(), inner: new bbox_1.BBox() });
        });
        for (var r = 0, top_1 = !this.absolute ? 0 : outer.top; r < nrows; r++) {
            var row = rows[r];
            row.top = top_1;
            top_1 += row.height + rspacing;
        }
        for (var c = 0, left = !this.absolute ? 0 : outer.left; c < ncols; c++) {
            var col = cols[c];
            col.left = left;
            left += col.width + cspacing;
        }
        function span_width(c0, c1) {
            var width = (c1 - c0) * cspacing;
            for (var c = c0; c <= c1; c++) {
                width += cols[c].width;
            }
            return width;
        }
        function span_height(r0, r1) {
            var height = (r1 - r0) * rspacing;
            for (var r = r0; r <= r1; r++) {
                height += rows[r].height;
            }
            return height;
        }
        items.foreach(function (_a, item) {
            var r0 = _a.r0, c0 = _a.c0, r1 = _a.r1, c1 = _a.c1;
            var layout = item.layout, size_hint = item.size_hint;
            var sizing = layout.sizing;
            var width = size_hint.width, height = size_hint.height;
            var span = {
                width: span_width(c0, c1),
                height: span_height(r0, r1),
            };
            var halign = c0 == c1 && cols[c0].align != "auto" ? cols[c0].align : sizing.halign;
            var valign = r0 == r1 && rows[r0].align != "auto" ? rows[r0].align : sizing.valign;
            var left = cols[c0].left;
            if (halign == "start")
                left += sizing.margin.left;
            else if (halign == "center")
                left += round((span.width - width) / 2);
            else if (halign == "end")
                left += span.width - sizing.margin.right - width;
            var top = rows[r0].top;
            if (valign == "start")
                top += sizing.margin.top;
            else if (valign == "center")
                top += round((span.height - height) / 2);
            else if (valign == "end")
                top += span.height - sizing.margin.bottom - height;
            item.outer = new bbox_1.BBox({ left: left, top: top, width: width, height: height });
        });
        var row_aligns = rows.map(function () {
            return {
                start: new DefaultMap(function () { return 0; }),
                end: new DefaultMap(function () { return 0; }),
            };
        });
        var col_aligns = cols.map(function () {
            return {
                start: new DefaultMap(function () { return 0; }),
                end: new DefaultMap(function () { return 0; }),
            };
        });
        items.foreach(function (_a, _b) {
            var r0 = _a.r0, c0 = _a.c0, r1 = _a.r1, c1 = _a.c1;
            var size_hint = _b.size_hint, outer = _b.outer;
            var inner = size_hint.inner;
            if (inner != null) {
                row_aligns[r0].start.apply(outer.top, function (v) { return max(v, inner.top); });
                row_aligns[r1].end.apply(rows[r1].bottom - outer.bottom, function (v) { return max(v, inner.bottom); });
                col_aligns[c0].start.apply(outer.left, function (v) { return max(v, inner.left); });
                col_aligns[c1].end.apply(cols[c1].right - outer.right, function (v) { return max(v, inner.right); });
            }
        });
        items.foreach(function (_a, item) {
            var r0 = _a.r0, c0 = _a.c0, r1 = _a.r1, c1 = _a.c1;
            var size_hint = item.size_hint, outer = item.outer;
            function inner_bbox(_a) {
                var left = _a.left, right = _a.right, top = _a.top, bottom = _a.bottom;
                var width = outer.width - left - right;
                var height = outer.height - top - bottom;
                return new bbox_1.BBox({ left: left, top: top, width: width, height: height });
            }
            if (size_hint.inner != null) {
                var inner_1 = inner_bbox(size_hint.inner);
                if (size_hint.align !== false) {
                    var top_2 = row_aligns[r0].start.get(outer.top);
                    var bottom = row_aligns[r1].end.get(rows[r1].bottom - outer.bottom);
                    var left = col_aligns[c0].start.get(outer.left);
                    var right = col_aligns[c1].end.get(cols[c1].right - outer.right);
                    try {
                        inner_1 = inner_bbox({ top: top_2, bottom: bottom, left: left, right: right });
                    }
                    catch (_b) { }
                }
                item.inner = inner_1;
            }
            else
                item.inner = outer;
        });
        items.foreach(function (_, _a) {
            var layout = _a.layout, outer = _a.outer, inner = _a.inner;
            layout.set_geometry(outer, inner);
        });
    };
    return Grid;
}(layoutable_1.Layoutable));
exports.Grid = Grid;
var Row = /** @class */ (function (_super) {
    tslib_1.__extends(Row, _super);
    function Row(items) {
        var _this = _super.call(this) || this;
        _this.items = items.map(function (item, i) { return ({ layout: item, row: 0, col: i }); });
        _this.rows = "fit";
        return _this;
    }
    return Row;
}(Grid));
exports.Row = Row;
var Column = /** @class */ (function (_super) {
    tslib_1.__extends(Column, _super);
    function Column(items) {
        var _this = _super.call(this) || this;
        _this.items = items.map(function (item, i) { return ({ layout: item, row: i, col: 0 }); });
        _this.cols = "fit";
        return _this;
    }
    return Column;
}(Grid));
exports.Column = Column;
