function getCost(row) {
    for (var i = 0; i < row.cells.length; i++) {
        if(row.cells[i].className == "cost_col") {
            return parseInt(row.cells[i].innerHTML);
        }
    }
    return 0;
}

function getBonus(row) {
    for (var i = 0; i < row.cells.length; i++) {
        if(row.cells[i].className == "bonus_col") {
            return parseInt(row.cells[i].innerHTML);
        }
    }
    return 0;
}

function buy(tableName, rowNum, method, noclear) {
    var summary = document.getElementById("summary");
    var wallet = document.getElementById("counter");
    var points = parseInt(wallet.innerHTML);
    var options = document.getElementById(tableName).getElementsByTagName("tr");
    var cost = getCost(options[rowNum]);
    var bonus = getBonus(options[rowNum]);
    
    if(points >= cost) {
        if(noclear != 1) {
            //refund other purchases in same chain
            for (var i = 0; i < options.length; i++) {
                points = refund(tableName, i);
            }
        }    
        
        //purchase option
        if(method == "roll") {
            options[rowNum].className = "rolled";
            points = points + bonus;
        } else {
            if(tableName == "artifact") {
                points = points + bonus;
            }
            options[rowNum].className = "purchased";
        }
        points = points - cost;
        summary.innerHTML = summary.innerHTML + tableName + " " + rowNum.toString() + "|"; //update summary
    }
    
    wallet.innerHTML = points.toString(); //update counter
    return points;
}

function refund(tableName, rowNum) {
    var summary = document.getElementById("summary");
    var wallet = document.getElementById("counter");
    var points = parseInt(wallet.innerHTML);
    var row = document.getElementById(tableName).getElementsByTagName("tr")[rowNum];
    if(is_taken(tableName, rowNum)) {
        points = points + getCost(row);
        
        //update summary
        var sumText = summary.innerHTML;
        var key = tableName + " " + rowNum;
        var key_start = sumText.indexOf(key);
        //grab everything before and after the refunded choice
        summary.innerHTML = sumText.slice(0, key_start) + sumText.slice(key_start + key.length + 1);
    }
    row.className = "";
    wallet.innerHTML = points.toString();
    
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
    for (var i=0; i<dice; i++) {
        total = total + Math.floor(Math.random()*sides)+1;
    }
    return total;
}

function roll_choice(tableName) {
    var confirmed = window.confirm("Are you sure you want to take a random option? This may not be reversible.");
    if(confirmed === true) {
        var choice = roll(1,12) - 1;
        while(is_taken(tableName, choice)) {
            choice = roll(1,12) - 1;
        }
        buy(tableName,choice,"roll",1);
    }
}

function gen_summary() {
    //tableName rowNum|
    var sumText = document.getElementById("summary").innerHTML;
    var outText = "";
    var str_tok = sumText.split("|");
    var cur_tok = "";
    var row;
    var baubles = 100;
    for (var i=0; i<str_tok.length-1; i++) {    
        cur_tok = str_tok[i].split(" ");
        row = document.getElementById(cur_tok[0]).getElementsByTagName("tr")[cur_tok[1]];
        baubles = baubles - getCost(row);
        if(row.className == "rolled") {
            baubles = baubles + getBonus(row);
            outText = outText + "[" + baubles + "] " + "Rolled: ";
        } else {
            outText = outText + "[" + baubles + "] ";
        }
        for (var j=0; j<row.cells.length; j++) {
            if(row.cells[j].className == "name_col") {
                outText = outText + row.cells[j].innerHTML + "<br>";
            }
        }
    }
    
    document.getElementById("p_summary").innerHTML = outText;
}

function is_taken(tableName, rowNum) {
    var row = document.getElementById(tableName).getElementsByTagName("tr")[rowNum];
    return (row.className == "purchased" || row.className == "rolled");
    
}