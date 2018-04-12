findValue();
function findValue() {

    var gr = new GlideRecord('alm_asset');
    gr.addQuery('u_bigfix_url', 'CONTAINS', 'UCD%20BigFix');
    gr.query();
    gs.log('Updating the BigFix URL for ' + gr.getRowCount() + ' records');
    while (gr.next()) {
        var oldURL = gr.u_bigfix_url;
        var newURL = oldURL.replace('UCD%20BigFix', 'UCD+BigFix');
        gr.u_bigfix_url = newURL;
        gr.update();
    }
    gs.log('Updating of BigFix URLs complete');
} 
/*
//single record fix test
findValue();
function findValue() {

    var gr = new GlideRecord('alm_asset');
    gr.get('000fde864fe7a60006a6650f0310c7dc');
    gs.print('old: ' + gr.u_bigfix_url);
    var oldURL = gr.u_bigfix_url;
    var newURL = oldURL.replace('UCD%20BigFix', 'UCD+BigFix');
    gr.u_bigfix_url = newURL;
    gr.update();

    gs.print('Message: ' + oldURL + '\n' + newURL + '\n' + gr.u_bigfix_url);

} 

//records to update
findValue();
function findValue() {

    var gr = new GlideRecord('alm_asset');
    gr.addQuery('u_bigfix_url', 'CONTAINS', 'UCD%20BigFix');
    gr.query();

    gs.print('Message: ' + gr.getRowCount());
}
*/