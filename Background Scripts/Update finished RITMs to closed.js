updateRITMs();

function updateRITMs() {
	var needsUpdate = 0;
	var allRITMs = "";

	var ritmGR = new GlideRecord('sc_req_item');
	var ritmGRor = ritmGR.addQuery('state', '1'); //RITMs that are open
	ritmGRor.addOrCondition('state', '2'); //or RITMS that are work in progress
	ritmGR.query();

	while (ritmGR.next()) {
		var wfcGR = new GlideRecord('wf_context');
		wfcGR.addQuery('id', ritmGR.sys_id); //workflows for the selected RITM
		wfcGR.addQuery('state', '!=', 'finished'); //that are not finished
		wfcGR.query();
		if (!wfcGR.next()) { //does the RITM not have any active workflows?
			needsUpdate++;
			allRITMs += ritmGR.number + ', ';
			//ritmGR.autoSysField(false); //let sys fields update
			ritmGR.setWorkflow(false); //do not run business rules
			ritmGR.state = 3;
			ritmGR.update();
		}
	}
	gs.log('Amount of RITMs that have been updated to closed complete: ' + needsUpdate);
	gs.log('RITMs updated to closed complete: ' + allRITMs);
}

/* the following can be ran to run pre-flight check
updateRITMs();

function updateRITMs() {
	var needsUpdate = 0;
	var allRITMs = "";

	var ritmGR = new GlideRecord('sc_req_item');
	var ritmGRor = ritmGR.addQuery('state', '1'); //RITMs that are open
	ritmGRor.addOrCondition('state', '2'); //or RITMS that are work in progress
	ritmGR.query();

	while (ritmGR.next()) {
		var wfcGR = new GlideRecord('wf_context');
		wfcGR.addQuery('id', ritmGR.sys_id); //workflows for the selected RITM
		wfcGR.addQuery('state', '!=', 'finished'); //that are not finished
		wfcGR.query();
		if (!wfcGR.next()) { //does the RITM not have any active workflows?
			needsUpdate++;
			allRITMs += ritmGR.number + ', ';
			//ritmGR.autoSysField(false); //let sys fields update
			//ritmGR.setWorkflow(false); //do not run business rules
			//ritmGR.state = 3;
			//ritmGR.update();
		}
	}
	gs.print('Amount of RITMs that have been updated to closed complete: ' + needsUpdate);
	gs.print('RITMs updated to closed complete: ' + allRITMs);
}
*/