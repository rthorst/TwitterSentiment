"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var box_1 = require("./box");
var grid_1 = require("../../core/layout/grid");
var p = require("../../core/properties");
var RowView = /** @class */ (function (_super) {
    tslib_1.__extends(RowView, _super);
    function RowView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RowView.prototype._update_layout = function () {
        var items = this.child_views.map(function (child) { return child.layout; });
        this.layout = new grid_1.Row(items);
        this.layout.cols = this.model.cols;
        this.layout.spacing = [0, this.model.spacing];
        this.layout.set_sizing(this.box_sizing());
    };
    return RowView;
}(box_1.BoxView));
exports.RowView = RowView;
var Row = /** @class */ (function (_super) {
    tslib_1.__extends(Row, _super);
    function Row(attrs) {
        return _super.call(this, attrs) || this;
    }
    Row.initClass = function () {
        this.prototype.type = "Row";
        this.prototype.default_view = RowView;
        this.define({
            cols: [p.Any, "auto"],
        });
    };
    return Row;
}(box_1.Box));
exports.Row = Row;
Row.initClass();
