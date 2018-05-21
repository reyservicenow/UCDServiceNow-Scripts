(function () {
    var userIDs = '';

    //add specific users to the string
    userIDs += current.sla.u_user_25;

    //add people from specific groups to the string
    var groupIDs = current.sla.u_group_25.split(',');

    for (var i = 0; i < groupIDs.length; i++) {
        var gr = new GlideRecord('sys_user_group');
        gr.get(groupIDs[i]);

        // if sla definition wants the manager of these groups
        if (current.sla.u_group_25_managers) addUser(gr.manager);

        // if sla definition wants the owners of these groups
        if (current.sla.u_group_25_owners) addUser(gr.u_owner);

        // if sla definition wants the members of these groups
        if (current.sla.u_group_25_members) {
            var gr2 = new GlideRecord('sys_user_grmember');
            gr2.addQuery('group', groupIDs[i]);
            gr2.query();
            while (gr2.next()) {
                addUser(gr2.user);
            }
        }
    }

    //add the ticket group's manager
    if (current.task.assignment_group && current.sla.u_user_25_manager) addUser(current.task.assignment_group.manager);

    //add the ticket's group's owner
    if (current.task.assignment_group && current.sla.u_user_25_owner) addUser(current.task.assignment_group.u_owner);

    //and the ticket's group's members
    if (current.task.assignment_group && current.sla.u_user_25_members) {
        var gr3 = new GlideRecord('sys_user_grmember');
        gr3.addQuery('group', current.task.assignment_group);
        gr3.query();
        while (gr3.next()) {
            addUser(gr3.user);
        }
    }

    //remove duplicates from array
    var arrayUtil = new ArrayUtil();
    var userIDsArr = userIDs.split(',');
    var uniqueUserIDs = arrayUtil.unique(userIDsArr);
    var uniqueUserIDsString = uniqueUserIDs + '';

    //return the value to use for Parameter 1
    return uniqueUserIDsString;

    //function to construct the userIDs string
    function addUser(sysID) {
        if (userIDs) {
            userIDs += ',' + sysID;
        } else {
            userIDs = sysID;
        }
    }

}());