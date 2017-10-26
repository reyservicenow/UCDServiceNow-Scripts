var ctype = current.call_type;

if (ctype != 'hang_up' && ctype != 'wrong_number' && ctype != 'status_call' && ctype != 'general_inquiry' && ctype != 'sc_request'){
	var gr = new GlideRecord(ctype);
	gr.short_description = current.short_description;
	gr.description = current.description.getHTMLValue();
	gr.contact_type = current.contact_type;
	gr.company = current.company;
	gr.opened_by = current.opened_by;

	// update task work notes
	var callerName = current.caller.name;
	var taskType = current.call_type.getDisplayValue();
	var currentLink = "[code]<a href='" + current.getLink() + "'>" + current.number + "</a>[/code]";
	var journalEntry = gs.getMessage("This {0} was raised on behalf of {1} from {2}", [taskType, callerName, currentLink]);
	gr.work_notes = journalEntry;

	if (GlidePluginManager.isRegistered('com.glide.domain'))
		gr.sys_domain = getDomain();
	
	if (ctype == 'incident'){
		gr.caller_id = current.caller;
		gr.location = current.caller.location;
		gr.comments = current.description.getHTMLValue();
		//Custom Addition
		gr.assignment_group = current.u_assignment_group;
		gr.assigned_to = current.u_assigned_to;
		gr.work_notes = current.u_work_notes.getJournalEntry(-1);
		gr.u_guest_name = current.u_guest_name;
		gr.u_call_id = current.sys_id;
	}
	
	if(ctype == 'sc_request'){
		gr.u_related_record = current.sys_id;
	}
	
	if (ctype == 'change_request'){
		gr.requested_by = current.caller;
	}
	
	var sysID = gr.insert();
	current.transferred_to = sysID;
	var url = ctype + '.do?sys_id=' + sysID;
	gs.addInfoMessage(current.number + gs.getMessage(" transferred to ") + ":  <a href='" + url + "'>" + current.transferred_to.getDisplayValue() + "</a>");
}

function getDomain(){
	// only set the domain if the caller has a domain that is not global
	if (JSUtil.notNil(current.caller) && JSUtil.notNil(current.caller.sys_domain) && current.caller.sys_domain.getDisplayValue() != 'global') 
		return current.caller.sys_domain;
	else
		return getDefaultDomain();
}