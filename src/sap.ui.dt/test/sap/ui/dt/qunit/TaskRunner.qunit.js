/*global QUnit*/

sap.ui.define([
	"sap/ui/dt/TaskRunner",
	"sap/ui/dt/TaskManager",
	"sap/ui/thirdparty/sinon-4"

], function (
	TaskRunner,
	TaskManager,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Instantiation TaskRunner", {
		beforeEach: function () {
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("must contain a TaskManager", function (assert) {
			assert.throws(function () {
				// eslint-disable-next-line no-new
				new TaskRunner();
			}, /sap.ui.dt.TaskRunner: TaskManager required/,
			"TaskRunner throws an exception when TaskManager is not passed");
		});
		QUnit.test("must be stopped after initialization", function (assert) {
			var oTaskManager = new TaskManager();
			var oTaskRunner = new TaskRunner({
				taskManager: oTaskManager
			});
			assert.strictEqual(oTaskRunner.bIsStopped, true, "then the taskRunner is not running after init");
		});
	});

	QUnit.module("TaskRunner API - run", {
		beforeEach: function () {
			this.observableTaskType = "TestType";
			this.oCallbackSpy = sandbox.spy();
			this.oTaskManager = new TaskManager();
			this.oTaskRunner = new TaskRunner({
				taskManager: this.oTaskManager,
				taskType: this.observableTaskType
			});
		},
		afterEach: function () {
			this.oTaskManager.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("must start the task execution process", function (assert) {
			var done = assert.async();
			var mTask = {
				type: this.observableTaskType,
				callbackFn: this.oCallbackSpy
			};
			var iTaskId = this.oTaskManager.add(mTask);

			this.oTaskManager.attachComplete(function (oEvent) {
				assert.strictEqual(this.oCallbackSpy.callCount, 1, "then the added task with existing callback function is executed sucessfully");
				assert.strictEqual(oEvent.getParameters().taskId[0], iTaskId, "then the added task is marked as completed by task manager");
				done();
			}.bind(this));

			this.oTaskRunner.run();
			assert.strictEqual(this.oTaskRunner.bIsStopped, false, "then the taskRunner is started");
		});

		QUnit.test("must start the task execution process with alternative task type", function (assert) {
			var done = assert.async();
			var mTask = {
				type: this.observableTaskType,
				callbackFn: this.oCallbackSpy
			};
			this.oTaskManager.add(mTask);

			var sAlternativeTaskType = "alternative task type";
			var oCallback1Spy = sandbox.spy();
			var mSecondTask = {
				type: sAlternativeTaskType,
				callbackFn: oCallback1Spy
			};
			var iTaskId = this.oTaskManager.add(mSecondTask);

			this.oTaskManager.attachComplete(function (oEvent) {
				assert.strictEqual(this.oCallbackSpy.callCount, 0, "then added task with initial type is not executed");
				assert.strictEqual(oCallback1Spy.callCount, 1, "then added task with alternative type is executed sucessfully");
				assert.strictEqual(oEvent.getParameters().taskId[0], iTaskId, "then the task with alternative type is marked as completed by task manager");
				done();
			}.bind(this));

			this.oTaskRunner.run(sAlternativeTaskType);
		});
	});

	QUnit.module("TaskRunner API - stop", {
		beforeEach: function () {
			this.observableTaskType = "TestType";
			this.oCallbackSpy = sandbox.spy();
			this.oTaskManager = new TaskManager();
			this.oTaskRunner = new TaskRunner({
				taskManager: this.oTaskManager,
				taskType: this.observableTaskType
			});
		},
		afterEach: function () {
			this.oTaskManager.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("must stop the task execution process", function (assert) {
			var done = assert.async();
			var mTask = {
				type: this.observableTaskType,
				callbackFn: this.oCallbackSpy
			};

			this.oTaskRunner.run();
			this.oTaskManager.add(mTask);
			this.oTaskManager.attachEventOnce('complete', function () {
				assert.strictEqual(this.oCallbackSpy.callCount, 1, "then, before stop, the added task with existing callback function is executed sucessfully");
				this.oTaskRunner.stop();

				this.oTaskManager.add(mTask);
				window.requestAnimationFrame(function () {
					assert.strictEqual(this.oCallbackSpy.callCount, 1, "then after stop() the newly added task is not executed anymore");
					done();
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("TaskRunner API - lifetime", {
		beforeEach: function () {
			this.oTaskManager = new TaskManager();
			this.oTaskRunner = new TaskRunner({
				taskManager: this.oTaskManager
			});
			this.oTaskRunner.run();
		},
		afterEach: function () {
			this.oTaskManager.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when dependent TaskManager is destroyed", function (assert) {
			var done = assert.async();
			this.oTaskManager.destroy();
			window.requestAnimationFrame(function () {
				assert.ok(this.oTaskRunner.bIsStopped, "then TaskRunner is stoped");
				done();
			}.bind(this));
		});
	});

	// TODO: Test with tasks without functions? (maybe logging needed!), sometimes the tests need to much time 700ms. Check with logging, if something special happens in the taskrunner
	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});