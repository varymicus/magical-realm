function getCost(row) {
	for(var i = 0; i < row.cells.length; i++) {
		if(row.cells[i].className == "cost_col") {
			return parseInt(row.cells[i].innerHTML);
		}
	}
	return 0;
}

function buy(tableName, rowNum) {
	var summary = document.getElementById("summary");
	var wallet = document.getElementById("counter");
	var points = parseInt(wallet.innerText);
	var options = document.getElementById(tableName).getElementsByTagName("tr");
	var cost = getCost(options[rowNum]);
	
	if(points >= cost) {
		//refund other purchases in same chain
		for(var i = 0; i < options.length; i++) {
			points = refund(tableName, i);
		}
		
		//purchase option
		points = points - cost;
		options[rowNum].className = "purchased";
		summary.innerText = summary.innerText + tableName + " " + rowNum.toString() + "|"; //update summary
	}
	
	wallet.innerText = points.toString(); //update counter
	return points;
}

function refund(tableName, rowNum) {
	var summary = document.getElementById("summary");
	var wallet = document.getElementById("counter");
	var points = parseInt(wallet.innerText);
	var row = document.getElementById(tableName).getElementsByTagName("tr")[rowNum];
	if(row.className == "purchased") {
		points = points + getCost(row);
		
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

function roll_choice(button, table, bonus) {
	var confirmed = window.confirm("Are you sure you want to take a random option? This may not be reversible.");
	if(confirmed == true) {
		var btn = document.getElementById(button);
		var wallet = document.getElementById("counter");
		var points = parseInt(wallet.innerText);
		var choice = roll(1,12) - 1;
		points = buy(table,choice);
		points = points + bonus;
		wallet.innerText = points.toString();
		btn.disabled = true;
		disable_tbl('complic_tbl');
	}
}

function disable_tbl(table) {
	var rows = document.getElementById(table).getElementsByTagName("tr");
	var wallet = document.getElementById("counter");
	for(var i=0; i<rows.length; i++) {
		disable_row(table, i);
	}
}

function disable_row(table, rowNum) {
	var row = document.getElementById(table).getElementsByTagName("tr")[rowNum];
	if(row.className == "purchased") {
		row.className = "row_disabled_purchased";
	} else {
		row.className = "row_disabled";
	}
}

function gen_summary() {
	var sumText = document.getElementById("summary").innerText;
	var outText = "";
	var str_tok = sumText.split("|");
	var cur_tok = "";
	var row;
	for(var i=0; i<str_tok.length-1; i++) {	
		cur_tok = str_tok[i].split(" ");
		row = document.getElementById(cur_tok[0]).getElementsByTagName("tr")[cur_tok[1]];
		for(var j=0; j<row.cells.length; j++) {
			if(row.cells[j].className == "name_col") {
				outText = outText + row.cells[j].innerHTML + "\n"
			}
		}
	}
	
	document.getElementById("p_summary").innerText = outText;
}
