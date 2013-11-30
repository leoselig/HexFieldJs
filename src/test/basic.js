var jsObjective = require('../main/main.js');
var assert = require('assert');
var sinon = require('sinon');
var should = require('should');

describe('Basic', function() {
	"use strict";

	var Base, initSpy, methodSpy;

	beforeEach(function() {
		initSpy = sinon.spy();
		methodSpy = sinon.spy();

		Base = jsObjective.Object.extend({
			init:         initSpy,
			publicMethod: methodSpy
		}, {

		});
	});

	describe('Simple objects', function() {

		it('creates objects of the correct type', function() {
			var base = new Base();
			assert(base.should.be.instanceOf(jsObjective.Object));
			assert(base.should.be.instanceOf(Base));
		});

		it('should call init() when creating an instance', function() {
			var base = new Base();
			assert(initSpy.calledOnce);
		});

		it('should pass arguments to init()', function() {
			var base = new Base(123, 456);
			assert(initSpy.calledWith(123, 456));
		});
	});

	describe('Inheritance', function() {
		var Child;
		var childInitSpy;

		beforeEach(function() {
			childInitSpy = sinon.spy();

			Child = Base.extend({
				init:         childInitSpy,
				publicMethod: function() {
					this.callSuper('publicMethod', arguments);
				}
			}, {

			});
		});

		it('sets super references', function() {
			var child = new Child();
			assert(should(Base.__super__).equal(jsObjective.Object.prototype));
			assert(should(Child.__super__).equal(Base.prototype));
			assert(should(child).be.instanceOf(Child));
			assert(should(child).be.instanceOf(Base));
			assert(should(child).be.instanceOf(jsObjective.Object));
		});

		it('calls super method', function() {
			var child = new Child();
			assert(!methodSpy.calledOnce);
			child.publicMethod();
			assert(methodSpy.calledOnce);
		});
	});
})