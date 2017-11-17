function onChange(control, oldValue, newValue, isLoading) {
	if (isLoading || newValue == '') {
		return;
	}

	//split up list collector and then display the values in a text field
	var fieldText = '';
	var collectorResults = newValue;
	var array = collectorResults.split(',');
	
	for (var i = 0; i < array.length; i++) {
		var newGR = new GlideRecord('sys_user');
		newGR.addQuery('sys_id', array[i]);
		newGR.query();
		if (newGR.next()) {
			fieldText += newGR.name + ': ';
			if (newGR.department) {
				fieldText += newGR.department + ' ';
			}
			if (newGR.u_affiliation) {
				fieldText += newGR.u_affiliation + ' ';
			}
			if (newGR.cost_center) {
				fieldText += newGR.cost_center;
			}
			fieldText += '\n';
		}
	}
	g_form.setValue('u_nominee_information', fieldText);
}