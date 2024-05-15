const fs = require('fs');
let jsonLog = [];
let activeIndexList = [];
let fileContent = fs.readFileSync("C:\\Users\\Praveen\\Downloads\\logFileName.log", 'utf8');
if(fileContent){
	let data = fileContent.split("\n");
	if(data.length > 0){
		let lineNo = 0;
		for(lineNo;lineNo<data.length;lineNo++){
			let line = data[lineNo]
			if(line.indexOf("METHOD_ENTRY") > -1 || line.indexOf("CODE_UNIT_STARTED") > -1 || line.indexOf("CONSTRUCTOR_ENTRY") > -1){
				handleMethodEntry(line);
			}else if(line.indexOf("METHOD_EXIT") > -1 || line.indexOf("CODE_UNIT_FINISHED") > -1 || line.indexOf("CONSTRUCTOR_EXIT") > -1){
				handleMethodExit(line);
			}else{
				pushToJson(line);
			}
			/* console.log(line);
			console.log("Line No: "+lineNo);
			console.log("activeIndexList: "+activeIndexList);
			console.log("*****************************"); */
		};
	}
}
function handleMethodEntry(line){
	let newList = [];
	newList.push(line);
	let pushedIndex = pushToJson(newList);
	if(pushedIndex){
		activeIndexList.push(pushedIndex);	
	}else{
		activeIndexList.push(jsonLog.length-1);
	}
}
function handleMethodExit(line){
	pushToJson(line);
	if(activeIndexList.length > 0){
		activeIndexList.pop();
	}
}
function pushToJson(line) {
    if (activeIndexList.length > 0) {
        let target = jsonLog;
        for (let i = 0; i < activeIndexList.length - 1; i++) {
            if (!target[activeIndexList[i]]) {
                target[activeIndexList[i]] = [];
            }
            target = target[activeIndexList[i]];
        }
        if (!Array.isArray(target[activeIndexList[activeIndexList.length - 1]])) {
            target[activeIndexList[activeIndexList.length - 1]] = [];
        }
        target[activeIndexList[activeIndexList.length - 1]].push(line);
		return (target[activeIndexList])?target[activeIndexList].length-1:target.length-1;
    }else{
		jsonLog.push(line);
		return null;
	}
}

fs.writeFileSync('data3.json',JSON.stringify(jsonLog));