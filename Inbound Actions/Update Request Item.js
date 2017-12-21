gs.include('validators');

if (current.getTableName() == "sc_req_item") {
	
	var temp_comment = "reply from: " + email.origemail + "\n\n" + email.body_text;
	current.comments = temp_comment;
	// Check if RITM is in 'Open' or 'Work in Progress' state first
	if (current.state < 3) {
		current.update();
		gs.log("This should fire.");
	}
	else {
		
		if (gs.hasRole("itil")) {
			if (email.body.assign != undefined)
				current.assigned_to = email.body.assign;

			if (email.body.priority != undefined && isNumeric(email.body.priority))
				current.priority = email.body.priority;
		}


		var str ='';
		var incRec = new GlideRecord('incident');
		var caller = new GlideRecord('sys_user');
		caller.get(getCallerFromEmail(email));
		gs.log("Checking outside function: " + caller.name);
		incRec.caller_id = caller.sys_id;
		incRec.short_description = email.subject;
		incRec.description = email.body_text;
		incRec.notify = 2;
		incRec.contact_type = 'email';
		incRec.u_emailed_from = email.origemail;
		incRec.u_requested_for = current.request.requested_for;
		incRec.department = caller.department;
		incRec.assignment_group = current.assignment_group;
		incRec.state = 1;
		incRec.opened_by = caller.sys_id;
		gs.log("Incident's caller: "+incRec.caller_id);
		gs.log("Incident's opened by: "+incRec.opened_by);

		//incRec.comments = "reply from: " + email.origemail + "\n\n" + email.body_text;
		str = 'Item: '+current.cat_item.name+'\n Number: '+current.number+'\n Requested For: '+current.request.requested_for.name +'\n Department: '+current.request.requested_for.department.getDisplayValue()+'\n Request: '+current.request.number+'\n Assignment Group: '+current.assignment_group.getDisplayValue()+'\n State: '+current.state+'\n Stage: '+current.stage+'\n Quantity: '+current.quantity+'\n Opened By: '+current.opened_by.name + '\n\n ***RITM Work Notes*** \n\n' + current.work_notes.getJournalEntry(-1) + "\n ***RITM Additional Comments*** \n\n" + current.comments.getJournalEntry(-1);
		incRec.work_notes = str;
		incRec.insert();
		//gs.log("New Incident request parsing has been completed.");
		//var activities = getActivity(current.sys_id);
		//incRec.work_notes = current.work_notes.getJournalEntry(-1);
		

	}
}

function getActivity(incidentSysId)   
{   
    var journalString = "";   
    var actObject = new GlideRecord('sys_journal_field');   
    actObject.addQuery('element_id', incidentSysId);   
    //gs.info("incidentSysId: " + incidentSysId);   
     
    actObject.query();   
    journalString = '';  
     
    while( actObject.next() ) {  
         
        journalString += actObject.sys_created_on + ' - ' +  
            actObject.sys_created_by + ' (' + actObject.element + ')\n' +  
            actObject.value + '\n\n';  
         
    }  
     
    return journalString;   
}  

/**
 * Determines the 'Caller' and 'Opened by' fields based on the originating email.
 */
function getCallerFromEmail(email){
	// Find guest user
	var guestId = '';
	var guest = new GlideRecord('sys_user');
	guest.addQuery('user_name', gs.getProperty('edu.ucdavis.email.guest', 'guest'));
	guest.setLimit(1);
	guest.query();
	if (guest.next()) {
		guestId = guest.sys_id;
	}

	var callerId = '';
	var caller = new GlideRecord('sys_user');
	// Search for caller if the sender's email has been provided
	if (email.origemail != '') {
		var primaryQuery = caller.addQuery('email', email.origemail);
		primaryQuery.addOrCondition('u_alt_email', 'CONTAINS', email.origemail);
		caller.setLimit(1);
		caller.query();
		if (caller.next()) {
			callerId = caller.sys_id;
		}
	}
	
	// Return callerID if it isn't empty, otherwise return the guest ID
	gs.log("Checking inside function: " + callerId);
	gs.log("checking again inside: " + caller.name);
	return(callerId == '' ? guest.sys_id : caller.sys_id);
}



