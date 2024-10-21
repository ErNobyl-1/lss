// ==UserScript==
// @name         LSS Live Toplist 
// @namespace    http://tampermonkey.net/
// @version      2024-10-15
// @description  shows the current toplist position and updates after credits changed and last update was more than 30 seconds ago
// @author       ErNobyl
// @match        https://www.leitstellenspiel.de/
// @grant        none
// @updateURL    https://github.com/ErNobyl-1/lss/raw/refs/heads/main/LSSLiveToplist.user.js
// ==/UserScript==

(function() {
    'use strict';
    function toplistlivebootstrap() {
        $('#news_li').before(`
        <li title="Platzierung">
          <a href="#" id="lsstoplistlivelink">
            🏆
            <span id="lsstoplistlive">0</span>
            <span id="lsstoplistlivechange" style="padding-left: 15px;"></span>
          </a>
        </li>
        `);
    }
    var savedcredits = 0;
    var firstplace = 0;
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
                if(firstplace == 0) {
                    firstplace = newplace;
                }
                var difference = firstplace - newplace;
                var emoji = "";
                if(difference == 0) {
                    emoji = "= ";
                } else if(difference < 0) {
                    emoji = "-";
                } else if(difference > 0) {
                    emoji = "+";
                }
                $('#lsstoplistlivechange').text(emoji + difference.toLocaleString());
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
