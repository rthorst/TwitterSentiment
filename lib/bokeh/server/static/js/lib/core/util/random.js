"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MAX_INT32 = 2147483647;
// Park-Miller LCG
var Random = /** @class */ (function () {
    function Random(seed) {
        this.seed = seed % MAX_INT32;
        if (this.seed <= 0)
            this.seed += MAX_INT32 - 1;
    }
    Random.prototype.integer = function () {
        this.seed = (48271 * this.seed) % MAX_INT32;
        return this.seed;
    };
    Random.prototype.float = function () {
        return (this.integer() - 1) / (MAX_INT32 - 1);
    };
    return Random;
}());
exports.Random = Random;
exports.random = new Random(Date.now());
