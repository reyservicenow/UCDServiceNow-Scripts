//for when you come back in january. this isn't working. i think i need to update this script to look for the specific variables you want to pull and pass that in. it doesn't know how to associate items into the object (text vs. array. etc)

var CatalogItemRetriever = Class.create();
CatalogItemRetriever.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    /**
    * Gets Previous values for RITM
    * Returns a text string values
    */
    GetPreviousRITM: function () {
        var results = {}; //create an object

        var ritmReference2 = this.getParameter('sysparm_ref');

        var newGR = new GlideRecord('sc_item_option_mtom'); //find the old RITM's variables
        newGR.addQuery('request_item', ritmReference2);
        newGR.query();

        //push all the old values into the object

        while (newGR.next()) {
            var currentQuestion = newGR.sc_item_option.item_option_new.name;
            var currentValue = newGR.sc_item_option.value;
            if (currentValue && currentValue != "undefined" && currentQuestion) {
                results[currentQuestion] = currentValue;
            }
        }

        results = new JSON().encode(results);

        return results;
    },
    type: 'CatalogItemRetriever'
});

/*
//this background script works
findValue();
function findValue() {
    var results = {};
    var newGR = new GlideRecord('sc_item_option_mtom');
    newGR.addQuery('request_item', 'f321169b13cfc7003527bd122244b0be');
    newGR.query();
    while (newGR.next()) {
        var currentQuestion = newGR.sc_item_option.item_option_new.name;
        var currentValue = newGR.sc_item_option.value;
        if (currentValue && currentValue != "undefined" && currentQuestion) {
            results[currentQuestion] = currentValue;
        }
    }
    var questionNames = Object.getOwnPropertyNames(results).toString();
    var questionArray = questionNames.split(",");

    for (var i=0; i < questionArray.length; i++){
        var qName = questionArray[i]
        gs.print("ANSWER: " + questionArray[i] + " = " + results[qName]);
    }
}
*/


//old below
/*
//this background script works
findValue();
function findValue() {
    var results = {};
    var newGR = new GlideRecord('sc_item_option_mtom');
    newGR.addQuery('request_item', 'f321169b13cfc7003527bd122244b0be');
    newGR.query();
    while (newGR.next()) {
        var currentQuestion = newGR.sc_item_option.item_option_new.name;
        //var currentQuestionName = currentQuestion;
        var currentValue = newGR.sc_item_option.value;
        if (currentValue && currentValue != "undefined" && currentQuestion) {
            results[currentQuestion] = currentValue;
            //results[currentQuestionName] = currentQuestion;
            //gs.print(results[currentQuestionName] +" = "+ results[currentQuestion]);
            //gs.print(currentQuestion +" = "+ results[currentQuestion]);
        }
    }
    //gs.print("\nreturn:\n\n");
    //gs.print(Object.getOwnPropertyNames(results));

    //gs.print(Object.values(results));
    var questionNames = Object.getOwnPropertyNames(results).toString();
    var questionArray = questionNames.split(",");

    for (var i=0; i < questionArray.length; i++){
        var qName = questionArray[i]
        gs.print("ANSWER: " + questionArray[i] + " = " + results[qName]);
    }

    gs.print("end");
    //listAllProperties(results);
}

/*
function listAllProperties(o) {
	var objectToInspect;
	var result = [];

	for(objectToInspect = o; objectToInspect !== null; objectToInspect = Object.getPrototypeOf(objectToInspect)) {
      result = result.concat(Object.getOwnPropertyNames(objectToInspect));
	}

	return result;
}
*/
*/