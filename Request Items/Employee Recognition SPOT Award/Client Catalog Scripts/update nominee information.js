function onChange(control, oldValue, newValue, isLoading) {
	if (isLoading || newValue == '') {
		return;
	}

	//Type appropriate comment here, and begin script below
	var ga = new GlideAjax('CatalogItemFunctions');
	ga.addParam('sysparm_name', 'GetNomineeInfo');
	ga.addParam('sysparm_nominee_list', newValue);
	ga.getXML(GetNomineeInfoParse);

	function GetNomineeInfoParse(response) {
		var answer = response.responseXML.documentElement.getAttribute("answer");
		g_form.setValue('u_nominee_information', answer);
	}
}