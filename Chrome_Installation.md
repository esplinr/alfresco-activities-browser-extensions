# Chrome Installation #

Follow these instructions to build and install the Chrome extension.
  1. Checkout the project somewhere on your machine
  1. Modify the "build.properties" file and change the "http.domain" and "https.domain" properties to the appropriate URLs for your Alfresco installation. By default these are set to use the Alfresco Cloud servers (please ensure that the URLs end with a forward-slash)
  1. Build the extension using Ant
  1. Open Chrome and click on the spanner icon in top-right corner
  1. Select "Tools" > "Extensions" from the menu
  1. Make sure that the "Developer mode" option is checked
  1. Click the "Load unpacked extension..." button
  1. Select the "Chrome/build/assemble/Alfresco-Activities" directory (from within the location that you checked out the project to)
  1. Click "OK" - you should now see a new button with an Alfresco logo on your toolbar
  1. Login to Share on your specified Alfresco server (i.e. Alfresco Cloud if you haven't changed the build properties)
  1. Click on the new button and you should see a pop-up panel containing the latest activities from the server
  1. When new activities occur you will see a desktop notification appear (this notification will either disappear when you close it or when you click the toolbar button).