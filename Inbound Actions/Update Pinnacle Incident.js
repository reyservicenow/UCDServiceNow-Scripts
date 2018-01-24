var emailBody = email.body_text.toString().split("\n");
var incID;

parseEmail(); //finds the sys_id for the desired incident

var newGR = new GlideRecord('incident'); //selects the desired incident
newGR.addQuery('sys_id', incID);
newGR.query();

if (newGR.next()) {
    gs.log("Update Pinnacle Incident inbound action is updating: " + newGR.number);

    newGR.work_notes += email.subject + "\n\n" + email.body_text; //adds the email to the incident's work notes
    newGR.update();
}

function parseEmail() {
    for (var i = 0; i < emailBody.length; i++) {
        if (emailBody[i].indexOf("Ref:") >= 0) { //look for "Ref: xxxxxxxxxxxxx"
            incID = emailBody[i].split(":")[1].trim();
        }
    }
}