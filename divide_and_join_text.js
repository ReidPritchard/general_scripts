var doc = activeDocument;
var genError = "DivideTextFrame must be run on a point-text text-frame. ";
if (doc) {
	var docsel = doc.selection;
	var sel = [];
	//remember initial selection set
	for (var itemCt = 0, len = docsel.length; itemCt < len; itemCt++) {
		if (docsel[itemCt].typename == "TextFrame") {
			sel.push(docsel[itemCt]);
		}
	}

	if (sel.length) {
		if (sel.length > 1) {
			join(sel);
		} else if (sel.length === 1) {
			divide(sel[0]);
		}
	} else {
		alert(genError + "Please select a Text-Frame object. (Try ungrouping.)");
	}
} else {
	alert(genError + "No document found.");
}

function divide(selected) {
	//get object position
	var selected_width = selected.width;
	if (selected.contents.indexOf("\n") != -1) {
		//alert("This IS already a single line object!");
	} else {
		//getObject justification
		var justification = selected.story.textRange.justification;

		//make array
		var array_of_lines = get_line_content(selected);
		// alert(array_of_lines);
		textfield_top = selected.top;
		textfield_left = selected.left;
		selected.contents = array_of_lines[0];

		selected.convertAreaObjectToPointObject();

		//for each array item, create a new text line
		var tr = selected.story.textRange;
		var vSpacing = tr.leading;
		var newTF;
		for (j = 1; j < array_of_lines.length; j++) {
			newTF = selected.duplicate(doc, ElementPlacement.PLACEATBEGINNING);
			newTF.contents = array_of_lines[j];
			newTF.top = textfield_top - vSpacing * j;
			if (justification == Justification.CENTER) {
				newTF.left = textfield_left + selected.width / 2 - newTF.width / 2;
			} else if (justification == Justification.RIGHT) {
				newTF.left = textfield_left + selected.width - newTF.width;
			} else {
				newTF.left = textfield_left;
			}
			newTF.selected = false;
			newTF.convertAreaObjectToPointObject();
		}
	}
}

function get_line_content(selection){
	var lines = selection.lines;
	var out_lines = [];
	for (var i = 0; i < lines.length; i++) {
		out_lines.push(trim(lines[i].contents));
	}
	return out_lines;
}

function join(selections) {
	selections = selections.reverse();
	selections[0].contents = get_tf_contents(selections).join("\n");
	selections[0].convertPointObjectToAreaObject();

	for (var i = 1; i < selections.length; i++){
		selections[i].remove();
	}
}

function get_tf_contents(selection){
	var out_array = [];
	for (var i = 0; i < selection.length; i++){
		out_array.push(selection[i].contents);
	}
	return out_array;
}

function trim(s){
  return ( s || '' ).replace( /^\s+|\s+$/g, '' );
}
