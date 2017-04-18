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

    window.Livestreamer = {
      scheme: 'twitch',         // scheme to use for URI, i.e. <scheme>://<streamer>
      openOptions: {
        chat: '1',              // open chat in new tab
        quiet: '1',             // run twitch command in quiet mode
        livestreamer_args: '',  // additional livestreamer options
        quality: ''             // preferred quality option
      },
      replace: {
        directory: true,
        hostedChannels: true,
        followingSidebar: true,
        streamerSite: true
      },
      disableMiniPlayer: false
    };

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
        e.href = Livestreamer.scheme + '://' + streamer + '?' + $.param(Livestreamer.openOptions);
    };

    waitForKeyElements(".qa-stream-preview", e => {
        if ( !Livestreamer.replace.directory )
            return;
        editAnchor(e.find('a.cap')[0]);
    });

    // Hosted channels in following
    waitForKeyElements('.streams > .ember-view:not(.qa-stream-preview)', e => {
        if ( !Livestreamer.replace.hostedChannels )
            return;
        var match = e.context.innerText.match(/\w+ hosting (\w+)/);
        if ( !match )
            return;
        editAnchor(e.find('a.cap')[0], match[1]);
    });

    // replace following list links as well
    waitForKeyElements(".following-list a:has(img)", e => {
        if ( !Livestreamer.replace.followingSidebar )
            return;
        editAnchor(e.context);
    });

    waitForKeyElements('.js-cn-tab-following', e => {
        if ( !Livestreamer.replace.streamerSite )
            return;
        // Livestreamer Element
        var lsEle = e.clone().removeClass('js-cn-tab-following').addClass('cn-tab-livestreamer');
        lsEle.find('a').removeUniqueId().find('span').removeAttr('data-ember-action');
        lsEle.find('.cn-tabs__count').remove();
        lsEle.find('.cn-tabs__title').text("Watch with Livestreamer");
        editAnchor(lsEle.find('a')[0]);
        e.addClass('cn-tabs__item--withseparator');
        lsEle.appendTo(e.parent());
    });

    waitForKeyElements('.js-player-mini', e => {
        if ( !Livestreamer.disableMiniPlayer )
            return;
        e.remove();
    })

    // Set Twitch Chat page title to 'Chat - streamer'
    var chat_url_match = window.location.pathname.match(/^\/([^\/]+)\/chat/);
    if ( chat_url_match ) {
        var streamer = chat_url_match[1];
        var set_title = () => {
            var title = ["Chat", streamer].join(" - ");
            if (document.title !== title)
                document.title = title;
        };
        set_title();
        $.ajax({
            url: 'https://www.twitch.tv/' + streamer,
            success: (response) => {
                var capitalized = response.match(new RegExp("(" + streamer + ") - Twitch", "i"));
                if ( capitalized ) {
                    streamer = capitalized[1];
                    set_title();
                }
            }
        });
        setInterval(set_title, 5000); // Twitch sets title back to 'Twitch' sometimes.
    }
})();
