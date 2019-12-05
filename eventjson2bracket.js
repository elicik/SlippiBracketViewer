// retrieve json object from query
var eventJSON; // this is our json object parsed?
var setlist = eventJSON["data"]["event"]["sets"]["nodes"];
var setcount = setlist.length;
// find highest positive round number - this is grands
var maxround = 0;
var finalset = {};
for (var i = 0; i < setcount; i++)
{
	if (setlist[i]["round"] > maxround)
	{
		maxround = setlist[i]["round"];
		finalset = setlist[i];
	}
}
var revisedBracketStructure = new Array(setcount);
var bracketMaker = function(set) {
	var prereq1 = setlist.filter(obj => obj["id"] === parseInt(set["slots"][0]["prereqId"]));
	var prereq2 = setlist.filter(obj => obj["id"] === parseInt(set["slots"][1]["prereqId"]));
	var setobject = {
		identifier: set["identifier"],
		round: set["round"],
		p1name: set["slots"][0]["entrants"]["name"],
		p1score: parseInt(set["slots"][0]["standing"]["stats"]["score"]["value"]),
		p1prereq: prereq1[0]["identifier"],
		p2name: set["slots"][1]["entrants"]["name"],
		p2score: parseInt(set["slots"][1]["standing"]["stats"]["score"]["value"]),
		p2prereq: prereq2[0]["identifier"]
	};
	revisedBracketStructure.push(setobject);
	bracketMaker(prereq1);
	bracketMaker(prereq2);
}
bracketMaker(finalset);