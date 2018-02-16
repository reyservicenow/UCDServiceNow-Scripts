function ($scope, $rootScope, $window, $anchorScroll, $location) {
    var c = this;

    c.viewAll = false;

    // These only are called on page load
    setInnerText();
    $rootScope.$broadcast('sp.update.breadcrumbs', c.data.breadcrumbs);

    function setInnerText() {
        for (var i = 0; $scope.data.items.length > i; i++) {
            var item = $scope.data.items[i];
            if (item.text.indexOf(">") == -1) {
                item.inner_text = item.text.trim();
                return;
            }

            var t = $("<div>" + item.text + "</div>");
            t = t.text();
            item.inner_text = t.trim();
        }
    }
    // listener for dept filter event
    $rootScope.$on('selectedDept', function (event, data) {
        c.data.selectedDepts = data;

        c.data.queryStr = "";
        // check for All
        if (data.length == 1) {
            if (data[0].name == "All")
                c.data.queryStr = "All";
            // not all
            else {
                c.data.queryStr = "author=" + data[0].id;
            }
        } else { // get all departments and add to query
            for (var i = 0; i < data.length; i++) {
                if (i == data.length - 1)
                    c.data.queryStr += "author=" + data[i].id;
                else
                    c.data.queryStr += "author=" + data[i].id + "^OR";
            }
        }
        // get category parameter
        c.data.category = getParameter('kb_category');
        c.server.update();
    });

    // listener for radio content type selection
    $rootScope.$on('selectedContentType', function (event, data) {
        if (data.name != "All")
            c.data.queryStr = "u_type_of_article=" + data.id;
        else
            c.data.queryStr = "All";
        // get category parameter
        c.data.category = getParameter('kb_category');
        c.server.update();
    });

    // listener for internal KB broadcast
    $rootScope.$on('selectedKB', function (event, data) {
        c.data.kbId = data.id;
        c.server.update();
    });

    // listener for category broadcast
    $rootScope.$on('selectedCat', function (event, data) {
        c.data.catQueryStr = "";
        c.data.catQueryStr = data.id;
        c.data.catDisplay = data.name;
        c.data.catParent = data.parent;

        c.server.update().then(function () {
            var old = $location.hash();
            // scroll to top
            $location.hash('art-list');
            $anchorScroll();
            $location.hash(old);
        });
    });

    function getParameter(name, url) {
        if (!url)
            url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        // match ? or &, name, = to get parameter in url
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
}
