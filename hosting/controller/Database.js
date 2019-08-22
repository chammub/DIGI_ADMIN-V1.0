sap.ui.define(["sap/ui/base/Object","sap/m/MessageBox","sap/m/MessageToast"],function(e,t,i){"use strict";return e.extend("com.digiArtitus.controller.Banner",{constructor:function(e){this._oInstance=e;this._oView=e.getView();this.oViewModel=this._oView.getModel("oViewModel")},liveDatabaseCollectionUpdates:function(){var e=function(e){var t=this._oView.getModel("oViewModel");var i=t.getData();var o=[];e.forEach(function(e){o.push({DOC_REF:e.ref,USER_ID:e.data().USER_ID,NAME:e.data().NAME,INITIALS:e.data().NAME.substr(0,1),TIME_STAMP:moment(e.data().TIME_STAMP).format("Do MMM YYYY")})});i.COLLECTIONS=o;t.refresh()}.bind(this);com.digiArtitus.FirestoreInstance().collection("DATABASE").doc(com.digiArtitus.companyCode).collection("COLLECTION").onSnapshot(e)},liveDatabaseMenuUpdates:function(){var e=function(e){var t=this._oView.getModel("oViewModel");var i=t.getData();var o=[];e.forEach(function(e){o.push({DOC_REF:e.ref,USER_ID:e.data().USER_ID,NAME:e.data().NAME,COLLECTION:e.data().COLLECTION,IMAGE_NAME:e.data().IMAGE_NAME,IMAGE_URL:e.data().IMAGE_URL,IMAGE_REF_PATH:e.data().IMAGE_REF_PATH,USER_COMPANY_CODE:e.data().USER_COMPANY_CODE,TIME_STAMP:moment(e.data().TIME_STAMP).format("Do MMM YYYY")})});i.MENU=o;t.refresh()}.bind(this);com.digiArtitus.FirestoreInstance().collection("DATABASE").doc(com.digiArtitus.companyCode).collection("MENU").onSnapshot(e)},liveDatabaseItemUpdates:function(){var e=function(e){var t=this._oView.getModel("oViewModel");var i=t.getData();var o=[];e.forEach(function(e){o.push({DOC_REF:e.ref,USER_ID:e.data().USER_ID,COLLECTION:e.data().COLLECTION,MENU:e.data().MENU,IMAGE_NAME:e.data().IMAGE_NAME,IMAGE_URL:e.data().IMAGE_URL,IMAGE_REF_PATH:e.data().IMAGE_REF_PATH,USER_COMPANY_CODE:e.data().USER_COMPANY_CODE,TIME_STAMP:moment(e.data().TIME_STAMP).format("Do MMM YYYY"),ITEM_CODE:e.data().ITEM_CODE,NAME:e.data().NAME,DESCRIPTION:e.data().DESCRIPTION,TAX:e.data().TAX,NET_PRICE:e.data().NET_PRICE,SALE_PRICE:e.data().SALE_PRICE,RANGE_OF_PRODUCTS:e.data().RANGE_OF_PRODUCTS,RANGE_OF_PRODUCTS_ITEMS:e.data().RANGE_OF_PRODUCTS_ITEMS,ACTIVE:e.data().ACTIVE})});i.ITEMS=o;t.refresh()}.bind(this);com.digiArtitus.FirestoreInstance().collection("DATABASE").doc(com.digiArtitus.companyCode).collection("ITEMS").onSnapshot(e)},_collectionDialog:function(){if(!this.collectionDialog){var e=this._oView;this.collectionDialog=sap.ui.xmlfragment(e.getId(),"com.digiArtitus.fragment.database-collection",this);e.addDependent(this.collectionDialog);jQuery.sap.syncStyleClass("sapUiSizeCompact",e,this.collectionDialog)}return this.collectionDialog},onCollectionListEdit:function(){},onCollectionDialogAddPress:function(){this._collectionDialog().open()},onCollectionListEditPress:function(e){var t=e.getSource();var i=t.getBindingContext("oViewModel").getObject();this.COLLECTION_EDIT_FLAG=true;this.COLLECTION_EDIT_DATA=i;this.oViewModel.setProperty("/COLLECTION_NAME",i.NAME);this._collectionDialog().open()},onCollectionListPress:function(e){var t=e.getParameter("listItem").getBindingContext("oViewModel").getObject();this.oViewModel.setProperty("/SELECTED_COLL_NAME",t.NAME);this._oInstance._listFilter("menu-list-id","COLLECTION",t.NAME)},onCollectionSave:function(){var e=this._oInstance;var t=this._oView;var o=[t.byId("collection-name-id")];var E=false;jQuery.each(o,function(t,i){E=e._validateInput(i)||E});if(E){i.show("A validation error has occurred. Complete your input first");return}com.digiArtitus.StartGlobalBusyIndicator();var s={NAME:this.oViewModel.getProperty("/COLLECTION_NAME"),TIME_STAMP:firebase.firestore.Timestamp.fromDate(new Date)};if(this.COLLECTION_EDIT_FLAG){this.COLLECTION_EDIT_DATA.DOC_REF.update(s).then(function(){this._collectionDialog().close();this.COLLECTION_EDIT_FLAG=false;this.oViewModel.setProperty("/COLLECTION_NAME","");com.digiArtitus.EndGlobalBusyIndicator()}.bind(this)).catch(function(e){i.show("Error in posting data");com.digiArtitus.EndGlobalBusyIndicator()})}else{s.USER_ID=com.digiArtitus.userId;com.digiArtitus.FirestoreInstance().collection("DATABASE").doc(com.digiArtitus.companyCode).collection("COLLECTION").add(s).then(function(){this._collectionDialog().close();this.oViewModel.setProperty("/COLLECTION_NAME","");com.digiArtitus.EndGlobalBusyIndicator()}.bind(this)).catch(function(e){i.show("Error in posting data");com.digiArtitus.EndGlobalBusyIndicator()})}},onCollectionDialogClose:function(){this.oViewModel.setProperty("/COLLECTION_NAME","");this._collectionDialog().close()},_menuDialog:function(){if(!this.menuDialog){var e=this._oView;this.menuDialog=sap.ui.xmlfragment(e.getId(),"com.digiArtitus.fragment.database-menu",this);e.addDependent(this.menuDialog);jQuery.sap.syncStyleClass("sapUiSizeCompact",e,this.menuDialog)}return this.menuDialog},onMenuListPress:function(e){var t=e.getParameter("listItem").getBindingContext("oViewModel").getObject();this.oViewModel.setProperty("/SELECTED_MENU_NAME",t.NAME);this._oInstance._listFilter("items-list-id","MENU",t.NAME)},onMenuLoadImagePress:function(){this._oInstance._fileUploaderLoad("menu-file-uploader-id","MENU_UPLOADER_FILE","MENU_UPLOADER_EDIT_FLAG","MENU_UPLOADER_EDIT_CHANGE_FLAG","MENU_PREVIEW_UPLOADER_FILE","MENU_PREVIEW_VISIBLE")},onMenuRemoveImagePress:function(){this._oInstance._fileUploaderUnLoad("menu-file-uploader-id","MENU_UPLOADER_FILE","MENU_UPLOADER_EDIT_CHANGE_FLAG","MENU_PREVIEW_UPLOADER_FILE","MENU_PREVIEW_VISIBLE")},onMenuDialogClose:function(){this.onMenuRemoveImagePress();this.oViewModel.setProperty("/MENU_NAME","");this._menuDialog().close()},onMenuListEditPress:function(e){var t=e.getSource();var i=t.getBindingContext("oViewModel").getObject();this.oViewModel.setProperty("/MENU_UPLOADER_EDIT_FLAG",true);this.MENU_EDIT_DATA=i;this.oViewModel.setProperty("/MENU_NAME",i.NAME);this.oViewModel.setProperty("/MENU_PREVIEW_VISIBLE",true);this.oViewModel.setProperty("/MENU_PREVIEW_UPLOADER_FILE",i.IMAGE_URL);this._menuDialog().open()},onMenuSave:function(){var e=this._oInstance;var t=this._oView;var o={};var E=[t.byId("menu-name-id")];var s=false;var r=firebase.storage().ref();jQuery.each(E,function(t,i){s=e._validateInput(i)||s});if(this.oViewModel.getProperty("/MENU_PREVIEW_UPLOADER_FILE")===""){i.show("Add an image to create record!");return}if(s){i.show("A validation error has occurred. Complete your input first");return}com.digiArtitus.StartGlobalBusyIndicator();var a=function(){this._menuDialog().close();this.onMenuRemoveImagePress();this.oViewModel.setProperty("/MENU_UPLOADER_EDIT_CHANGE_FLAG",false);this.oViewModel.setProperty("/MENU_NAME","");com.digiArtitus.EndGlobalBusyIndicator()}.bind(this);if(this.oViewModel.getProperty("/MENU_UPLOADER_EDIT_FLAG")){o={TIME_STAMP:firebase.firestore.Timestamp.fromDate(new Date),NAME:this.oViewModel.getProperty("/MENU_NAME")};if(this.oViewModel.getProperty("/MENU_UPLOADER_EDIT_CHANGE_FLAG")){var _=r.child(this.MENU_EDIT_DATA.IMAGE_REF_PATH);_.delete().then(()=>{var e=this.oViewModel.getProperty("/MENU_UPLOADER_FILE");o.IMAGE_NAME=e.name;o.IMAGE_REF_PATH=com.digiArtitus.companyCode+"/MENU/"+(new Date).getTime()+"_"+e.name;var t=r.child(o.IMAGE_REF_PATH);t.put(e).then(e=>{e.ref.getDownloadURL().then(e=>{o.IMAGE_URL=e;this.MENU_EDIT_DATA.DOC_REF.update(o).then(function(){a()});com.digiArtitus.EndGlobalBusyIndicator()}).catch(e=>{com.digiArtitus.EndGlobalBusyIndicator()})})}).catch(function(e){com.digiArtitus.EndGlobalBusyIndicator()})}else{this.MENU_EDIT_DATA.DOC_REF.update(o).then(function(){a()}).catch(function(e){i.show("Error in posting data");com.digiArtitus.EndGlobalBusyIndicator()})}}else{var n=this.oViewModel.getProperty("/MENU_UPLOADER_FILE");this.MENU_STORAGE_FILE_REF_PATH=com.digiArtitus.companyCode+"/MENU/"+(new Date).getTime()+"_"+n.name;var I=r.child(this.MENU_STORAGE_FILE_REF_PATH);I.put(n).then(e=>{e.ref.getDownloadURL().then(e=>{o={USER_ID:com.digiArtitus.userId,USER_COMPANY_CODE:com.digiArtitus.companyCode,IMAGE_REF_PATH:this.MENU_STORAGE_FILE_REF_PATH,IMAGE_NAME:n.name,IMAGE_URL:e,TIME_STAMP:firebase.firestore.Timestamp.fromDate(new Date),COLLECTION:this.oViewModel.getProperty("/SELECTED_COLL_NAME"),NAME:this.oViewModel.getProperty("/MENU_NAME")};com.digiArtitus.FirestoreInstance().collection("DATABASE").doc(com.digiArtitus.companyCode).collection("MENU").add(o).then(function(){a()}).catch(function(e){i.show("Error in posting data");com.digiArtitus.EndGlobalBusyIndicator()})}).catch(e=>{com.digiArtitus.EndGlobalBusyIndicator()})})}},_itemDialog:function(){if(!this.itemDialog){var e=this._oView;this.itemDialog=sap.ui.xmlfragment(e.getId(),"com.digiArtitus.fragment.database-item",this);e.addDependent(this.itemDialog);jQuery.sap.syncStyleClass("sapUiSizeCompact",e,this.itemDialog)}return this.itemDialog},_itemDisplayDialog:function(){if(!this.itemDisplayDialog){var e=this._oView;this.itemDisplayDialog=sap.ui.xmlfragment(e.getId(),"com.digiArtitus.fragment.database-display-item",this);e.addDependent(this.itemDisplayDialog);jQuery.sap.syncStyleClass("sapUiSizeCompact",e,this.itemDisplayDialog)}return this.itemDisplayDialog},onItemListPress:function(e){var t=e.getParameter("listItem").getBindingContext("oViewModel").getObject();this._loadItemInViewModel(t);this._itemDisplayDialog().open()},onDisplayItemDialogClose:function(){this._clearItemInViewModel();this._itemDisplayDialog().close()},onItemDialogClose:function(){this._clearItemInViewModel();this._itemDialog().close()},onItemListEditPress:function(e){var t=e.getSource();var i=t.getBindingContext("oViewModel").getObject();this.oViewModel.setProperty("/ITEM_EDIT_FLAG",true);this.ITEM_EDIT_DATA=i;this._loadItemInViewModel(i);this._itemDialog().open()},_loadItemInViewModel:function(e){this.oViewModel.setProperty("/ITEM_CODE",e.ITEM_CODE);this.oViewModel.setProperty("/ITEM_NAME",e.NAME);this.oViewModel.setProperty("/ITEM_DESC",e.DESCRIPTION);this.oViewModel.setProperty("/ITEM_TAX",e.TAX);this.oViewModel.setProperty("/ITEM_NET_PRICE",e.NET_PRICE);this.oViewModel.setProperty("/ITEM_SALE_PRICE",e.SALE_PRICE);this.oViewModel.setProperty("/ITEM_RANGE_OF_PROD",e.RANGE_OF_PRODUCTS);this.oViewModel.setProperty("/ITEM_RANGE_OF_PROD_ITEMS",e.RANGE_OF_PRODUCTS_ITEMS);this.oViewModel.setProperty("/ITEM_ACTIVE",e.ACTIVE);this.oViewModel.setProperty("/ITEM_PREVIEW_VISIBLE",true);this.oViewModel.setProperty("/ITEM_PREVIEW_UPLOADER_FILE",e.IMAGE_URL)},_clearItemInViewModel:function(){this.oViewModel.setProperty("/ITEM_CODE","");this.oViewModel.setProperty("/ITEM_NAME","");this.oViewModel.setProperty("/ITEM_DESC","");this.oViewModel.setProperty("/ITEM_TAX","");this.oViewModel.setProperty("/ITEM_NET_PRICE","");this.oViewModel.setProperty("/ITEM_SALE_PRICE","");this.oViewModel.setProperty("/ITEM_RANGE_OF_PROD",false);this.oViewModel.setProperty("/ITEM_RANGE_OF_PROD_ITEMS",[]);this.oViewModel.setProperty("/ITEM_ACTIVE",true);this.oViewModel.setProperty("/ITEM_PREVIEW_VISIBLE",false);this.oViewModel.setProperty("/ITEM_PREVIEW_UPLOADER_FILE","")},onItemSave:function(){var e=this.oViewModel.getProperty("/ITEM_EDIT_FLAG");if(e){var t={ITEM_CODE:this.ITEM_EDIT_DATA.ITEM_CODE,NAME:this.ITEM_EDIT_DATA.NAME,DESCRIPTION:this.ITEM_EDIT_DATA.DESCRIPTION,TAX:this.ITEM_EDIT_DATA.ITEM_TAX,NET_PRICE:this.ITEM_EDIT_DATA.NET_PRICE,SALE_PRICE:this.ITEM_EDIT_DATA.SALE_PRICE,RANGE_OF_PRODUCTS:this.ITEM_EDIT_DATA.RANGE_OF_PRODUCTS,RANGE_OF_PRODUCTS_ITEMS:this.ITEM_EDIT_DATA.RANGE_OF_PRODUCTS_ITEMS,ACTIVE:this.ITEM_EDIT_DATA.ACTIVE};var o={ITEM_CODE:this.oViewModel.getProperty("/ITEM_CODE"),NAME:this.oViewModel.getProperty("/ITEM_NAME"),DESCRIPTION:this.oViewModel.getProperty("/ITEM_DESC"),TAX:this.oViewModel.getProperty("/ITEM_TAX"),NET_PRICE:this.oViewModel.getProperty("/ITEM_NET_PRICE"),SALE_PRICE:this.oViewModel.getProperty("/ITEM_SALE_PRICE"),RANGE_OF_PRODUCTS:this.oViewModel.getProperty("/ITEM_RANGE_OF_PROD"),RANGE_OF_PRODUCTS_ITEMS:this.oViewModel.getProperty("/ITEM_RANGE_OF_PROD_ITEMS"),ACTIVE:this.oViewModel.getProperty("/ITEM_ACTIVE")};if(JSON.stringify(t)===JSON.stringify(o)){i.show("No changes found to save!");return}}var E=this;var s=this._oView;var r=[s.byId("item-code-id"),s.byId("item-name-id"),s.byId("item-description-id")];if(!this.oViewModel.getProperty("/ITEM_RANGE_OF_PROD")){r.push(s.byId("item-tax-id"));r.push(s.byId("item-net-price-id"));r.push(s.byId("item-sale-price-id"))}var a=false;var _;var n=firebase.storage().ref();jQuery.each(r,function(e,t){a=E._oInstance._validateInput(t)||a});if(this.oViewModel.getProperty("/ITEM_RANGE_OF_PROD")){var I=this.oViewModel.getProperty("/ITEM_RANGE_OF_PROD_ITEMS");a=I.length===0}if(this.oViewModel.getProperty("/ITEM_PREVIEW_UPLOADER_FILE")===""){i.show("Add an image to create record!");return}if(a){i.show("A validation error has occurred. Complete your input first");return}com.digiArtitus.StartGlobalBusyIndicator();var M=function(){this._itemDialog().close();this.onItemRemoveImagePress();this.oViewModel.setProperty("/ITEM_UPLOADER_EDIT_CHANGE_FLAG",false);this._clearItemInViewModel();com.digiArtitus.EndGlobalBusyIndicator()}.bind(this);if(e){_={TIME_STAMP:firebase.firestore.Timestamp.fromDate(new Date),ITEM_CODE:this.oViewModel.getProperty("/ITEM_CODE"),NAME:this.oViewModel.getProperty("/ITEM_NAME"),DESCRIPTION:this.oViewModel.getProperty("/ITEM_DESC"),TAX:this.oViewModel.getProperty("/ITEM_TAX"),NET_PRICE:this.oViewModel.getProperty("/ITEM_NET_PRICE"),SALE_PRICE:this.oViewModel.getProperty("/ITEM_SALE_PRICE"),RANGE_OF_PRODUCTS:this.oViewModel.getProperty("/ITEM_RANGE_OF_PROD"),RANGE_OF_PRODUCTS_ITEMS:this.oViewModel.getProperty("/ITEM_RANGE_OF_PROD_ITEMS"),ACTIVE:this.oViewModel.getProperty("/ITEM_ACTIVE")};if(this.oViewModel.getProperty("/ITEM_UPLOADER_EDIT_CHANGE_FLAG")){var d=n.child(this.ITEM_EDIT_DATA.IMAGE_REF_PATH);d.delete().then(()=>{var e=this.oViewModel.getProperty("/ITEM_UPLOADER_FILE");_.IMAGE_NAME=e.name;_.IMAGE_REF_PATH=com.digiArtitus.companyCode+"/ITEM/"+(new Date).getTime()+"_"+e.name;var t=n.child(_.IMAGE_REF_PATH);t.put(e).then(e=>{e.ref.getDownloadURL().then(e=>{_.IMAGE_URL=e;this.ITEM_EDIT_DATA.DOC_REF.update(_).then(function(){M()});com.digiArtitus.EndGlobalBusyIndicator()}).catch(e=>{com.digiArtitus.EndGlobalBusyIndicator()})})}).catch(function(e){com.digiArtitus.EndGlobalBusyIndicator()})}else{this.ITEM_EDIT_DATA.DOC_REF.update(_).then(function(){M()}).catch(function(e){i.show("Error in posting data");com.digiArtitus.EndGlobalBusyIndicator()})}}else{var l=this.oViewModel.getProperty("/ITEM_UPLOADER_FILE");_={USER_ID:com.digiArtitus.userId,USER_COMPANY_CODE:com.digiArtitus.companyCode,IMAGE_REF_PATH:com.digiArtitus.companyCode+"/ITEM/"+(new Date).getTime()+"_"+l.name,IMAGE_NAME:l.name,TIME_STAMP:firebase.firestore.Timestamp.fromDate(new Date),COLLECTION:this.oViewModel.getProperty("/SELECTED_COLL_NAME"),MENU:this.oViewModel.getProperty("/SELECTED_MENU_NAME"),ITEM_CODE:this.oViewModel.getProperty("/ITEM_CODE"),NAME:this.oViewModel.getProperty("/ITEM_NAME"),DESCRIPTION:this.oViewModel.getProperty("/ITEM_DESC"),TAX:this.oViewModel.getProperty("/ITEM_TAX"),NET_PRICE:this.oViewModel.getProperty("/ITEM_NET_PRICE"),SALE_PRICE:this.oViewModel.getProperty("/ITEM_SALE_PRICE"),RANGE_OF_PRODUCTS:this.oViewModel.getProperty("/ITEM_RANGE_OF_PROD"),RANGE_OF_PRODUCTS_ITEMS:this.oViewModel.getProperty("/ITEM_RANGE_OF_PROD_ITEMS"),ACTIVE:this.oViewModel.getProperty("/ITEM_ACTIVE")};var A=n.child(_.IMAGE_REF_PATH);A.put(l).then(e=>{e.ref.getDownloadURL().then(e=>{_.IMAGE_URL=e;com.digiArtitus.FirestoreInstance().collection("DATABASE").doc(com.digiArtitus.companyCode).collection("ITEMS").add(_).then(function(){M()}).catch(function(e){i.show("Error in posting data");com.digiArtitus.EndGlobalBusyIndicator()})}).catch(e=>{com.digiArtitus.EndGlobalBusyIndicator()})})}},onItemLoadImagePress:function(){this._oInstance._fileUploaderLoad("item-file-uploader-id","ITEM_UPLOADER_FILE","ITEM_EDIT_FLAG","ITEM_UPLOADER_EDIT_CHANGE_FLAG","ITEM_PREVIEW_UPLOADER_FILE","ITEM_PREVIEW_VISIBLE")},onItemRemoveImagePress:function(){this._oInstance._fileUploaderUnLoad("item-file-uploader-id","ITEM_UPLOADER_FILE","ITEM_UPLOADER_EDIT_CHANGE_FLAG","ITEM_PREVIEW_UPLOADER_FILE","ITEM_PREVIEW_VISIBLE")},_rangeItemDialog:function(){if(!this.rangeItemDialog){var e=this._oView;this.rangeItemDialog=sap.ui.xmlfragment(e.getId(),"com.digiArtitus.fragment.database-range",this);e.addDependent(this.rangeItemDialog);jQuery.sap.syncStyleClass("sapUiSizeCompact",e,this.rangeItemDialog)}return this.rangeItemDialog},onRangeItemAddPress:function(e){this._clearRangeInputs();this._rangeItemDialog().open()},onRangeItemClosePress:function(e){this._clearRangeInputs();this._rangeItemDialog().close()},onRangeItemEditPress:function(e){var t=e.getSource().getBindingContext("oViewModel");var i=t.getObject();this._setRangeInputs(i);this.RANGE_ITEM_EDIT_BINDING_CONTEXT=t;this.RANGE_ITEM_EDIT_PRESS=true;this._rangeItemDialog().open()},onRangeItemDeletePress:function(e){var t=e.getSource();var i=t.getBindingContext("oViewModel").getPath();var o=i.substr(i.lastIndexOf("/")+1);var E=this.oViewModel.getProperty("/ITEM_RANGE_OF_PROD_ITEMS");E.splice(o,1);this.oViewModel.setProperty("/ITEM_RANGE_OF_PROD_ITEMS",E)},_setRangeInputs:function(e){this.oViewModel.setProperty("/RANGE_ITEM_DESC",e.DESCRIPTION);this.oViewModel.setProperty("/RANGE_ITEM_TAX",e.TAX);this.oViewModel.setProperty("/RANGE_ITEM_NET_PRICE",e.NET_PRICE);this.oViewModel.setProperty("/RANGE_ITEM_SALE_PRICE",e.SALE_PRICE)},_clearRangeInputs:function(){this.oViewModel.setProperty("/RANGE_ITEM_DESC","");this.oViewModel.setProperty("/RANGE_ITEM_TAX","");this.oViewModel.setProperty("/RANGE_ITEM_NET_PRICE","");this.oViewModel.setProperty("/RANGE_ITEM_SALE_PRICE","")},onRangeItemSavePress:function(){var e=this;var t=this._oView;var o=[t.byId("item-range-description-id"),t.byId("item-range-tax-id"),t.byId("item-range-net-price-id"),t.byId("item-range-sale-price-id")];var E=false;jQuery.each(o,function(t,i){E=e._oInstance._validateInput(i)||E});if(E){i.show("A validation error has occurred. Complete your input first");return}var s={DESCRIPTION:o[0].getValue(),TAX:o[1].getValue(),NET_PRICE:o[2].getValue(),SALE_PRICE:o[3].getValue()};if(this.RANGE_ITEM_EDIT_PRESS){if(JSON.stringify(this.RANGE_ITEM_EDIT_BINDING_CONTEXT.getObject())===JSON.stringify(s)){i.show("No changes found.");return}var r=this.RANGE_ITEM_EDIT_BINDING_CONTEXT.getPath();this.oViewModel.setProperty(r+"/DESCRIPTION",o[0].getValue());this.oViewModel.setProperty(r+"/TAX",o[1].getValue());this.oViewModel.setProperty(r+"/NET_PRICE",o[2].getValue());this.oViewModel.setProperty(r+"/SALE_PRICE",o[3].getValue())}else{var a=this.oViewModel.getProperty("/ITEM_RANGE_OF_PROD_ITEMS");a.push(s);this.oViewModel.setProperty("/ITEM_RANGE_OF_PROD_ITEMS",a)}this._rangeItemDialog().close()}})});