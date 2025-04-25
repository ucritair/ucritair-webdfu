/* dfu-util.js - Adjusted for external orchestration */
var device = null; // Keep global 'device' for potential use by dfu.js/dfuse.js internals if they rely on it
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


    // Expose logging functions to be called from index.html script
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
             // Remove progress bar when done? Optional.
             if (done >= total) {
                 // Maybe replace with text?
                 // progressBar.remove();
                 // logInfo("Progress complete.");
             }
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
        // TODO: read the selected configuration's descriptor
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
                     return {
                         WillDetach: true, // Assume true if not found? Or false?
                         ManifestationTolerant: true, // Assume true
                         CanUpload: true,
                         CanDnload: true,
                         TransferSize: 1024, // Default
                         DetachTimeOut: 0,
                         DFUVersion: 0x0100 // Default
                     };
                }
            },
            error => {
                 console.error("Failed to read configuration descriptor:", error);
                 // Return default values on error
                  return {
                     WillDetach: true, ManifestationTolerant: true, CanUpload: true,
                     CanDnload: true, TransferSize: 1024, DetachTimeOut: 0, DFUVersion: 0x0100
                 };
             }
        );
     }

    async function fixInterfaceNames(device_, interfaces) {
         // Check if any interface names were not read correctly
         if (interfaces.some(intf => (intf.name == null))) {
             // Manually retrieve the interface name string descriptors
             console.log("Attempting to fix interface names...");
             // Need a temporary device to open and read descriptors
             let tempDevice = new dfu.Device(device_, interfaces[0]);
             try {
                 await tempDevice.device_.open();
                 if (!tempDevice.device_.configuration) {
                     await tempDevice.device_.selectConfiguration(1); // Assuming configuration 1
                 }
                 let mapping = await tempDevice.readInterfaceNames();
                 await tempDevice.close(); // Close temp device

                 for (let intf of interfaces) {
                     if (intf.name === null) {
                         let configIndex = intf.configuration.configurationValue;
                         let intfNumber = intf["interface"].interfaceNumber;
                         let alt = intf.alternate.alternateSetting;
                         if (mapping && mapping[configIndex] && mapping[configIndex][intfNumber] && mapping[configIndex][intfNumber][alt]) {
                             intf.name = mapping[configIndex][intfNumber][alt];
                             console.log(`Fixed name for Cfg ${configIndex}, Intf ${intfNumber}, Alt ${alt}: ${intf.name}`);
                         } else {
                             console.warn(`Could not find mapping for Cfg ${configIndex}, Intf ${intfNumber}, Alt ${alt}`);
                         }
                     }
                 }
             } catch (error) {
                 console.error("Error fixing interface names:", error);
                 if (tempDevice && tempDevice.device_.opened) {
                     await tempDevice.close(); // Ensure temp device is closed on error
                 }
                 // Proceed without fixed names if necessary
             }
         }
     }

    function populateInterfaceList(form, device_, interfaces) { /* ... as before ... */ }


    let onDisconnectCallback = null; // Callback for disconnect events

    function setOnDisconnectCallback(callback) {
        onDisconnectCallback = callback;
    }

    function onDisconnect(reason) {
        if (onDisconnectCallback) {
            onDisconnectCallback(reason); // Call the callback set by index.html
        } else {
            // Default behavior if no callback set (e.g., initial page load before setup)
            console.log("onDisconnect (no callback set):", reason);
        }
        // Reset internal state
        device = null; // Clear the global device reference
    }

    function onUnexpectedDisconnect(event) {
        // Access the *global* device variable directly here as it's used for comparison
        if (device !== null && device.device_ !== null) {
            if (device.device_ === event.device) {
                console.log("Unexpected disconnect detected for current device");
                if (device.disconnected !== true) { // Prevent multiple calls
                     device.disconnected = true; // Mark as disconnected
                     onDisconnect("Device disconnected unexpectedly"); // Trigger the disconnect handler
                }
            }
        }
    }

    // --- CORE Connect Function (Modified) ---
    // This now focuses ONLY on establishing the connection and setting up the device object
    // It returns the dfu.Device object on success.
    async function connect(usbDevice, interfaceIndex = 0) {
        if (!usbDevice) throw new Error("No USB device provided to connect function.");

        let interfaces = dfu.findDeviceDfuInterfaces(usbDevice);
        if (interfaces.length === 0) {
            throw new Error("The selected device does not have any USB DFU interfaces.");
        }
        if (interfaceIndex >= interfaces.length) {
             throw new Error(`Selected interface index ${interfaceIndex} is invalid.`);
        }

        // Fix names before creating the dfu.Device if needed
         // Don't await here, let it run in background or make it synchronous if possible
        fixInterfaceNames(usbDevice, interfaces).catch(err => console.warn("Failed to fix interface names:", err)); // Run async but don't block connection

        // Create the specific DFU device object
        let dfuDevice = new dfu.Device(usbDevice, interfaces[interfaceIndex]);

        try {
            // *** ADDED DELAY HERE ***
            console.log("Waiting briefly before opening device...");
            await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay

            console.log("Opening device...");
            await dfuDevice.open();
            console.log("Device opened.");
        } catch (error) {
            // Don't call onDisconnect here, let the caller handle UI
            console.error("Failed to open device:", error);
            throw error; // Rethrow for the caller
        }

        let desc = {};
        try {
            console.log("Getting DFU properties...");
            desc = await getDFUDescriptorProperties(dfuDevice);
             console.log("DFU properties:", desc);
        } catch (error) {
             // Don't disconnect here, let the caller handle it
            console.warn("Could not get DFU properties: " + error);
             // Proceed anyway, might be a non-standard DFU device
        }

        // Store properties and check for DfuSe
        if (desc && Object.keys(desc).length > 0) {
            dfuDevice.properties = desc;
             // Check for DfuSe device AFTER getting properties
             if (desc.DFUVersion == 0x011a && dfuDevice.settings.alternate.interfaceProtocol == 0x02) {
                console.log("Detected DfuSe device");
                // Re-create device as dfuse.Device, passing existing device and settings
                // Make sure dfuse.Device is available globally or passed in
                if (typeof dfuse !== 'undefined' && typeof dfuse.Device === 'function') {
                     dfuDevice = new dfuse.Device(dfuDevice.device_, dfuDevice.settings);
                    // dfuse constructor parses memory info from settings.name
                     console.log("Memory Info:", dfuDevice.memoryInfo);
                 } else {
                     console.error("dfuse.Device is not defined!");
                 }
             }
        } else {
            console.warn("DFU functional descriptor not found or properties empty.");
        }


        // Bind logging methods from this closure
        dfuDevice.logDebug = logDebug;
        dfuDevice.logInfo = logInfo;
        dfuDevice.logWarning = logWarning;
        dfuDevice.logError = logError;
        dfuDevice.logProgress = logProgress;
        dfuDevice.logSuccess = logSuccess; // Add success log


        // Set the global device variable (important for onUnexpectedDisconnect)
        device = dfuDevice;
        console.log("Device connection established:", device);
        return device; // Return the device object
    }


    // --- Firmware Loading ---
    let firmwareFile = null;
    function loadFirmware(url = "zephyr.signed.bin") {
        return new Promise((resolve, reject) => {
            let firmwareReader = new FileReader();
            firmwareReader.onloadend = function() {
                firmwareFile = firmwareReader.result;
                console.log(`Firmware loaded (${firmwareFile?.byteLength || 0} bytes)`);
                resolve(firmwareFile);
            };
             firmwareReader.onerror = function(err) {
                 console.error("Firmware loading error:", err);
                 firmwareFile = null;
                 reject(new Error("Failed to read firmware file from blob"));
             };

             console.log("Fetching firmware from:", url);
            fetch(url)
                .then(resp => {
                    if (!resp.ok) {
                        throw new Error(`HTTP error! status: ${resp.status} while fetching ${url}`);
                    }
                    return resp.blob();
                })
                .then(blob => {
                     if (blob.size === 0) {
                         throw new Error("Fetched firmware blob is empty.");
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
        if (typeof navigator.usb !== 'undefined') {
             navigator.usb.addEventListener("disconnect", onUnexpectedDisconnect);
             console.log("Disconnect listener added.");
        } else {
             console.warn('WebUSB not available.');
             // UI update for no WebUSB is handled in index.html
        }
    }


    // --- Public API ---
    return {
        init: init,
        connect: connect, // Expose the core connect function
        loadFirmware: loadFirmware, // Expose firmware loader
        getFirmwareFile: getFirmwareFile, // Expose firmware getter
        setOnDisconnectCallback: setOnDisconnectCallback, // Allow index.html to handle disconnects
        setLogContext: setLogContext, // Expose log context setter
        logInfo: logInfo, // Expose logging functions
        logWarning: logWarning,
        logError: logError,
        logProgress: logProgress,
        logSuccess: logSuccess,
        clearLog: clearLog, // Expose log clearing
        getDevice: function() { return device; }, // Way to get current *global* device reference
        // Expose helpers if needed by index.html
        // formatDFUSummary: formatDFUSummary,
        // niceSize: niceSize,
    };

})();

// Initialize basic listeners on script load
dfuUtil.init();