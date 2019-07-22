"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var control_1 = require("./control");
var InputGroupView = /** @class */ (function (_super) {
    tslib_1.__extends(InputGroupView, _super);
    function InputGroupView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    InputGroupView.prototype.connect_signals = function () {
        var _this = this;
        _super.prototype.connect_signals.call(this);
        this.connect(this.model.change, function () { return _this.render(); });
    };
    return InputGroupView;
}(control_1.ControlView));
exports.InputGroupView = InputGroupView;
var InputGroup = /** @class */ (function (_super) {
    tslib_1.__extends(InputGroup, _super);
    function InputGroup(attrs) {
        return _super.call(this, attrs) || this;
    }
    InputGroup.initClass = function () {
        this.prototype.type = "InputGroup";
    };
    return InputGroup;
}(control_1.Control));
exports.InputGroup = InputGroup;
InputGroup.initClass();
