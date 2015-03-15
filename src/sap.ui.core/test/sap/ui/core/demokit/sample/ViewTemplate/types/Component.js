/*!
 * ${copyright}
 */
/**
 * @fileOverview Application component to test bindings using OData types.
 * @version @version@
 */
sap.ui.define([
		'jquery.sap.global',
		'sap/m/FlexItemData',
		'sap/m/HBox',
		'sap/m/MessageBox',
		'sap/ui/core/UIComponent',
		'sap/ui/core/mvc/View',
		'sap/ui/core/util/MockServer',
		'sap/ui/model/json/JSONModel',
		'sap/ui/model/odata/AnnotationHelper',
		'sap/ui/model/odata/v2/ODataModel',
		'jquery.sap.script'
	], function(jQuery, FlexItemData, HBox, MessageBox, UIComponent, View, MockServer, JSONModel, AnnotationHelper, ODataModel/*, jQuerySapScript*/) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.core.sample.ViewTemplate.types.Component", {
		metadata: "json",
		createContent: function () {
			var sUri = "/sap/opu/odata/sap/ZUI5_EDM_TYPES/",
				oLayout = new HBox(),
				sMockServerBaseUri = 
					jQuery.sap.getModulePath("sap.ui.core.sample.ViewTemplate.types.data", "/"),
				oMockServer,
				oModel,
				bRealOData = (jQuery.sap.getUriParameters().get("realOData") === "true"),
				oView;

			if (!bRealOData) {
				jQuery.sap.require("sap.ui.core.util.MockServer");

				oMockServer = new MockServer({rootUri: sUri});
				oMockServer.simulate(sMockServerBaseUri + "metadata.xml", {
					sMockdataBaseUrl: sMockServerBaseUri
				});
				oMockServer.start();
			} else if (location.hostname === "localhost") { //for local testing prefix with proxy
				sUri = "proxy" + sUri;
			}

			oModel = new ODataModel(sUri, {
				annotationURI: sMockServerBaseUri + "annotations.xml",
				defaultBindingMode: sap.ui.model.BindingMode.TwoWay
			});

			/**
			 * Sets the value state of the control if possible.
			 * @param {sap.ui.core.ValueState} sState state for the InputBase control
			 * @param {sap.ui.base.Event} oEvent the event to get the control
			 */
			function setState(sState, oEvent) {
				var oControl = oEvent.getSource(),
					oException;

				if (oControl && oControl.setValueState) {
					oControl.setValueState(sState);
					oException = oEvent.getParameter("exception");
					if (oException) {
						oControl.setValueStateText(oException.name + ": " + oException.message);
					}
				}
			}

			/**
			 * Sets the value state of the control to error if possible.
			 * @param {sap.ui.base.Event} oEvent the event to get the control
			 */
			function setErrorState(oEvent) {
				setState(sap.ui.core.ValueState.Error, oEvent);
			}

			oModel.getMetaModel().loaded().then(function () {
				var oMetaModel = oModel.getMetaModel(),
					oView = sap.ui.view({
						models : {
							undefined: oModel,
							ui: new JSONModel({realOData: bRealOData})
						},
						preprocessors: {
							xml: {
								bindingContexts: {meta: oMetaModel.createBindingContext(
									"/dataServices/schema/0/entityType/0")
								},
								models: {meta: oMetaModel}
							}
						},
						type: sap.ui.core.mvc.ViewType.XML,
						viewName: "sap.ui.core.sample.ViewTemplate.types.Types"
					});

				oView.attachFormatError(setErrorState);
				oView.attachParseError(setErrorState);
				oView.attachValidationError(setErrorState);
				oView.attachValidationSuccess(function (oEvent) {
					setState(sap.ui.core.ValueState.Success, oEvent);
				});
				oView.setLayoutData(new FlexItemData({growFactor: 1.0}));
				oLayout.addItem(oView);
			}, function (oError) {
				MessageBox.alert(oError.message, {
					icon: sap.m.MessageBox.Icon.ERROR,
					title: "Error"});
			});
			return oLayout;
		}
	});


	return Component;

});
