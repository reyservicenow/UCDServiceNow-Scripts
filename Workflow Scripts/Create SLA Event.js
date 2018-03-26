(function () {
    // return the value to use for Parameter 1
    var userIDs = '';
    userIDs += current.sla.u_user_25;

    var groupIDs = current.sla.u_group_25.split(',');

    for (var i = 0; i < groupIDs.length; i++) {
        var gr = new GlideRecord('sys_user_grmember');
        gr.addQuery('group', groupIDs[i]);
        gr.query();
        while (gr.next()) {
            if (userIDs) {
                userIDs += ',' + gr.user;
            } else {
                userIDs = gr.user;
            }
        }
    }
    return userIDs;
}());