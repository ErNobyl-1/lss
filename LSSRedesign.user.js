// ==UserScript==
// @name         LSS Redesign
// @namespace    http://tampermonkey.net/
// @version      2024-10-17
// @description  try to take over the world!
// @author       ErNobyl
// @match        https://www.leitstellenspiel.de/*
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

    // redesign the map
    function redesignMap() {
        map.options.zoomSnap = 0.1;
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
    }

    // show all onmap buildings
    function showBuildings() {
        var usermarkers = new L.FeatureGroup();
        map.eachLayer( function(layer) {
            if(layer instanceof L.Marker) {
                if(layer.building_id) {
                    usermarkers.addLayer(layer);
                }
            }
        });
        map.fitBounds(usermarkers.getBounds(), {paddingTopLeft: [0, 50], paddingBottomRight: [0, 25]});
    }

    // redesign pages
    function bootstraplssredesign(site) {

        // index page
        if(site == 'index') {
            // hide normal game
            $('#col_navbar_holder').css('display','none');
            $('#main_container').css('display','none');
            $('.client-id').css('display','none');
            // add css
            $('head').append(`
        <style>
        .halfscreen { height: calc(50vh - 16.5px) !important; }
        .mission_progress { margin: 0; padding: 0; margin-bottom: 5px; }
        .patient_progress { margin: 0; padding: 0; margin-bottom: 2.5px; }
        .mission_vehicle_state { display: none; }
        .panel-default { margin-bottom: 5px; }
        </style>
        `);
            // add navbar at bottom of page
            $('body').prepend(`
        <div class="container-fluid w-100" style="padding: 5px 20px; border-top: 1px solid #bdbdbd; display: flex; flex-direction: row; flex-wrap: nowrap;" id="redesign-navbar">
        </div>
        `);
            $('.glyphicon-menu-up').css('display','none');
            $('#mission_speed_play').css('display','none');
            $('#redesign-navbar')
                .append('<a href="#" class="lightbox-open" id="redesign-user-link" style="color: black;">🧑‍🚒 </a>')
                .append('<a href="/credits/overview" class="lightbox-open" style="margin-left: 15px; color: black;" id="redesign-credits-outer" title="aktuelle Credits">💸 </a>')
                .append('<a href="/toplist" class="lightbox-open" style="color: black; margin-left: 15px;" id="lsstoplistlivelink" title="aktuelle Platzierung in der Toplist">🏆 <span id="lsstoplistlive">0</span></span>')
                .append('<a href="/verband" class="lightbox-open" style="margin-left: 15px; color: black;">🌐 Verband</a>')
                .append('<div style="position: relative;"><a href="#" style="margin-left: 15px; color: black;" id="redesign-chat-link" class="chat-toggle-link">💬 Chat</a><div style="display: none; border: 5px solid #89c4ff; position: absolute; height: 700px; width: 500px; left: 0; top: -710px; z-index: 99999; background-color: #fff; border-radius: 15px; padding: 10px;" id="redesign-chat-toggle"><div style="height: 100%; overflow-y: scroll;" id="redesign-chat-outer"></div></div></div>')
                .append('<a href="/tasks/index" class="lightbox-open" id="redesign-task" style="color: black; margin-left: 15px;">✅ Aufgaben </a>')
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
            $('#redesign-task').append($('#completed_tasks_counter'));
            $('#redesign-user-link').attr('href', '/profile/'+user_id).append(username);
            // add Einsätze
            $('body').prepend('<div class="row" id="redesign-missions-outer" style="margin: 0; padding: 10px 5px 7px 10px;"></div>');
            $('#redesign-missions-outer').addClass('halfscreen');
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
            $('#map').addClass('halfscreen');
            redesignMap();
            // chat
            var savedmessage = "";
            function redesignupdateChat() {
                if($('#redesign-chat-toggle').css('display') == 'none') {
                    if(savedmessage != "" && savedmessage != $('#mission_chat_messages > li')[0]) {
                        if($('#redesign-new-message-hint').lengt > 0) {
                            // do nothing, hint already exists
                        } else {
                            $('#redesign-chat-link').append('<span id="redesign-new-message-hint" class="badge message_new" style="margin-left: 5px;">neu</span>')
                        }
                    }
                }
                savedmessage = $('#mission_chat_messages > li')[0]
            }
            setInterval(redesignupdateChat, 1000);
            $('#redesign-chat-link').on('click', function() {
                $('#redesign-new-message-hint').remove();
            });
        }

    }

    // live toplist
    var savedcredits = 0;
    var lastupdate = 0;
    async function redesigngetApi() {
        return await fetch("/api/credits.json", {
            cache: "reload",
        })
        .then(response => response.json());
    }
    async function redesignupdatePlace() {
        var lastcredits = $('.credits-value');
        if(lastcredits.length > 0) {
            lastcredits = $('.credits-value')[0].innerText;
            if(savedcredits != lastcredits && lastupdate < (Date.now() - 1000 * 30)) {
                lastupdate = Date.now();
                var data = await redesigngetApi();
                var newplace = data.user_toplist_position;
                $('#lsstoplistlive').text(newplace.toLocaleString());
            }
            savedcredits = lastcredits;
        }
    }

    // bootstrap
    $( document ).ready(function() {
        var site = window.location.pathname;
        if(site == '/') {
            bootstraplssredesign('index');
            redesignupdatePlace();
            setInterval(redesignupdatePlace, 1000);
            map.zoomOut(15);
            showBuildings();
        }
        if(site.includes('/profile/')) {
            bootstraplssredesign('profile');
        }
    });
})();
