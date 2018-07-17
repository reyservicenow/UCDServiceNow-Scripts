(function () {
    /* populate the 'data' object */
    /* e.g., data.table = $sp.getValue('table'); */
    var table_namegr = new GlideRecord('sys_db_object');
    table_namegr.get(options.table);
    var table_name = table_namegr.name.toString();


    var gr = new GlideRecord(table_name);
    gr.addEncodedQuery(options.encoded_query);
    gr.orderByDesc('number');
    gr.query();
    data.option1 = gr.getRowCount(); //temp

    data.records = [];
    data.state_array = [];
    data.state_columns = [];

    while (gr.next()) {
        var record = {};
        record.number = gr.number + '';
        record.short_description = gr.short_description + '';
        record.state = gr.state + '';
        record.state_value = gr.state.getDisplayValue() + '';

        if (data.state_array.indexOf(gr.state.toString()) == -1) {
            data.state_array.push(gr.state.toString());
            data.state_array.sort();
        }

        data.records.push(record);
    }

    for (var i = 0; i < data.state_array.length; i++) {
        var columnsgr = new GlideRecord('sys_choice');
        columnsgr.addQuery('name', table_name);
        columnsgr.addQuery('element', 'state');
        columnsgr.addQuery('value', data.state_array[i]);
        columnsgr.query();
        if (columnsgr.next()) data.state_columns.push(columnsgr.label + '');
    }

    data.option2 = data.records.length; //temp
    data.option3 = data.state_array.toString(); //temp
    data.option4 = data.state_columns.toString(); //temp
    data.option5 = options.table; //temp
    data.option6 = data.state_columns.length; //temp
    data.option7 = table_name;

})();