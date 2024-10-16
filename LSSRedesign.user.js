// ==UserScript==
// @name         LSS Redesign
// @namespace    http://tampermonkey.net/
// @version      2024-10-15
// @description  try to take over the world!
// @author       ErNobyl
// @match        https://www.leitstellenspiel.de/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    function bootstraplssredesign() {

        $('head').append('<style type="text/css">.progress {margin: 0;}</style>');

        $('#missions_outer').after(`
        <div class="overview_outer bigMapWindow col-sm-2" id="redesign_outer">
		    <div id="redesign-missions" style="overflow-y: scroll; overflow-x: hidden;">
			    <div class="mission-panel-head" id="redesign_panel_heading">
                    <div class="mission-panel-main" id="redesign_header_right">
			        </div>
		        </div>
			    <div class="missions-panel-body" id="redesign_panel_body">
			    </div>
		    </div>
	    </div>`);

        $('#missions_outer').after(`
        <div class="overview_outer bigMapWindow col-sm-3" id="redesign_vb_outer">
		    <div id="redesign-vb-missions" style="overflow-y: scroll; overflow-x: hidden;">
			    <div class="mission-panel-head" id="redesign_vb_panel_heading">
                    <div class="mission-panel-main" id="redesign_vb_header_right">
			        </div>
		        </div>
			    <div class="missions-panel-body" id="redesign_vb_panel_body">
			    </div>
		    </div>
	    </div>`);

        $('#map_outer').removeClass('col-sm-8');
        $('#map_outer').addClass('col-sm-4');
        var mapwidth = $('#map_outer').width()
        $('#map_outer').height(mapwidth);
        $('#map').height('100%');
        map.invalidateSize();

        $('#missions_outer').removeClass('col-sm-4');
        $('#missions_outer').addClass('col-sm-3');
        $('#missions_outer').height(mapwidth);
        $('#missions').height('100%');

        $('#redesign-vb-missions').height(mapwidth);
        $('#redesign_vb_header_right').append($('#mission_select_alliance')).append($('mission_select_sicherheitswache'));
        $('#redesign_vb_panel_body').append($('#mission_list_alliance')).append($('#mission_list_alliance_event'));

        $('#redesign-missions').height(mapwidth);
        $('#redesign_header_right').append($('#mission_select_krankentransport'));
        $('#redesign_panel_body').append($('#radio_messages_important')).append($('#mission_list_krankentransporte_alliance')).append($('#mission_list_krankentransporte')).append($('#ktw_no_transports'));
    }
    bootstraplssredesign();
})();
