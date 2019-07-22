"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var layout_dom_1 = require("./layout_dom");
var grid_1 = require("../../core/layout/grid");
var p = require("../../core/properties");
var GridBoxView = /** @class */ (function (_super) {
    tslib_1.__extends(GridBoxView, _super);
    function GridBoxView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GridBoxView.prototype.connect_signals = function () {
        var _this = this;
        _super.prototype.connect_signals.call(this);
        this.connect(this.model.properties.children.change, function () { return _this.rebuild(); });
    };
    Object.defineProperty(GridBoxView.prototype, "child_models", {
        get: function () {
            return this.model.children.map(function (_a) {
                var child = _a[0];
                return child;
            });
        },
        enumerable: true,
        configurable: true
    });
    GridBoxView.prototype._update_layout = function () {
        this.layout = new grid_1.Grid();
        this.layout.rows = this.model.rows;
        this.layout.cols = this.model.cols;
        this.layout.spacing = this.model.spacing;
        for (var _i = 0, _a = this.model.children; _i < _a.length; _i++) {
            var _b = _a[_i], child = _b[0], row = _b[1], col = _b[2], row_span = _b[3], col_span = _b[4];
            var child_view = this._child_views[child.id];
            this.layout.items.push({ layout: child_view.layout, row: row, col: col, row_span: row_span, col_span: col_span });
        }
        this.layout.set_sizing(this.box_sizing());
    };
    return GridBoxView;
}(layout_dom_1.LayoutDOMView));
exports.GridBoxView = GridBoxView;
var GridBox = /** @class */ (function (_super) {
    tslib_1.__extends(GridBox, _super);
    function GridBox(attrs) {
        return _super.call(this, attrs) || this;
    }
    GridBox.initClass = function () {
        this.prototype.type = "GridBox";
        this.prototype.default_view = GridBoxView;
        this.define({
            children: [p.Array, []],
            rows: [p.Any, "auto"],
            cols: [p.Any, "auto"],
            spacing: [p.Any, 0],
        });
    };
    return GridBox;
}(layout_dom_1.LayoutDOM));
exports.GridBox = GridBox;
GridBox.initClass();
