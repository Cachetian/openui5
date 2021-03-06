/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/UriParameters",
	"sap/ui/core/sample/common/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/test/TestUtils"
], function (UriParameters, Controller, JSONModel, TestUtils) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.DataAggregation.DataAggregation", {
		onExit : function () {
			this.getView().getModel("ui").destroy();
			return Controller.prototype.onExit.apply(this, arguments);
		},

		onInit : function () {
			var oUriParameters = UriParameters.fromQuery(location.search),
				sGrandTotalAtBottomOnly = TestUtils.retrieveData( // controlled by OPA
						"sap.ui.core.sample.odata.v4.DataAggregation.grandTotalAtBottomOnly")
					|| oUriParameters.get("grandTotalAtBottomOnly"),
				oTable = this.byId("table"),
				oRowsBinding = oTable.getBinding("rows"),
				sVisibleRowCount = TestUtils.retrieveData( // controlled by OPA
						"sap.ui.core.sample.odata.v4.DataAggregation.visibleRowCount")
					|| oUriParameters.get("visibleRowCount");

			this.getView().setModel(new JSONModel({
				iMessages : 0,
				iVisibleRowCount : parseInt(sVisibleRowCount) || 5
			}), "ui");
			this.initMessagePopover("showMessages");

			oTable.setBindingContext(oRowsBinding.getHeaderContext(), "headerContext");
			oTable.setModel(oTable.getModel(), "headerContext");
			if (sGrandTotalAtBottomOnly) {
				oRowsBinding.setAggregation({
					aggregate : {
						SalesAmountLocalCurrency : {
							grandTotal : true,
							subtotals : true,
							unit : 'LocalCurrency'
						},
						SalesNumber : {}
					},
					//TODO how to change this w/o duplicating $$aggregation here?
					grandTotalAtBottomOnly : sGrandTotalAtBottomOnly === "true",
					group : {
						AccountResponsible : {}
					},
					groupLevels : ['Country', 'Region', 'Segment']
				});
				if (sGrandTotalAtBottomOnly === "true") {
					oTable.setFixedRowCount(0);
				}
				oTable.setFixedBottomRowCount(1);
			}
			oRowsBinding.resume(); // now that "ui" model is available...
		},

		onToggleExpand : function (oEvent) {
			// get the context from the button's row
			var oRowContext = oEvent.getSource().getBindingContext();

			if (oRowContext.isExpanded()) {
				oRowContext.collapse();
			} else {
				oRowContext.expand();
			}
		}
	});
});