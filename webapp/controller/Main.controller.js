sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "jquery.sap.global"
], function (Controller, Filter, FilterOperator, MessageToast, jQuery) {
    "use strict";

            return Controller.extend("sync.ea.qfruqr.controller.Main", {
                onInit: function () {
                    this._loadQRCodeLibrary();
                },

                _loadQRCodeLibrary: function () {
                    var sLibPath = jQuery.sap.getModulePath("sync.ea.qfruqr.lib"); // qrcode.min.js 파일 경로
                    var sQRCodeLibPath = sLibPath + "/qrcode.min.js";

                    jQuery.sap.includeScript(sQRCodeLibPath, "qrcode-lib", function () {
                        console.log("QR Code Library loaded.");
                    }, function () {
                        console.error("Failed to load QR Code Library.");
                    });
                },

                onGenerateQRCode: function () {
                    var that = this;
                    var sBatch = this.byId("input2").getValue();
                    if (!sBatch) {
                        MessageToast.show("생산실적을 선택해주세요.");
                        return;
                    }
                
                    var sURL = "https://edu.bgis.co.kr:8443/sap/bc/ui2/flp#synceaqrbatch-display&/batch/" + encodeURIComponent(sBatch);
                
                    if (window.QRCode) {
                        var qrCodeElement = document.createElement("div");
                
                        var qrCode = new QRCode(qrCodeElement, {
                            text: sURL,
                            width: 200,
                            height: 200,
                            correctLevel: QRCode.CorrectLevel.H
                        });
                
                        setTimeout(function() {
                            try {
                                var qrCanvas = qrCodeElement.getElementsByTagName("canvas")[0];
                                var sQRCodeImageSrc = qrCanvas.toDataURL("image/png");
                                var oImage = that.byId("qrCodeImage");
                                oImage.setSrc(sQRCodeImageSrc); // Set QR code image in Image element
                
                                that.byId("inputDate").setValue(new Date().toISOString().slice(0, 10));  // Set creation date
                                that.byId("inputBatch").setValue(sBatch);  // Set applied batch number
                
                                // Save QR code data URL
                                that._sQRCodeImageSrc = sQRCodeImageSrc;
                                MessageToast.show("QR 코드가 생성되었습니다.");
                            } catch (error) {
                                console.error("Error generating QR Code: ", error);
                                MessageToast.show("QR 코드 생성에 실패했습니다.");
                            }
                        }, 500); // Wait for 500ms after QR code generation (adjust if necessary)
                
                    } else {
                        console.error("QR Code Library is not loaded.");
                        MessageToast.show("QR 코드 생성 라이브러리가 로드되지 않았습니다.");
                    }
                },

                onSaveQRCode: function () {
                    if (this._sQRCodeImageSrc) {
                        var a = document.createElement('a');
                        a.href = this._sQRCodeImageSrc;
                        a.download = 'qrcode.png';
                        a.click();
                    } else {
                        MessageToast.show("먼저 QR 코드를 생성하세요.");
                    }
                },

                // onPrintQRCode: function () {
                //     if (this._sQRCodeImageSrc) {
                //         var qrWindow = window.open("", "QR Code", "width=300,height=300");
                //         qrWindow.document.write('<!DOCTYPE html><html><head><title>QR Code</title></head><body>');
                //         qrWindow.document.write('<img src="' + this._sQRCodeImageSrc + '" style="width:100%;">');
                //         qrWindow.document.write('</body></html>');
                //         qrWindow.document.close();
                //         qrWindow.print();
                //     } else {
                //         MessageToast.show("먼저 QR 코드를 생성하세요.");
                //     }
                // },

                onPrintQRCode: function () {
                    var imageURL = "https://media.discordapp.net/attachments/1222118601733967923/1247533608592216168/224x.png?ex=66605fb6&is=665f0e36&hm=cfc057ac3dde71fb80daa98b78602019f9fcf23b428b16c9df5624ed30aff9d2&=&format=webp&quality=lossless&width=386&height=532"; // Replace with your actual image URL
                  
                    // Get A4 paper dimensions in millimeters
                    var a4Width = 210;
                    var a4Height = 297;
                  
                    // Open a new print window
                    var printWindow = window.open("", "Image Print", "width=900,height=450,top=200,left=500");
                    printWindow.document.write('<!DOCTYPE html><html><head><title>Image Print</title></head><body>');
                  
                    // Adjust image size to fill A4 paper
                    var image = new Image();
                    image.onload = function() {
                      // Calculate scaling factor to fill A4 paper
                      var scaleX = a4Width / image.width;
                      var scaleY = a4Height / image.height;
                  
                      // Use the larger scale factor to ensure the image fills the entire page
                      var scale = Math.max(scaleX, scaleY);
                  
                      printWindow.document.write('<img src="' + imageURL + '" style="width:100%;">');

                      // Print the content of the print window
                      printWindow.document.close();
                      printWindow.print();
                    };
                    image.src = imageURL;
                  },
                
                
                
                onTableRowSelectionChange: function(oEvent) {
                    var oTable = this.byId("dataTable");
                    var oSelectedItem = oTable.getSelectedItem();
                    
                    if (!oSelectedItem) {
                        MessageToast.show("선택된 라인이 없습니다.");
                        return;
                    }

                    var oBindingContext = oSelectedItem.getBindingContext();
                    var oData = oBindingContext.getProperty();

                    this.byId("input1").setValue(oData.Aufnr);
                    this.byId("input2").setValue(oData.Charg);
                    this.byId("input3").setValue(oData.Matnr);
                    this.byId("input4").setValue(oData.Maktx);
                    this.byId("input5").setValue(oData.Tsdat);
                    this.byId("input6").setValue(oData.Fnpd + " " + oData.Meins);
                },
                
                onFilter: function () {
                    var aFilters = [];
                    var oTable = this.byId("dataTable");
                    var oBinding = oTable.getBinding("items");

                    var sAufnr = this.byId("aufnrFilter").getValue();
                    var sCharg = this.byId("chargFilter").getValue();
                    var sTsdat = this.byId("tsdatFilter").getValue();

                    if (sAufnr) {
                        aFilters.push(new Filter("Aufnr", FilterOperator.Contains, sAufnr));
                    }
                    if (sCharg) {
                        aFilters.push(new Filter("Charg", FilterOperator.Contains, sCharg));
                    }
                    if (sTsdat) {
                        aFilters.push(new Filter("Tsdat", FilterOperator.EQ, sTsdat));
                    }

                    if (oBinding) {
                        oBinding.filter(aFilters);
                        console.log("Filters applied:", aFilters);
                    } else {
                        console.error("Table binding not found");
                    }
                },

                onClearFilters: function () {
                    this.byId("aufnrFilter").setValue("");
                    this.byId("chargFilter").setValue("");
                    this.byId("tsdatFilter").setValue("");
                    this.onFilter();
                }

                // onQR: function() {
                //     var oTable = this.byId("dataTable");
                //     var oSelectedItem = oTable.getSelectedItem();
                
                //     if (!oSelectedItem) {
                //         MessageToast.show("선택된 라인이 없습니다.");
                //         return;
                //     }
                
                //     var oBindingContext = oSelectedItem.getBindingContext();
                //     var oData = oBindingContext.getProperty();
                
                //     // 선택된 라인의 데이터를 각 입력 필드에 설정합니다.
                //     this.byId("input1").setValue(oData.Aufnr);
                //     this.byId("input2").setValue(oData.Charg);
                //     this.byId("input3").setValue(oData.Matnr);
                //     this.byId("input4").setValue(oData.Tsdat);
                //     this.byId("input5").setValue(oData.Fnpd + " " + oData.Meins);
                // }


            });
        });
