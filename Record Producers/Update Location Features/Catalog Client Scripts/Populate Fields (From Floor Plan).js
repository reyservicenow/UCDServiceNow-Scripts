//The following was created by admin-eduque on 08/17/2017 in ucdavisietdev
//Description: Grab the location from the map, put it in the form, and then grab that location's current values, and put them in the description

function onLoad() {
    //Get the location passed in from the map and plug it into the location field
    var location = getParmVal('sysparm_location');
    if (location)
        g_form.setValue('location', location);

    //grab the location record
    var glideToLocation = new GlideRecord('fm_space');
    glideToLocation.addQuery('sys_id', g_form.getValue('location'));
    glideToLocation.query();
    glideToLocation.next();

    //in the description (read-only) field, plug in the location record's current values
    g_form.setValue('description', 'Current Settings:\nSit/Stand Desk: ' + glideToLocation.u_sit_stand_station + '\nMax Occupancy: ' + glideToLocation.max_occupancy + '\nNAMs: ');

    //grab the NAMs for the selected location
    var glideToNAM = new GlideRecord('u_nam');
    glideToNAM.addQuery('u_location', g_form.getValue('location'));
    glideToNAM.query();
    var listNAM = '';
    var choiceNum = 0;
    while (glideToNAM.next()) { //put multiple NAMs into one string
        listNAM += glideToNAM.u_name + ', ';
        g_form.addOption('u_field_update_sys_id', glideToNAM.sys_id, glideToNAM.u_name, choiceNum);
        choiceNum++; //adds options to the "remove NAMs" question
    }
    g_form.setValue('description', g_form.getValue('description') + listNAM); //add the NAMs to the description

}

function getParmVal(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if (results == null)
        return "";
    else
        return unescape(results[1]);
}