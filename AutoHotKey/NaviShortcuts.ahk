;various table grabs in SN
#IfWinActive, ServiceNow
GetTableName(windownumpad){
	if (windownumpad = 1){
		TableName = incident.list
	} else if (windownumpad = 2){
		TableName = sys_user.list
	} else if (windownumpad = 3){
		TableName = sys_user_group.list
	} else if (windownumpad = 4){
		TableName = sc_cat_item.list
	} else if (windownumpad = 5){
		TableName = u_service_desk_emails.list
	}
	return TableName
}

SendNavAction(numpadNumber){
	send ^!f
	sleep,100
	zTableName := GetTableName(numpadNumber)
	send, %zTableName%{enter}
}

^Numpad1::
	SendNavAction(1)
	Return
^Numpad2::
	SendNavAction(2)
	Return
^Numpad3::
	SendNavAction(3)
	Return
^Numpad4::
	SendNavAction(4)
	Return
^Numpad5::
	SendNavAction(5)
	Return

^Numpad0::
	windows1 := GetTableName(1)
	windows2 := GetTableName(2)
	windows3 := GetTableName(3)
	windows4 := GetTableName(4)
	windows5 := GetTableName(5)
	WinGetActiveStats, Title, Width, Height, X, Y
	guiWidth := X
	guiHeight := Y+200
	Gui, New,,SN Tables
	gui, font, s14
	Gui, Add, Text,,numpad1. %windows1%
	Gui, Add, Text,,numpad2. %windows2%
	Gui, Add, Text,,numpad3. %windows3%
	Gui, Add, Text,,numpad4. %windows4%
	Gui, Add, Text,,numpad5. %windows5%
	Gui -Caption
	Gui, Show, X%guiWidth% Y%guiHeight%
	loop {
		if (GetKeyState("Numpad0","P")=0 && GetKeyState("Ctrl","P")=0){
			Gui Destroy
			WinActivate, %Title%
			return
		}
		sleep 500
	}
	return
	
	
	
; Control+S saves the script and if the script is in focus, reloads the script
#IfWinActive, C:\Users\eduque\Box Sync\Scripts\MyScript.ahk - Notepad++
~^s::
	sleep 100
	reload
	return