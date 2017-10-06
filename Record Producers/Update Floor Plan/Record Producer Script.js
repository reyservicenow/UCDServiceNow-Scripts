//The following was created by admin-eduque on 8/11/2017ish in ucdavisietdev
//Description: Construct a logical description out of all the fields. This description is then passed on to any attached tasks (via workflow)

current.short_description = 'Update Floor Plan for ' + producer.caller.getDisplayValue();

current.description = gs.getUserDisplayName() + ' requested that the map be updated to indicate that ' + producer.caller.getDisplayValue() + ' is located at ' + producer.location.getDisplayValue() + '\nTask has been assigned to ITSM for review';

current.state = 10; //Push to WIP

current.assignment_group = 'eecdfd9bff131100a0a5ffffffffffe9'; //Assign to Facilities, this should be happening OOB but it isn't so I'm forcing it.