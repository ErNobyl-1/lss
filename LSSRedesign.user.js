// ==UserScript==
// @name         LSS Redesign Index
// @namespace    http://tampermonkey.net/
// @version      2024-10-16
// @description  try to take over the world!
// @author       ErNobyl
// @match        https://www.leitstellenspiel.de/
// @grant        none
// @updateURL    https://github.com/ErNobyl-1/lss/raw/main/LSSRedesign.user.js
// ==/UserScript==

/*
TODO

- save last used map tiles and use it when reloading the page

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
        // add Einsätze
        $('body').prepend('<div class="row p-3" id="redesign-missions-outer" style="height: 50vh; margin: 0; padding: 10px 0px;"></div>');
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
        // add map at start
        $('#redesign-missions-outer').before($('#map'));
        $('#map').css('height','50vh');
        map.eachLayer( function(layer) {
            if( layer instanceof L.TileLayer ) {
                map.removeLayer(layer);
            }
        } );
        map.invalidateSize();
        // add changable tile layers
        var BaseMapDE_Color = L.tileLayer('https://sgx.geodatenzentrum.de/wmts_basemapde/tile/1.0.0/de_basemapde_web_raster_farbe/default/GLOBAL_WEBMERCATOR/{z}/{y}/{x}.png', {
            detectRetina: true,
            maxZoom: 19,
            attribution: 'Map data: &copy; <a href="http://www.govdata.de/dl-de/by-2-0">dl-de/by-2-0</a>'
        }).addTo(map);
        var BaseMapDE_Grey = L.tileLayer('https://sgx.geodatenzentrum.de/wmts_basemapde/tile/1.0.0/de_basemapde_web_raster_grau/default/GLOBAL_WEBMERCATOR/{z}/{y}/{x}.png', {
            detectRetina: true,
            maxZoom: 19,
            attribution: 'Map data: &copy; <a href="http://www.govdata.de/dl-de/by-2-0">dl-de/by-2-0</a>'
        });
        var osmhot = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            detectRetina: true,
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>'
        });
        var osmgermany = L.tileLayer('https://tile.openstreetmap.de/{z}/{x}/{y}.png', {
            detectRetina: true,
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        });
        var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            detectRetina: true,
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        });
        var osmtopo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            detectRetina: true,
            maxZoom: 15,
            attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        });
        var googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
            detectRetina: true,
            maxZoom: 19,
            subdomains:['mt0','mt1','mt2','mt3']
        });
        var googleHybrid = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{
            detectRetina: true,
            maxZoom: 19,
            subdomains:['mt0','mt1','mt2','mt3']
        });
        var googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
            detectRetina: true,
            maxZoom: 19,
            subdomains:['mt0','mt1','mt2','mt3']
        });
        var googleTerrain = L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',{
            detectRetina: true,
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
    $( document ).ready(function() {
        bootstraplssredesign();
    });
})();
