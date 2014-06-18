function getCost(row) {
	for(var i = 0; i < row.cells.length; i++) {
		if(row.cells[i].className == "cost_col") {
			return parseInt(row.cells[i].innerHTML);
		}
	}
	return 0;
}

function buy(tableName, rowNum) {
	var wallet = document.getElementById("counter");
	var points = parseInt(wallet.innerText);
	var options = document.getElementById(tableName).getElementsByTagName("tr");
	var cost = getCost(options[rowNum]);
	
	if(points >= cost) {
		//refund other purchases in same chain
		for(var i = 0; i < options.length; i++) {
			if(options[i].className == "purchased") {
				points = points + getCost(options[i]);;
			}
			options[i].className = "";
		}
		
		points = points - cost;
		options[rowNum].className = "purchased";
	}
	
	wallet.innerText = points.toString();
}

function refund(tableName, rowNum) {
	var wallet = document.getElementById("counter");
	var points = parseInt(wallet.innerText);
	var row = document.getElementById(tableName).getElementsByTagName("tr")[rowNum];
	if(row.className == "purchased") {
		points = points + getCost(row);
	}
	row.className = "";
	wallet.innerText = points.toString();
}

function slidePanel(id) {
	var panel = document.getElementById(id);
	if(panel.className == "infocus") {
		panel.className = "nodisplay";
	} else {
		panel.className = "infocus";
	}
}
