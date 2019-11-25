// $("#submit").click(function (event) {
// 	let data = $("#form").serialize();
// 	$.get("/replay", data, function(resp) {
// 		$("#visualizer").get(0).contentWindow.start(resp);
// 	});
// });

let transform = function(set) {
	if (set === null) {
		return "<p>null</p>";
	}
	if (!set.previous0 && !set.previous1) {
		return `<p>${set.fullRoundText}</p>`;
	}
	return `<div class="item">
		<div class="item-parent">
			<p>${set.fullRoundText}</p>
		</div>
		<div class="item-childrens">
			<div class="item-child">
				${transform(set.previous0)}
			</div>
			<div class="item-child">
				${transform(set.previous1)}
			</div>
		</div>
	</div>`;
}

let tournament = "the-zoo-the-bear-exhibit";
fetch("/tournament/" + tournament)
.then(data => data.json())
.then(data => {
	document.getElementById("wrapper").innerHTML = transform(data);
});