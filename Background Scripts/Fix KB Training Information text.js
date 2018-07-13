findValue();
function findValue() {

    var gr = new GlideRecord('kb_knowledge');
    gr.addEncodedQuery('u_type_of_article=training^textLIKE<h2>Training Information</h2>');
    gr.query();
    while (gr.next()) {
        gr.text = gr.text.replace("<h2>Training Information</h2>", "");
        gr.setWorkflow(false);
        gr.autoSysFields(false);
        gr.update();
        gs.info('Replaced string for ' + gr.number);
    }

    gs.info('Replaced string total: ' + gr.getRowCount());
} 