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
	// Convert it to a point object, for no reason other than they are nicer for single words
	selected.convertAreaObjectToPointObject();

	if (selected.contents.indexOf("\n") === -1) {
		// Since this is one line we will assume the user is trying to split by word rather than line

		// Generate a array of words
		var array_of_words = get_tf_contents(selected.words);

		// Save left position of text field to later position the new words
		textfield_left = selected.left;

		// Set selected element to value of ' '
		selected.contents = " ";
		// Find the width of one character
		var char_width = selected.width;

		// Set selected element to value of first word
		selected.contents = array_of_words[0];
		// Convert it to a point object, for no reason other than they are nicer for single words
		selected.convertAreaObjectToPointObject();
		// Deselect text field
		selected.selected = false;

		// Start offset as first word width + the width of a char (or space)
		var offset = selected.width + char_width;

		// Init new text field to be used in for loop
		var new_text_field;

		for (var j = 1; j < array_of_words.length; j++) {
			// Duplicate text field and place at beginning of first text
			new_text_field = selected.duplicate(
				doc,
				ElementPlacement.PLACEATBEGINNING
			);

			// Set contents of this new text field to the next word in the array
			new_text_field.contents = array_of_words[j];

			// Set left position of text field by offset
			new_text_field.left = textfield_left + offset;

			// Update offset based on text_field width with extra char
			offset += new_text_field.width + char_width;

			// Deselect new text field
			new_text_field.selected = false;

			// Convert it to a point object, for no reason other than they are nicer for single words
			new_text_field.convertAreaObjectToPointObject();
		}
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
		var leading = tr.leading;
		var newTF;
		for (j = 1; j < array_of_lines.length; j++) {
			newTF = selected.duplicate(doc, ElementPlacement.PLACEATBEGINNING);

			// Set contents of this new text field to the next line in the array
			newTF.contents = array_of_lines[j];

			// Get top position of text field and offset by leading amount
			newTF.top = textfield_top - leading * j;

			if (justification == Justification.CENTER) {
				newTF.left = textfield_left + selected.width / 2 - newTF.width / 2;
			} else if (justification == Justification.RIGHT) {
				newTF.left = textfield_left + selected.width - newTF.width;
			} else {
				newTF.left = textfield_left;
			}

			// Deselect new text field
			newTF.selected = false;
			newTF.convertAreaObjectToPointObject();
		}
	}
}

function get_line_content(selection) {
	var lines = selection.lines;
	var out_lines = [];
	for (var i = 0; i < lines.length; i++) {
		out_lines.push(trim(lines[i].contents));
	}
	return out_lines;
}

function join(selections) {
	selections = selections.reverse();
	selections[0].contents = get_tf_contents(selections).join(
		pick_join_char(selections)
	);
	selections[0].convertPointObjectToAreaObject();

	for (var i = 1; i < selections.length; i++) {
		selections[i].remove();
	}
}

function pick_join_char(selections) {
	var min_width = selections[0].left;
	var max_width = selections[0].left;

	var max_height = selections[0].top;
	var min_height = selections[0].top;
	for (var i = 1; i < selections.length; i++) {
		max_width = Math.max(max_width, selections[i].left);
		min_width = Math.min(min_width, selections[i].left);

		max_height = Math.max(max_height, selections[i].top);
		min_height = Math.min(min_height, selections[i].top);
	}

	// alert(max_width+ ' '+ min_width+ ' : '+ max_height+' '+ min_height);

	if (Math.abs(max_width - min_width) > Math.abs(max_height - min_height)) {
		return " ";
	} else {
		return "\n";
	}
}

function get_tf_contents(selection) {
	var out_array = [];
	for (var i = 0; i < selection.length; i++) {
		out_array.push(selection[i].contents);
	}
	return out_array;
}

function trim(s) {
	return (s || "").replace(/^\s+|\s+$/g, "");
}
