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
 * This file contains the JavaScript used to process restoring, saving and 
 * processing options from the options page.
 */
 $(document).ready(function() {
    $("#save_button").click(save_options);

    // Restore the persisted options...
    restore_options();
});
        
// Saves options to localStorage.
function save_options() {
    //var repoUrl = $("#repo-url").val();
    var shareUrl = $("#share-url").val();
    
    //localStorage["repo-url"] = repoUrl;
    localStorage["share-url"] = shareUrl;
    
    // TODO: Need some kind of saved success status message...
}
// Restores select box state to saved value from localStorage.
function restore_options() {
    //$("#repo-url").val(localStorage["repo-url"]);
    $("#share-url").val(localStorage["share-url"]);
}
