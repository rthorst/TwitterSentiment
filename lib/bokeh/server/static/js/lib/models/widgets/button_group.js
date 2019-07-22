"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var control_1 = require("./control");
var dom_1 = require("../../core/dom");
var p = require("../../core/properties");
var ButtonGroupView = /** @class */ (function (_super) {
    tslib_1.__extends(ButtonGroupView, _super);
    function ButtonGroupView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ButtonGroupView.prototype.connect_signals = function () {
        var _this = this;
        _super.prototype.connect_signals.call(this);
        var p = this.model.properties;
        this.on_change(p.button_type, function () { return _this.render(); });
        this.on_change(p.labels, function () { return _this.render(); });
        this.on_change(p.active, function () { return _this._update_active(); });
    };
    ButtonGroupView.prototype.render = function () {
        var _this = this;
        _super.prototype.render.call(this);
        this._buttons = this.model.labels.map(function (label, i) {
            var button = dom_1.div({
                class: ["bk-btn", "bk-btn-" + _this.model.button_type],
                disabled: _this.model.disabled,
            }, label);
            button.addEventListener("click", function () { return _this.change_active(i); });
            return button;
        });
        this._update_active();
        var group = dom_1.div({ class: "bk-btn-group" }, this._buttons);
        this.el.appendChild(group);
    };
    return ButtonGroupView;
}(control_1.ControlView));
exports.ButtonGroupView = ButtonGroupView;
var ButtonGroup = /** @class */ (function (_super) {
    tslib_1.__extends(ButtonGroup, _super);
    function ButtonGroup(attrs) {
        return _super.call(this, attrs) || this;
    }
    ButtonGroup.initClass = function () {
        this.prototype.type = "ButtonGroup";
        this.define({
            labels: [p.Array, []],
            button_type: [p.ButtonType, "default"],
            callback: [p.Any],
        });
    };
    return ButtonGroup;
}(control_1.Control));
exports.ButtonGroup = ButtonGroup;
ButtonGroup.initClass();
