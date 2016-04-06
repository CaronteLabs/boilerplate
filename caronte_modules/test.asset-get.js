/**
 * @license AngularJS v1.2.28
 * (c) 2015-2016 Madtrip, Inc. http://madtrip.co
 * License: MIT
 * Author: Daniele Tomasi (MorrisDa);
 */ 

 //replace fs.exist which has been deprecated

var jscache = require('./gulpcache.js');
var assert  = require('assert');

describe("Cache", function() {

	
	describe("get(table | string, row | string)", function() {
		describe("bad call", function() {
			it("should return false, missing parameters", function() {
				assert.ok(!(new jscache().get()));
				return;
			});
		});
		
		describe("empty", function() {
			it("should return null, not existing", function() {
				assert.equal(null, new jscache().get('table_7', 'row_1'));
				return;
			});
		});
	});

	describe("getOrSet(table | string, row | string, data (optional) | object )", function() {
		describe("bad call", function() {
			it("should return false, missing parameters", function() {
				assert.equal(new jscache().getOrSet(), false);
				return;
			});
		});

		describe("empty", function() {
			it("should return empty object", function() {
				assert.deepEqual(new Object(), new jscache().getOrSet('table_1', 'row_1'));
				assert.deepEqual({}, new jscache().get('table_1', 'row_1'));
				return;
			});
		});

		describe("empty", function() {
			it("should return empty object", function() {
				assert.deepEqual(new jscache().getOrSet('table_9', 'row_9', {enkilet: true}), {enkilet: true});
				assert.deepEqual({enkilet: true}, new jscache().get('table_9', 'row_9'));
				return;
			});
		});
	});

	describe("Save(table | string, row | string, data | object)", function() {
		


		describe("succesfull, not merging", function() {
			it("should return the saved data", function() {
				assert.deepEqual(new jscache().save("table_4", "row_1", {enkilet: true}), {enkilet: true});
				return;
			});
		});

		describe("succesfull, merging with previous data", function() {
			it("should return the saved data", function() {
				assert.deepEqual(new jscache().save("table_4", "row_1", {a:1}, {merge:true}), {enkilet: true, a:1});
				return;
			});
		});

		describe("succesfull, not merging with previous data", function() {
			it("should return the saved data", function() {
				assert.deepEqual(new jscache().save("table_4", "row_1", {a:1, b: {c: {d: 3}}}, {merge:false}), {a:1, b: {c: {d: 3}}});
				return;
			});
		});

		describe("succesfull, merging with previous data", function() {
			it("should return the saved data with old keys", function() {
				assert.deepEqual(new jscache().save("table_4", "row_1", {b: {c: {d: 2}}, r: true}, {merge:true}), {a:1, b: {c: {d: 2}}, r: true});
				return;
			});
		});

	});



});