var express = require("express"), fs = require("fs");

var report = require("../report");
var instrument = require("../instrument");
var common = require("./common");
var fileSystem = require("../fileSystem");

var sourceCodeCache = {
	code : {},
	highlight : {}
};

exports.start = function (docRoot, port, adminRoot, adminPort, coverageOptions, onClose) {
	var app = express.createServer();

	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({
		secret : "theres not much secrecy here"
	}));

	app.get("/*.js", function (req, res) {
		var url = req.path;
		var instrumentedCode = sourceCodeCache[url];

		if (coverageOptions.verbose) {
			console.log("Requesting", url);
		}

		var headers = {
			"Content-Type" : "text/javascript"
		};
		if (coverageOptions["exit-on-submit"]) {
			headers["Connection"] = "close";
		}

		if (instrumentedCode) {
			res.send(instrumentedCode.clientCode, headers);
		} else {
			fs.readFile(docRoot + url, "utf-8", function (err, content) {
				if (err) {
					res.send("Error while reading " + url + err, 500);
				} else {
					if (coverageOptions.verbose) {
						console.log("Instrumenting", docRoot + url);
					}
					var code = instrument(url, content, coverageOptions);
					sourceCodeCache.code[url] = code.clientCode;

					if (!coverageOptions.doHighlight) {
						sourceCodeCache.highlight[url] = code.highlightedCode;
						req.session.highlightInMemory = true;
					}

					res.send(code.clientCode, headers);
				}
			});
		}
	});

	app.post("/node-coverage-store", function (req, res) {
		mergeCodeFromMemory(req.body.code, sourceCodeCache.highlight);

		common.saveCoverage(req.body, adminRoot, function (error) {
			if (error) {
				res.send(error, 500);
			} else {
				res.send(200, coverageOptions["exit-on-submit"] ? {"Connection": "close"} : null);
			}

			if (coverageOptions["exit-on-submit"]) {
				process.nextTick(function () {
					server.close(onClose);
				});
			}
		});
	});

	app.post("/*", function (req, res, next) {
		res.sendfile(docRoot + req.path);
	});

	app.use(express.static(docRoot));

	var server = app.listen(port);
	return server;
};

function mergeCodeFromMemory (inside, from) {
	if (!inside) {
		return;
	}

	for (var fileName in inside) {
		if (!inside[fileName].src) {
			inside[fileName] = from[fileName];
		}
	}
}