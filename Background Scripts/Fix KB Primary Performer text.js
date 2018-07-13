findValue();
function findValue() {

	var gr = new GlideRecord('kb_knowledge');
	gr.addEncodedQuery('textLIKE<p>Primary Performer:');
	gr.query();
	while (gr.next()) {
		gr.text = gr.text.replace("<p>Primary Performer:", "<p>Procedure fulfilled by:");
		gr.setWorkflow(false);
		gr.autoSysFields(false);
		gr.update();
		gs.info('Replaced string for ' + gr.number);
	}

	gs.info('Replaced string total: ' + gr.getRowCount());
}