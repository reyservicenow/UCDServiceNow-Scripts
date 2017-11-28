var CatalogItemFunctions = Class.create();
CatalogItemFunctions.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	/**
	* Gets a users contact information
	* Returns an object with user's email, phone, and mobile phone number
	*/
	getContactInfo: function (user) {
		var contact = {};

		var gr = new GlideRecord('sys_user');
		if (gr.get(user)) {
			contact.email = gr.email;
			contact.phone = gr.phone;
			contact.mobile_phone = gr.mobile_phone;
			contact = new JSON().encode(contact);
		}
		return contact;
	},

	/**
	* Get users primary support group
	*/
	getPrimarySupportGroup: function () {
		var user = this.getParameter('sysparm_user');

		var answer = {};
		var u = new GlideRecord('sys_user');
		if (u.get('sys_id', user)) {
			answer.name = u.u_primary_support_group.getDisplayValue();
			answer.id = u.u_primary_support_group.getValue();
		}
		answer = new JSON().encode(answer);
		return answer;
	},

	/**
	* Check if user is a manager of any groups
	* if type is parent, check if user is manager of any parent groups
	*/
	isManager: function () {
		var user = this.getParameter('sysparm_user');
		var type = this.getParameter('sysparm_type');

		var gr = new GlideRecord("sys_user_group");
		gr.addQuery('active', true);
		if (type == "parent")
			gr.addQuery('parent', '');
		gr.addQuery('manager', user);
		gr.query();
		if (gr.next()) {
			return "true";
		} else
			return "false";
	},

	/**
	* Get manager of user's primary support group
	*/
	getOrganizationManager: function () {
		var answer = {};
		answer.name = "";
		answer.id = "";

		var user = this.getParameter('sysparm_user');

		var gr = new GlideRecord('sys_user');
		if (gr.get('sys_id', user)) {
			// get manager of primary support group
			var psg = gr.u_primary_support_group;
			if (psg != "") {
				var gr2 = new GlideRecord('sys_user_group');
				gr2.addQuery('sys_id', psg);
				gr2.query();
				if (gr2.next()) {
					answer.id = gr2.manager.getValue();
					answer.name = gr2.manager.getDisplayValue();
				}
			}
		}
		answer = new JSON().encode(answer);
		return answer;
	},

	/**
	* Gets a user's organizations that they are a manager of
	* Different than just getting a user's assignment groups that they manage
	* Requires organization string e.g. "IET, COE"
	*/
	getManagedOrgs: function () {
		var answer = {};
		var managedGroupsStr = "";
		var managedGroups = [];

		var user = this.getParameter('sysparm_user');
		var org = this.getParameter('sysparm_org');

		var orgArr = [];
		// check if single organization
		if (org.contains(',')) {
			// decode multiple organization string back into array
			orgArr = org.split("\\s*,\\s*");
		} else {
			orgArr.push(org);
		}

		// go through each organization and see if user is manager of it
		for (var i = 0; i < orgArr.length; i++) {
			var gr = new GlideRecord('sys_user_group');
			gr.addQuery('name', orgArr[i]);
			gr.query();
			if (gr.next()) {
				if (gr.manager == user) {
					// user is manager, add to answer
					managedGroups.push(orgArr[i]);
				}
			}
		}
		if (managedGroups.length > 0) {
			for (var j = 0; j < managedGroups.length; j++) {
				managedGroupsStr += managedGroups[j] + ", ";
			}

			//remove the last 2 characters, because they are ", "
			managedGroupsStr = managedGroupsStr.substr(0, managedGroupsStr.length - 2);
		}
		answer.managedGroups = managedGroups;
		answer.managedGroupsStr = managedGroupsStr;
		answer = new JSON().encode(answer);

		return answer;
	},

	/**
	* Gets the groups a user is manager of
	*/
	getManagedGroups: function () {
		var answer = {};

		var managedGroups = [];
		var managedGroupsStr = "";

		var user = this.getParameter("sysparm_user");

		var gr = new GlideRecord('sys_user_group');
		gr.addQuery('manager', user);
		gr.addQuery('active', true);
		gr.query();
		while (gr.next()) {
			managedGroups.push(gr.name.getDisplayValue());
		}

		// create managed groups string
		if (managedGroups.length > 0) {
			for (var i = 0; i < managedGroups.length; i++) {
				managedGroupsStr += managedGroups[i] + ", ";
			}
			//remove the last 2 characters, because they are ", "
			managedGroupsStr = managedGroupsStr.substr(0, managedGroupsStr.length - 2);
		}

		answer.managedGroupsStr = managedGroupsStr;
		answer.managedGroups = managedGroups;
		answer = new JSON().encode(answer);

		return answer;
	},

	/**
	* Gets PPS codes of group
	*/
	filterPPS: function () {
		var answer = "";

		var org = this.getParameter('sysparm_org');
		// find PPS codes of group
		var gr = new GlideRecord('u_pps_codes');
		gr.addQuery('u_group_name', org);
		gr.query();
		while (gr.next()) {
			answer += gr.sys_id + ",";
		}
		return answer;
	},

	/**
	* Checks if PPS code number is in use
	*/
	isPPSUsed: function () {
		var num = this.getParameter('sysparm_number');

		var gr = new GlideRecord('u_pps_codes');
		gr.addQuery("u_pps_code", num);
		gr.query();
		if (gr.next()) {
			return "false";
		}

		return "true";
	},

	/**
	* Gets a users active ticket count
	* Returns String
	*/
	getActiveTickets: function () {
		var user = this.getParameter('sysparm_user');
		var answer = {};
		var ticketCount = 0;

		var taskTable = new GlideRecord("task");
		taskTable.addQuery('assigned_to', user);
		taskTable.addQuery("active", 'true');
		taskTable.query();
		while (taskTable.next()) {
			ticketCount++;
		}
		answer.ticketCount = ticketCount;
		answer = new JSON().encode(answer);

		return answer;
	},

	/**
	* Gets a users parent groups in ServiceNow
	* E.g. User is in IET Inbox group. Parent group of IET Inbox is IET so this would return IET
	* Returns comma separated string of parent groups
	*/
	getParents: function () {
		var parentsStr = "";

		var user = this.getParameter('sysparm_user');
		var possibleParents = []; //array of all possible parent orgs
		var userGroups = []; //array of all groups the user is in
		var userParents = []; //array of all parents the user belongs to

		//get user's groups
		var gr = new GlideRecord('sys_user_grmember');
		gr.addQuery('user', user);
		gr.query();
		while (gr.next()) {
			//look at the current group
			var curGroup = gr.group; //current group the user is part of
			var sysGrp = new GlideRecord("sys_user_group");
			sysGrp.addQuery('sys_id', curGroup);
			sysGrp.query();
			sysGrp.next();
			userGroups.push(sysGrp.name.trim()); // add group user is part of
		}

		//get possible parent groups
		var grp = new GlideRecord("sys_user_group");
		grp.addQuery("parent", "");
		grp.addQuery("active", "true");
		grp.query();
		while (grp.next()) {
			possibleParents.push(grp.name.trim());
		}

		// find matches
		//idea - see if indexOf curr in parent is not 0
		//don't look at this group if it starts with a parent we know the user is in

		//for each grp the user is in
		outer:
			for (var i = 0; i < userGroups.length; i++) {

				// for each known parent
				for (var k = 0; k < userParents.length; k++) {
					//if cur grp is a known parent, skip it
					if (userGroups[i].indexOf(userParents[k]) == 0) {
						continue outer;
					}
				}

				//for each possible parent grp
				for (var j = 0; j < possibleParents.length; j++) {
					//if user grp starts with parent's name
					if (userGroups[i].indexOf(possibleParents[j]) >= 0) {
						userParents.push(possibleParents[j]);
					}
				}
			}
		//got all parents

		//if user has parents
		if (userParents.length > 0) {
			//parentsStr will be a comma separate string of all parents
			//eg: "IET, CAES"
			for (var i = 0; i < userParents.length; i++) {
				//if (userParents[i] !== "ROLE")
				if (userParents[i].indexOf("ROLE") < 0)
					parentsStr += userParents[i] + ", ";
			}

			//remove the last 2 characters, because they are ", "
			parentsStr = parentsStr.substr(0, parentsStr.length - 2);
		}
		return parentsStr;
	},

	/**
	* Get user's primary support group and current assignment groups
	* Returns user's groups and organizations as comma separated string
	* Returns array of user's groups and also array of user's organizations
	*/
	getUserGroups: function () {
		var answer = {};

		var userGroups = []; // groups user is in
		var possibleParents = []; //array of all possible parent orgs
		var userOrgs = [];
		var userOrg = "";
		var groupsStr = "";
		var orgsStr = "";

		var user = this.getParameter('sysparm_user');
		var ag = new GlideRecord('sys_user_grmember');
		ag.addQuery('user', user);
		ag.query();
		while (ag.next()) {
			var myGroup = ag.group.getDisplayValue();
			if (!myGroup.startsWith("ROLE")) {
				userGroups.push(myGroup);
			}
		}

		// create current assignment groups string
		if (userGroups.length > 0) {
			for (var i = 0; i < userGroups.length; i++) {
				groupsStr += userGroups[i] + ", ";
			}
			groupsStr = groupsStr.substr(0, groupsStr.length - 2);
		}

		// get possible parent groups
		var grp = new GlideRecord("sys_user_group");
		grp.addQuery("parent", "");
		grp.addQuery("active", "true");
		grp.query();
		while (grp.next()) {
			possibleParents.push(grp.name.trim());
		}

		// for each group the user is in
		for (var j = 0; j < userGroups.length; j++) {
			//for each possible parent grp
			for (var k = 0; k < possibleParents.length; k++) {
				//if user grp starts with parent's name
				if (userGroups[j].indexOf(possibleParents[k]) >= 0) {
					userOrgs.push(possibleParents[k]);
				}
			}
		}

		if (userOrgs.length > 0) {
			// create organization groups string after removing duplicates
			var uniqueOrgs = userOrgs.reduce(function (a, b) {
				if (a.indexOf(b) < 0)
					a.push(b);
				return a;
			}, []);


			for (var l = 0; l < uniqueOrgs.length; l++) {
				orgsStr += uniqueOrgs[l] + ", ";
			}
			orgsStr = orgsStr.substr(0, orgsStr.length - 2);
		}

		// get users primary support organization
		var u = new GlideRecord('sys_user');
		if (u.get('sys_id', user))
			userOrg = u.u_primary_support_group.getDisplayValue();

		answer.groupsStr = groupsStr; // user groups string
		answer.orgsStr = orgsStr;  // user organizations string
		answer.userGroups = userGroups; // array of user groups
		answer.userOrg = userOrg; // primary support group
		answer.userOrgs = userOrgs; // array of all organizations user is in
		answer = new JSON().encode(answer);

		return answer;
	},
	/**
    * Gets a user information from a provided list
    * Returns a text string of names, deapartments, affiliations, and cost centers
    */
	GetNomineeInfo: function () {
		var textField = '';
		var nomList = this.getParameter('sysparm_nominee_list');
		var array = [];
		array = nomList.split(','); //split the list into an array

        //for every person, grab their information and push it into a single text string
		for (var i = 0; i < array.length; i++) {
			var newGR = new GlideRecord('sys_user');
			newGR.addQuery('sys_id', array[i]);
			newGR.query();
			if (newGR.next()) {
				textField += newGR.name + ': ';
				if (newGR.department) {
					textField += 'Department: ' + newGR.department.getDisplayValue() + '. ';
				}
				if (newGR.u_affiliation) {
					textField += 'Affilitation: ' + newGR.u_affiliation.getDisplayValue() + '. ';
				}
				if (newGR.cost_center) {
					textField += 'Cost Center: ' + newGR.cost_center.getDisplayValue();
				}
				textField += '\n';
			}
		}
		return textField;
	},
    /**
    * Gets Previous values for RITM: Employee Recognition: SPOT Award
    * Returns a text string of names, deapartments, affiliations, and cost centers
    */
	GetPreviousRITMspot: function () {
	    var results = {}; //create an object

	    var u_nominees2 = [];
	    var u_department_manager2 = "";
	    var u_director2 = "";
	    var u_justification2 = "";
	    var additional_info2 = "";

	    var ritmReference2 = this.getParameter('sysparm_ref');

	    var newGR = new GlideRecord('sc_req_item'); //find the old RITM
	    newGR.addQuery('sys_id', ritmReference2);
	    newGR.query();

        //push all the old values into the object
	    if (newGR.next()) {
	        u_nominees2 = newGR.variables.u_nominees.toString();
	        u_department_manager2 = newGR.variables.u_department_manager.toString();
	        u_director2 = newGR.variables.u_director.toString();
	        u_justification2 = newGR.variables.u_justification.toString();
	        additional_info2 = newGR.variables.additional_info.toString();

	        results.u_nominees = u_nominees2;
	        results.u_department_manager = u_department_manager2;
	        results.u_director = u_director2;
	        results.u_justification = u_justification2;
	        results.additional_info = additional_info2;
	    }
	    results = new JSON().encode(results);
	    
	    return results;
	},
	type: 'CatalogItemFunctions'
});