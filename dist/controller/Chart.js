sap.ui.define(["sap/ui/base/Object","sap/m/MessageBox","sap/m/MessageToast"],function(e,t,a){"use strict";return e.extend("com.digiArtitus.controller.Chart",{constructor:function(e){this._oInstance=e;this._oView=e.getView()},loadChart:function(e){anychart.onDocumentReady(function(){var t=this.getView().byId("dashBoard-chart").getId();var a=[];var n=0;for(n;n<e.length;n++){a.push({x:e[n].Day,value:e[n].Revenue,normal:{fill:"#5cd65c",stroke:null,label:{enabled:true}},hovered:{fill:"#5cd65c",label:{enabled:true}},selected:{fill:"#5cd65c",label:{enabled:true}}})}var i=anychart.column();i.title("Previous Week Revenue");i.xAxis().title("Week");i.yAxis().title("Sales, INR");i.container(t);i.draw()}.bind(this._oInstance))}})});