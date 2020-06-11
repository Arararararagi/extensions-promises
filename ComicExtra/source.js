(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Sources = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LanguageCode;
(function (LanguageCode) {
    LanguageCode["UNKNOWN"] = "_unknown";
    LanguageCode["BENGALI"] = "bd";
    LanguageCode["BULGARIAN"] = "bg";
    LanguageCode["BRAZILIAN"] = "br";
    LanguageCode["CHINEESE"] = "cn";
    LanguageCode["CZECH"] = "cz";
    LanguageCode["GERMAN"] = "de";
    LanguageCode["DANISH"] = "dk";
    LanguageCode["ENGLISH"] = "gb";
    LanguageCode["SPANISH"] = "es";
    LanguageCode["FINNISH"] = "fi";
    LanguageCode["FRENCH"] = "fr";
    LanguageCode["WELSH"] = "gb";
    LanguageCode["GREEK"] = "gr";
    LanguageCode["CHINEESE_HONGKONG"] = "hk";
    LanguageCode["HUNGARIAN"] = "hu";
    LanguageCode["INDONESIAN"] = "id";
    LanguageCode["ISRELI"] = "il";
    LanguageCode["INDIAN"] = "in";
    LanguageCode["IRAN"] = "ir";
    LanguageCode["ITALIAN"] = "it";
    LanguageCode["JAPANESE"] = "jp";
    LanguageCode["KOREAN"] = "kr";
    LanguageCode["LITHUANIAN"] = "lt";
    LanguageCode["MONGOLIAN"] = "mn";
    LanguageCode["MEXIAN"] = "mx";
    LanguageCode["MALAY"] = "my";
    LanguageCode["DUTCH"] = "nl";
    LanguageCode["NORWEGIAN"] = "no";
    LanguageCode["PHILIPPINE"] = "ph";
    LanguageCode["POLISH"] = "pl";
    LanguageCode["PORTUGUESE"] = "pt";
    LanguageCode["ROMANIAN"] = "ro";
    LanguageCode["RUSSIAN"] = "ru";
    LanguageCode["SANSKRIT"] = "sa";
    LanguageCode["SAMI"] = "si";
    LanguageCode["THAI"] = "th";
    LanguageCode["TURKISH"] = "tr";
    LanguageCode["UKRAINIAN"] = "ua";
    LanguageCode["VIETNAMESE"] = "vn";
})(LanguageCode = exports.LanguageCode || (exports.LanguageCode = {}));

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MangaStatus;
(function (MangaStatus) {
    MangaStatus[MangaStatus["ONGOING"] = 1] = "ONGOING";
    MangaStatus[MangaStatus["COMPLETED"] = 0] = "COMPLETED";
})(MangaStatus = exports.MangaStatus || (exports.MangaStatus = {}));

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Source_1 = require("../Source");
const Manga_1 = require("../../models/Manga/Manga");
const Languages_1 = require("../../models/Languages/Languages");
const COMICEXTRA_DOMAIN = 'https://www.comicextra.com';
class ComicExtra extends Source_1.Source {
    constructor(cheerio) {
        super(cheerio);
    }
    get version() { return '0.6.0'; }
    get name() { return 'ComicExtra'; }
    get description() { return 'Extension that pulls western comics from ComicExtra'; }
    get author() { return 'Conrad Weiser'; }
    get authorWebsite() { return 'http://github.com/conradweiser'; }
    get icon() { return "logo.png"; } // The website has SVG versions, I had to find one off of a different source
    get hentaiSource() { return false; }
    getMangaShareUrl(mangaId) { return `${COMICEXTRA_DOMAIN}/comic/${mangaId}`; }
    getMangaDetailsRequest(ids) {
        let requests = [];
        for (let id of ids) {
            let metadata = { 'id': id };
            requests.push(createRequestObject({
                url: `${COMICEXTRA_DOMAIN}/comic/${id}`,
                metadata: metadata,
                method: 'GET'
            }));
        }
        return requests;
    }
    getMangaDetails(data, metadata) {
        var _a;
        let manga = [];
        let $ = this.cheerio.load(data);
        let titles = [$('.title-1').text()];
        let image = $('img', $('.movie-l-img')).attr('src');
        let status, author, released;
        let tags = [createTagSection({ id: 'genres', label: 'genres', tags: [] })];
        let i = 0;
        for (let item of $('.movie-dd', $('.movie-dl')).toArray()) {
            switch (i) {
                case 0: {
                    i++;
                    continue;
                }
                case 1: {
                    // Comic Status
                    if ($(item).text().toLowerCase().includes("ongoing")) {
                        status = Manga_1.MangaStatus.ONGOING;
                    }
                    else {
                        status = Manga_1.MangaStatus.COMPLETED;
                    }
                    i++;
                    continue;
                }
                case 2: {
                    // Alt Titles
                    if ($(item).text().toLowerCase().trim() == "-") {
                        i++;
                        continue;
                    }
                    titles.push($(item).text().trim());
                    i++;
                    continue;
                }
                case 3: {
                    // Released Year
                    released = $(item).text().trim();
                    i++;
                    continue;
                }
                case 4: {
                    // Author
                    author = $(item).text().trim();
                    i++;
                    continue;
                }
                case 5: {
                    // Genres
                    let genres = $(item).text().split(",");
                    for (let genre in genres) {
                        tags[0].tags.push(createTag({ id: genre.trim(), label: genre.trim() }));
                    }
                    i++;
                    continue;
                }
            }
            i = 0;
        }
        let summary = $('#film-content', $('#film-content-wrapper')).text().trim();
        let relatedIds = [];
        for (let obj of $('.list-top-item').toArray()) {
            relatedIds.push(((_a = $('a', $(obj)).attr('href')) === null || _a === void 0 ? void 0 : _a.replace(`${COMICEXTRA_DOMAIN}/comic/`, '')).trim());
        }
        return [createManga({
                id: metadata.id,
                rating: 0,
                titles: titles,
                image: image,
                status: Number(status),
                author: author,
                lastUpdate: released,
                tags: tags,
                desc: summary,
                relatedIds: relatedIds
            })];
    }
    getChaptersRequest(mangaId) {
        let metadata = { 'id': mangaId };
        return createRequestObject({
            url: `${COMICEXTRA_DOMAIN}/comic/${mangaId}`,
            method: "GET",
            metadata: metadata
        });
    }
    getChapters(data, metadata) {
        var _a;
        let $ = this.cheerio.load(data);
        let chapters = [];
        let i = $('tr', $('#list')).toArray().length;
        for (let obj of $('tr', $('#list')).toArray()) {
            let chapterId = (_a = $('a', $(obj)).attr('href')) === null || _a === void 0 ? void 0 : _a.replace(`${COMICEXTRA_DOMAIN}/${metadata.id}/`, '');
            let chapNum = i;
            let chapName = $('a', $(obj)).text();
            let time = $($('td', $(obj)).toArray()[1]).text();
            i--;
            chapters.push(createChapter({
                id: chapterId,
                mangaId: metadata.id,
                chapNum: chapNum,
                langCode: Languages_1.LanguageCode.ENGLISH,
                name: chapName,
                time: new Date(time)
            }));
        }
        return chapters;
    }
    getChapterDetailsRequest(mangaId, chapId) {
        let metadata = { 'mangaId': mangaId, 'chapterId': chapId };
        return createRequestObject({
            url: `${COMICEXTRA_DOMAIN}/${mangaId}/${chapId}/full`,
            metadata: metadata,
            method: 'GET',
        });
    }
    getChapterDetails(data, metadata) {
        let $ = this.cheerio.load(data);
        let pages = [];
        // Get all of the pages
        for (let obj of $('.chapter_img').toArray()) {
            pages.push($(obj).attr('src'));
        }
        return createChapterDetails({
            id: metadata.chapterId,
            mangaId: metadata.mangaId,
            pages: pages,
            longStrip: false
        });
    }
    searchRequest(query, page) {
        var _a;
        query.title = (_a = query.title) === null || _a === void 0 ? void 0 : _a.replace(" ", "+");
        return createRequestObject({
            url: `${COMICEXTRA_DOMAIN}/comic-search?key=${query.title}`,
            timeout: 4000,
            method: "GET"
        });
    }
    search(data, metadata) {
        var _a;
        let $ = this.cheerio.load(data);
        let mangaTiles = [];
        for (let obj of $('.cartoon-box').toArray()) {
            let id = (_a = $('a', $(obj)).attr('href')) === null || _a === void 0 ? void 0 : _a.replace(`${COMICEXTRA_DOMAIN}/comic/`, '');
            let titleText = $('h3', $(obj)).text();
            let image = $('img', $(obj)).attr('src');
            mangaTiles.push(createMangaTile({
                id: id,
                title: createIconText({ text: titleText }),
                image: image
            }));
        }
        return mangaTiles;
    }
    getHomePageSectionRequest() {
        let request = createRequestObject({ url: `${COMICEXTRA_DOMAIN}/popular-comic`, method: 'GET', });
        let homeSection = createHomeSection({ id: 'popular_comics', title: 'POPULAR COMICS', view_more: false });
        return [createHomeSectionRequest({ request: request, sections: [homeSection] })];
    }
    getHomePageSections(data, section) {
        var _a;
        let popularComics = [];
        let $ = this.cheerio.load(data);
        for (let obj of $('.cartoon-box').toArray()) {
            let id = (_a = $('a', $(obj)).attr('href')) === null || _a === void 0 ? void 0 : _a.replace(`${COMICEXTRA_DOMAIN}/comic/`, '');
            let title = $('h3', $(obj)).text().trim();
            let image = $('img', $(obj)).attr('src');
            popularComics.push(createMangaTile({
                id: id,
                title: createIconText({ text: title }),
                image: image
            }));
        }
        section[0].items = popularComics;
        return section;
    }
}
exports.ComicExtra = ComicExtra;

},{"../../models/Languages/Languages":1,"../../models/Manga/Manga":2,"../Source":4}],4:[function(require,module,exports){
"use strict";
/**
 * Request objects hold information for a particular source (see sources for example)
 * This allows us to to use a generic api to make the calls against any source
 */
Object.defineProperty(exports, "__esModule", { value: true });
class Source {
    constructor(cheerio) {
        this.cheerio = cheerio;
    }
    /**
     * An optional field where the author may put a link to their website
     */
    get authorWebsite() { return null; }
    /**
     * An optional field that defines the language of the extension's source
     */
    get language() { return 'all'; }
    // <-----------        OPTIONAL METHODS        -----------> //
    getMangaShareUrl(mangaId) { return null; }
    /**
     * (OPTIONAL METHOD) Different sources have different tags available for searching. This method
     * should target a URL which allows you to parse apart all of the available tags which a website has.
     * This will populate tags in the iOS application where the user can use
     * @returns A request object which can provide HTML for determining tags that a source uses
     */
    getTagsRequest() { return null; }
    /**
     * (OPTIONAL METHOD) A function which should handle parsing apart HTML returned from {@link Source.getTags}
     * and generate a list of {@link TagSection} objects, determining what sections of tags an app has, as well as
     * what tags are associated with each section
     * @param data HTML which can be parsed to get tag information
     */
    getTags(data) { return null; }
    /**
     * (OPTIONAL METHOD) A function which should handle generating a request for determining whether or
     * not a manga has been updated since a specific reference time.
     * This method is different depending on the source. A current implementation for a source, as example,
     * is going through multiple pages of the 'latest' section, and determining whether or not there
     * are entries available before your supplied date.
     * @param ids The manga IDs which you are searching for updates on
     * @param time A {@link Date} marking the point in time you'd like to search up from.
     * Eg, A date of November 2020, when it is currently December 2020, should return all instances
     * of the image you are searching for, which has been updated in the last month
     * @param page A page number parameter may be used if your update scanning requires you to
     * traverse multiple pages.
     */
    filterUpdatedMangaRequest(ids, time, page) { return null; }
    /**
     * (OPTIONAL METHOD) A function which should handle parsing apart HTML returned from {@link Source.filterUpdatedMangaRequest}
     * and generate a list manga which has been updated within the timeframe specified in the request.
     * @param data HTML which can be parsed to determine whether or not a Manga has been updated or not
     * @param metadata Anything passed to the {@link Request} object in {@link Source.filterUpdatedMangaRequest}
     * with the key of metadata will be available to this method here in this parameter
     * @returns A list of mangaID which has been updated. Also, a nextPage parameter is required. This is a flag
     * which should be set to true, if you need to traverse to the next page of your search, in order to fully
     * determine whether or not you've gotten all of the updated manga or not. This will increment
     * the page number in the {@link Source.filterUpdatedMangaRequest} method and run it again with the new
     * parameter
     */
    filterUpdatedManga(data, metadata) { return null; }
    /**
     * (OPTIONAL METHOD) A function which should generate a {@link HomeSectionRequest} with the intention
     * of parsing apart a home page of a source, and grouping content into multiple categories.
     * This does not exist for all sources, but sections you would commonly see would be
     * 'Latest Manga', 'Hot Manga', 'Recommended Manga', etc.
     * @returns A list of {@link HomeSectionRequest} objects. A request for search section on the home page.
     * It is likely that your request object will be the same in all of them.
     */
    getHomePageSectionRequest() { return null; }
    /**
     * (OPTIONAL METHOD) A function which should handle parsing apart HTML returned from {@link Source.getHomePageSectionRequest}
     * and finish filling out the {@link HomeSection} objects.
     * Generally this simply should update the parameter obejcts with all of the correct contents, and
     * return the completed array
     * @param data The HTML which should be parsed into the {@link HomeSection} objects. There may only be one element in the array, that is okay
     * if only one section exists
     * @param section The list of HomeSection objects which are unfinished, and need filled out
     */
    getHomePageSections(data, section) { return null; }
    /**
     * (OPTIONAL METHOD) For many of the home page sections, there is an ability to view more of that selection
     * Calling this function should generate a {@link Request} targeting a new page of a given key
     * @param key The current page that is being viewed
     * @param page The page number which you are currently searching
     */
    getViewMoreRequest(key, page) { return null; }
    /**
     * (OPTIONAL METHOD) A function which should handle parsing apart a page
     * and generate different {@link MangaTile} objects which can be found on it
     * @param data HTML which should be parsed into a {@link MangaTile} object
     * @param key
     */
    getViewMoreItems(data, key) { return null; }
    /**
     * Returns the number of calls that can be done per second from the application
     * This is to avoid IP bans from many of the sources
     * Can be adjusted per source since different sites have different limits
     */
    getRateLimit() { return 2; }
    // <-----------        PROTECTED METHODS        -----------> //
    // Many sites use '[x] time ago' - Figured it would be good to handle these cases in general
    convertTime(timeAgo) {
        var _a;
        let time;
        let trimmed = Number(((_a = /\d*/.exec(timeAgo)) !== null && _a !== void 0 ? _a : [])[0]);
        trimmed = (trimmed == 0 && timeAgo.includes('a')) ? 1 : trimmed;
        if (timeAgo.includes('minutes')) {
            time = new Date(Date.now() - trimmed * 60000);
        }
        else if (timeAgo.includes('hours')) {
            time = new Date(Date.now() - trimmed * 3600000);
        }
        else if (timeAgo.includes('days')) {
            time = new Date(Date.now() - trimmed * 86400000);
        }
        else if (timeAgo.includes('year') || timeAgo.includes('years')) {
            time = new Date(Date.now() - trimmed * 31556952000);
        }
        else {
            time = new Date(Date.now());
        }
        return time;
    }
}
exports.Source = Source;

},{}]},{},[3])(3)
});
