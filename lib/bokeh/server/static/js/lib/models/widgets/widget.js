"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var html_box_1 = require("../layouts/html_box");
var p = require("../../core/properties");
var WidgetView = /** @class */ (function (_super) {
    tslib_1.__extends(WidgetView, _super);
    function WidgetView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    WidgetView.prototype._width_policy = function () {
        return this.model.orientation == "horizontal" ? _super.prototype._width_policy.call(this) : "fixed";
    };
    WidgetView.prototype._height_policy = function () {
        return this.model.orientation == "horizontal" ? "fixed" : _super.prototype._height_policy.call(this);
    };
    WidgetView.prototype.box_sizing = function () {
        var sizing = _super.prototype.box_sizing.call(this);
        if (this.model.orientation == "horizontal") {
            if (sizing.width == null)
                sizing.width = this.model.default_size;
        }
        else {
            if (sizing.height == null)
                sizing.height = this.model.default_size;
        }
        return sizing;
    };
    return WidgetView;
}(html_box_1.HTMLBoxView));
exports.WidgetView = WidgetView;
var Widget = /** @class */ (function (_super) {
    tslib_1.__extends(Widget, _super);
    function Widget(attrs) {
        return _super.call(this, attrs) || this;
    }
    Widget.initClass = function () {
        this.prototype.type = "Widget";
        this.define({
            orientation: [p.Orientation, "horizontal"],
            default_size: [p.Number, 300],
        });
        this.override({
            margin: [5, 5, 5, 5],
        });
    };
    return Widget;
}(html_box_1.HTMLBox));
exports.Widget = Widget;
Widget.initClass();
