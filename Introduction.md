# Introduction #

This project provides browser extensions for FireFox and Chrome that make it easier for a user to keep up-to-date with activities relevant to them that are occurring on an Alfresco server.

It does this in three ways:
  1. by providing desktop notifications of "unseen" activities
  1. by providing a numerically "badged" toolbar icon that allows users to see the number of unseen activities at a glance
  1. by displaying a pop-up activity feed when the user clicks on the toolbar button


---


## Current Limitations ##
The following limitations currently exist in the extensions:
  * It is not possible to configure the target Alfresco server via the plugin - this **MUST** be done explicitly via a build property (i.e. you must create a new build for each Alfresco server you want to use the extension against). This has been done to minimize the risk of XSS attacks by limiting the domains that the extension can access.
  * Currently there is no persisted authentication in the extension, you **MUST** be logged into Alfresco Share in order for updates to be received (this is because there is no known "safe" way of persisting user credentials currently - at least not by the original author who will welcome enlightenment!)
  * FireFox user must install the "HTML Desktop Notifications" extension as desktop notifications are not currently natively supported by FireFox - this extension is available [here](https://addons.mozilla.org/en-US/firefox/addon/html-notifications/)