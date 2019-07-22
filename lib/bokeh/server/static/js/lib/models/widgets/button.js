"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var abstract_button_1 = require("./abstract_button");
var bokeh_events_1 = require("../../core/bokeh_events");
var p = require("../../core/properties");
var ButtonView = /** @class */ (function (_super) {
    tslib_1.__extends(ButtonView, _super);
    function ButtonView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ButtonView.prototype.click = function () {
        this.model.clicks = this.model.clicks + 1;
        this.model.trigger_event(new bokeh_events_1.ButtonClick());
        _super.prototype.click.call(this);
    };
    return ButtonView;
}(abstract_button_1.AbstractButtonView));
exports.ButtonView = ButtonView;
var Button = /** @class */ (function (_super) {
    tslib_1.__extends(Button, _super);
    function Button(attrs) {
        return _super.call(this, attrs) || this;
    }
    Button.initClass = function () {
        this.prototype.type = "Button";
        this.prototype.default_view = ButtonView;
        this.define({
            clicks: [p.Number, 0],
        });
        this.override({
            label: "Button",
        });
    };
    return Button;
}(abstract_button_1.AbstractButton));
exports.Button = Button;
Button.initClass();
