/* dfu-util.js - Adjusted for external orchestration */
var device = null; // Keep global 'device' for potential use by dfu.js internals if they rely on it
var dfuUtil = (function() { // Keep IIFE but expose functions
    'use strict';

    // Keep helper functions like hex4, hexAddr8, niceSize, formatDFUSummary, etc.
    function hex4(n) {
        let s = n.toString(16)
        while (s.length < 4) { s = '0' + s; }
        return s;
    }

    function hexAddr8(n) {
        let s = n.toString(16)
        while (s.length < 8) { s = '0' + s; }
        return "0x" + s;
    }

     function niceSize(n) {
        const gigabyte = 1024 * 1024 * 1024;
        const megabyte = 1024 * 1024;
        const kilobyte = 1024;
        if (n >= gigabyte) {
            return n / gigabyte + "GiB";
        } else if (n >= megabyte) {
            return n / megabyte + "MiB";
        } else if (n >= kilobyte) {
            return n / kilobyte + "KiB";
        } else {
            return n + "B";
        }
    }

     function formatDFUSummary(device) {
        if (!device || !device.device_) return "Invalid device object";
        const vid = hex4(device.device_.vendorId);
        const pid = hex4(device.device_.productId);
        const name = device.device_.productName;

        let mode = "Unknown"
        if (device.settings.alternate.interfaceProtocol == 0x01) {
            mode = "Runtime";
        } else if (device.settings.alternate.interfaceProtocol == 0x02) {
            mode = "DFU";
        }

        const cfg = device.settings.configuration.configurationValue;
        const intf = device.settings["interface"].interfaceNumber;
        const alt = device.settings.alternate.alternateSetting;
        const serial = device.device_.serialNumber;
        let info = `${mode}: [${vid}:${pid}] cfg=${cfg}, intf=${intf}, alt=${alt}, name="${name}" serial="${serial}"`;
        return info;
    }

      function formatDFUInterfaceAlternate(settings) {
        let mode = "Unknown"
        if (settings.alternate.interfaceProtocol == 0x01) {
            mode = "Runtime";
        } else if (settings.alternate.interfaceProtocol == 0x02) {
            mode = "DFU";
        }

        const cfg = settings.configuration.configurationValue;
        const intf = settings["interface"].interfaceNumber;
        const alt = settings.alternate.alternateSetting;
        const name = (settings.name) ? settings.name : "UNKNOWN";

        return `${mode}: cfg=${cfg}, intf=${intf}, alt=${alt}, name="${name}"`;
    }


    // Expose logging functions to be called from app.js script
    let logContext = null;
    function setLogContext(div) { logContext = div; }
    function clearLog(context) {
         if (typeof context === 'undefined') { context = logContext; }
         if (context) { context.innerHTML = ""; }
     }
    function logDebug(msg) { console.log(msg); } // Keep console logging
    function logInfo(msg) {
        if (logContext) {
            let info = document.createElement("p");
            info.className = "info"; // Add classes if needed for styling log lines
            info.textContent = msg;
            logContext.appendChild(info);
            logContext.scrollTop = logContext.scrollHeight; // Scroll to bottom
        }
     }
    function logWarning(msg) {
         if (logContext) {
             let warning = document.createElement("p");
             warning.className = "warning";
             warning.textContent = "⚠️ " + msg; // Add emoji?
             logContext.appendChild(warning);
             logContext.scrollTop = logContext.scrollHeight;
         }
     }
    function logError(msg) {
         if (logContext) {
             let error = document.createElement("p");
             error.className = "error";
             error.textContent = "❌ " + msg; // Add emoji?
             logContext.appendChild(error);
             logContext.scrollTop = logContext.scrollHeight;
         }
     }
    function logProgress(done, total) {
         if (logContext) {
            let progressBar;
             // Find existing progress bar
             progressBar = logContext.querySelector("progress");

            if (!progressBar) { // Create if doesn't exist
                progressBar = document.createElement("progress");
                logContext.appendChild(progressBar);
            }
            progressBar.value = done;
            if (typeof total !== 'undefined') {
                progressBar.max = total;
            }
             // Optional: Remove progress bar when done?
             // if (done >= total) {
             //     progressBar.remove();
             //     logInfo("Progress complete.");
             // }
         }
     }
    function logSuccess(msg) { // Make logSuccess available here too
        if (logContext) {
            let success = document.createElement("p");
            success.className = "success";
             success.textContent = "✅ " + msg; // Add emoji?
            logContext.appendChild(success);
            logContext.scrollTop = logContext.scrollHeight;
        }
     }


    // Keep DFU descriptor functions
    function getDFUDescriptorProperties(device) {
        // Attempt to read the DFU functional descriptor
         if (!device || !device.device_ || !device.settings) return Promise.reject("Invalid device object in getDFUDescriptorProperties");
        return device.readConfigurationDescriptor(0).then(
            data => {
                let configDesc = dfu.parseConfigurationDescriptor(data);
                let funcDesc = null;
                let configValue = device.settings.configuration.configurationValue;
                if (configDesc.bConfigurationValue == configValue) {
                    for (let desc of configDesc.descriptors) {
                        if (desc.bDescriptorType == 0x21 && desc.hasOwnProperty("bcdDFUVersion")) {
                            funcDesc = desc;
                            break;
                        }
                    }
                }

                if (funcDesc) {
                    return {
                        WillDetach:            ((funcDesc.bmAttributes & 0x08) != 0),
                        ManifestationTolerant: ((funcDesc.bmAttributes & 0x04) != 0),
                        CanUpload:             ((funcDesc.bmAttributes & 0x02) != 0),
                        CanDnload:             ((funcDesc.bmAttributes & 0x01) != 0),
                        TransferSize:          funcDesc.wTransferSize,
                        DetachTimeOut:         funcDesc.wDetachTimeOut,
                        DFUVersion:            funcDesc.bcdDFUVersion
                    };
                } else {
                    // Return default values or empty object if descriptor not found
                     console.warn("DFU Functional Descriptor not found. Using defaults.");
                     return {
                         WillDetach: true,
                         ManifestationTolerant: true,
                         CanUpload: false, // Assume standard DFU cannot upload without descriptor
                         CanDnload: true,
                         TransferSize: 1024, // Default
                         DetachTimeOut: 0,
                         DFUVersion: 0x0100 // Default DFU version 1.0
                     };
                }
            },
            error => {
                 console.error("Failed to read configuration descriptor:", error);
                 // Return default values on error
                 return {
                     WillDetach: true, ManifestationTolerant: true, CanUpload: false,
                     CanDnload: true, TransferSize: 1024, DetachTimeOut: 0, DFUVersion: 0x0100
                 };
             }
        );
     }

    async function fixInterfaceNames(device_, interfaces) {
         // Check if any interface names were not read correctly
         if (interfaces.some(intf => (intf.name == null))) {
             console.log("Attempting to fix interface names...");
             let tempDevice = new dfu.Device(device_, interfaces[0]); // Need a temporary device
             try {
                 await tempDevice.device_.open();
                 // Ensure configuration is selected before reading descriptors
                 if (!tempDevice.device_.configuration) {
                      const confValue = interfaces[0].configuration.configurationValue;
                      console.log(`Selecting configuration ${confValue} on temp device...`);
                      await tempDevice.device_.selectConfiguration(confValue);
                  } else {
                       console.log(`Temp device already has configuration ${tempDevice.device_.configuration.configurationValue} selected.`);
                  }

                 let mapping = await tempDevice.readInterfaceNames();
                 await tempDevice.close(); // Close temp device

                 for (let intf of interfaces) {
                     if (intf.name === null && mapping) { // Check mapping exists
                         let configIndex = intf.configuration.configurationValue;
                         let intfNumber = intf["interface"].interfaceNumber;
                         let alt = intf.alternate.alternateSetting;
                         if (mapping[configIndex]?.[intfNumber]?.[alt]) {
                             intf.name = mapping[configIndex][intfNumber][alt];
                             console.log(`Fixed name for Cfg ${configIndex}, Intf ${intfNumber}, Alt ${alt}: ${intf.name}`);
                         } else {
                             console.warn(`Could not find mapping for Cfg ${configIndex}, Intf ${intfNumber}, Alt ${alt}`);
                         }
                     }
                 }
             } catch (error) {
                 console.error("Error fixing interface names:", error);
                 // Ensure temp device is closed on error, even if open failed partially
                 if (tempDevice && tempDevice.device_.opened) {
                     try { await tempDevice.close(); } catch (e) { console.error("Error closing temp device:", e); }
                 }
             }
         }
     }

    // Removed: populateInterfaceList function as the dialog is not used.

    let onDisconnectCallback = null; // Callback for disconnect events

    function setOnDisconnectCallback(callback) {
        onDisconnectCallback = callback;
    }

    function onDisconnect(reason) {
        if (onDisconnectCallback) {
            onDisconnectCallback(reason); // Call the callback set by app.js
        } else {
            console.log("onDisconnect (no callback set):", reason);
        }
        // Reset internal state if needed (clearing 'device' might be handled by app.js now)
        // device = null;
    }

    function onUnexpectedDisconnect(event) {
        // Use the internal 'device' reference for checking
        if (device !== null && device.device_ !== null) {
            if (device.device_ === event.device) {
                console.log("Unexpected disconnect detected for current device");
                // Prevent multiple calls if disconnect/close is already in progress
                if (!device.disconnected) {
                     device.disconnected = true; // Mark as disconnected internally
                     onDisconnect("Device disconnected unexpectedly"); // Trigger the handler
                }
            }
        }
    }

    // --- CORE Connect Function (Modified, DfuSe check removed) ---
    async function connect(usbDevice, interfaceIndex = 0) {
        if (!usbDevice) throw new Error("No USB device provided to connect function.");

        let interfaces = dfu.findDeviceDfuInterfaces(usbDevice);
        if (interfaces.length === 0) {
            throw new Error("The selected device does not have any USB DFU interfaces.");
        }
        if (interfaceIndex < 0 || interfaceIndex >= interfaces.length) {
             console.warn(`Invalid interface index ${interfaceIndex}, using 0.`);
             interfaceIndex = 0;
        }

        fixInterfaceNames(usbDevice, interfaces).catch(err => console.warn("Failed to fix interface names:", err));

        let dfuDevice = new dfu.Device(usbDevice, interfaces[interfaceIndex]);

        try {
            console.log("Waiting briefly before opening device...");
            await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay

            console.log("Opening device...");
            await dfuDevice.open();
            console.log("Device opened.");
        } catch (error) {
            console.error("Failed to open device:", error);
            throw error;
        }

        let desc = {};
        try {
            console.log("Getting DFU properties...");
            desc = await getDFUDescriptorProperties(dfuDevice);
             console.log("DFU properties:", desc);
             dfuDevice.properties = desc;
        } catch (error) {
             console.warn("Could not get DFU properties: " + error);
        }

        dfuDevice.logDebug = logDebug;
        dfuDevice.logInfo = logInfo;
        dfuDevice.logWarning = logWarning;
        dfuDevice.logError = logError;
        dfuDevice.logProgress = logProgress;
        dfuDevice.logSuccess = logSuccess;

        // Set the internal device variable (important for onUnexpectedDisconnect)
        // Ensure this assignment happens *after* the object is fully configured
        device = dfuDevice;
        console.log("Device connection established:", device);
        return device; // Return the dfu.Device object
    }


    // --- Firmware Loading ---
    let firmwareFile = null;
    function loadFirmware(url = "zephyr.signed.bin") {
        return new Promise((resolve, reject) => {
            let firmwareReader = new FileReader();
            firmwareReader.onloadend = function() {
                if (firmwareReader.result && firmwareReader.result.byteLength > 0) {
                     firmwareFile = firmwareReader.result;
                     console.log(`Firmware loaded (${firmwareFile.byteLength} bytes)`);
                     resolve(firmwareFile);
                } else {
                     console.error("Firmware loading error: Empty or invalid file content.");
                     firmwareFile = null;
                     reject(new Error("Failed to read firmware: Empty file content"));
                }
            };
             firmwareReader.onerror = function(err) {
                 console.error("Firmware loading error:", err);
                 firmwareFile = null;
                 reject(new Error(`Failed to read firmware file: ${err}`));
             };

             console.log("Fetching firmware from:", url);
            fetch(url)
                .then(resp => {
                    if (!resp.ok) {
                        throw new Error(`HTTP error ${resp.status} while fetching ${url}`);
                    }
                    if (resp.headers.get("content-length") === "0") {
                         throw new Error("Firmware file is empty (Content-Length is 0).");
                    }
                    return resp.blob();
                })
                .then(blob => {
                     if (blob.size === 0) {
                         throw new Error("Fetched firmware blob is empty (blob.size is 0).");
                     }
                    firmwareReader.readAsArrayBuffer(blob);
                })
                .catch(error => {
                    console.error("Fetch firmware error:", error);
                    firmwareFile = null;
                    reject(error);
                 });
        });
    }

    function getFirmwareFile() {
        return firmwareFile;
    }


    // --- Initialize Basic Listeners ---
     function init() {
        // This function is now intended to be called by app.js explicitly
        if (typeof navigator.usb !== 'undefined') {
             // Remove previous listener if exists, to prevent duplicates on multiple calls
             try {
                 navigator.usb.removeEventListener("disconnect", onUnexpectedDisconnect);
             } catch(e) { /* ignore */ }
             navigator.usb.addEventListener("disconnect", onUnexpectedDisconnect);
             console.log("Disconnect listener added/updated by dfuUtil.init().");
        } else {
             console.warn('WebUSB not available.');
        }
    }


    // --- Public API ---
    return {
        init: init,
        connect: connect,
        loadFirmware: loadFirmware,
        getFirmwareFile: getFirmwareFile,
        setOnDisconnectCallback: setOnDisconnectCallback,
        setLogContext: setLogContext,
        logInfo: logInfo,
        logWarning: logWarning,
        logError: logError,
        logProgress: logProgress,
        logSuccess: logSuccess,
        clearLog: clearLog,
        getDevice: function() { return device; },
    };

})();