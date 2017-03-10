// ==UserScript==
// @name         Twitch Filter + Livestreamer Replace
// @namespace    https://github.com/muja/twitch
// @version      0.2.0
// @description  Twitch script that replaces streamer URLs with twitch://<streamer> for custom URL handler
// @author       https://github.com/muja
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @match        https://www.twitch.tv/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var OPEN_OPTIONS = {
        chat: '1',              // open chat in new tab
        quiet: '1',             // run twitch command in quiet mode
        livestreamer_args: '',  // additional livestreamer options
        quality: ''             // preferred quality option
    }

    var editAnchor = (e, streamer) => {
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
        e.href = 'twitch://' + streamer + '?' + $.param(OPEN_OPTIONS);
    };

    waitForKeyElements(".qa-stream-preview", e => {
        // filter unwanted streamers
        var filtered = [];
        for (var i = 0; i < filtered.length; i++) {
            e.filter(':contains(' + filtered[i] + ')').fadeOut();
        }

        // replace links with livestreamer link
        editAnchor(e.find('a.cap')[0]);
    });

    // Hosted channels in following
    waitForKeyElements('.streams > .ember-view:not(.qa-stream-preview)', e => {
        if ( !window.XX ) window.XX = e;
        var match = e.context.innerText.match(/\w+ hosting (\w+)/);
        if ( !match ) return;
        editAnchor(e.find('a.cap')[0], match[1]);
    });

    // replace follower list links as well
    waitForKeyElements(".following-list a:has(img)", e => editAnchor(e.context));

    waitForKeyElements('.js-cn-tab-following', e => {
        // Livestreamer Element
        var lsEle = e.clone().removeClass('js-cn-tab-following').addClass('cn-tab-livestreamer');
        lsEle.find('a').removeUniqueId().find('span').removeAttr('data-ember-action');
        lsEle.find('.cn-tabs__count').remove();
        lsEle.find('.cn-tabs__title').text("Watch with Livestreamer");
        editAnchor(lsEle.find('a')[0]);
        e.addClass('cn-tabs__item--withseparator');
        lsEle.appendTo(e.parent());
    });
})();
