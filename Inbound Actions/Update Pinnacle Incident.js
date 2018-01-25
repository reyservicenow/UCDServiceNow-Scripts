(function runAction(/*GlideRecord*/ current, /*GlideRecord*/ event, /*EmailWrapper*/ email, /*ScopedEmailLogger*/ logger, /*EmailClassifier*/ classifier) {

    var emailBody = email.body_text.toString().split("\n");
    var incID;
    var finalComment;
    var pinnacleComment;

    parseEmail(); //finds the sys_id for the desired incident

    var newGR = new GlideRecord('incident'); //selects the desired incident
    newGR.addQuery('sys_id', incID);
    newGR.addQuery('state', '!=', '7'); //do nothing if closed
    newGR.query();

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
            if (emailBody[i].indexOf("Ref:") >= 0) { //look for "Ref: xxxxxxxxxxxxx"
                incID = emailBody[i].split(":")[1].trim().slice(0, 32); //grab sys_id and make clip it to 32 chars
            } else if (emailBody[i].indexOf("Comment(Limited):") >= 0) { //look for comment
                pinnacleComment = emailBody[i].split(":")[1].trim();
            }
        }
    }

    function constructComment() {
        var now = new GlideDateTime();
        finalComment = "Message received from Pinnacle " + now + " from " + email.from + "\n";
        finalComment += "Incident number " + newGR.number;
        if (newGR.u_external_system_number) {
            finalComment += ", pre-order number " + newGR.u_external_system_number;
        }
        finalComment += "\n " + pinnacleComment;
    }

})(current, event, email, logger, classifier); 