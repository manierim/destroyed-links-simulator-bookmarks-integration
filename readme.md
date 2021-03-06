# Bookmarks Integration for Destroyed Links Simulator

Stores Destroyed Links Simulator information into Bookmarks

This is a plugin for [Ingress Intel Total Conversion (IITC)](https://github.com/iitc-project/ingress-intel-total-conversion/).

## Overview

At the time this integration was created, "Destroyed Links Simulator" does not support storing its data into the browser local storage, therefore starting with no memory each time IITC is loaded/reloaded.

It support export for bookmarks, but then it's not possible to get back the bookmarked portals into "Destroyed Links Simulator".

"Bookmarks for maps and portals" does instead fully support local storage so its data are persisted through IITC sessions/reloads.

This integration seamlessly stores and retrieves the Destroyed Links Simulator "destroy" portals status to/from the Bookmarks data object.

When the integration is active, Destroyed Links Simulator markers are not shown at all, Portal Bookmarks markers visibility can be managed with more flexibility.

## Installation
[Click here](https://github.com/manierim/destroyed-links-simulator-bookmarks-integration/raw/master/dls-bookmarks-integration.user.js) and your userscript manager should do it.

## Requirements

This plugin integrates and therefore requires:
- [Destroyed Links Simulator](https://www.giacintogarcea.com/ingress/items/) by Zaso
Simulates portal destruction by hiding its links and fields (cross links if you use [Cross Links](https://iitc.me/desktop/) plugin) from the map.
- [Bookmarks for maps and portals](https://iitc.me/desktop/)
Save your favorite Maps and Portals and move the intel map with a click.

## Usage

When the "Destroy" button is pressed the integration looks into the bookmarks for the portal.
If the portal has not yet been bookmarked, it will be automatically added to the root portal bookmarks folder.

The Destroy status is then stored in the portal bookmark data.
When reversing through the "Regenerate" button, the destroy status is updated.

If a "Destroy" flagged portal is removed from the bookmarks (or its containing folder is deleted), the portal is also regenerated in Destroyed Links Simulator.

Destroyed Links Simulator is synced when Bookmarks are loaded at startup, when resetted and when imported.

## Compatibility

The integration has been tested with the following versions (current at the time of writing):
- Bookmarks version 0.2.12.20170108.21732
- Destroyed Links Simulator version 0.0.7.20180217.123738

Modifications of both plugins might work as long as they do not change the original plugin behavior too much.

Bookmarks modifications implementing Bookmarks sharing will work as long as they will correctly run the `pluginBkmrksEdit` hook for `all.import` event after having correctly updated the `window.plugin.bookmarks.bkmrksObj` object.

## Changelog

- 2019-06-13 (version 1.4)
  + Major bugfix in setup logic!
- 2019-06-11 (version 1.3)
  + bugfix
- 2019-06-11 (version 1.2)
  + init will not run twice
- 2019-06-10 (version 1.1)
  + regenerateAllPortals managed
  + window.plugin.bookmarks.saveStorage not called when not needed
- 2019-06-10 (version 1.0)
  + Initial Release
