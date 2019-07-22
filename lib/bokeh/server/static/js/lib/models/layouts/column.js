"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var box_1 = require("./box");
var grid_1 = require("../../core/layout/grid");
var p = require("../../core/properties");
var ColumnView = /** @class */ (function (_super) {
    tslib_1.__extends(ColumnView, _super);
    function ColumnView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ColumnView.prototype._update_layout = function () {
        var items = this.child_views.map(function (child) { return child.layout; });
        this.layout = new grid_1.Column(items);
        this.layout.rows = this.model.rows;
        this.layout.spacing = [this.model.spacing, 0];
        this.layout.set_sizing(this.box_sizing());
    };
    return ColumnView;
}(box_1.BoxView));
exports.ColumnView = ColumnView;
var Column = /** @class */ (function (_super) {
    tslib_1.__extends(Column, _super);
    function Column(attrs) {
        return _super.call(this, attrs) || this;
    }
    Column.initClass = function () {
        this.prototype.type = "Column";
        this.prototype.default_view = ColumnView;
        this.define({
            rows: [p.Any, "auto"],
        });
    };
    return Column;
}(box_1.Box));
exports.Column = Column;
Column.initClass();
