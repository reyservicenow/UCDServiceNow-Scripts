findValue();
findValue2();

function findValue() {

    var gr = new GlideRecord('sys_user_has_role');
    gr.addQuery('role.name', 'admin');
    gr.query();
    var admins = [];
    while (gr.next()) {
        admins.push(gr.user.name);
    }

    gs.print('Admins: ' + admins.join());
}

function findValue2() {

    var gr2 = new GlideRecord('sys_user_has_role');
    gr2.addQuery('role.name', 'security_admin');
    gr2.query();
    var admins2 = [];
    while (gr2.next()) {
        admins2.push(gr2.user.name);
    }

    gs.print('Security Admins: ' + admins2.join());
} 