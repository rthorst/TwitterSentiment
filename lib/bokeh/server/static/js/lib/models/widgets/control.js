"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var widget_1 = require("./widget");
var ControlView = /** @class */ (function (_super) {
    tslib_1.__extends(ControlView, _super);
    function ControlView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ControlView.prototype.connect_signals = function () {
        var _this = this;
        _super.prototype.connect_signals.call(this);
        var p = this.model.properties;
        this.on_change(p.disabled, function () { return _this.render(); });
    };
    return ControlView;
}(widget_1.WidgetView));
exports.ControlView = ControlView;
var Control = /** @class */ (function (_super) {
    tslib_1.__extends(Control, _super);
    function Control(attrs) {
        return _super.call(this, attrs) || this;
    }
    Control.initClass = function () {
        this.prototype.type = "Control";
    };
    return Control;
}(widget_1.Widget));
exports.Control = Control;
Control.initClass();
