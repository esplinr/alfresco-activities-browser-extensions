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
    
 function setContent(content)
{
    var activitiesContainer = document.getElementById('ACTIVITIES_GO_HERE');
    while (activitiesContainer.hasChildNodes()) 
	{
        activitiesContainer.removeChild(activitiesContainer.lastChild);
    }
	activitiesContainer.innerHTML = content;
}

function getActivities() 
{
  setContent("<span>Loading...</span>");
  function onSuccess(html) 
  {
    var replaceString = "\"" + domain + "share/";
	html = html.replace(/"\/share\//g, replaceString);
	setContent(html);
  }
  function onError()
  {
	// Need to show some kind of failed icon
	setContent("<span>Unable to load activities - please ensure that you <a href='" + domain + "share'>signed in</a> to Alfresco Share</span>");
	console.error("An error occurred getting the activities");  
  }
  chrome.extension.getBackgroundPage().makeXhr(domain + "share/service/components/dashlets/activities/list?site=&mode=user&dateFilter=28&userFilter=others&activityFilter=", onSuccess, onError);
}

$('a').live('click', function(e) {
  var href = e.currentTarget.href;
  chrome.tabs.create({"url":href,"selected":true}, function(tab){
        // Callback (not currently required)
  });
  window.close(); // To close the popup.
});

document.addEventListener('DOMContentLoaded', function() {
  chrome.browserAction.setBadgeText({"text": "0"});
  if (chrome.extension.getBackgroundPage().lastNotification) 
  {
    chrome.extension.getBackgroundPage().lastNotification.cancel();
  }
  localStorage.lastAcknowledgedPost = localStorage.latestPost;
  localStorage.lastNotificationSize = -1;
  getActivities();
});