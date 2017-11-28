function onLoad() {  
    //check to see if URL has the reference
    var ritmReference = getParameterValue('sysparm_ref');  //grab reference sys_id
    if (ritmReference) {
        g_form.setValue('u_ritm_reference', ritmReference); //set field on form

        var ga = new GlideAjax('CatalogItemFunctions'); //call the script include to fill the rest of the form
        ga.addParam('sysparm_name', 'GetPreviousRITMspot');
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
    results = JSON.parse(answer);

    //set the values on the form
    g_form.setValue('u_nominees', results.u_nominees);
    g_form.setValue('u_department_manager', results.u_department_manager);
    g_form.setValue('u_director', results.u_director);
    g_form.setValue('u_justification', results.u_justification);
    g_form.setValue('additional_info', results.additional_info);
}