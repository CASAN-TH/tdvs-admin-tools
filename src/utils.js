/**
 * clean \n \r \t \u200b within text
 * @param {string} txt 
 */
exports.cleanText = function(txt) {
    if (typeof(txt) === "string") {
        return txt.replace(/(\n|\r|\t|\u200b)/g, "");
    }
    return txt;
}