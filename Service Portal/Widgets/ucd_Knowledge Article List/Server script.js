(function () {
    data.categoryPageUrl = "ucd_kb_category"; // Category page url
    data.catParam = $sp.getParameter("kb_category"); // Get the sys_id from the URL
    data.kb = $sp.getValue("kb_knowledge_base"); // sys_id for the KB for this portal
    data.categories = []; // list of categories to display
    var kb = data.kb;
    data.documents = getDocuments(kb);
    data.articlePageUrl = "ucd_app_kb_article";

    //var api = new ScopedPortalAPI(); // loads UCD Portal API

    // get previous KB selection from url
    var prevKb = $sp.getParameter('kb');
    if (prevKb != null) {
        data.kb = prevKb;
    }

    var cats = new GlideRecord("kb_category");
    if (input && input.kbId) {
        data.kb = input.kbId;
    }
    cats.addQuery("parent_id", data.kb);
    cats.addActiveQuery();
    cats.addEncodedQuery("label!=General^label!=Virtualization^label!=Media & Events"); // Filter out General, Media & Events and Virtualization which are not shown in ESS
    cats.query();
    while (cats.next()) {
        if (hasArts(cats.getUniqueValue())) // has articles
            data.categories.push({ label: cats.getDisplayValue("label"), value: cats.getUniqueValue(), icon: cats.x_uocd2_ucd_portal_u_icon.getDisplayValue(), desc: cats.x_uocd2_ucd_portal_u_description.getDisplayValue() });
    }

    // get knowledge search widget
    data.widget = $sp.getWidget('ucd-app-knowledge-base-search', {});


    // Sort the final list of categories alphabetically
    //	increasing
    data.categories.sort(function (a, b) {
        return (a.label < b.label) ? -1 : (a.label > b.label) ? 1 : 0;
    });

    function hasArts(category) {
        if (hasArticle(category))
            return true;
        else { // check subcategories
            var sub = new GlideRecord('kb_category');
            sub.addQuery('parent_id', category);
            sub.query();
            while (sub.next()) {
                if (hasArticle(sub.getUniqueValue())) {
                    return true;
                }
                return false;
            }
        }
    }

    function hasArticle(category) {
        var arts = new GlideRecord('kb_knowledge');
        arts.addQuery("kb_category", category);
        arts.addQuery('workflow_state', 'published');
        arts.query();
        if (arts.next()) {
            return true;
        }
        return false;
    }

    function getDocuments(kb) {
        var d = [];
        var gr = new GlideRecord('kb_knowledge');
        gr.addQuery('kb_knowledge_base', kb);
        gr.addQuery('workflow_state', 'published');
        //gr.addQuery('valid_to', '>=', (new GlideDate()).getLocalDate().getValue());
        gr.orderBy('short_description');
        gr.query();
        while (gr.next()) {
            var n = {};
            $sp.getRecordValues(n, gr, 'sys_id,number,short_description,kb_category');
            //n.topCat = $sp.getKBTopCategoryID(n.kb_category);
            d.push(n);
        }
        return d;
    }
})();
