ace.define("ace/mode/ex3_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var Ex3HighlightRules = function() {
    var defIns = "AND|ADD|LDA|STA|BUN|BSA|ISZ|CLA|CLE|CMA|CME|CIR|CIL|INC|SPA|SNA|SZA|SZE|HLT";
    var valIns = "HEX|DEC|CHR|SYM|ORG|END|I"
    var depIns = "INP|OUT|SKI|SKO|ION|IOF|SIO|PIO|IMK";
    var newIns = "SEG|SLX|SLY|WRT|TRX|TRY|ROT|BTN|SLP|RND";

    var keywordMapper = this.createKeywordMapper({
        "support.function": newIns,
        "variable.language" : defIns,
        "invalid": depIns,
        "constant.language": valIns,
    }, "identifier", true);

    this.$rules = {
        "start" : [ {
            token : "comment",
            regex : "/.*$"
        }, {
            token : "constant.language",
            regex : "CHR\\b",
            next : [
                { token : "string", regex : " .", next: "start" },
                { defaultToken : "identifier" }
            ]
        }, {
            token : "constant.language",
            regex : "HEX|ORG\\b",
            next : [
                { token : "constant.numeric", regex : "[+-]?(?:\\d|[A-Fa-f])+(?:(?:\\.(?:\\d|[A-Fa-f])*)?(?:[eE][+-]?\\d+)?)?\\b", next: "start" },
                { defaultToken : "identifier" }
            ]
        },  {
            token : "keyword",
            regex : "ASSERT\\b"
        }, {
            token : "keyword",
            regex : "BREAK\\b"
        }, {
            token : "string",
            regex : "\\$."
        }, {
            token : keywordMapper,
            regex : "(?:I|[A-Z]{3})\\b"
        }, {
            token : "variable.parameter",
            regex : "@[a-zA-Z_][a-zA-Z0-9_]*\\b"
        }, {
            token : "identifier",
            regex : "[a-zA-Z_][a-zA-Z0-9_]*\\b"
        }, {
            token : "constant.numeric",
            regex : "[+-]?(?:\\d|[A-Fa-f])+(?:(?:\\.(?:\\d|[A-Fa-f])*)?(?:[eE][+-]?\\d+)?)?\\b"
        }, {
            token : "text",
            regex : "\\s+"
        } ]
    };
    this.normalizeRules();
};

oop.inherits(Ex3HighlightRules, TextHighlightRules);

exports.Ex3HighlightRules = Ex3HighlightRules;
});

ace.define("ace/mode/ex3",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/ex3_highlight_rules","ace/range"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var Ex3HighlightRules = require("./ex3_highlight_rules").Ex3HighlightRules;
var Range = require("../range").Range;

var Mode = function() {
    this.HighlightRules = Ex3HighlightRules;
    this.$behaviour = this.$defaultBehaviour;
};
oop.inherits(Mode, TextMode);

(function() {

    this.lineCommentStart = "/";

    this.$id = "ace/mode/ex3";
}).call(Mode.prototype);

exports.Mode = Mode;

});
