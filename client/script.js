$("#submit").click(function (event) {
	console.log(event);
	let data = $("#form").serialize();
	console.log(data);
	$.get("/replay", data, function(resp) {
		console.log(resp);
		$("#visualizer").get(0).contentWindow.start(resp);
	});
});