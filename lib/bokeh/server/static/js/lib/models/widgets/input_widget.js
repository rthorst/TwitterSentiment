"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var control_1 = require("./control");
var dom_1 = require("../../core/dom");
var p = require("../../core/properties");
var InputWidgetView = /** @class */ (function (_super) {
    tslib_1.__extends(InputWidgetView, _super);
    function InputWidgetView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    InputWidgetView.prototype.connect_signals = function () {
        var _this = this;
        _super.prototype.connect_signals.call(this);
        this.connect(this.model.properties.title.change, function () {
            _this.label_el.textContent = _this.model.title;
        });
    };
    InputWidgetView.prototype.render = function () {
        _super.prototype.render.call(this);
        var title = this.model.title;
        this.label_el = dom_1.label({ style: { display: title.length == 0 ? "none" : "" } }, title);
        this.group_el = dom_1.div({ class: "bk-input-group" }, this.label_el);
        this.el.appendChild(this.group_el);
    };
    InputWidgetView.prototype.change_input = function () {
        if (this.model.callback != null)
            this.model.callback.execute(this.model);
    };
    return InputWidgetView;
}(control_1.ControlView));
exports.InputWidgetView = InputWidgetView;
var InputWidget = /** @class */ (function (_super) {
    tslib_1.__extends(InputWidget, _super);
    function InputWidget(attrs) {
        return _super.call(this, attrs) || this;
    }
    InputWidget.initClass = function () {
        this.prototype.type = "InputWidget";
        this.define({
            title: [p.String, ""],
            callback: [p.Any],
        });
    };
    return InputWidget;
}(control_1.Control));
exports.InputWidget = InputWidget;
InputWidget.initClass();
