// Runtime config for website2 static frontend.
(function () {
	const isFileProtocol = window.location.protocol === "file:";
	const defaultApiBase = isFileProtocol
		? "https://g-track-backend-94gv.onrender.com"
		: window.location.origin;

	window.GTRACK_API_BASE_URL = window.GTRACK_API_BASE_URL || defaultApiBase;

	// gtrack_dist app URL for role portal routing.
	window.GTRACK_DIST_URL = "./gtrack_dist/dist/index.html";
})();
