let tournament = "the-zoo-the-bear-exhibit";
let setid;
let gamenum;


let transform = function(set) {
	let child0 = set.previous0 === null ? "" : `<div class="item-child">${transform(set.previous0)}</div>`;
	let child1 = set.previous1 === null ? "" : `<div class="item-child">${transform(set.previous1)}</div>`;
	return `<div class="item">
		<div class="item-parent">
			<div class="set" data-id="${set.id}" data-totalgames="${set.score0 + set.score1}" data-title="${set.fullRoundText + ": " + set.tag0 + " vs " + set.tag1}">
				<div>${set.tag0}</div>
				<div>${set.score0}</div>
				<div>${set.tag1}</div>
				<div>${set.score1}</div>
			</div>
		</div>
		<div class="item-childrens">
			${child0}
			${child1}
		</div>
	</div>`;
}

function loadGame() {
	$("#gamenum").text(gamenum);
	$("#visualizer").get(0).contentWindow.location.reload(true);
	$.get("/replay", `filename=${tournament}/${setid}_Game${gamenum}.slp`, function(resp) {
		$("#visualizer").get(0).contentWindow.start(resp);
	});
}

$.get("/tournament/" + tournament, function(data) {
	$("#wrapper").html(transform(data));
	$(".set").click(function(event) {
		let target = $(event.currentTarget);
		let title = target.data("title");
		let totalgames = target.data("totalgames");
		setid = target.data("id");
		gamenum = 1;
		$("#title").text(title);
		let options = "";
		for (let i = 1; i <= totalgames; i++) {
			options += `<option value="${i}">Game ${i}</option>`
		}
		$("#select").html(options);
		loadGame();
		$("#modal").show();
	});
});
$("#close").click(function(event) {
	$("#modal").hide();
});
$("#select").change(function(event) {
	gamenum = $("#select").val();
	loadGame();
});