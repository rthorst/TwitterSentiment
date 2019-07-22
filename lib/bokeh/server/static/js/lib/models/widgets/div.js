"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var markup_1 = require("./markup");
var p = require("../../core/properties");
var DivView = /** @class */ (function (_super) {
    tslib_1.__extends(DivView, _super);
    function DivView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DivView.prototype.render = function () {
        _super.prototype.render.call(this);
        if (this.model.render_as_text)
            this.markup_el.textContent = this.model.text;
        else
            this.markup_el.innerHTML = this.model.text;
    };
    return DivView;
}(markup_1.MarkupView));
exports.DivView = DivView;
var Div = /** @class */ (function (_super) {
    tslib_1.__extends(Div, _super);
    function Div(attrs) {
        return _super.call(this, attrs) || this;
    }
    Div.initClass = function () {
        this.prototype.type = "Div";
        this.prototype.default_view = DivView;
        this.define({
            render_as_text: [p.Boolean, false],
        });
    };
    return Div;
}(markup_1.Markup));
exports.Div = Div;
Div.initClass();
