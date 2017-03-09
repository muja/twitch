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
    var editAnchor = function(e, streamer) {
        if ( streamer === undefined ) {
            var match = e.href.match(/^https?:\/\/(?:www\.)twitch.tv\/([^\/\?]+)/);
            if ( match === null ) return;
            streamer = match[1];
        }
        var a = e.attributes;
        e.removeAttribute("id");
        for (var i = a.length - 1; i >= 0; i--) {
            if (a[i].name.match(/action/i)) {
                e.removeAttribute(a[i].name);
            }
        }
        e.href = 'twitch://' + streamer;
    };
    
    waitForKeyElements(".qa-stream-preview", function(e) {
        // filter unwanted streamers
        var filtered = [];
        for (var i = 0; i < filtered.length; i++) {
            e.filter(':contains(' + filtered[i] + ')').fadeOut();
        }

        // replace links with livestreamer link
        editAnchor(e.find('a.cap')[0]);
    });

    // Hosted channels in following
    waitForKeyElements('.streams > .ember-view:not(.qa-stream-preview)', function(e) {
        if ( !window.XX ) window.XX = e;
        var match = e.context.innerText.match(/\w+ hosting (\w+)/);
        if ( !match ) return;
        editAnchor(e.find('a.cap')[0], match[1]);
    });

    // replace follower list links as well
    waitForKeyElements(".following-list a:has(img)", (e) => editAnchor(e.context));
})();
