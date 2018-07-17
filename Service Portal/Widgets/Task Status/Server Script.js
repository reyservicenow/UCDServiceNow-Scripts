(function () {
    //get table from widget options
    var table_namegr = new GlideRecord('sys_db_object');
    table_namegr.get(options.table);
    var table_name = table_namegr.name.toString();

    //retrieve records according to the widget options query
    var gr = new GlideRecord(table_name);
    gr.addEncodedQuery(options.encoded_query);
    gr.orderByDesc('number');
    gr.query();
    data.option1 = gr.getRowCount(); //temp

    //declare objects
    data.records = [];
    data.state_array = [];
    data.state_columns = [];

    //for each record, get its information
    while (gr.next()) {
        var record = {};
        record.number = gr.number + '';
        record.short_description = gr.short_description + '';
        record.state = gr.state + '';
        record.state_value = gr.state.getDisplayValue() + '';

        //if the state is a new state we've seen, add it to the table builder
        if (data.state_array.indexOf(gr.state.toString()) == -1) {
            data.state_array.push(gr.state.toString());
            data.state_array.sort();
        }

        //add the record to the data object for display
        data.records.push(record);
    }

    //figure out the column state names
    for (var i = 0; i < data.state_array.length; i++) {
        var columnsgr = new GlideRecord('sys_choice');
        columnsgr.addQuery('name', table_name);
        columnsgr.addQuery('element', 'state');
        columnsgr.addQuery('value', data.state_array[i]);
        columnsgr.query();
        if (columnsgr.next()) data.state_columns.push(columnsgr.label + '');
    }


})();