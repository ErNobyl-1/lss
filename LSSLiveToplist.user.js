// ==UserScript==
// @name         LSS Live Toplist 
// @namespace    http://tampermonkey.net/
// @version      2024-10-15
// @description  shows the current toplist position and updates after credits changed and last update was more than 30 seconds ago
// @author       ErNobyl
// @match        https://www.leitstellenspiel.de/
// @grant        none
// @updateURL    https://github.com/ErNobyl-1/lss/raw/main/LSSLiveToplist.user.js
// ==/UserScript==

(function() {
    'use strict';
    function toplistlivebootstrap() {
        $('#daily-bonus').after(`
        <li title="Platzierung">
          <a href="#" id="lsstoplistlivelink">
            🏆
            <span id="lsstoplistlive">0</span>
          </a>
        </li>
        `);
    }
    var savedcredits = 0;
    var lastupdate = 0;
    async function getApi() {
        return await fetch("/api/credits.json", {
            cache: "reload",
        })
        .then(response => response.json());
    }
    async function updatePlace() {
        var lastcredits = $('.credits-value');
        if(lastcredits.length > 0) {
            lastcredits = $('.credits-value')[0].innerText;
            if(savedcredits != lastcredits && lastupdate < (Date.now() - 1000 * 30)) {
                lastupdate = Date.now();
                var data = await getApi();
                var newplace = data.user_toplist_position;
                $('#lsstoplistlive').text(newplace.toLocaleString());
            }
            savedcredits = lastcredits;
        }
    }
    $( document ).ready(function() {
        toplistlivebootstrap();
        updatePlace();
        setInterval(updatePlace, 1000);
    });
})();
