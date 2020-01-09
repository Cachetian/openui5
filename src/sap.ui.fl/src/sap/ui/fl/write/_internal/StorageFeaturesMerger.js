/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge"
], function (
	merge
) {
	"use strict";

	/**
	 * ConnectorFeaturesMerger class for Connector implementations (write).
	 *
	 * @namespace sap.ui.fl.write._internal.StorageFeaturesMerger
	 * @since 1.70
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal.Storage
	 */

	var DEFAULT_FEATURES = {
		isKeyUser: false,
		isVariantSharingEnabled: false,
		isAtoAvailable: false,
		isAtoEnabled: false,
		draft: {},
		isProductiveSystem: true,
		isZeroDowntimeUpgradeRunning: false,
		system: "",
		client: ""
	};

	function _getDraftFromResponse(oResponse) {
		var oDraft = {};
		var bDraftEnabled = !!oResponse.features.isDraftEnabled;

		oResponse.layers.forEach(function(sLayer) {
			oDraft[sLayer] = bDraftEnabled;
		});

		return oDraft;
	}

	return {
		/**
		 * Merges the results from all involved connectors otherwise take default value;
		 * The information if a draft is enabled for a given layer on write is determined by
		 * each connector individually; since getConnectorsForLayer allows no more than 1 connector
		 * for any given layer a merging is not necessary.
		 *
		 * @param {object[]} aResponses - All responses provided by the different connectors
		 * @returns {object} Merged result
		 */
		mergeResults: function(aResponses) {
			var oResult = DEFAULT_FEATURES;
			aResponses.forEach(function (oResponse) {
				Object.keys(oResponse.features).forEach(function (sKey) {
					if (sKey !== "isDraftEnabled") {
						oResult[sKey] = oResponse.features[sKey];
					}
				});
				oResult.draft = merge(oResult.draft, _getDraftFromResponse(oResponse));
			});
			return oResult;
		}
	};
});