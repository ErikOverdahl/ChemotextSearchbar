function simpleSearch(){
	if (input.value == "") return;

	$(displayText).text("");
	$("#results").hide();
	$("#show-subterms").hide();
	showLoader();

	queryNeo4j(getMentionsPayload(input.value), simpleSearchOnSuccess);
}

function simpleSearchOnSuccess(data){
	var results = readResults(data);
	showResult(results, input.value);
}

function queryNeo4j(payload,successFunc){
	console.log(payload);
	$.ajax({
		url: "http://chemotext.mml.unc.edu:7474/db/data/transaction/commit",
		accepts: "application/json; charset=UTF-8",	
		dataType:"json",
		contentType:"application/json",
		data: payload,
		type:"POST",
		success:function(data,xhr,status){ successFunc(data); },
		error:function(xhr,err,msg){
			console.log(xhr);
			console.log(err+": "+msg);
			$("#loader").hide();
			$(displayText).text("Connection to Neo4j Database rejected");
		}
	});
}

function getMentionsPayload(name, type){
	var typeFilter = getQueryTypeFilter(type);
	return JSON.stringify({
		"statements" : [{
			// match Terms with the name 'name' that are mentioned by an 'article' that mentions a 'term'
			"statement": "MATCH (:Term{name:{name}})-[:MENTIONS]-(article)-[:MENTIONS]-(term"+typeFilter+") " +
				"RETURN term, collect(article) as articleList " +	//return each term and its list of articles
				"ORDER BY size(articleList) DESC", 	//sorted by number of articles
			"parameters" : {"name": name, "type": type}
		}]
	});
}
