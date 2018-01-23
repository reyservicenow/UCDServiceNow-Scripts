(function executeRule(current, previous /*null when async*/) {

    /*
    This business rule adds or removes the u_group_manager role which reveals the self-service module

    if !previous && current, check to see if current already has role, if not then add role
    if previous && !current, see if previous has role in another group, if so do nothing, if not then remove role.
    if previous && current, see if previous has role in another group, if so do nothing, if not then remove role.see if current has role in another group, if so do nothing, if not then add role.
    */

    if (!previous.manager && current.manager) {
        if (!hasManagerRole(current.manager, current.sys_id)) {
            addManagerRole(current.manager);
        }
    } else if (previous.manager && !current.manager) {
        if (!hasManagerRole(previous.manager, previous.sys_id)) {
            removeManagerRole(previous.manager);
        }
    } else if (previous.manager && current.manager) {
        if (!hasManagerRole(previous.manager, previous.sys_id)) {
            removeManagerRole(previous.manager);
        }
        if (!hasManagerRole(current.manager, current.sys_id)) {
            addManagerRole(current.manager);
        }
    }

    function hasManagerRole(thisManager, thisGroup) {
        var newGR0 = new GlideRecord('sys_user_group');
        newGR0.addQuery('sys_id', '!=', thisGroup);
        newGR0.addQuery('manager', thisManager);
        newGR0.query();
        if (newGR0.next()) {
            return true;
        } else {
            return false;
        }
    }

    function addManagerRole(thisManager) {
        var newGR1 = new GlideRecord('sys_user_has_role');
        newGR1.initialize();
        newGR1.user = thisManager;
        newGR1.role = '4cb881120ff3c7006717590be1050e7f'; //u_group_manager sys_id
        newGR1.insert();
    }

    function removeManagerRole(thisManager) {
        var newGR = new GlideRecord('sys_user_has_role');
        newGR.addQuery('user', thisManager);
        newGR.query();
        newGR.next(); //should only be one record
        newGR.deleteRecord();

    }

})(current, previous);