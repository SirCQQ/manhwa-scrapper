"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var cheerio_1 = require("cheerio");
var fs_1 = require("fs");
var names = [
    //   "the-player-hides-his-past",
    //   "academys-genius-swordmaster",
    //   "revenge-of-the-iron-blooded-sword-hound",
    //   "return-of-the-shattered-constellation",
    "solo-max-level-newbie",
    "omniscient-readers-viewpoint",
];
var getChapters = function (name) { return __awaiter(void 0, void 0, void 0, function () {
    var data, $, chapters, fullChapters, sortedChapters;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, axios_1.default.get("https://asuracomics.com/manga/4102803034-".concat(name, "/"))];
            case 1:
                data = (_a.sent()).data;
                $ = (0, cheerio_1.load)(data);
                chapters = $("div.eph-num>a")
                    .map(function (index, elem) {
                    var url = elem.attribs["href"];
                    var $chapter = $(elem);
                    var chapter = $chapter.find("span.chapternum").text();
                    return { url: url, chapter: chapter };
                })
                    .toArray();
                return [4 /*yield*/, Promise.all(chapters.map(function (elem) { return __awaiter(void 0, void 0, void 0, function () {
                        var imgs;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, getChapterImages(elem.url)];
                                case 1:
                                    imgs = _a.sent();
                                    return [2 /*return*/, {
                                            chapterNumber: parseInt(elem.chapter.replace("Chapter ", "")),
                                            imgs: imgs,
                                        }];
                            }
                        });
                    }); }))];
            case 2:
                fullChapters = _a.sent();
                sortedChapters = __spreadArray([], fullChapters, true).sort(function (a, b) { return a.chapterNumber - b.chapterNumber; });
                return [2 /*return*/, sortedChapters];
        }
    });
}); };
var getChapterImages = function (url) { return __awaiter(void 0, void 0, void 0, function () {
    var result, $, imgs, images;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, axios_1.default.get(url)];
            case 1:
                result = (_a.sent()).data;
                $ = (0, cheerio_1.load)(result)("#readerarea");
                imgs = $.find("img");
                images = imgs
                    .map(function (idx, elem) {
                    return { index: idx, src: elem.attribs["src"] };
                })
                    .toArray();
                return [2 /*return*/, images];
        }
    });
}); };
var combineAll = function (allChapters) {
    var content = [];
    allChapters.forEach(function (chapter) {
        var images = __spreadArray([], chapter.imgs, true).sort(function (a, b) { return a.index - b.index; });
        images.forEach(function (img) {
            content.push("<img src=\"".concat(img.src, "\" alt=\"").concat(chapter.chapterNumber, "-").concat(img.index, "\" style=\"width:100%;\"/>"));
        });
    });
    return content.join("");
};
var createChapter = function (chapter, name) {
    var chapterContent = [];
    chapter.imgs
        .sort(function (a, b) { return a.index - b.index; })
        .forEach(function (img) {
        chapterContent.push("<img src=\"".concat(img.src, "\" alt=\"").concat(chapter.chapterNumber, "-").concat(img.index, "\" style=\"width:100%;\"/>"));
    });
    var document = "<!DOCTYPE html>\n    <html lang=\"en\">\n    <head>\n        <meta charset=\"UTF-8\">\n        <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n        <title>".concat(createName(name), "</title>\n    </head>\n    <body style=\"display: flex; align-items:center; justify-content:center;\">\n    <div style=\"width:50%;min-width:500px;max-width:750px;\" >\n    ").concat(chapterContent.join("\n"), "\n    </div>    \n    </body>\n    </html> ");
    writePage(document, "./".concat(name, "/").concat(chapter.chapterNumber, ".html"));
};
var createChapters = function (chapters, name) {
    chapters.forEach(function (chapter) { return createChapter(chapter, name); });
};
var createFluentStory = function (allChapters, name) { return __awaiter(void 0, void 0, void 0, function () {
    var document;
    return __generator(this, function (_a) {
        document = "<!DOCTYPE html>\n    <html lang=\"en\">\n    <head>\n        <meta charset=\"UTF-8\">\n        <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n        <title>".concat(createName(name), "</title>\n    </head>\n    <body style=\"display: flex; align-items:center; justify-content:center;\">\n    <div style=\"width:50%;min-width:500px;max-width:750px;\" >\n    ").concat(combineAll(allChapters), "\n    </div>    \n    </body>\n    </html> ");
        writePage(document, "./".concat(name, "/fluent.html"));
        return [2 /*return*/];
    });
}); };
var createFolder = function (folderName) {
    if (!(0, fs_1.existsSync)(folderName)) {
        (0, fs_1.mkdir)(folderName, function (err) {
            if (err) {
                console.log(err);
            }
            else {
                console.log("New directory successfully created.");
            }
        });
    }
    else {
        console.log("FOLDER ALRAEDY EXISTS ");
    }
};
var writePage = function (content, name) {
    (0, fs_1.writeFile)(name, content, function (err) {
        if (err) {
            console.error(err);
        }
        console.log("SUCCESSFUL WRITE ".concat(name));
    });
};
var createName = function (title) {
    var arr = title.toLocaleLowerCase().split(" ");
    for (var i = 0; i < arr.length; i++) {
        arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
    }
    return arr.join(" ");
};
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Promise.all(names.map(function (name) { return __awaiter(void 0, void 0, void 0, function () {
                    var chapters;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                createFolder(name);
                                return [4 /*yield*/, getChapters(name)];
                            case 1:
                                chapters = _a.sent();
                                return [4 /*yield*/, createFluentStory(chapters, name)];
                            case 2:
                                _a.sent();
                                createChapters(chapters, name);
                                return [2 /*return*/];
                        }
                    });
                }); }))];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
main();
