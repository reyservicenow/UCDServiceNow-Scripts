function onChange(control, oldValue, newValue, isLoading) {
   if (isLoading || newValue == '') {
      return;
   }
	
	//grab the location record
	var glideToLocation = new GlideRecord('fm_space');
	glideToLocation.addQuery('sys_id', g_form.getValue('location'));
	glideToLocation.query();
	glideToLocation.next();
	
	//in the description (read-only) field, plug in the location record's current values
	g_form.setValue('description', 'Current Settings:\nSit/Stand Desk: ' + glideToLocation.u_sit_stand_station + '\nMax Occupancy: ' + glideToLocation.max_occupancy + '\nNAMs: ');
	
	//grab the NAMs for the selected location
	var glideToNAM = new GlideRecord ('u_nam');
	glideToNAM.addQuery('u_location', g_form.getValue('location'));
	glideToNAM.query();
	var listNAM = '';
	var choiceNum = 0;
	g_form.clearOptions('u_nams_remove');
	while (glideToNAM.next()){ //put multiple NAMs into one string
		listNAM += glideToNAM.u_name + ', ';
		g_form.addOption('u_field_update_sys_id', glideToNAM.sys_id, glideToNAM.u_name, choiceNum);
		choiceNum++; //adds options to the "remove NAMs" question
	}
	g_form.setValue('description', g_form.getValue('description') + listNAM); //add the NAMs to the description
}