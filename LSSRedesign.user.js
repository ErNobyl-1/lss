// ==UserScript==
// @name         LSS Redesign Index
// @namespace    http://tampermonkey.net/
// @version      2024-10-16
// @description  try to take over the world!
// @author       ErNobyl
// @match        https://www.leitstellenspiel.de/
// @grant        none
// @updateURL    https://github.com/ErNobyl-1/lss/raw/refs/heads/main/LSSRedesign.user.js
// ==/UserScript==

/*
TODO

- save last used map tiles and use it when reloading the page
- check if chat changed, if yes show color on chat link

*/

(function() {
    'use strict';
    function bootstraplssredesign() {
        // hide normal game
        $('#col_navbar_holder').css('display','none');
        $('#main_container').css('display','none');
        $('.client-id').css('display','none');
        // add css
        $('head').append(`
        <style>
        .mission_progress { margin: 0; padding: 0; margin-bottom: 5px; }
        .patient_progress { margin: 0; padding: 0; margin-bottom: 2.5px; }
        .mission_vehicle_state { display: none; }
        .panel-default { margin-bottom: 5px; }
        </style>
        `);
        // js for style
        var docheight = $(window).height();
        // add navbar at bottom of page
        $('body').prepend(`
        <div class="container-fluid w-100" style="padding: 5px 20px; border-top: 1px solid #bdbdbd; display: flex; flex-direction: row; flex-wrap: nowrap;" id="redesign-navbar">
        </div>
        `);
        $('.glyphicon-menu-up').css('display','none');
        $('#mission_speed_play').css('display','none');
        $('#redesign-navbar')
            .append('<a href="/credits/overview" class="lightbox-open" style="color: black;" id="redesign-credits-outer" title="aktuelle Credits">💸 </a>')
            .append('<a href="/toplist" class="lightbox-open" style="color: black; margin-left: 15px;" id="lsstoplistlivelink" title="aktuelle Platzierung in der Toplist">🏆 <span id="lsstoplistlive">0</span></span>')
            .append('<a href="/verband" class="lightbox-open" style="margin-left: 15px; color: black;">🌐 Verband</a>')
            .append('<div style="position: relative;"><a href="#" style="margin-left: 15px; color: black;" class="chat-toggle-link">💬 Chat</a><div style="display: none; border: 5px solid #89c4ff; position: absolute; height: 700px; width: 500px; left: 0; top: -710px; z-index: 99999; background-color: #fff; border-radius: 15px; padding: 10px;" id="redesign-chat-toggle"><div style="height: 100%; overflow-y: scroll;" id="redesign-chat-outer"></div></div></div>')
            .append('<div id="redesign-sprechwunsch-outer"></div>')
            .append($('.mission-state-filters').css('margin','0 15px 0 auto'))
            .append($('.mission-participation-filters'))
            .append($('#missions-panel-main').css('margin-left','15px').css('display','inline-block'))
        $('#redesign-credits-outer').append($('.credits-value')[0]);
        $('.mission-state-filters > a > .icon').remove();
        $('#mission_select_unattended').prepend('<span style="color: red;">⬤</span>');
        $('#mission_select_attended').prepend('<span style="color: yellow;">⬤</span>');
        $('#mission_select_finishing').prepend('<span style="color: limegreen;">⬤</span>');
        $('#redesign-chat-outer').append($('#chat_panel_body').css('padding','0 5px 0 0')).prepend('<span style="float: right;"><button class="chat-toggle-link btn btn-sm">minimieren</button></span>');
         function toggleChat() {
            var redesigncurrentchatval = $('#redesign-chat-toggle').css('display');
            if(redesigncurrentchatval == 'none') {
                $('#redesign-chat-toggle').css('display','inline-block')
            } else {
                $('#redesign-chat-toggle').css('display','none')
            }
        }
        $('.chat-toggle-link').on('click', function() {
            toggleChat();
        });
        $('#redesign-sprechwunsch-outer').css('height','22.4px').css('overflow','hidden').append($('#radio_messages_important'));
        // add Einsätze
        $('body').prepend('<div class="row p-3" id="redesign-missions-outer" style="height: '+(docheight / 2 - 16)+'px; margin: 0; padding: 10px 0px;"></div>');
        const einsatzlisten = [
            ["mission_list"],
            ["mission_list_krankentransporte", "mission_list_krankentransporte_alliance", "ktw_no_transports"],
            ["mission_list_alliance", "mission_list_alliance_event"],
            ["mission_list_sicherheitswache", "mission_list_sicherheitswache_alliance"],
        ];
        const colint = Math.floor(12 / einsatzlisten.length);
        for(var i = 0; i < einsatzlisten.length; i++) {
            $('#redesign-missions-outer').append('<div class="col-xs-'+colint+'" id="redesign-missions-list-'+i+'" style="height: 100%; overflow-y: scroll; overflow-x: hidden; padding: 0px 2px 0px 5px;"></div>');
            for(var j = 0; j < einsatzlisten[i].length; j++) {
                $('#redesign-missions-list-'+i).append($('#'+einsatzlisten[i][j]));
            }
        }
        // add map
        $('#redesign-missions-outer').before($('#map'));
        $('#map').css('height',(docheight / 2 - 17)+'px');
        map.eachLayer( function(layer) {
            if( layer instanceof L.TileLayer ) {
                map.removeLayer(layer);
            }
        } );
        map.invalidateSize();
        // add changable tile layers
        var BaseMapDE_Color = L.tileLayer('https://sgx.geodatenzentrum.de/wmts_basemapde/tile/1.0.0/de_basemapde_web_raster_farbe/default/GLOBAL_WEBMERCATOR/{z}/{y}/{x}.png', {
            maxZoom: 19,
            attribution: 'Map data: &copy; <a href="http://www.govdata.de/dl-de/by-2-0">dl-de/by-2-0</a>'
        });
        var BaseMapDE_Grey = L.tileLayer('https://sgx.geodatenzentrum.de/wmts_basemapde/tile/1.0.0/de_basemapde_web_raster_grau/default/GLOBAL_WEBMERCATOR/{z}/{y}/{x}.png', {
            maxZoom: 19,
            attribution: 'Map data: &copy; <a href="http://www.govdata.de/dl-de/by-2-0">dl-de/by-2-0</a>'
        });
        var osmhot = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>'
        }).addTo(map);
        var osmgermany = L.tileLayer('https://tile.openstreetmap.de/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        });
        var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        });
        var osmtopo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            maxZoom: 15,
            attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        });
        var googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
            maxZoom: 19,
            subdomains:['mt0','mt1','mt2','mt3']
        });
        var googleHybrid = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{
            maxZoom: 19,
            subdomains:['mt0','mt1','mt2','mt3']
        });
        var googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
            maxZoom: 19,
            subdomains:['mt0','mt1','mt2','mt3']
        });
        var googleTerrain = L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',{
            maxZoom: 19,
            subdomains:['mt0','mt1','mt2','mt3']
        });
        var baseMaps = {
            "BaseMapDE Farbe": BaseMapDE_Color,
            "BaseMapDE Grau": BaseMapDE_Grey,
            "OpenStreetMap HOT": osmhot,
            "OpenStreetMap Deutschland": osmgermany,
            "OpenStreetMap Standard": osm,
            "OpenTopoMap": osmtopo,
            "Google Streets": googleStreets,
            "Google Hybrid": googleHybrid,
            "Google Sat": googleSat,
            "Google Terrain": googleTerrain
        };
        L.control.layers(baseMaps).addTo(map);
        // add chat window
    }
    // live toplist
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
        bootstraplssredesign();
        updatePlace();
        setInterval(updatePlace, 1000);
    });
})();
