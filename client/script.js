$("#submit").click(function (event) {
	let data = $("#form").serialize();
	$.get("/replay", data, function(resp) {
		$("#visualizer").get(0).contentWindow.start(resp);
	});
});