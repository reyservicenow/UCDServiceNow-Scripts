(function runAction(/*GlideRecord*/ current, /*GlideRecord*/ event, /*EmailWrapper*/ email, /*ScopedEmailLogger*/ logger, /*EmailClassifier*/ classifier) {

    var emailRaw = email.body_text.replace(/<(?:.|\n)*?>/gm, '\n');
	emailRaw = emailRaw.replace(/&nbsp;/g,'');
	var emailBody = emailRaw.toString().split("\n");
    var incID;
    var finalComment;
    var createdBy;
	var preOrderNumber;

    parseEmail(); //finds the sys_id for the desired incident
	
	gs.log("Update Pinnacle Incident inbound action is updating:\nRunning Update Pinnacle Incident\n\n" + emailRaw);

    var newGR = new GlideRecord('incident'); //selects the desired incident
    newGR.addQuery('sys_id', incID);
    newGR.addQuery('state', '!=', '7'); //do nothing if closed
    newGR.query();

	gs.log("Update Pinnacle Incident inbound action is updating:\nRecords found: " + newGR.getRowCount() + "\nRef: " + incID);
	
    if (newGR.next()) {
        constructComment(); //builds the comment

        newGR.work_notes += finalComment;
        //email.subject + "\n\n" + email.body_text; //adds the email to the incident's work notes
        newGR.update();
        sys_email.target_table = 'incident';
        sys_email.instance = newGR.sys_id;

        gs.log("Update Pinnacle Incident inbound action is updating: " + newGR.number);
    }

    function parseEmail() {
        for (var i = 0; i < emailBody.length; i++) {
            if (emailBody[i].indexOf("inc_ref_sys_id:") >= 0) { //look for "inc_ref_sys_id: xxxxxxxxxxxxx"
                incID = emailBody[i].split("inc_ref_sys_id:")[1].trim().slice(0, 32); //grab sys_id and make clip it to 32 chars
            } else if (emailBody[i].indexOf("Created By:") >= 0) { //look for created by
                createdBy = emailBody[i].split("Created By:")[1].trim();
            } else if (emailBody[i].indexOf("Pinnacle Pre-Order Incident:") >= 0) { //look for pre-order #
                preOrderNumber = emailBody[i].split("Pinnacle Pre-Order Incident:")[1].trim(); 
			}
        }
    }

    function constructComment() {
        var now = new GlideDateTime();
        finalComment = "Message received from Pinnacle on " + now + " from " + createdBy + "\n";
        finalComment += "Incident number " + newGR.number;
        if (preOrderNumber) {
            finalComment += ", pre-order number " + preOrderNumber;
        }
        finalComment += "\nMessage:\n" + emailRaw;
    }

})(current, event, email, logger, classifier); 
