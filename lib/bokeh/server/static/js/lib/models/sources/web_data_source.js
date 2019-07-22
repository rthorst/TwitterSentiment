"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var column_data_source_1 = require("./column_data_source");
var p = require("../../core/properties");
var WebDataSource = /** @class */ (function (_super) {
    tslib_1.__extends(WebDataSource, _super);
    function WebDataSource(attrs) {
        return _super.call(this, attrs) || this;
    }
    WebDataSource.prototype.get_column = function (colname) {
        var column = this.data[colname];
        return column != null ? column : [];
    };
    WebDataSource.prototype.initialize = function () {
        _super.prototype.initialize.call(this);
        this.setup();
    };
    WebDataSource.prototype.load_data = function (raw_data, mode, max_size) {
        var adapter = this.adapter;
        var data;
        if (adapter != null)
            data = adapter.execute(this, { response: raw_data });
        else
            data = raw_data;
        switch (mode) {
            case "replace": {
                this.data = data;
                break;
            }
            case "append": {
                var original_data = this.data;
                for (var _i = 0, _a = this.columns(); _i < _a.length; _i++) {
                    var column = _a[_i];
                    // XXX: support typed arrays
                    var old_col = Array.from(original_data[column]);
                    var new_col = Array.from(data[column]);
                    data[column] = old_col.concat(new_col).slice(-max_size);
                }
                this.data = data;
                break;
            }
        }
    };
    WebDataSource.initClass = function () {
        this.prototype.type = 'WebDataSource';
        this.define({
            mode: [p.UpdateMode, 'replace'],
            max_size: [p.Number],
            adapter: [p.Any, null],
            data_url: [p.String],
        });
    };
    return WebDataSource;
}(column_data_source_1.ColumnDataSource));
exports.WebDataSource = WebDataSource;
WebDataSource.initClass();
