function($rootScope) {
    var c = this;

    $rootScope.$on('selectedKB', function (event, data) {
        c.data.kbId = data.id;
        c.server.update();
    });
}