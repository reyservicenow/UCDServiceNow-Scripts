//The following was created by admin-eduque on 8/17/2017ish in ucdavisietdev
//Description: Gather Data and plug it into the description

current.short_description = 'Update Location Feature for ' + producer.location.getDisplayValue();

current.description = gs.getUserDisplayName() + ' requested that the features at location ' + producer.location.getDisplayValue() + ' be updated. The data below is from the form they submitted, a task will be assigned to ITSM for review.';

current.state = 10; //Push to WIP

current.assignment_group = 'eecdfd9bff131100a0a5ffffffffffe9'; //Assign to Facilities, this should be happening OOB but it isn't so I'm forcing it.

//Create a comprehensive description to be passed to the tasks
current.description += '\n\nFields to update: ';
if (producer.u_max_occupancy == 'true') current.u_field_update_request += 'Max Occupancy, ';
if (producer.u_sit_stand_station == 'true') current.u_field_update_request += 'Sit/Stand Station, ';
if (producer.u_nams == 'true') current.u_field_update_request += 'NAM information, ';
current.description += current.u_field_update_request + '\n';
if (producer.u_max_occupancy == 'true') current.description += '\nNew Occupancy: ' + producer.u_field_update_integer;
if (producer.u_sit_stand_station == 'true') current.description += '\nNew Sit/Stand option: ' + producer.u_field_update_checkbox;
var namName = new GlideRecord('u_nam'); //grab the name of the nam sys_id
namName.addQuery('sys_id', producer.u_field_update_sys_id);
namName.query();
namName.next();
if (producer.u_nams == 'true' && producer.u_nams_options == 'Add') {
	current.description += '\nAdd NAM, ' + producer.u_field_update_string;
	current.u_field_update_request += 'Add NAM, ';
} else if (producer.u_nams == 'true' && producer.u_nams_options == 'Edit') {
	current.description += '\nEdit NAM, ' + namName.u_name + ' to ' + producer.u_field_update_string;
	current.u_field_update_request += 'Edit NAM, ';
} else if (producer.u_nams == 'true' && producer.u_nams_options == 'Remove') {
	current.description += '\nRemove NAM, ' + namName.u_name;
	current.u_field_update_request += 'Remove NAM, ';
}

current.u_field_update_sys_id = producer.u_field_update_sys_id; //store the sys_id for use later

// hot_mess.update()