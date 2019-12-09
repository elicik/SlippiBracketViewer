let tournament = "the-zoo-the-bear-exhibit";
let gameNum = 1;

let transform = function(set) {
	let child0 = set.previous0 === null ? "" : `<div class="item-child">${transform(set.previous0)}</div>`;
	let child1 = set.previous1 === null ? "" : `<div class="item-child">${transform(set.previous1)}</div>`;
	return `<div class="item">
		<div class="item-parent">
			<div class="set" data-id="${set.id}" data-title="${set.fullRoundText + ": " + set.tag0 + " vs " + set.tag1}">
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

function loadGame(id) {
	$("#visualizer").get(0).contentWindow.location.reload(true);
	$.get("/replay", `filename=${tournament}/${id}_Game${gameNum}.slp`, function(resp) {
		$("#visualizer").get(0).contentWindow.start(resp);
	});
}

$.get("/tournament/" + tournament, function(data) {
	$("#wrapper").html(transform(data));
	$(".set").click(function(event) {
		let target = $(event.currentTarget);
		let id = target.data("id");
		let title = target.data("title");
		console.log(title);
		gameNum = 1;
		loadGame(id);
		$("#modal").show();
	});
});
$("#close").click(function(event) {
	$("#modal").hide();
});