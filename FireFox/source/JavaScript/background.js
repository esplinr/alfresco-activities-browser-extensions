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
var pollIntervalMin = 1000 * 60 * 3;  // 3 minute
var pollIntervalMax = 1000 * 60 * 10;  // 10 mins
var requestFailureCount = 0;  // used for exponential backoff
var requestTimeout = 1000 * 2;  // 5 seconds
var requestTimerId;

var loggedOut = false;

function scheduleRequest() 
{
    if (requestTimerId) 
	{
        clearTimeout(requestTimerId);
    }
    var randomness = Math.random() * 2;
    var exponent = Math.pow(2, requestFailureCount);
    var multiplier = Math.max(randomness * exponent, 1);
    var delay = Math.min(multiplier * pollIntervalMin, pollIntervalMax);
    delay = Math.round(delay);
    requestTimerId = setTimeout(startRequest, delay);
}

/**
 * Initialises the background activities. Sets the last notificationSize local store
 * to -1 to indicate that no notifications have been shown yet and then puts in a 
 * a request for the latest activity details before scheduling repeated requests.
 */
function init() 
{
    startRequest();
}

function startRequest() 
{
    checkActivities(
        function(response) 
	    {
	        var json = JSON.parse(response);
            postMessage({ type: "ActivityUpdate",
			              json: json});			
	        scheduleRequest();
        },
        function() 
	    {
	        // Need to show some kind of failed icon
			postMessage({ type: "Failure"});			
            scheduleRequest();
        }
    );
}

function checkActivities(onSuccess, onError) 
{
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
    if (!loggedOut)
    {
	    var xhr = new XMLHttpRequest();
		var abortTimerId = setTimeout(function() 
		{ 
			xhr.abort();  // synchronously calls onreadystatechange
		}, requestTimeout);

		function handleSuccess(count) 
		{
			requestFailureCount = 0;
			clearTimeout(abortTimerId);
			if (onSuccess)
			{
				onSuccess(count);
			}
		}

		var invokedErrorCallback = false;
		function handleError() 
		{
			++requestFailureCount;
			clearTimeout(abortTimerId);
			if (onError && !invokedErrorCallback)
			{
				onError();
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
				else if (xhr.status == 401 || xhr.status == 403)
				{
					// The user is not authenticated. Disable polling.
					loggedOut = true;
                    handleError();
				}
				else if (xhr.status == 200)
				{
				    loggedOut = false;
                    if (xhr.responseText) 
                    {
                        handleSuccess(xhr.responseText);
                        return;
                    }       
				}
                else if (xhr.status == 0)
                {
                    setTimeout(function() {
                        makeXhr(url, onSuccess, onError)
                    }, 1000);
                }
                else
                {
                    handleError();
                }
			}

			// Override the default error handling function to call the one passed as
			// an argument...
			xhr.onerror = function(error) 
			{
				postMessage({ type: "Failure",
							  error: error});
				handleError();
			}

			// Make the request...
			xhr.open("GET", url, true);
			xhr.send(null);
		} 
		catch(e) 
		{
			handleError();
		}
	}
    
}

init();