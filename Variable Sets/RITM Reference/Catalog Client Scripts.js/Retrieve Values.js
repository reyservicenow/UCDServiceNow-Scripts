function onLoad() {
    //check to see if URL has the reference
    var ritmReference = getParameterValue('sysparm_ref');  //grab reference sys_id
    if (ritmReference) {
        g_form.setValue('u_ritm_reference', ritmReference); //set field on form

        var ga = new GlideAjax('CatalogItemRetriever'); //call the script include to fill the rest of the form
        ga.addParam('sysparm_name', 'GetPreviousRITM');
        ga.addParam('sysparm_ref', ritmReference);
        ga.getXML(getPreviousResponses);
    }
}

function getParameterValue(name) {
    //parse the URL
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(top.location);
    if (results == null) {
        return "";
    } else {
        return unescape(results[1]);
    }
}

function getPreviousResponses(response) {
    var answer = response.responseXML.documentElement.getAttribute("answer");
    var results = JSON.parse(answer);

    var questionNames = Object.getOwnPropertyNames(results).toString();
    var questionArray = questionNames.split(",");

    for (var i = 0; i < questionArray.length; i++) {
        var qName = questionArray[i];
        g_form.setValue(questionArray[i], results[qName]);
    }

}