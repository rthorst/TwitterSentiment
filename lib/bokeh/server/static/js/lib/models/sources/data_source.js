"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var model_1 = require("../../model");
var selection_1 = require("../selections/selection");
var p = require("../../core/properties");
var DataSource = /** @class */ (function (_super) {
    tslib_1.__extends(DataSource, _super);
    function DataSource(attrs) {
        return _super.call(this, attrs) || this;
    }
    DataSource.initClass = function () {
        this.prototype.type = "DataSource";
        this.define({
            selected: [p.Instance, function () { return new selection_1.Selection(); }],
            callback: [p.Any],
        });
    };
    DataSource.prototype.connect_signals = function () {
        var _this = this;
        _super.prototype.connect_signals.call(this);
        this.connect(this.selected.change, function () {
            if (_this.callback != null)
                _this.callback.execute(_this);
        });
    };
    return DataSource;
}(model_1.Model));
exports.DataSource = DataSource;
DataSource.initClass();
