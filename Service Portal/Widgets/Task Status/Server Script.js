(function() {

	//get table from widget options
	var table_name;
	if ($sp.getParameter('table')){
		table_name = $sp.getParameter('table');
	} else {
		var table_namegr = new GlideRecord('sys_db_object');
		table_namegr.get(options.table); 
		table_name = table_namegr.name.toString();
	}

	//check to see if an encoded query was provided
	var encoded_query = $sp.getParameter('query') || options.encoded_query;
	data.tooltip = 'Searching ' + table_name + ' with query: ' + encoded_query+'.';//temp

	//retrieve records according to the widget options query
	var gr = new GlideRecord(table_name);
	if ($sp.getParameter('table') && ! $sp.getParameter('query')){
		data.tooltip = 'Searching ' + table_name + '.';//temp
	} else {
		gr.addEncodedQuery(encoded_query);
	}
	gr.orderByDesc('number');
	gr.setLimit(100);
	gr.query();
	data.option1 = gr.getRowCount(); //temp

	//if the limit was reached
	if (gr.getRowCount() == 100) {
		data.limit_reached = 'true';
	} else {
		data.record_count = gr.getRowCount();
	}

	//declare objects
	data.records = [];
	data.state_array = [];
	data.state_columns = [];
	var i;

	//if a manual state order was given. build the state array now
	var states_from_options;
	if ($sp.getParameter('state_order')){
		states_from_options = $sp.getParameter('state_order').split(',');
	} else if (options.state_order){
		states_from_options = options.state_order.split(',');
	}
	if (states_from_options){
		for (i = 0; i < states_from_options.length; i++){
			data.state_array.push(states_from_options[i]);
		}
	}


	//for each record, get its information
	while (gr.next()){
		var record = {};
		record.number = gr.number + '';
		record.short_description = gr.short_description + '';
		record.state = gr.state + '';
		record.state_value = gr.state.getDisplayValue() + '';

		//if the state is a new state we've seen, add it to the table builder
		if (!options.state_order && data.state_array.indexOf(gr.state.toString()) == -1){
			data.state_array.push(gr.state.toString());
		}

		//add the record to the data object for display
		data.records.push(record);
	}

	//figure out the column state names
	if (!states_from_options) data.state_array.sort();
	for (i = 0; i < data.state_array.length; i++){
		var columnsgr = new GlideRecord('sys_choice');
		columnsgr.addQuery('name', table_name);
		columnsgr.addQuery('element', 'state');
		columnsgr.addQuery('value', data.state_array[i]);
		columnsgr.query();
		if(columnsgr.next()) {
			data.state_columns.push(columnsgr.label+'');
		} else {
			var columnstaskgr = new GlideRecord('sys_choice');
			columnstaskgr.addQuery('name', 'task');
			columnstaskgr.addQuery('element', 'state');
			columnstaskgr.addQuery('value', data.state_array[i]);
			columnstaskgr.query();
			if(columnstaskgr.next()) data.state_columns.push(columnstaskgr.label+'');
		}
	}


})();