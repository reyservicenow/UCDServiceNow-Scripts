function ($filter, $location) {
    var c = this;
    c.options.glyph = c.options.glyph || 'search';
    c.data.searchMsg = "Search the Knowledge Base";
    c.options.title = c.options.title || c.data.searchMsg;

    c.onSelect = function ($item, $model, $label) {
        if ($item.type == "kb") {
            $location.search({ id: 'ucd_app_kb_article', sys_id: $item.sys_id });
        }
    };

    c.getResults = function (query) {
        return c.server.get({ q: query }).then(function (response) {
            var a = $filter('orderBy')(response.data.results, '-score');
            return $filter('limitTo')(a, c.data.limit);
        });
    }

    c.submitSearch = function () {
        if (c.selectedState)
            $location.search({ id: 'ucd_search2', query: c.selectedState });
    }
}