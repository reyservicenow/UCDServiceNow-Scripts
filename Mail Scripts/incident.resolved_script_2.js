if (current.assignment_group.u_send_surveys == 'qualtrics') {
    myGroupUtil = new UCDUserGroupUtils();

    var org = myGroupUtil.getTopOrgGroup(current.assignment_group);
    var orgName = '';

    if (org != null) {
        var group = new GlideRecord('sys_user_group');
        if (group.get(org)) {
            orgName = group.name;
        }
    }

    var params = [];
    params['ORG'] = orgName;
    params['NUM'] = current.number;

    var qual = new UCDQualtricsUtils();

    var href = qual.createSurveyUrl(gs.getProperty('edu.ucdavis.qualtrics.surveyBase'), gs.getProperty('edu.ucdavis.qualtrics.surveyInstance'), params);
    var linkText = 'complete a brief survey to rate our service';
    var htmltag = '<a href="' + href + '">' + linkText + '</a>';
    template.print('\nWant to provide feedback? Please take a moment to ' + htmltag + '.\n');
}

if (current.assignment_group.u_send_surveys == 'servicenow') {
    var href = 'servicehub/?id=ucd_take_survey&sysparm_iid=' + current.sys_id;
    var linkText = 'complete a brief survey to rate our service';
    var htmltag = '<a href="' + href + '">' + linkText + '</a>';
    template.print('\nWant to provide feedback? Please take a moment to ' + htmltag + '.\n');
}
