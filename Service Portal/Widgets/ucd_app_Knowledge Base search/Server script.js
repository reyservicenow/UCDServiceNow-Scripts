(function() {
	data.searchType = $sp.getParameter("t");
	data.results = [];
	data.kb = $sp.getValue("kb_knowledge_base");
	data.searchMsg = gs.getMessage("Search the Knowledge Base");
	data.limit = options.limit || 15;
	var textQuery = '123TEXTQUERY321';
	
	// End if no input in box (aka on page load)	
	if (!input) {
		/* Istanbul only feature - search sources	
		data.typeaheadTemplates = {};
	
		var searchGroupTemplatesGR = new GlideRecord("sp_search_source");
		searchGroupTemplatesGR.query();
		while(searchGroupTemplatesGR.next()) {
			if (searchGroupTemplatesGR.getElement("advanced_typeahead_config").getDisplayValue() == "true")
				data.typeaheadTemplates["sp-typeahead-" + searchGroupTemplatesGR.getValue("id") + ".html"] = searchGroupTemplatesGR.getValue("typeahead_template");
				// translateTemplate() isn't available outside global scope
				// data.typeaheadTemplates["sp-typeahead-" + searchGroupTemplatesGR.getValue("id") + ".html"] = $sp.translateTemplate(searchGroupTemplatesGR.getValue("typeahead_template"));
		}
		*/
		return;
	}
	
	data.q = input.q;
	getKnowledge();

	function addSearchTable(sg) {
		var table = sg.getValue('name');
		var condition = sg.getValue('condition');
		var gr = new GlideRecord(table);
		if (condition)
			gr.addEncodedQuery(condition);

		gr.addQuery(textQuery, data.q);
		gr.query();
		var searchTableCount = 0;
		while (gr.next() && searchTableCount < data.limit) {
			var rec = {};
			rec.type = "rec";
			rec.table = table;
			rec.sys_id = gr.getDisplayValue('sys_id');
			rec.page = sg.getDisplayValue('sp_page');
			if (!rec.page)
				rec.page = "form";
			rec.label = gr.getDisplayValue();
			rec.score = parseInt(gr.ir_query_score.getDisplayValue());
			data.results.push(rec);
			searchTableCount++;
		}
	}

	function getKnowledge() {
		var knowledgeBase = new GlideRecord('kb_knowledge_base');
		knowledgeBase.addQuery('sys_id',data.kb); // IT - public KB
		knowledgeBase.addActiveQuery();
		knowledgeBase.query();
		while (knowledgeBase.next()) {
			// Skip if user cannot access this knowledge base
			if (!knowledgeBase.canRead()) continue;
			
			var kb = new GlideRecord('kb_knowledge');
			kb.addQuery('workflow_state', 'published');
			
			/* getLocalDate() is not available outside global scope
					We aren't currently using valid_to field anyways,
					but this kind of code can be added if we decide to
			*/
			// kb.addQuery('valid_to', '>=', (new GlideDate()).getLocalDate().getValue());
			kb.addQuery(textQuery, data.q);
			kb.addQuery('kb_knowledge_base', knowledgeBase.getUniqueValue());
			kb.query();
			var kbCount = 0;
			while (kb.next() && kbCount < data.limit) {
				if (!$sp.canReadRecord(kb))
					continue;

				var article = {};
				article.type = "kb";
				$sp.getRecordDisplayValues(article, kb, 'sys_id,number,short_description,published,text');
				if (!article.text)
					article.text = "";
				article.text = $sp.stripHTML(article.text);
				article.text = article.text.substring(0,200);
				article.score = parseInt(kb.ir_query_score.getDisplayValue());
				article.label = article.short_description;
				data.results.push(article);
				kbCount++;
			}
		}
	}
})();