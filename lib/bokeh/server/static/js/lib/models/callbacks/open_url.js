"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var callback_1 = require("./callback");
var templating_1 = require("../../core/util/templating");
var p = require("../../core/properties");
var OpenURL = /** @class */ (function (_super) {
    tslib_1.__extends(OpenURL, _super);
    function OpenURL(attrs) {
        return _super.call(this, attrs) || this;
    }
    OpenURL.initClass = function () {
        this.prototype.type = 'OpenURL';
        this.define({
            url: [p.String, 'http://'],
            same_tab: [p.Boolean, false],
        });
    };
    OpenURL.prototype.execute = function (_cb_obj, _a) {
        var _this = this;
        var source = _a.source;
        var open_url = function (i) {
            var url = templating_1.replace_placeholders(_this.url, source, i);
            if (_this.same_tab)
                window.location.href = url;
            else
                window.open(url);
        };
        var selected = source.selected;
        for (var _i = 0, _b = selected.indices; _i < _b.length; _i++) {
            var i = _b[_i];
            open_url(i);
        }
        for (var _c = 0, _d = selected.line_indices; _c < _d.length; _c++) {
            var i = _d[_c];
            open_url(i);
        }
        // TODO: multiline_indices: {[key: string]: number[]}
    };
    return OpenURL;
}(callback_1.Callback));
exports.OpenURL = OpenURL;
OpenURL.initClass();
