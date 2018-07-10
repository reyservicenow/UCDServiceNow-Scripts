//Call this script_include and make sure that the URL incldues the sysparm_ritm parameter (set to a RITM's sys_id) and it will return all the variables of that ritm.

var ritm_variable_collector = Class.create();
ritm_variable_collector.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    getVariables: function () {

        //The glideajax should have provided the sys_id of the RITM to retrieve
        var referencedSysID = this.getParameter('sysparm_ritm');
        var results = {};

        //find the RITM
        var gr = new GlideRecord('sc_req_item');
        gr.get(referencedSysID);

        //return all its variables and their values
        for (var key in gr.variables) {
            results[key] = gr.variables[key];
        }

        //encode the object and pass it back to the client
        return JSON.stringify(results);
    },

    type: 'ritm_variable_collector'
});

/* client script to be added to your catalog item
 * 
 * 
//If the URL contains sysparm_ritm then fill in all the fields with the referenced values

function onLoad() {
	var ritmReference = getParameterValue('sysparm_ritm');

	if (!ritmReference) return;

	var ga = new GlideAjax('ritm_variable_collector');
	ga.addParam('sysparm_name', 'getVariables');
	ga.addParam('sysparm_ritm', ritmReference);
	ga.getXML(updateForm);
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

function updateForm(response) {
	var answer = response.responseXML.documentElement.getAttribute("answer");
    results = JSON.parse(answer);
	for (var key in results){
		g_form.setValue(key, results[key]);
	}
}
*/