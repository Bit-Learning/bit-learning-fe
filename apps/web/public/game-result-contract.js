(function () {
	function emitGameResult(payload) {
		if (!window.parent || window.parent === window) return;
		window.parent.postMessage(
			{
				type: "GAME_RESULT",
				attemptType: payload.attemptType || "STANDARD_HTML",
				rawScore: Number(payload.rawScore || 0),
				maxRawScore: Number(payload.maxRawScore || 100),
				duration:
					typeof payload.duration === "number" ? payload.duration : undefined,
				completed: payload.completed !== false,
				metrics:
					payload.metrics && typeof payload.metrics === "object"
						? payload.metrics
						: undefined,
			},
			"*",
		);
	}

	window.BitLearningGame = Object.freeze({
		emitGameResult,
	});
})();
