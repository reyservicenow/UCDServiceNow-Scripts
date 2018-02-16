(function () {
    // populate the 'data' variable
    data.articlePageUrl = "ucd_kb_article"; // Scoped KB article page
    data.kb = '7c2d56f42bd89200e0b209d417da153e'; // IT - Public

    var parentId = '';

    var gr = new GlideRecord('kb_category');

    if ($sp.getParameter('kb')) {
        data.kb = $sp.getParameter('kb');
    }

    if (input && input.catQueryStr) {
        data.category = input.catQueryStr;

        // get parent of category
        parentId = getParent(gr, data.category);
        if (parentId != null) {
            data.kb = parentId;
        }
        // modify breadcrumbs for category selection
        modifyBreadcrumbs(data.category);
    }
    else if (input && input.category) {
        data.category = input.category;

        // get parent of category
        parentId = getParent(gr, data.category);
        if (parentId != null) {
            data.kb = parentId;
        }

        // modify breadcrumbs for category selection
        modifyBreadcrumbs(data.category);
    }
    else { // take category from url
        data.category = $sp.getParameter("kb_category"); // Grab category sys_id from URL

        parentId = getParent(gr, data.category);
        if (parentId != null) {
            data.kb = parentId;
        }
        // modify breadcrumbs
        modifyBreadcrumbs(data.category);
    }
    var kb_cat = new GlideRecord("kb_category");
    if (kb_cat.get(data.category)) {
        data.categoryExists = true;
        data.categoryDisplay = kb_cat.getDisplayValue();
        data.categoryIcon = kb_cat.getDisplayValue('x_uocd2_ucd_portal_u_icon');
        data.categoryDescription = kb_cat.getDisplayValue('x_uocd2_ucd_portal_u_description');
        if (kb_cat.parent_id == data.kb) { // parent check
            if (kb_cat.x_uocd2_ucd_portal_u_icon) {
                data.parentCatIcon = kb_cat.getDisplayValue('x_uocd2_ucd_portal_u_icon');
            }
            data.isParentCatDisplay = true;
            data.isSubcatDisplay = false;
            data.isSubcatcatDisplay = false;
        } else if (kb_cat.parent_id.parent_id == data.kb) { // Subcategory check
            data.categoryDisplay = kb_cat.parent_id.label.getDisplayValue();
            data.subCategoryDisplay = kb_cat.getDisplayValue();
            data.isSubcatDisplay = true;
            data.isParentCatDisplay = false;
            if (kb_cat.parent_id.x_uocd2_ucd_portal_u_icon) {
                data.parentCatIcon = kb_cat.parent_id.x_uocd2_ucd_portal_u_icon.getDisplayValue();
            }
            data.isSubcatcatDisplay = false;
        } else if (kb_cat.parent_id.parent_id != data.kb && kb_cat.parent_id != data.kb) { // subsubcategory check
            data.isSubcatcatDisplay = true;
            data.isSubcatDisplay = false;
            if (kb_cat.parent_id.parent_id.x_uocd2_ucd_portal_u_icon) {
                data.parentCatIcon = kb_cat.parent_id.parent_id.x_uocd2_ucd_portal_u_icon.getDisplayValue();
            }
            data.categoryDisplay = kb_cat.parent_id.parent_id.label.getDisplayValue();
            data.subcatcatDisplay = kb_cat.parent_id.label + ": " + kb_cat.label;
        } else {
            data.isSubcatDisplay = false;
            data.isSubcatcatDisplay = false;
        }
    }
    var api = new ScopedPortalAPI();

    data.items = [];

    // check if user has access to the current category
    var currCat = new GlideRecord("kb_category");
    currCat.addQuery('sys_id', data.category);
    currCat.query();
    currCat.next();

    var subcats = new GlideRecord("kb_category");
    subcats.addQuery("parent_id", data.category);
    subcats.query();
    if (subcats.getRowCount() > 0) {
        data.has_subs = true;
        data.subcategories = [];
        while (subcats.next()) {
            data.subcategories.push({
                label: subcats.getDisplayValue("label"),
                value: subcats.getUniqueValue()
            });
        }
    }
    else data.has_subs = false;
    data.categoryExists = false;

    if (input && input.queryStr) {
        data.kbQuery = input.queryStr;

        if (data.kbQuery != "All") { // apply filter
            api.getKBCategoryArticlesFiltered(data.category, data.items, data.kbQuery + '^ORDERBYDESCsys_view_count', data.kb.toString());
            // check for special release notes type
            if (data.kbQuery.contains("release_note") || data.category == "4698f7b24fc86e0048874b5e0210c786") {
                // sort articles by view count
                data.items.sort(function (a, b) {
                    if (a.short_description < b.short_description) return 1;
                    if (a.short_description > b.short_description) return -1;
                    return 0;
                });
            }
        } else // get all articles in category
            api.getKBCategoryArticlesFiltered(data.category, data.items, data.kbQuery + 'ORDERBYDESCsys_view_count', data.kb.toString());
        //api.getKBCategoryArticles(data.category,data.items);
    } else { // no filter set
        api.getKBCategoryArticlesFiltered(data.category, data.items, 'ORDERBYDESCsys_view_count', data.kb.toString());
    }

    // sort articles by view count
	/*data.items.sort(function(a,b) {
		if (a.view_count < b.view_count) return -1;
		if (a.view_count > b.view_count) return 1;
		return 0;
	});*/

    // check for a category to display
    if (input && input.catDisplay) {
        data.categoryDisplay = input.catDisplay;
    }

    data.kb_knowledge_page = $sp.getDisplayValue("kb_knowledge_page") || "kb_view";

	/**
	* @param categoryRecord
	* @param input
	* Returns parent KB
	*/
    function getParent(categoryRecord, input) {

        categoryRecord.get('sys_id', input);

        if (categoryRecord) {
            var parent = categoryRecord.getValue('parent_id');
            var parentLabel = '';
            parentLabel = categoryRecord.parent_id.getDisplayValue();
            while (parent && parent != null) { // is subcategory
                var parentCat = new GlideRecord('kb_category');
                if (parentCat.get(parent)) {
                    var label = parentCat.getDisplayValue('label');
                    var id = parentCat.getUniqueValue();

                    parent = parentCat.getValue('parent_id');
                    parentLabel = label;
                } else { // is parent already
                    return parent;
                }
            }
            return parent;
        } else {
            return null;
        }
    }

	/**
	* Changes breadcrumbs depending on what category you are in
	*/
    function modifyBreadcrumbs(category) {
        data.breadcrumbs = [];

        // Get current category record
        var kbCat = new GlideRecord('kb_category');
        kbCat.get(category);

        // Add the current category to the breadcrumbs
        data.breadcrumbs = [{
            label: kbCat.getDisplayValue('label'),
            url: '?id=ucd_kb_category&kb_category=' + kbCat.getUniqueValue() + "&kb=" + data.kb + "#articles"
        }];

        // Continue adding parent categories until reaching the Knowledge Base
        var parent = kbCat.getValue('parent_id');
        while (parent && parent != data.kb) {
            var parentCat = new GlideRecord('kb_category');
            parentCat.get(parent);

            var label = parentCat.getDisplayValue('label');
            var id = parentCat.getUniqueValue();

            data.breadcrumbs.unshift({
                label: label,
                url: '?id=ucd_kb_category&kb_category=' + id + "&kb=" + data.kb + "#articles"
            });
            parent = parentCat.getValue('parent_id');
        }

        // Store selected KB
        var kbHomepage = '?id=ucd_kb_view2&kb=' + data.kb;

        // Add Knowledge Base last
        data.breadcrumbs.unshift({ label: "Knowledge Base", url: kbHomepage });
    }
})();

