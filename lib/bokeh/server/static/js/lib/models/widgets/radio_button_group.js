"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var button_group_1 = require("./button_group");
var dom_1 = require("../../core/dom");
var p = require("../../core/properties");
var RadioButtonGroupView = /** @class */ (function (_super) {
    tslib_1.__extends(RadioButtonGroupView, _super);
    function RadioButtonGroupView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RadioButtonGroupView.prototype.change_active = function (i) {
        if (this.model.active !== i) {
            this.model.active = i;
            if (this.model.callback != null)
                this.model.callback.execute(this.model);
        }
    };
    RadioButtonGroupView.prototype._update_active = function () {
        var active = this.model.active;
        this._buttons.forEach(function (button, i) {
            dom_1.classes(button).toggle("bk-active", active === i);
        });
    };
    return RadioButtonGroupView;
}(button_group_1.ButtonGroupView));
exports.RadioButtonGroupView = RadioButtonGroupView;
var RadioButtonGroup = /** @class */ (function (_super) {
    tslib_1.__extends(RadioButtonGroup, _super);
    function RadioButtonGroup(attrs) {
        return _super.call(this, attrs) || this;
    }
    RadioButtonGroup.initClass = function () {
        this.prototype.type = "RadioButtonGroup";
        this.prototype.default_view = RadioButtonGroupView;
        this.define({
            active: [p.Any, null],
        });
    };
    return RadioButtonGroup;
}(button_group_1.ButtonGroup));
exports.RadioButtonGroup = RadioButtonGroup;
RadioButtonGroup.initClass();
