"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var web_data_source_1 = require("./web_data_source");
var ServerSentDataSource = /** @class */ (function (_super) {
    tslib_1.__extends(ServerSentDataSource, _super);
    function ServerSentDataSource(attrs) {
        var _this = _super.call(this, attrs) || this;
        _this.initialized = false;
        return _this;
    }
    ServerSentDataSource.initClass = function () {
        this.prototype.type = 'ServerSentDataSource';
    };
    ServerSentDataSource.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
    };
    ServerSentDataSource.prototype.setup = function () {
        var _this = this;
        if (!this.initialized) {
            this.initialized = true;
            var source = new EventSource(this.data_url);
            source.onmessage = function (event) {
                _this.load_data(JSON.parse(event.data), _this.mode, _this.max_size);
            };
        }
    };
    return ServerSentDataSource;
}(web_data_source_1.WebDataSource));
exports.ServerSentDataSource = ServerSentDataSource;
ServerSentDataSource.initClass();
