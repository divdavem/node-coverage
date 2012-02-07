var vm = require("vm");
var report = require("../lib/report");
var assert = require("assert");
var expectedCoverage = {
	"base.js" : {
		total : 3,
		visited : 3,
		conditions : 0,
		conditionsTrue : 0,
		conditionsFalse : 0,
		functions : 0,
		functionsCalled : 0
	},
	"longlines.js" : {
		total : 1,
		visited : 1,
		conditions : 0,
		conditionsTrue : 0,
		conditionsFalse : 0,
		functions : 0,
		functionsCalled : 0
	},
	"function.js" : {
		total : 4,
		visited : 4,
		conditions : 0,
		conditionsTrue : 0,
		conditionsFalse : 0,
		functions : 1,
		functionsCalled : 1
	},
	"if_no_block.js" : {
		total : 9,
		visited : 6,
		conditions : 2,
		conditionsTrue : 1,
		conditionsFalse : 1,
		functions : 2,
		functionsCalled : 1
	},
	"no_block.js" : {
		total : 8,
		visited : 5,
		conditions : 0,
		conditionsTrue : 0,
		conditionsFalse : 0,
		functions : 0,
		functionsCalled : 0
	},
	"label_continue.js" : {
		total : 2,
		visited : 2,
		conditions : 0,
		conditionsTrue : 0,
		conditionsFalse : 0,
		functions : 0,
		functionsCalled : 0
	},
	"cond_simple_if.js" : {
		total : 22,
		visited : 22,
		conditions : 9,
		conditionsTrue : 9,
		conditionsFalse : 0,
		functions : 3,
		functionsCalled : 3
	},
	"cond_simple_if_false.js" : {
		total : 24,
		visited : 15,
		conditions : 10,
		conditionsTrue : 1,
		conditionsFalse : 9,
		functions : 3,
		functionsCalled : 3
	},
	"function_object.js" : {
		total : 7,
		visited : 7,
		conditions : 0,
		conditionsTrue : 0,
		conditionsFalse : 0,
		functions : 4,
		functionsCalled : 4
	},
	"cond_decision_if.js" : {
		total : 17,
		visited : 15,
		conditions : 7,
		conditionsTrue : 5,
		conditionsFalse : 2,
		functions : 1,
		functionsCalled : 1
	},
	"cond_multiple_if.js" : {
		total : 14,
		visited : 11,
		conditions : 14,
		conditionsTrue : 7,
		conditionsFalse : 5,
		functions : 1,
		functionsCalled : 1
	},
	"cond_group_if.js" : {
		total : 4,
		visited : 2,
		conditions : 7,
		conditionsTrue : 3,
		conditionsFalse : 2,
		functions : 0,
		functionsCalled : 0
	},
	"if_else.js" : {
		total : 10,
		visited : 7,
		conditions : 6,
		conditionsTrue : 4,
		conditionsFalse : 1,
		functions : 1,
		functionsCalled : 1
	},
	"empty_function.js" : {
		total : 7,
		visited : 7,
		conditions : 0,
		conditionsTrue : 0,
		conditionsFalse : 0,
		functions : 4,
		functionsCalled : 3
	}
};

var compare = function (file, code) {
	//console.log(code);

	var serialized;
	var sandbox = {
		XMLHttpRequest : function () {
			this.open = function () {};
			this.setRequestHeader = function () {};
			this.send = function (data) {
				serialized = data;
			};
		},
		window : {}
	};
	vm.runInNewContext(code, sandbox, file);
	sandbox.$$_l.submit();

	var json = JSON.parse(serialized);

	var result = report.generateAll(json).files[file];
	var expected = expectedCoverage[file.substring(file.lastIndexOf("/") + 1)];
	assert.ok(expected, "Missing expected result for " + file);

	//console.log(result);

	assert.equal(result.total, expected.total, "total " + file + " got " + result.total);
	assert.equal(result.visited, expected.visited, "visited " + file + " got " + result.visited);

	assert.equal(result.conditions, expected.conditions, "conditions " + file + " got " + result.conditions);
	assert.equal(result.conditionsTrue, expected.conditionsTrue, "conditionsTrue " + file + " got " + result.conditionsTrue);
	assert.equal(result.conditionsFalse, expected.conditionsFalse, "conditionsFalse " + file + " got " + result.conditionsFalse);

	assert.equal(result.functions, expected.functions, "functions " + file + " got " + result.functions);
	assert.equal(result.functionsCalled, expected.functionsCalled, "functionsCalled " + file + " got " + result.functionsCalled);

	console.log("Test", file, "passed");
};

exports.compare = compare;