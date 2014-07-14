function getCost(row) {
	for(var i = 0; i < row.cells.length; i++) {
		if(row.cells[i].className == "cost_col") {
			return parseInt(row.cells[i].innerHTML);
		}
	}
	return 0;
}

function getBonus(row) {
	for(var i = 0; i < row.cells.length; i++) {
		if(row.cells[i].className == "bonus_col") {
			return parseInt(row.cells[i].innerHTML);
		}
	}
	return 0;
}

function buy(tableName, rowNum, method, noclear) {
	var summary = document.getElementById("summary");
	var wallet = document.getElementById("counter");
	var points = parseInt(wallet.innerText);
	var options = document.getElementById(tableName).getElementsByTagName("tr");
	var cost = getCost(options[rowNum]);
	var bonus = getBonus(options[rowNum]);
	
	if(points >= cost) {
		if(noclear != 0) {
			//refund other purchases in same chain
			for(var i = 0; i < options.length; i++) {
				points = refund(tableName, i);
			}
		}		
		
		//purchase option
		if(method == "roll") {
			options[rowNum].className = "rolled";
			points = points + bonus;
		} else {
			options[rowNum].className = "purchased";
		}
		points = points - cost;
		summary.innerText = summary.innerText + tableName + " " + rowNum.toString() + "|"; //update summary
	}
	
	wallet.innerText = points.toString(); //update counter
	return points;
}

function refund(tableName, rowNum, method) {
	var summary = document.getElementById("summary");
	var wallet = document.getElementById("counter");
	var points = parseInt(wallet.innerText);
	var row = document.getElementById(tableName).getElementsByTagName("tr")[rowNum];
	if(is_taken(tableName, rowNum)) {
		points = points + getCost(row);
		if(row.className == "rolled") {
			points = points - getBonus(row);
		}
		
		//update summary
		var sumText = summary.innerText;
		var key = tableName + " " + rowNum;
		var key_start = sumText.indexOf(key);
		//grab everything before and after the refunded choice
		summary.innerText = sumText.slice(0, key_start) + sumText.slice(key_start + key.length + 1);
	}
	row.className = "";
	wallet.innerText = points.toString();
	
	return points;
}

function slidePanel(id) {
	var panel = document.getElementById(id);
	if(panel.className == "infocus") {
		panel.className = "nodisplay";
	} else {
		panel.className = "infocus";
	}
}

function roll(dice, sides) {
	var total = 0;
	for(var i=0; i<dice; i++) {
		total = total + Math.floor(Math.random()*sides)+1
	}
	return total;
}

function roll_choice(button, tableName, max_rolls) {
	var confirmed = window.confirm("Are you sure you want to take a random option? This may not be reversible.");
	if(!max_rolls) {
		max_rolls = 999;
	}
	if(confirmed == true) {
		var btn = document.getElementById(button);
		var wallet = document.getElementById("counter");
		var points = parseInt(wallet.innerText);
		var choice = roll(1,12) - 1;
		var choice = 1;
		while(is_taken(tableName, choice)) {
			choice = roll(1,12) - 1;
		}
		buy(tableName,choice,"roll",0);
	}
	if(count_taken(tableName) >= max_rolls) {
		points = 0;
		btn.disabled = "true";
		disable_tbl(tableName,1);
	}
}

function disable_tbl(tableName, allowPurchased) {
	var rows = document.getElementById(tableName).getElementsByTagName("tr");
	var wallet = document.getElementById("counter");
	for(var i=0; i<rows.length; i++) {
		if(!allowPurchased || rows[i].className != "purchased") {
			disable_row(tableName, i);
		}
	}
}

function disable_row(tableName, rowNum) {
	var row = document.getElementById(tableName).getElementsByTagName("tr")[rowNum];
	switch(row.className) {
		case "purchased":
			row.className = "row_disabled_purchased";
			break;
		case "rolled":
			break;
		default:
			row.className = "row_disabled";
	}
}

function count_taken(tableName) {
	var rows = document.getElementById(tableName).getElementsByTagName("tr");
	var count = 0;
	for(var i=0; i<rows.length; i++) {
		if(is_taken(tableName, i)) {
			count = count + 1;
		}
	}
	return count;
}

function enable_row(tableName, rowNum) {
	var row = document.getElementById(tableName).getElementsByTagName("tr")[rowNum];	
	if(row.className == "row_disabled_purchased") {
		row.className = "purchased";	
	} else if(row.className == "row_disabled") {
		row.className = "";
	}
}

function gen_summary() {
	//tableName rowNum|
	var sumText = document.getElementById("summary").innerText;
	var outText = "";
	var str_tok = sumText.split("|");
	var cur_tok = "";
	var row;
	var baubles = 100;
	for(var i=0; i<str_tok.length-1; i++) {	
		cur_tok = str_tok[i].split(" ");
		row = document.getElementById(cur_tok[0]).getElementsByTagName("tr")[cur_tok[1]];
		baubles = baubles - getCost(row);
		if(row.className == "rolled") {
			baubles = baubles + getBonus(row);
			outText = outText + "[" + baubles + "] " + "Rolled: ";
		} else {
			outText = outText + "[" + baubles + "] ";
		}
		for(var j=0; j<row.cells.length; j++) {
			if(row.cells[j].className == "name_col") {
				outText = outText + row.cells[j].innerHTML + "\n"
			}
		}
	}
	
	document.getElementById("p_summary").innerText = outText;
}

function take_comp(rowNum) {
	var tableName = 'complic_tbl';
	var complications = document.getElementById(tableName).getElementsByTagName("tr");
	//count # of complications taken
	var count = count_taken(tableName);
	
	switch(count) {
		case 0:
			buy(tableName,rowNum);
			break;
		case 1:
			buy(tableName, rowNum, "choose", 0);	
			//disable other complications
			for(i=0; i<complications.length; i++) {
				if(!is_taken(tableName, i)) {
					disable_row(tableName,i);
				}
			}
			document.getElementById("btnRoll").disabled = true;
			break;
		default:
			break;
	}
}

function revoke_comp(rowNum) {
	var tableName = 'complic_tbl';
	refund(tableName, rowNum);
	
	//ensure other complications are enabled
	var complications = document.getElementById(tableName).getElementsByTagName("tr");
	var count=0;
	for(i=0; i<complications.length; i++) {
		enable_row(tableName,i);
	}
	
	//enable roll button if appropriate
	count_taken(tableName);
	if(count < 2) {
		document.getElementById('btnRoll').disabled = false;
	}
	
}

function is_taken(tableName, rowNum) {
	var row = document.getElementById(tableName).getElementsByTagName("tr")[rowNum];
	return (row.className == "purchased" || row.className == "rolled");
	
}