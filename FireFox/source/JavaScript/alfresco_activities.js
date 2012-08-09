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

 var @ID_PREFIX@worker = {

    worker: null,
	lastNotification:  null,
	badge: null,
	button: null,
    
    /**
     *
     */
    startup: function()
    {
		window.content.localStorage.@ID_PREFIX@lastNotificationSize = -1; // No notifications so far
		this.badge = document.getElementById("@ID_PREFIX@button-desc");
        this.button = document.getElementById("@ID_PREFIX@button");
	    this.worker = new Worker("chrome://@PACKAGE_NAME@/content/background.js");
		var self = this;  
		this.worker.onmessage = function(event) {  
		  self.onworkermessage.call(self, event);  
		};  
    },
	
    /**
     *
     */
	shutdown: function()
	{
	    
	},
	
	onworkermessage: function(event)
    {
	    var messageType = event.data.type;
		if (messageType == "ActivityUpdate")
		{
			var unreadPosts = this.countUnreadPosts(event.data.json);  
			Application.console.log("Unread posts: " + unreadPosts);
	        if (unreadPosts > 0)
	        {
                this.showNotifications(unreadPosts);
				if (this.badge)
				{
				    this.badge.setAttribute("value", unreadPosts);
                    this.button.classList.remove("@ID_PREFIX@disabled-button");
                    this.button.classList.add("@ID_PREFIX@button");
				}
	        }
		}
		else if (messageType == "Failure")
		{
		    if (event.data.error)
		    {
			    Application.console.log("Error: " + e);
                if (this.badge)
				{
                    this.badge.setAttribute("value", "X");
                    this.button.classList.remove("@ID_PREFIX@button");
                    this.button.classList.add("@ID_PREFIX@disabled-button");
                }
			}
		}
	},
	
	/**
	 * Counts the number of unread posts by comparing the latest post id in the 
	 * supplied JSON data with the last recorded post id. If they don't match
	 * then the array of activity data is worked through until the last recorded
	 * post is found. The number of iterations indicates the number of unread posts.
	 */
	countUnreadPosts: function(json)
	{
		var unreadPosts = 0;  
		if (json.length > 0)
		{
			var latestPost = json[0].id;
			window.content.localStorage.@ID_PREFIX@latestPost = latestPost;
			if (!window.content.localStorage.@ID_PREFIX@lastAcknowledgedPost)
			{
				window.content.localStorage.@ID_PREFIX@lastAcknowledgedPost = latestPost;
			}
		  
			if (latestPost != window.content.localStorage.@ID_PREFIX@lastAcknowledgedPost)
			{
				for (unreadPosts=1; unreadPosts<json.length; unreadPosts++)
				{
					if (json[unreadPosts].id == window.content.localStorage.@ID_PREFIX@lastAcknowledgedPost)
					{
						unreadPosts;
						break;
					}
				}
			}
		}
		return unreadPosts;
	},
	
	/**
	 * Handles displaying the notifications of unread posts.
	 */
	showNotifications: function(unreadPosts)
	{
		// Only show a notification if there are more activities since the last notification...	
         
		if (unreadPosts > window.content.localStorage.@ID_PREFIX@lastNotificationSize)
		{
			// Hide any previously shown notification pop-up...
			if (this.lastNotification) 
			{ 
				this.lastNotification.cancel();
			}
				
			// Handle single notification message...
			var msg = "There are " + unreadPosts + " updates that you've not seen.";
			if (unreadPosts == 1)
			{
				msg = "There is 1 update that you've not seen";
			}
				
			// Create a notification...
			if (webkitNotifications)
			{
				var notification = webkitNotifications.createNotification(
					"chrome://@PACKAGE_NAME@/content/alfresco32.png",
					"New Alfresco Activities",
					msg
				);
				notification.show();
			    this.lastNotification = notification;
			}
			
			window.content.localStorage.@ID_PREFIX@lastNotificationSize = unreadPosts;
		}
	}	
}

window.addEventListener("load", function(e) { @ID_PREFIX@worker.startup(); }, false);
window.addEventListener("unload", function(e) { @ID_PREFIX@worker.shutdown(); }, false);