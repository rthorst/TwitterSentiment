"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var abstract_button_1 = require("./abstract_button");
var dom_1 = require("../../core/dom");
var p = require("../../core/properties");
var ToggleView = /** @class */ (function (_super) {
    tslib_1.__extends(ToggleView, _super);
    function ToggleView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ToggleView.prototype.connect_signals = function () {
        var _this = this;
        _super.prototype.connect_signals.call(this);
        this.connect(this.model.properties.active.change, function () { return _this._update_active(); });
    };
    ToggleView.prototype.render = function () {
        _super.prototype.render.call(this);
        this._update_active();
    };
    ToggleView.prototype.click = function () {
        this.model.active = !this.model.active;
        _super.prototype.click.call(this);
    };
    ToggleView.prototype._update_active = function () {
        dom_1.classes(this.button_el).toggle("bk-active", this.model.active);
    };
    return ToggleView;
}(abstract_button_1.AbstractButtonView));
exports.ToggleView = ToggleView;
var Toggle = /** @class */ (function (_super) {
    tslib_1.__extends(Toggle, _super);
    function Toggle(attrs) {
        return _super.call(this, attrs) || this;
    }
    Toggle.initClass = function () {
        this.prototype.type = "Toggle";
        this.prototype.default_view = ToggleView;
        this.define({
            active: [p.Boolean, false],
        });
        this.override({
            label: "Toggle",
        });
    };
    return Toggle;
}(abstract_button_1.AbstractButton));
exports.Toggle = Toggle;
Toggle.initClass();
