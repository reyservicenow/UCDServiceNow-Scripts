findValue();
function findValue() {
    var newGR = new GlideRecord('incident');
    newGR.addQuery('assignment_group', '939a15336f4f7000091f52a03f3ee441'); //IET IT Express
    newGR.query();
    while (newGR.next()) {
        var assignedTo = newGR.assigned_to;
        newGR.autoSysField(false);
        newGR.setWorkflow(false);
        newGR.setValue('assignment_group', '786178d950368500528ad44054e28fca'); //IET Inbox
        gs.print('Updated ' + newGR.number);
        newGR.update();
        newGR.setValue('assigned_to', assignedTo);
        newGR.update();
    }
}