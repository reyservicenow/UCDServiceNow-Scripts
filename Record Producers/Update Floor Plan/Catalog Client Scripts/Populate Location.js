function onLoad() {
	var location = getParmVal('sysparm_location');
	if (location)
		g_form.setValue('location', location);
}

function getParmVal(name) {
	name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	var regexS = "[\\?&]"+name+"=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec( window.location.href );
	if(results == null)
		return "";
	else
		return unescape(results[1]);
}