const fs = require('fs');
let jsonLog = [];
let fileContent = readLogFile("C:\\Users\\Praveen\\Downloads\\apex-07L5E00000Z0Uk9UAF.log");
let activeMethodIndex = [];
let activeConstructorIndex = [];
let activeIndex_M = -1;
let activeIndex_C = -1;
let lineNo = 0;
let activeOperation = [];
function readLogFile(filepath) {
    let fileContent = "";
    try {
        fileContent = fs.readFileSync(filepath, 'utf8');
    } catch (err) {
        console.error('Error reading the file:', err);
    }
    return fileContent
}
function handleMethodEntry(line){
	let className,methodName;
	if(line.split("|").length == 5){
		let temp = line.split("|")[4];
		className = (temp.split(".") && temp.split(".")[0])?temp.split(".")[0]:"";
		methodName = (temp.split(".") && temp.split(".")[1])?temp.split(".")[1]:"";
	}else if(line.split("|").length == 4){
		let temp = line.split("|")[3];
		className = (temp.split(".") && temp.split(".")[0])?temp.split(".")[0]:"";
		methodName = (temp.split(".") && temp.split(".")[1])?temp.split(".")[1]:"";
	}
	if(className || methodName){
		jsonLog.push({
			"METHOD_ENTRY":{
				"className":className,
				"methodName":methodName,
				"startLine":lineNo,
				"entryApexLogLine":line.split("|")[2],
				"methodStatus":"Open",
				"lines":[]
			}
		});
		activeIndex_M = jsonLog.length-1;
		activeMethodIndex.push(jsonLog.length-1);
	}
}
function handleMethodExit(line){
	activeMethodIndex.pop();
	activeIndex_M--;
	for(let j=jsonLog.length-1;j>-1;j--){
		if(jsonLog[j]["METHOD_ENTRY"] && jsonLog[j]["METHOD_ENTRY"]["methodStatus"] ==="Open"){
			jsonLog[j]["METHOD_ENTRY"]["endLine"] = lineNo;
			jsonLog[j]["METHOD_ENTRY"]["entryApexLogLine"]=line.split("|")[2],
			jsonLog[j]["METHOD_ENTRY"]["methodStatus"] = "Closed";
			break;
		}
	}
}
function handleConstructorEntry(line){
	let constructorName;
	if(line.split("|").length==6){
		constructorName = line.split("|")[5];
	}
	if(constructorName){
		jsonLog.push({
			"CONSTRUCTOR_ENTRY":{
				"constructorName":constructorName,
				"startLine":lineNo,
				"entryApexLogLine":line.split("|")[2],
				"methodStatus":"Open",
				"lines":[]
			}
		});
		activeIndex_C = jsonLog.length-1;
		activeConstructorIndex.push(activeIndex_C);
	}
}
function handleConstructorExit(line){
	activeConstructorIndex.pop();
	activeIndex_C--;
	for(let j=jsonLog.length-1;j>-1;j--){
		if(jsonLog[j]["CONSTRUCTOR_ENTRY"] && jsonLog[j]["CONSTRUCTOR_ENTRY"]["methodStatus"] ==="Open"){
			jsonLog[j]["CONSTRUCTOR_ENTRY"]["endLine"] = lineNo;
			jsonLog[j]["CONSTRUCTOR_ENTRY"]["entryApexLogLine"]=line.split("|")[2],
			jsonLog[j]["CONSTRUCTOR_ENTRY"]["methodStatus"] = "Closed";
			break;
		}
	}
}
if(fileContent){
    let data = fileContent.split("\n");
    data.forEach(line=>{
		if(line.indexOf("USER_INFO") > -1){
			jsonLog.push({
				"USER_INFO":{
					"Username":line.split("|")[4],
					"Timezone":line.split("|")[5]
				}
			});
		}else if(line.indexOf("METHOD_ENTRY") > -1){
			handleMethodEntry(line);
			activeOperation.push("method");
		}else if(line.indexOf("METHOD_EXIT") > -1){
			handleMethodExit(line);
			activeOperation.pop();
		}else if(line.indexOf("CONSTRUCTOR_ENTRY") > -1){
			handleConstructorEntry(line);
			activeOperation.push("constructor");
		}else if(line.indexOf("CONSTRUCTOR_EXIT") > -1){
			handleConstructorExit(line);
			activeOperation.pop();
		}else if(activeOperation.length-1 >=0 && activeOperation[activeOperation.length-1] == "method" && activeMethodIndex.length > 0 && jsonLog.length >= activeMethodIndex[activeMethodIndex.length-1] && jsonLog[activeMethodIndex[activeMethodIndex.length-1]] && jsonLog[activeMethodIndex[activeMethodIndex.length-1]]["METHOD_ENTRY"] && jsonLog[activeMethodIndex[activeMethodIndex.length-1]]["METHOD_ENTRY"]["methodStatus"]==="Open"){
			jsonLog[activeMethodIndex[activeMethodIndex.length-1]]["METHOD_ENTRY"]["lines"].push({
				"logLineNo":lineNo,
				"log":line
			});
		}else if(activeOperation.length-1 >=0 && activeOperation[activeOperation.length-1] == "constructor" && activeConstructorIndex.length > 0 && jsonLog.length >= activeConstructorIndex[activeConstructorIndex.length-1] && jsonLog[activeConstructorIndex[activeConstructorIndex.length-1]] && jsonLog[activeConstructorIndex[activeConstructorIndex.length-1]]["METHOD_ENTRY"] && jsonLog[activeConstructorIndex[activeConstructorIndex.length-1]]["METHOD_ENTRY"]["methodStatus"]==="Open"){
			jsonLog[activeConstructorIndex[activeConstructorIndex.length-1]]["METHOD_ENTRY"]["lines"].push({
				"logLineNo":lineNo,
				"log":line
			});
		}else{
			jsonLog.push({
				"GEN":line
			})
		}
		lineNo++;
    });
}
fs.writeFileSync('data2.json',JSON.stringify(jsonLog));