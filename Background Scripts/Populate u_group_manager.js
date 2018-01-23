initialPopulate();
function initialPopulate() {
    var newGR = new GlideRecord('sys_user_group');
    newGR.addNotNullQuery('manager');
    newGR.query();
    gs.print('Message: ' + newGR.getRowCount());
    while (newGR.next()) {
        var newGR1 = new GlideRecord('sys_user_has_role');
        newGR1.addQuery('user', newGR.manager);
        newGR1.addQuery('role', '4cb881120ff3c7006717590be1050e7f');
        newGR1.query();
        if (!newGR1.next()) {
            var newGR2 = new GlideRecord('sys_user_has_role');
            newGR2.initialize();
            newGR2.user = newGR.manager;
            newGR2.role = '4cb881120ff3c7006717590be1050e7f'; //u_group_manager sys_id
            newGR2.insert();
        }

    }
}