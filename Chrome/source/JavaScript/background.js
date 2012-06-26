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
 * This file contains the background JavaScript processses that poll the
 * Alfresco server to check for any new activities. 
 *
 * This file contains code that is based on the BSD licensed samples
 * provided at http://code.google.com/chrome/extensions/samples.html in
 * particular it re-uses scheduled polling techniques from the Google Mail 
 * Checker extension.
 */

// In order to prevent XSS attacks the manifest.json file will have been explicitly set
// with the domain that can be accessed (the domain can be modified in the build.properties
// file). This domain should also be used to set the explit URLs for accessing content.
var domain = "@HTTPS_DOMAIN@"; // This should NOT say HTTP_DOMAIN - it should be replaced by the build process
 
// Development polling time...
//var pollIntervalMin = 1000 * 5;  // 5 seconds
//var pollIntervalMax = 1000 * 30; // 30 seconds

//var pollIntervalMin = 1000 * 60;  // 1 minute
//var pollIntervalMax = 1000 * 60 * 5;  // 5 mins
var requestFailureCount = 0;  // used for exponential backoff
var requestTimeout = 1000 * 2;  // 5 seconds
var requestTimerId;

lastNotification = null;

function init() {
  localStorage.lastNotificationSize = -1; // No notifications so far
  startRequest();
}

function startRequest() {
  checkActivities(
    function(response) 
	{
	
	  var json = JSON.parse(response);
	  var unreadPosts = 0;  
	  if (json.length > 0)
	  {
	    var latestPost = json[0].id;
	    localStorage.latestPost = latestPost;
	    if (!localStorage.lastAcknowledgedPost)
	    {
	       localStorage.lastAcknowledgedPost = latestPost;
	    }
	  
	    if (latestPost != localStorage.lastAcknowledgedPost)
	    {
	      // There are new posts... let's count how many...
		  for (unreadPosts=1; unreadPosts<json.length; unreadPosts++)
	      {
		    if (json[unreadPosts].id == localStorage.lastAcknowledgedPost)
		    {
		      unreadPosts;
		      break;
		    }
		  }

          // Only show a notification if there are more activities since the last notification...		  
		  if (unreadPosts > localStorage.lastNotificationSize)
		  {
		    if (lastNotification) 
			{
              lastNotification.cancel();
            }
			
			// Handle single notification message...
			var msg = "There are " + unreadPosts + " updates that you've not seen.";
			if (unreadPosts == 1)
	        {
			  msg = "There is 1 update that you've not seen";
			}
			
		    // Create a notification...
			var notification = webkitNotifications.createNotification(
								 chrome.extension.getURL("alfresco32.png"),  // icon url - can be relative
								 "New Alfresco Activities",  // notification title
								 msg  // notification body text
							   );
			notification.show();
			lastNotification = notification;
   		    localStorage.lastNotificationSize = unreadPosts;
	      }
		  chrome.browserAction.setBadgeText({"text": "" + unreadPosts});
	    }
	  }
	  scheduleRequest();
    },
    function() {
	  // Need to show some kind of failed icon
      scheduleRequest();
    }
  );
}


// This is stolen straight from the GMail checker...
function scheduleRequest() {
  if (requestTimerId) {
    window.clearTimeout(requestTimerId);
  }
  var randomness = Math.random() * 2;
  var exponent = Math.pow(2, requestFailureCount);
  var multiplier = Math.max(randomness * exponent, 1);
  var delay = Math.min(multiplier * pollIntervalMin, pollIntervalMax);
  delay = Math.round(delay);
  requestTimerId = window.setTimeout(startRequest, delay);
}


function checkActivities(onSuccess, onError) 
{
  //makeXhr(localStorage["share-url"] + "/proxy/alfresco/api/activities/feed/user?format=json&exclUser=true", onSuccess, onError);
  //makeXhr("https://ts.alfresco.com/share/proxy/alfresco/api/activities/feed/user?format=json", onSuccess, onError); // Shows your own notifications.
  var suffix = "share/proxy/alfresco/api/activities/feed/user?format=json&exclUser=true";
  if (domain == "https://my.alfresco.com/")
  {
      // This is a temporary hack for accessing the Cloud offering - we need to set the additional -default- tenant to 
      // ensure that we don't get an error page back...
      suffix = "share/-default-/proxy/alfresco/api/activities/feed/user?format=json&exclUser=true";
  }
  
  makeXhr(domain + suffix, onSuccess, onError);
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
  function handleError() 
  {
    ++requestFailureCount;
    window.clearTimeout(abortTimerId);
    if (onError && !invokedErrorCallback)
	{
      onError();
	}
    invokedErrorCallback = true;
  }

  try {
  
    xhr.onreadystatechange = function()
	{
      if (xhr.readyState != 4)
	  {
        return;
      }

      if (xhr.responseText) 
	  {
		handleSuccess(xhr.responseText);
		return;
      }
      handleError();
    }

    xhr.onerror = function(error) 
	{
      handleError();
    }

    xhr.open("GET", url, true);
    xhr.send(null);
  } 
  catch(e) 
  {
    console.error("Failed to load activities");
    handleError();
  }
}

init();