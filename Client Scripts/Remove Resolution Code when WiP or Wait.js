function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    //If state changes to a non-resolved/closed state, clear the resolution code

    if (newValue != '6' && newValue != '7' && g_form.getValue('close_code')) {
        g_form.setMandatory('close_code', false);
        g_form.setValue('close_code', '');
        g_form.setValue('u_do_not_send_notification', false);
        g_form.setDisplay('close_code', false);
    } else if (newValue == '6' || newValue == '7') {
        g_form.setDisplay('close_code', true);
        g_form.setMandatory('close_code', true);
    }

}