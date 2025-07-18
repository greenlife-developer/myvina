"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTSVtoJSON = parseTSVtoJSON;
function parseTSVtoJSON(rawData) {
    var lines = rawData.trim().split("\n");
    if (lines.length < 2)
        return [];
    var headers = lines[0].split("\t").map(function (h) { return h.trim(); });
    var results = lines.slice(1).map(function (line) {
        var cols = line.split("\t");
        var obj = {};
        headers.forEach(function (header, idx) {
            obj[header] = cols[idx] ? cols[idx].trim() : "";
        });
        return obj;
    });
    return results;
}
