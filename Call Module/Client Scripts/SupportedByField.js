// This process takes two callbacks: the first to get the caller's gliderecord, the second to get the group name.

function onChange(control, oldValue, newValue, isLoading, isTemplate) {	
	// If the field isn't blank, get the caller's gliderecord using the asynchronous callback to hasSupportGroupCallback()
	var supportGroup = g_form.getValue('u_supported_by');
		
	if (newValue == '') {return;}
	
	if(newValue) {
        g_form.getReference('caller', hasSupportGroupCallback);
	}
}

// Checks if a user has a primary support group assigned.
function hasSupportGroupCallback(caller) {
	
    // Check for support group on returned gliderecord
    if (caller.u_primary_support_group) {
		// At this point, we only have a sys_id for a sys_user_group
		// So, make a second ajax call to get the group's name, using the
		// callback function getSupportGroupCallback()
		
        var group = new GlideRecord('sys_user_group');
		group.addQuery('sys_id', caller.u_primary_support_group);
		group.query(getSupportGroupCallback);
    }
	return;
}

function getSupportGroupCallback(group) {
	if (group.next()) { 
		// If the query returned a valid gliderecord, show the group's name under the caller_id field
			g_form.setValue('u_supported_by', group.sys_id, [group.name]);
	}
}