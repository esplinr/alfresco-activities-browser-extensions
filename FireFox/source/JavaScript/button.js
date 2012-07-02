/*
 * Copyright 2010-2012 Alfresco Software Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * This file is part of an unsupported extension to Alfresco.
 *
 * File Description:
 * This file contains the JavaScript used to obtain the activity stream
 * to display in the pop-up window each time the user clicks the toolbar
 * button.
 */ 
 
// In order to prevent XSS attacks the manifest.json file will have been explicitly set
// with the domain that can be accessed (the domain can be modified in the build.properties
// file). This domain should also be used to set the explit URLs for accessing content.
var domain = "@HTTP_DOMAIN@"; // This should NOT say HTTP_DOMAIN - it should be replaced by the build process

var firstTime = true;
var requestFailureCount = 0;  // used for exponential backoff
var requestTimeout = 1000 * 2;  // 5 seconds
var requestTimerId;

function setContent(content)
{
    var activitiesContainer = document.getElementById("activities");
    while (activitiesContainer.hasChildNodes()) 
	{
        activitiesContainer.removeChild(activitiesContainer.lastChild);
    }

    // This is needed to make sure that we pick up the correct CSS for the XHR response...	
	var prefix = "<div class=\"sticky-wrapper sticky-footer activities alfreso-activities-panel\">";
	var suffix = "</div>";
	
	// Parse the fragment - this guarantees security against malicious HTML and man-in-the-middle
	// attacks... plus, it's really the only way to do this.
	var fragment = Components.classes["@mozilla.org/feed-unescapehtml;1"]  
                             .getService(Components.interfaces.nsIScriptableUnescapeHTML)  
                             .parseFragment(prefix + content + suffix, false, null, activitiesContainer);  
    activitiesContainer.appendChild(fragment);  
	
}

function getActivities() 
{
    // Clear any previously displayed notifications generated by the background thread
	// and reset the previous stored acknowledgement data...
    if (AlfrescoActivities.lastNotification) 
	{
		AlfrescoActivities.lastNotification.cancel();
	}
    window.content.localStorage.lastAcknowledgedPost = window.content.localStorage.latestPost;
    window.content.localStorage.lastNotificationSize = -1;
	if (AlfrescoActivities.badge)
	{
		AlfrescoActivities.badge.setAttribute("value", 0);
	}
	
	// Pop up a loading prompt...
    setContent("<span>Loading...</span>");
	
	function onSuccess(html) 
	{
		//html = html.replace(/"\/share\//g, "\"http://ts.alfresco.com/share/");
        var replaceString = "\"" + domain + "share/";
        html = html.replace(/"\/share\//g, replaceString);
		setContent(html);
	}
	function onError(error)
	{
		// Need to show some kind of failed icon
		setContent("<html:span>Unable to activities - please click icon to try again</html:span>");
		Application.console.log("An error occurred getting the activities");  
	}
	//makeXhr("https://ts.alfresco.com/share/service/components/dashlets/activities/list?site=&mode=user&dateFilter=28&userFilter=others&activityFilter=", onSuccess, onError);
	//makeXhr("http://localhost:8081/share/service/components/dashlets/activities/list?site=&mode=user&dateFilter=28&userFilter=all&activityFilter=", onSuccess, onError);
    makeXhr(domain + "share/service/components/dashlets/activities/list?site=&mode=user&dateFilter=28&userFilter=others&activityFilter=", onSuccess, onError);
	return true;
}
  
function makeXhr(url, onSuccess, onError)
{
    var xhr = new XMLHttpRequest();
    var abortTimerId = window.setTimeout(function() 
    { 
        xhr.abort();  // synchronously calls onreadystatechange
    }, requestTimeout);

    function handleSuccess(count) 
    {
        requestFailureCount = 0;
        window.clearTimeout(abortTimerId);
        if (onSuccess)
        {
            onSuccess(count);
	    }
    }

    var invokedErrorCallback = false;
    function handleError(error) 
    {
        ++requestFailureCount;
        window.clearTimeout(abortTimerId);
        if (onError && !invokedErrorCallback)
	    {
            onError(error);
	    }
        invokedErrorCallback = true;
    }

    try 
	{
	    // Handle changes in the response...
        xhr.onreadystatechange = function()
	    {
		    // Still waiting for the response to complete...
            if (xhr.readyState != 4)
	        { 
                return;
            }

			// If there is response text then call the success function with the 
			// contents of the response.
            if (xhr.responseText) 
	        {
		        handleSuccess(xhr.responseText);
		        return;
            }
			
			// If we're not still waiting for a response and we haven't had a successful
			// outcome then an error must have occurred so we need to call the supplied
			// error handling function...
            handleError();
        }

		// Override the default error handling function to call the one passed as
		// an argument...
        xhr.onerror = function(error) 
	    {
            handleError(error);
        }

		// Make the request...
        xhr.open("GET", url, true);  // TODO: Need to set correct authentication...
        xhr.send(null);
    } 
    catch(e) 
    {
        Application.console.log("Failed to load activities" + e);
        handleError();
    }
}

$('div.alfreso-ts-activities-panel a').live('click', function(e) {
  e.preventDefault();
  var href = e.currentTarget.href;
  var tBrowser = top.document.getElementById("content");
  var tab = tBrowser.addTab(e.currentTarget.href);
  tBrowser.selectedTab = tab;
  document.getElementById("activities").hidePopup();
});
