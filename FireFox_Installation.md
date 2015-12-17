# Firefox Installation #

Follow these instructions to build and install the Chrome extension.
  1. Checkout the project somewhere on your machine
  1. Modify the "build.properties" file and change the "http.domain" and "https.domain" properties to the appropriate URLs for your Alfresco installation. By default these are set to use the Alfresco Cloud servers (please ensure that the URLs end with a forward-slash)
  1. Build the extension using Ant
  1. Install the "HTML Desktop Notifications" extension (https://addons.mozilla.org/en-US/firefox/addon/html-notifications/)
  1. Open the "Firefox/build/deploy" directory
  1. Drag and drop the "Alfresco-Activities.xpi" file into the main FireFox window
  1. When the "Software Installation" dialog appears click "Install Now"
  1. When prompted, click the "Restart Now" dialog button
  1. When FireFox restarts you will almost certainly be prompted with an "Authentication Required" dialog. Enter your credentials for you specified Alfresco server (i.e. Alfresco Cloud if you haven't changed the build properties) and check the "Use Password Manager to remember this password" checkbox
  1. Login to Share on your specified Alfresco server (i.e. Alfresco Cloud if you haven't changed the build properties)
  1. Right-click somewhere on the toolbar and select "Customize..."
  1. In the "Customize Toolbar" dialog find the "Alfresco Activities" button and drag it onto your toolbar
  1. Click on the new button and you should see a pop-up panel containing the latest activities from the server
  1. When new activities occur you will see a desktop notification appear (this notification will either disappear when you close it or when you click the toolbar button).