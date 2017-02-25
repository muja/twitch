// ==UserScript==
// @name         Twitch Filter + Livestreamer Replace
// @namespace    https://github.com/muja/twitch
// @version      0.1
// @description  Twitch script that replaces streamer URLs with twitch://<streamer> for custom URL handler
// @author       You
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @match        https://www.twitch.tv/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    waitForKeyElements(".qa-stream-preview", function() {
        // filter unwanted streamers
        var filtered = [];
        for (var i = 0; i < filtered.length; i++) {
            $('.qa-stream-preview:contains(' + filtered[i] + ')').fadeOut();
        }

        // replace links with livestreamer link
        $('.qa-stream-preview a.cap').each(function(_, e) {
            var a = e.attributes;
            for (var i = 0; i < a.length; ) {
                if (a[i].name.match(/action/i)) {
                    e.removeAttribute(a[i].name);
                } else {
                    ++i;
                }
            }
            e.href = e.href.replace(/.*\//, 'twitch://');

        });

    });
})();
