// ==UserScript==
// @id             destroyed-links-simulator-bookmarks-integration
// @name           Bookmarks Integration for Destroyed Links Simulator
// @description    Stores Destroyed Links Simulator information into Bookmarks
// @category       Misc
// @version        1.1
// @author         MarcioPG
// @website        https://github.com/manierim/destroyed-links-simulator-bookmarks-integration
// @updateURL      https://github.com/manierim/destroyed-links-simulator-bookmarks-integration/raw/master/dls-bookmarks-integration.meta.js
// @downloadURL    https://github.com/manierim/destroyed-links-simulator-bookmarks-integration/raw/master/dls-bookmarks-integration.user.js
// @namespace      https://github.com/manierim
// @include        *://*.ingress.com/intel*
// @include        *://intel.ingress.com/*
// @match          *://*.ingress.com/intel*
// @match          *://intel.ingress.com/*
// @grant          none
// ==/UserScript==

// MarcioPG WRAPPER v1.0 START /////////////////////////////////////////////

function wrapper() {

    // ensure plugin framework is there, even if iitc is not yet loaded
    if (typeof window.plugin !== 'function') window.plugin = function () { };

    // PLUGIN START ////////////////////////////////////////////////////////

    window.plugin.dlsBkmrkIntegration = function () { };

    $plugin = window.plugin.dlsBkmrkIntegration;

    $plugin.init = function () {

        var exit = false;

        if (window.plugin.destroyedLinks === undefined) {
            console.warn('Bookmarks Integration for Destroyed Links Simulator: destroyedLinks plugin not found');
            exit = true;
        }

        if (
            window.plugin.bookmarks === undefined
            || window.plugin.bookmarks.bkmrksObj === undefined
            || window.plugin.bookmarks.bkmrksObj.portals === undefined
        ) {
            console.warn('Bookmarks Integration for Destroyed Links Simulator: bookmarks plugin not found');
            exit = true;
        }
        if (exit) {
            return;
        }

        $plugin.destroyedLinks.init();
        $plugin.bookmarks.init();

    }

    //-------------------------------------------------------------
    // store the destroy / not destroy status in bookmarks
    //-------------------------------------------------------------

    $plugin.storeDestroyStatusInBookmarks = function (args, toBeDestroyed) {

        var guid = window.selectedPortal;

        if (args !== undefined && args.count === 0) {
            var guid = args[0];
        }

        var bkmData = window.plugin.bookmarks.findByGuid(guid);

        if (bkmData === undefined) {
            if (!toBeDestroyed) {
                return;
            }
            window.plugin.bookmarks.switchStarPortal(guid);
            bkmData = window.plugin.bookmarks.findByGuid(guid);
        }

        var bkmrk = window.plugin.bookmarks.bkmrksObj.portals[bkmData.id_folder].bkmrk[bkmData.id_bookmark];

        var bkmkDestroy = false;
        if (bkmrk.destroy !== undefined) {
            bkmkDestroy = bkmrk.destroy;
        }

        if (bkmkDestroy != toBeDestroyed) {
            bkmrk.destroy = toBeDestroyed;
            window.plugin.bookmarks.saveStorage();
        }
    }

    //-------------------------------------------------------------
    // destroyedLinks integration
    //-------------------------------------------------------------
    $plugin.destroyedLinks = {};

    $plugin.destroyedLinks.overridenFunctions = {};

    $plugin.destroyedLinks.destroyPortal = function (...args) {
        $plugin.destroyedLinks.overridenFunctions.destroyPortal(...args);
        $plugin.storeDestroyStatusInBookmarks(args, true);
    }

    $plugin.destroyedLinks.regeneratePortal = function (...args) {
        $plugin.destroyedLinks.overridenFunctions.regeneratePortal(...args);
        $plugin.storeDestroyStatusInBookmarks(args, false);
    }

    $plugin.destroyedLinks.regenerateAllPortals = function (...args) {
        $plugin.destroyedLinks.overridenFunctions.regenerateAllPortals(...args);

        var portalFolders = window.plugin.bookmarks.bkmrksObj.portals;

        var changes = false;

        for (var folderId in portalFolders) {

            var folder = portalFolders[folderId];

            for (var idBkmrk in folder['bkmrk']) {

                var bkmrk = folder['bkmrk'][idBkmrk];

                if (bkmrk['guid'] !== undefined) {

                    if (bkmrk.destroy !== undefined && bkmrk.destroy) {
                        bkmrk.destroy = false;
                        changes = true;
                    }
                }

            }
        }

        if (changes) {
            window.plugin.bookmarks.saveStorage();
        }
    }

    $plugin.destroyedLinks.init = function () {

        $plugin.destroyedLinks.overridenFunctions.destroyPortal = window.plugin.destroyedLinks.action.destroyPortal;
        window.plugin.destroyedLinks.action.destroyPortal = $plugin.destroyedLinks.destroyPortal;

        $plugin.destroyedLinks.overridenFunctions.regeneratePortal = window.plugin.destroyedLinks.action.regeneratePortal;
        window.plugin.destroyedLinks.action.regeneratePortal = $plugin.destroyedLinks.regeneratePortal;

        $plugin.destroyedLinks.overridenFunctions.regenerateAllPortals = window.plugin.destroyedLinks.action.regenerateAllPortals;
        window.plugin.destroyedLinks.action.regenerateAllPortals = $plugin.destroyedLinks.regenerateAllPortals;

        window.plugin.destroyedLinks.ui.addMarker = function (guid) { };
        window.plugin.destroyedLinks.ui.removeMarker = function (guid) { };
    }


    //-------------------------------------------------------------
    // bookmarks integration
    //-------------------------------------------------------------
    $plugin.bookmarks = {};

    $plugin.bookmarks.syncDestroyedSimulatorPortals = function () {

        var portalFolders = window.plugin.bookmarks.bkmrksObj.portals;

        var checked = [];
        var add = [];
        var remove = [];

        for (var folderId in portalFolders) {

            var folder = portalFolders[folderId];

            for (var idBkmrk in folder['bkmrk']) {

                var bkmrk = folder['bkmrk'][idBkmrk];

                if (bkmrk['guid'] !== undefined) {

                    var guid = bkmrk['guid'];

                    checked.push(guid);

                    if (bkmrk.destroy !== undefined && bkmrk.destroy) {
                        if (window.plugin.destroyedLinks.listDestroyed.indexOf(guid) === -1) {
                            add.push(guid);
                        }
                    }
                    else {
                        if (window.plugin.destroyedLinks.listDestroyed.indexOf(guid) !== -1) {
                            remove.push(guid);
                        }
                    }
                }

            }
        }

        for (var idx in window.plugin.destroyedLinks.listDestroyed) {
            var guid = window.plugin.destroyedLinks.listDestroyed[idx];
            if (checked.indexOf(guid) === -1) {
                remove.push(guid);
            }
        }

        if (remove.length && window.overlayStatus['Destroyed Links Simulator']) {
            window.plugin.destroyedLinks.layer.showAllLayers();
        }
        remove.forEach(function (guid) {
            window.plugin.destroyedLinks.data.removeFromList(guid);
            window.plugin.destroyedLinks.bkmrk.removeFromObj(guid);
            window.plugin.destroyedLinks.ui.toggleButton(guid);
        });

        if (remove.length && window.overlayStatus['Destroyed Links Simulator']) {
            window.plugin.destroyedLinks.layer.hideAllLayers();
        }

        add.forEach(function (guid) {
            window.plugin.destroyedLinks.data.addToList(guid);
            if (window.overlayStatus['Destroyed Links Simulator']) {
                window.plugin.destroyedLinks.layer.hideLayer(guid);
            }
            window.plugin.destroyedLinks.ui.toggleButton(guid);
            window.plugin.destroyedLinks.bkmrk.generateBookmarkedPortal(guid);
        })

        if (remove.length) {
            window.plugin.destroyedLinks.cross.restoreCrossAll();
            window.plugin.destroyedLinks.cross.removeCrossAll();
        }

        if (remove.length || add.length) {
            window.plugin.destroyedLinks.ui.updateDialogMain();
            window.plugin.destroyedLinks.ui.updateDialogBkmrks();
            window.plugin.destroyedLinks.ui.updateCountToDestroy();

        }

    }

    $plugin.bookmarks.onEdit = function (event) {

        if (
            event.target === 'portal'
            && event.guid !== undefined
        ) {

            if (event.action === 'add') { return; }

            if (event.action === 'remove') {
                if (window.plugin.destroyedLinks.listDestroyed.indexOf(event.guid) !== -1) {
                    $plugin.destroyedLinks.regeneratePortal(event.guid);
                    return;
                }
            }

        }

        if (
            (event.target === 'folder' && event.action === 'remove')
            || (event.target === 'all' && event.action === 'reset')
            || (event.target === 'all' && event.action === 'import')
        ) {
            $plugin.bookmarks.syncDestroyedSimulatorPortals();
            return;
        }

    }

    $plugin.bookmarks.init = function () {

        window.addHook('pluginBkmrksEdit', $plugin.bookmarks.onEdit);
        $plugin.bookmarks.syncDestroyedSimulatorPortals();
    }

    var setup = function () {

        if (window.iitcLoaded) {
            $plugin.init();
        }
        else {
            window.addHook('iitcLoaded', $plugin.init);
        }

    }

    // PLUGIN END //////////////////////////////////////////////////////////


    if (!window.bootPlugins) window.bootPlugins = [];
    window.bootPlugins.push(setup);
    // if IITC has already booted, immediately run the 'setup' function
    if (window.iitcLoaded && typeof setup === 'function') setup();
}

// WRAPPER END /////////////////////////////////////////////////////////////

// inject code into site context ///////////////////////////////////////////

var script = document.createElement('script');
script.appendChild(document.createTextNode('(' + wrapper + ')();'));
(document.body || document.head || document.documentElement).appendChild(script);
