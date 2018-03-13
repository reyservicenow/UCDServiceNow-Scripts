var UCD_Bomgar_IntegrationUtil = Class.create();

UCD_Bomgar_IntegrationUtil.empty = function (item) {
	return (typeof item == 'undefined' || item == null || item.length == 0);
}

var UCD_Bomgar_Integration = Class.create();
UCD_Bomgar_Integration.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

	/**
 	* Constructs a Generate Session Key URL that can be used to call the Bomgar Rep Console Scripting API - Generate Session Key command.
 	* The URL is returned to a UI Action and called from there.
 	*
 	* @returns String containing the Generate Session Key URL
 	*/
	generateSessionKeyURL: function () {
		var recID = this.getParameter('sysparm_record_id');

		var url = 'https://';
		url += gs.getProperty('UCD.Bomgar.Hostname');
		url += '/api/client_script?action=generate_session_key&type=rep&operation=generate';

		if (recID != "" && recID != null) {
			url += '&session.custom.external_key=';
			url += recID.toString();
		}
		return url;
	},

	/**
 	* Pulls all pending Bomgar sessions on the configured Bomgar appliance. We determine which sessions to pull by querying the latest Bomgar session that
 	* has already been pulled into SNOW. We use the end_date of the session plus 1 second to query subsequent Bomgar sessions.
 	*/
	pullPendingBomgarReports: function () {

		gs.addInfoMessage("CALLING THE FALCON");

		// pull the end_time for the latest sessions (if enabled)
		var integrationEnabled = gs.getProperty('UCD.Bomgar.EnableSessionPull');
		if (!integrationEnabled || integrationEnabled == 'false') {
			return;
		}

		// determine the end_time with which to pull sessions from Bomgar API
		var timeToQuery;
		var maxEndTime;
		// if no sessions exist, we'll pull sessions starting from 24 hours ago
		maxEndTime = new GlideDateTime();
		var maxEndTimeStr = '' + maxEndTime.getNumericValue();
		timeToQuery = parseInt(maxEndTimeStr.substring(0, maxEndTimeStr.length - 3));
		timeToQuery -= (24 * 3600);

		// make the SupportSession call to the Bomgar API
		var response;
		var requestBody;
		var responseBody;
		var request;
		try {
			request = new sn_ws.RESTMessageV2('UCD_Bomgar_Integration REST', 'post');
			request.setStringParameter('applianceHostname', gs.getProperty('UCD.Bomgar.Hostname'));
			request.setStringParameter('username', encodeURIComponent(gs.getProperty('UCD.Bomgar.APIUsername')));
			request.setStringParameter('password', encodeURIComponent(gs.getProperty('UCD.Bomgar.APIPassword')));
			request.setStringParameter('end_time', timeToQuery);
			request.setStringParameter('duration', '0');

			response = request.execute();
			responseBody = response.getBody();
			if (response.haveError()) {
				gs.addInfoMessage('1Error making API call to Bomgar. Error: ' + response.getErrorMessage() + ', Error Code: ' + response.getErrorCode());
				return;
			}
		} catch (ex) {
			responseBody = ex.getMessage();
			gs.addInfoMessage('2Error making API call to Bomgar. Error: ' + responseBody);
		} finally {
			requestBody = request ? request.getRequestBody() : null;
		}

		// parse support session listing response for sessions with an external key
		var xmlDoc = new XMLDocument2();
		xmlDoc.parseXML(responseBody);

		// check xml for an error
		var errorRootNode = xmlDoc.getFirstNode('/').getFirstChild();
		if (!UCD_Bomgar_IntegrationUtil.empty(errorRootNode) && errorRootNode.getNodeName() == 'error') {
			gs.addInfoMessage('3Error making API call to Bomgar. Error: ' + errorRootNode.getTextContent());
			return;
		}

		// no error, proceed as normal
		var rootNode = xmlDoc.getNode('//session_list');
		var totalSessionsImported = 0;
		var iter = rootNode.getChildNodeIterator();
		// iterate each <session> node
		while (iter.hasNext()) {
			var sessionNode = iter.next();
			var lsid = sessionNode.getAttribute('lsid');
			if (!UCD_Bomgar_IntegrationUtil.empty(lsid)) {
				var externalKey;
				var sessionIter = sessionNode.getChildNodeIterator();
				// get external key
				while (sessionIter.hasNext()) {
					var childNode = sessionIter.next();
					if (childNode.getNodeName() == 'external_key') {
						externalKey = childNode.getTextContent();
						break;
					}
				}

				// process if we have an external key, otherwise skip this session
				if (!UCD_Bomgar_Integration.empty(externalKey)) {
					var incident = new GlideRecord('incident');//Searches for incident in externalKey
					incident.addQuery('number', externalKey);
					incident.query();
					// if we find an incident that matches the external key, create a Bomgar session
					if (incident.next()) {

						var sessionInfo = "";

						sessionIter = sessionNode.getChildNodeIterator();
						// iterate children of <session>
						while (sessionIter.hasNext()) {
							var childNode = sessionIter.next();
							if (childNode.getNodeName() == 'end_time') {
								var timestamp = childNode.getAttribute('timestamp');
								var timestampInt = parseInt(timestamp, 10);
								var dateTime = new GlideDateTime();
								dateTime.setValue(timestampInt * 1000);
								sessionInfo += "End time: " + dateTime + '\n';
							}
							else if (childNode.getNodeName() == 'start_time') {
								var timestamp = childNode.getAttribute('timestamp');
								var timestampInt = parseInt(timestamp, 10);
								var dateTime = new GlideDateTime();
								dateTime.setValue(timestampInt * 1000);
								sessionInfo += "Start time: " + dateTime + '\n';
							}
							else if (childNode.getNodeName() == 'session_details') {
								var detailIter = childNode.getChildNodeIterator();
								// iterate children of <session_details>, i.e. <event> nodes
								while (detailIter.hasNext()) {
									var detailNode = detailIter.next();
									if (detailNode.getNodeName() == 'event') {
										var eventType = detailNode.getAttribute('event_type');
										if (!UCD_Bomgar_IntegrationUtil.empty(eventType) && eventType == 'Chat Message') {

											// set chat timestamp
											var timestamp = detailNode.getAttribute('timestamp');
											var timestampInt = parseInt(timestamp, 10);
											var dateTime = new GlideDateTime();
											dateTime.setValue(timestampInt * 1000);
											// 											chat.time = dateTime;

											sessionInfo += "(" + dateTime + ") ";

											var eventIter = detailNode.getChildNodeIterator();
											// iterate children of <event>
											while (eventIter.hasNext()) {
												var eventChildNode = eventIter.next();
												if (eventChildNode.getNodeName() == 'body') {
													sessionInfo += eventChildNode.getTextContent() + '\n';
												}
												else if (eventChildNode.getNodeName() == 'performed_by') {
													sessionInfo += eventChildNode.getTextContent() + ' : ';
												}
												else if (eventChildNode.getNodeName() == 'destination') {

												}
											}
										}
									}
								}
							}
						}
						//Checks against the incident to ensure no duplicate Bomgar transcripts
						var check = "" + incident.u_bomgar_sid;
						gs.addInfoMessage(check);
						gs.addInfoMessage(lsid);
						gs.addInfoMessage(check.indexOf(lsid) > -1);
						if (check.indexOf(lsid) > -1) {
							//If session ID is already flagged in the incident
						}
						else {
							incident.u_bomgar_sid += lsid + ",";
							incident.work_notes += sessionInfo;
							incident.update();
						}
						totalSessionsImported++;
					}
				}
			}
		}
		// 		gs.info(totalSessionsImported + ' Bomgar Sessions imported based on a end_time timestamp of ' + timeToQuery);
		// 		gs.addInfoMessage(totalSessionsImported + ' Bomgar Sessions imported based on a end_time timestamp of ' + timeToQuery);
	},

	type: 'UCD_Bomgar_Integration'
});