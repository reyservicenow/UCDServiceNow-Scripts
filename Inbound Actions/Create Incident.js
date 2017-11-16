// Find guest user
var guestId = '';
var guest = new GlideRecord('sys_user');
guest.addQuery('user_name', gs.getProperty('edu.ucdavis.email.guest', 'guest'));
guest.setLimit(1);
guest.query();
if (guest.next()) {
    guestId = guest.sys_id;
} else {
    // Log an error - could not find guest user
    gs.logError('Could not find guest user', 'InboundAction');
}

var callerId = '';
var callerSupport = '';
// Search for caller if the sender's email has been provided
if (email.origemail != '') {
    var caller = new GlideRecord('sys_user');
    var primaryQuery = caller.addQuery('email', email.origemail);
    primaryQuery.addOrCondition('u_alt_email', 'CONTAINS', email.origemail);
    caller.setLimit(1);
    caller.query();
    if (caller.next()) {
        callerId = caller.sys_id;
        callerSupport = caller.u_primary_support_group.name;
    }
}

// If we know the caller, set some additional fields
if (callerId != '') {
    current.caller_id = callerId;
    current.opened_by = callerId;
    current.location = caller.location;
    current.u_affiliation = caller.u_affiliation;
    current.u_department_name = caller.department;
} else {
    current.caller_id = guestId;
    current.opened_by = guestId;
}

// Set standard fields
current.short_description = email.subject;
current.state = 1;
current.notify = 2;
current.contact_type = 'email';
current.u_emailed_from = email.origemail;

// Get the maximum number of recipients to process
var recipientMax = gs.getProperty('edu.ucdavis.email.recipientMax', 100);

var recipientArray = email.recipients_array;

// Seed limit with the number of recipients
var limit = recipientArray.length;

// Does the number of recipients exceed the maximum?
if (limit > recipientMax) {
    limit = recipientMax;
    // Log a warning that we will not be processing all recipients
    gs.logWarning('Current number of recipients exceeds edu.ucdavis.email.recipientMax', 'InboundAction');
}

// Get the maximum number of watch list entries to programatically add
var watchListMax = gs.getProperty('edu.ucdavis.email.watchListMax', 10);

// Used to track the number of watch list additions - this should never exceed watchListMax
var watchListCount = 0;

// Used to track the number of watch list queries we skipped
var watchListSkippedCount = 0;

var watchList = [];

for (var i = 0; i < limit; i++) {
    var currentRecipient = recipientArray[i];

    //Add lookup for emails sent to ucdservicedesk@ucdavis.edu
    if (currentRecipient == 'ucdservicedesk@ucdavis.edu' && current.caller_id != guestId && callerSupport != '') {
        var ucdsd = new GlideRecord('sys_user_group');
        var strPSG = callerSupport;
        strPSG += ' Inbox';
        ucdsd.addQuery('name', strPSG);
        ucdsd.setLimit(1);
        ucdsd.query();
        if (ucdsd.next()) {
            if (ucdsd.u_ucdservicedesk)
                current.assignment_group = ucdsd.sys_id;
        }
    }

    // Only look for an assignment group mapping until we have found one
    if (current.assignment_group.nil()) {
        var map = new GlideRecord('u_service_desk_emails');
        map.addQuery('u_active', true);
        map.addQuery('u_email', currentRecipient);
        map.setLimit(1);
        map.query();
        if (map.next()) {
            current.assignment_group = map.u_assignment_group;
            current.u_emailed_to = map.u_email;
            if (map.u_restricted == true) {
                current.u_restricted = map.u_restricted;
                current.u_restricted_group_list = map.u_restricted_group_list;
                current.u_restricted_user_list = map.u_restricted_user_list;
            }
            continue;
        }
    }
    // Only try to search for watchlist entires if we know who sent this
    if (callerId != '') {
        // Only search for watch list entires if we haven't hit the max
        if (watchListCount < watchListMax) {
            //            var recipient = new GlideRecord('sys_user');
            //            recipient.addQuery('email', currentRecipient);
            //            recipient.setLimit(1);
            //            recipient.query();
            //            if (recipient.next()) {
            if (currentRecipient != current.u_emailed_to && !map.next()) {
                watchList.push(currentRecipient);
                watchListCount++;
            }
        } else {
            watchListSkippedCount++;
        }
    }
}

// Add watchlist entires if they exist
current.watch_list = watchList.join();

if (watchListSkippedCount > 0) {
    // We skipped 1 or more watch list queries
    gs.logWarning('Skipped processing ' + watchListSkippedCount + ' possible watch list entires', 'InboundAction');
}

// Use the default map if a group assignment has not been made
if (current.assignment_group.nil()) {
    gs.log('Searching for default assignment group', 'InboundAction');
    var defaultMap = new GlideRecord('u_service_desk_emails');
    defaultMap.addQuery('u_default', true);
    defaultMap.setLimit(1);
    defaultMap.query();
    if (defaultMap.next()) {
        current.assignment_group = defaultMap.u_assignment_group;
    } else {
        gs.logError('Default assignment group could not be found', 'InboundAction');
    }
}

// Process structured email - This bit is temporary until we get clients coverted to the REST API
if (email.body.u_version != undefined) {
    gs.log('Version tag found in body - trying to process structured data', 'InboundAction');
    if (email.body.user_name != undefined) {
        var user = new GlideRecord('sys_user');
        user.addQuery('user_name', email.body.user_name);
        user.setLimit(1);
        user.query();
        if (user.next()) {
            current.caller_id = user.sys_id;
            current.opened_by = user.sys_id;
            current.location = user.location;
            current.u_affiliation = user.u_affiliation;
            current.u_department_name = user.department;
        } else {
            gs.logError('Could not find user ' + email.body.user_name, 'InboundAction');
        }
    }
    // CLM passphrase reset
    if (email.body.u_version == 'clm_passphrase_reset') {
        current.applyTemplate('clm_passphrase_reset');
        gs.log('Processed CLM passphrase reset', 'InboundAction');
    }
    // Account proxy passphrase reset
    if (email.body.u_version == 'proxy_passphrase_reset') {
        current.applyTemplate('proxy_passphrase_reset');
        gs.log('Processed account proxy passphrase reset', 'InboundAction');
    }
}

// Add email body to comments for content that has not been machine generated
if (email.body.u_version != undefined) {
    current.work_notes = "received from: " + email.origemail + "\n\n" + email.body_text;
} else {
    current.comments = "received from: " + email.origemail + "\n\n" + email.body_text;
}

//assignment group in body parser, for dev UAT. eduque 11/15/17
if (email.body.assignment_group != undefined) {
    inboundAG = new GlideRecord('sys_user_group');
    inboundAG.addQuery('name', email.body.assignment_group);
    inboundAG.query();
    if (inboundAG.next()) {
        current.assignment_group = inboundAG.sys_id;
    }
}

// Add headers to the Email Headers Information field.
current.u_header = email.headers;
current.u_has_headers = true;
current.insert();