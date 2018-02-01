(function runAction(/*GlideRecord*/ current, /*GlideRecord*/ event, /*EmailWrapper*/ email, /*ScopedEmailLogger*/ logger, /*EmailClassifier*/ classifier) {

    //variable declarations
    var emailRaw = email.body_text.replace(/<(?:.|\n)*?>/gm, '\n');
	emailRaw = emailRaw.replace(/&nbsp;/g,'');
	var emailBody = emailRaw.toString().split("\n");
    var incID;
    var finalComment;
    var createdBy;
    var preOrderNumber;
    var workOrderNumber;
    var closeIncident = false;

    parseEmail(); //parses the email to find relevant information
	
	gs.log("Update Pinnacle Incident inbound action is updating:\nRunning Update Pinnacle Incident\n\n" + emailRaw);

    var newGR = new GlideRecord('incident'); //finds the desired incident in ServiceNow
    newGR.addQuery('sys_id', incID);
    newGR.addQuery('state', '!=', '7'); //do nothing to the servicenow ticket if closed
    newGR.query();

	gs.log("Update Pinnacle Incident inbound action is updating:\nRecords found: " + newGR.getRowCount() + "\nRef: " + incID);
	
    if (newGR.next()) {
        constructComment(); //builds the work note or comment

        //if in the email it said Pinnacle Pre-Order Incident then the note goes to work notes, if it says Pinnacle Incident has been Closed: then the note goes to comments (customer facing)
        if (closeIncident == false) {
            newGR.work_notes += finalComment;
        } else if (closeIncident == true) {
            newGR.comments += finalComment;
        }

        //if in the email it said Pinnacle Incident has been Closed: then then update the ServiceNow incident state to resolved and the ServiceNow resolution code to Solved Remotely (Permanently)
        if (closeIncident == true) { 
            newGR.state = 6;
            newGR.close_code = 'Solved Remotely (Permanently)';
        }

        newGR.update();

        //update the serviceNow email table
        sys_email.target_table = 'incident';
        sys_email.instance = newGR.sys_id;

        gs.log("Update Pinnacle Incident inbound action is updating: " + newGR.number);
    }

    function parseEmail() {
        for (var i = 0; i < emailBody.length; i++) {
            if (emailBody[i].indexOf("inc_ref_sys_id:") >= 0) { //look for "inc_ref_sys_id:"
                incID = emailBody[i].split(":")[1].trim().slice(0, 32); //grab sys_id and make clip it to 32 chars
            } else if (emailBody[i].indexOf("Created By:") >= 0) { //look for Created By:
                createdBy = emailBody[i].split(":")[1].trim();
            } else if (emailBody[i].indexOf("Pinnacle Pre-Order NBR:") >= 0) { //look for Pinnacle Pre-Order NBR:
                preOrderNumber = emailBody[i].split(":")[1].trim(); 
            } else if (emailBody[i].indexOf("Pinnacle NBR:") >= 0) { //look for Pinnacle NBR:
                workOrderNumber = emailBody[i].split(":")[1].trim(); 
            } else if (emailBody[i].indexOf("Pinnacle has been Closed:") >= 0) { //look for Pinnacle has been Closed: to see if this is a closure notification
                closeIncident = true;
            }
        }
    }

    function constructComment() {
        var now = new GlideDateTime();
        finalComment = "Message received from Pinnacle on " + now + " from " + createdBy + "\n"; //comment template from Brent
        finalComment += "Incident number " + newGR.number;
        if (preOrderNumber) {
            finalComment += ", pre-order number " + preOrderNumber;
        } else if (workOrderNumber) {
            finalComment += ", work order number " + workOrderNumber;
        }
        finalComment += "\n" + emailRaw; //post the entire email body
    }

})(current, event, email, logger, classifier); 
