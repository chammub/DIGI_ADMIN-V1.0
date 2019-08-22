/*global anychart*/
sap.ui.define(["sap/ui/base/Object", "sap/m/MessageBox", "sap/m/MessageToast"],
	function (UI5Object, MessageBox, MessageToast) {
		"use strict";

		return UI5Object.extend("com.digiArtitus.controller.Chart", {

			constructor: function (oInstance) {
				this._oInstance = oInstance;
				this._oView = oInstance.getView();
			},

			loadChart: function (aChartData) {
				anychart.onDocumentReady(function () {
					var sChartDomId = this.getView().byId("dashBoard-chart").getId();
					var data = [];
					var index = 0;
					for (index; index < aChartData.length; index++) {
						data.push({
							x: aChartData[index].Day,
							value: aChartData[index].Revenue,
							normal: {
								fill: "#5cd65c",
								stroke: null,
								label: {
									enabled: true
								}
							},
							hovered: {
								fill: "#5cd65c",
								label: {
									enabled: true
								}
							},
							selected: {
								fill: "#5cd65c",
								label: {
									enabled: true
								}
							}
						});
					}

					// create a chart
					var chart = anychart.column();

					// create a column series and set the data
					// var series = chart.column(data);

					// set the chart title
					chart.title("Previous Week Revenue");

					// set the titles of the axes
					chart.xAxis().title("Week");
					chart.yAxis().title("Sales, INR");

					// set the container id
					chart.container(sChartDomId);

					// initiate drawing the chart
					chart.draw();
				}.bind(this._oInstance));
			}

		});

	});