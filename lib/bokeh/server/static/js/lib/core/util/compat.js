"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.is_ie = (function () {
    var ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    return ua.indexOf('MSIE') >= 0 || ua.indexOf('Trident') > 0 || ua.indexOf('Edge') > 0;
})();
exports.is_mobile = (function () {
    return typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);
})();
exports.is_little_endian = (function () {
    var buf = new ArrayBuffer(4);
    var buf8 = new Uint8Array(buf);
    var buf32 = new Uint32Array(buf);
    buf32[1] = 0x0a0b0c0d;
    var little_endian = true;
    if (buf8[4] == 0x0a && buf8[5] == 0x0b && buf8[6] == 0x0c && buf8[7] == 0x0d) {
        little_endian = false;
    }
    return little_endian;
})();
