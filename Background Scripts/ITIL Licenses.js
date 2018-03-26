findValue();
function findValue(){

	var gr = new GlideRecord('sys_user_grmember');
	gr.addNotNullQuery('user');
	gr.addQuery('user','!=','6816f79cc0a8016401c5a33be04be441'); //not admin default account
	gr.addQuery('user.name','DOES NOT CONTAIN','[A]') //not admin accounts
	gr.addQuery('group.name','!=','API');
	gr.orderBy('user.name');

	gr.query();
	var groups = {};
	var currentUser;


	while (gr.next()){
		if (gr.user.u_primary_support_group == ''){
			//do nothing;
		} else if (!groups[gr.user.u_primary_support_group.name]){
			groups[gr.user.u_primary_support_group.name] = 1;
		} else {
			groups[gr.user.u_primary_support_group.name]++;
		}
	}

	str = JSON.stringify(groups);
	gs.print(str);

	/*for (var i = 0; i < groups.length; i++){
		gs.print(groups[i]);
	}*/
}
