let tournament = "the-zoo-the-alligator-exhibit";
let setid;
let gamenum;

let transform = function(set) {
	let child0 = set.previous0 === null ? "" : `<div class="item-child">${transform(set.previous0)}</div>`;
	let child1 = set.previous1 === null ? "" : `<div class="item-child">${transform(set.previous1)}</div>`;
	let tag0 = `${set.tag0}`;
	let score0 = `${set.score0}`;
	let tag1 = `${set.tag1}`;
	let score1 = `${set.score1}`;
	if (set.score0 > set.score1)
	{
		score0 = `<b>${set.score0}</b>`;
		tag0 = `<b>${set.tag0}</b>`;
	}
	else if (set.score1 > set.score0)
	{
		score1 = `<b>${set.score1}</b>`;
		tag1 = `<b>${set.tag1}</b>`;
	}
	let sethtml = `<div class="set" data-id="${set.id}" data-totalgames="${set.score0 + set.score1}" data-title="${set.fullRoundText + ": " + set.tag0 + " vs " + set.tag1}">
		<div>${tag0}</div>
		<div>${score0}</div>
		<div>${tag1}</div>
		<div>${score1}</div>
	</div>`;
	if (!(set.previous0 === null && set.previous1 === null)) {
		sethtml = `<div class="item-parent">${sethtml}</div>`;
	}
	return `<div class="item">
		${sethtml}
		<div class="item-childrens">
			${child0}
			${child1}
		</div>
	</div>`;
}

function loadGame() {
	$("#gamenum").text(gamenum);
	$("#visualizer").on("load", function() {
		$.get("/replay", `filename=${tournament}/${setid}_Game${gamenum}.slp`, function(resp) {
			$("#visualizer").get(0).contentWindow.start(resp);
		})
	});
	$("#visualizer").get(0).contentWindow.location.reload(true);
}

function loadTournament() {
	$.get("/tournament-info/" + tournament, function(data) {
		$("#titlename").text(data.name);
		$("#titleimg").attr("src", data.img);
	});

	$.get("/tournament/" + tournament, function(data) {
		$("#wrapper").html(transform(data));
		$(".set").click(function(event) {
			let target = $(event.currentTarget);
			let title = target.data("title");
			let totalgames = target.data("totalgames");
			setid = target.data("id");
			gamenum = 1;
			$("#gametitle").text(title);
			let options = "";
			for (let i = 1; i <= totalgames; i++) {
				options += `<option value="${i}">Game ${i}</option>`
			}
			$("#select").html(options);
			loadGame();
			$("#modal").show();
		});
	});
}

$("#close").click(function(event) {
	$("#modal").hide();
});
$("#select").change(function(event) {
	gamenum = $("#select").val();
	loadGame();
});
$("#chooseyourtournament").change(function(event) {
	tournament = $("#chooseyourtournament").val();
	loadTournament();
});

loadTournament();