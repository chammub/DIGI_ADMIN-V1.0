sap.ui.define([], function () {
	"use strict";

	return {

		numberUnit: function (sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(2);
		},

		orderStatus: function (sValue) {
			if (sValue === "DELIVERED") {
				return "Success";
			} else if (sValue === "IN PROGRESS") {
				return "Warning";
			} else if (sValue === "REJECT" || sValue === "CANCELLED") {
				return "Error";
			} else {
				return "Information";
			}
		},

		orderStatusIcon: function (sValue) {
			if (sValue === "DELIVERED") {
				return "sap-icon://accept";
			} else if (sValue === "IN PROGRESS") {
				return "sap-icon://shipping-status";
			} else if (sValue === "REJECT" || sValue === "CANCELLED") {
				return "sap-icon://decline";
			} else {
				return "sap-icon://hint";
			}
		}

	};

});