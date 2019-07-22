"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var layout_1 = require("../../core/layout");
var dom_1 = require("../../core/dom");
var p = require("../../core/properties");
var widget_1 = require("./widget");
var MarkupView = /** @class */ (function (_super) {
    tslib_1.__extends(MarkupView, _super);
    function MarkupView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MarkupView.prototype.connect_signals = function () {
        var _this = this;
        _super.prototype.connect_signals.call(this);
        this.connect(this.model.change, function () {
            _this.render();
            _this.root.compute_layout(); // XXX: invalidate_layout?
        });
    };
    MarkupView.prototype._update_layout = function () {
        this.layout = new layout_1.VariadicBox(this.el);
        this.layout.set_sizing(this.box_sizing());
    };
    MarkupView.prototype.render = function () {
        _super.prototype.render.call(this);
        var style = tslib_1.__assign({}, this.model.style, { display: "inline-block" });
        this.markup_el = dom_1.div({ class: "bk-clearfix", style: style });
        this.el.appendChild(this.markup_el);
    };
    return MarkupView;
}(widget_1.WidgetView));
exports.MarkupView = MarkupView;
var Markup = /** @class */ (function (_super) {
    tslib_1.__extends(Markup, _super);
    function Markup(attrs) {
        return _super.call(this, attrs) || this;
    }
    Markup.initClass = function () {
        this.prototype.type = "Markup";
        this.define({
            text: [p.String, ''],
            style: [p.Any, {}],
        });
    };
    return Markup;
}(widget_1.Widget));
exports.Markup = Markup;
Markup.initClass();
