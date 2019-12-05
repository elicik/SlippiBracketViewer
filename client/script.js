// $("#submit").click(function (event) {
// 	let data = $("#form").serialize();
// 	$.get("/replay", data, function(resp) {
// 		$("#visualizer").get(0).contentWindow.start(resp);
// 	});
// });

let transform = function(set) {
	if (!set.previous0 && !set.previous1) {
		return `<p>${set.fullRoundText}</p>`;
	}
	let child0 = set.previous0 === null ? "" : `<div class="item-child">${transform(set.previous0)}</div>`;
	let child1 = set.previous1 === null ? "" : `<div class="item-child">${transform(set.previous1)}</div>`;
	return `<div class="item">
		<div class="item-parent">
			<p>${set.fullRoundText}</p>
		</div>
		<div class="item-childrens">
			${child0}
			${child1}
		</div>
	</div>`;
}

let tournament = "the-zoo-the-bear-exhibit";
fetch("/tournament/" + tournament)
.then(data => data.json())
.then(data => {
	document.getElementById("wrapper").innerHTML = transform(data);
});