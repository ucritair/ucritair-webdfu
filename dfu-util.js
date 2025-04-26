/* dfu-util.js - Adjusted for external orchestration */
var device = null; // Keep global 'device' for potential use by dfu.js internals if they rely on it
// Assign the result of the IIFE to the global dfuUtil variable
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
        if (n >= gigabyte) { return n / gigabyte + "GiB"; }
        else if (n >= megabyte) { return n / megabyte + "MiB"; }
        else if (n >= kilobyte) { return n / kilobyte + "KiB"; }
        else { return n + "B"; }
    }

     function formatDFUSummary(device) {
        if (!device || !device.device_) return "Invalid device object";
        const vid = hex4(device.device_.vendorId); const pid = hex4(device.device_.productId);
        const name = device.device_.productName; let mode = "Unknown";
        if (device.settings.alternate.interfaceProtocol == 0x01) { mode = "Runtime"; }
        else if (device.settings.alternate.interfaceProtocol == 0x02) { mode = "DFU"; }
        const cfg = device.settings.configuration.configurationValue; const intf = device.settings["interface"].interfaceNumber;
        const alt = device.settings.alternate.alternateSetting; const serial = device.device_.serialNumber;
        let info = `${mode}: [${vid}:${pid}] cfg=${cfg}, intf=${intf}, alt=${alt}, name="${name}" serial="${serial}"`; return info;
    }

      function formatDFUInterfaceAlternate(settings) {
        let mode = "Unknown";
        if (settings.alternate.interfaceProtocol == 0x01) { mode = "Runtime"; }
        else if (settings.alternate.interfaceProtocol == 0x02) { mode = "DFU"; }
        const cfg = settings.configuration.configurationValue; const intf = settings["interface"].interfaceNumber;
        const alt = settings.alternate.alternateSetting; const name = (settings.name) ? settings.name : "UNKNOWN";
        return `${mode}: cfg=${cfg}, intf=${intf}, alt=${alt}, name="${name}"`;
    }

    let logContext = null;
    function setLogContext(div) { logContext = div; }
    function clearLog(context) { if (typeof context === 'undefined') { context = logContext; } if (context) { context.innerHTML = ""; } }
    function logDebug(msg) { console.log(msg); }
    function logInfo(msg) { if (logContext) { let e = document.createElement("p"); e.className = "info"; e.textContent = msg; logContext.appendChild(e); logContext.scrollTop = logContext.scrollHeight; } }
    function logWarning(msg) { if (logContext) { let e = document.createElement("p"); e.className = "warning"; e.textContent = "⚠️ " + msg; logContext.appendChild(e); logContext.scrollTop = logContext.scrollHeight; } }
    function logError(msg) { if (logContext) { let e = document.createElement("p"); e.className = "error"; e.textContent = "❌ " + msg; logContext.appendChild(e); logContext.scrollTop = logContext.scrollHeight; } }
    function logProgress(done, total) { if (logContext) { let p = logContext.querySelector("progress"); if (!p) { p = document.createElement("progress"); logContext.appendChild(p); } p.value = done; if (typeof total !== 'undefined') { p.max = total; } } }
    function logSuccess(msg) { if (logContext) { let e = document.createElement("p"); e.className = "success"; e.textContent = "✅ " + msg; logContext.appendChild(e); logContext.scrollTop = logContext.scrollHeight; } }

    function getDFUDescriptorProperties(device) {
         if (!device || !device.device_ || !device.settings) return Promise.reject("Invalid device object");
        return device.readConfigurationDescriptor(0).then(
            data => {
                let configDesc = dfu.parseConfigurationDescriptor(data); let funcDesc = null; let configValue = device.settings.configuration.configurationValue;
                if (configDesc.bConfigurationValue == configValue) { for (let d of configDesc.descriptors) { if (d.bDescriptorType == 0x21 && d.hasOwnProperty("bcdDFUVersion")) { funcDesc = d; break; } } }
                if (funcDesc) { return { WillDetach:((funcDesc.bmAttributes&0x08)!=0), ManifestationTolerant:((funcDesc.bmAttributes&0x04)!=0), CanUpload:((funcDesc.bmAttributes&0x02)!=0), CanDnload:((funcDesc.bmAttributes&0x01)!=0), TransferSize: funcDesc.wTransferSize, DetachTimeOut: funcDesc.wDetachTimeOut, DFUVersion: funcDesc.bcdDFUVersion }; }
                else { console.warn("DFU Functional Descriptor not found."); return { WillDetach: true, ManifestationTolerant: true, CanUpload: false, CanDnload: true, TransferSize: 1024, DetachTimeOut: 0, DFUVersion: 0x0100 }; } },
            error => { console.error("Failed read config descriptor:", error); return { WillDetach: true, ManifestationTolerant: true, CanUpload: false, CanDnload: true, TransferSize: 1024, DetachTimeOut: 0, DFUVersion: 0x0100 }; } );
    }

    async function fixInterfaceNames(device_, interfaces) {
         if (interfaces.some(intf => (intf.name == null))) {
             console.log("Attempting to fix interface names..."); let tempDevice = new dfu.Device(device_, interfaces[0]);
             try {
                 await tempDevice.device_.open();
                 if (!tempDevice.device_.configuration) { const confValue = interfaces[0].configuration.configurationValue; console.log(`Selecting config ${confValue} on temp device...`); await tempDevice.device_.selectConfiguration(confValue); }
                 else { console.log(`Temp device already has config ${tempDevice.device_.configuration.configurationValue}`); }
                 let mapping = await tempDevice.readInterfaceNames(); await tempDevice.close();
                 for (let intf of interfaces) { if (intf.name === null && mapping) { let cfgIdx = intf.configuration.configurationValue; let intfNum = intf["interface"].interfaceNumber; let alt = intf.alternate.alternateSetting;
                         if (mapping[cfgIdx]?.[intfNum]?.[alt]) { intf.name = mapping[cfgIdx][intfNum][alt]; console.log(`Fixed name for Cfg ${cfgIdx}, Intf ${intfNum}, Alt ${alt}: ${intf.name}`); }
                         else { console.warn(`Could not find map for Cfg ${cfgIdx}, Intf ${intfNum}, Alt ${alt}`); } } }
             } catch (error) { console.error("Error fixing interface names:", error); if (tempDevice?.device_?.opened) { try { await tempDevice.close(); } catch (e) { console.error("Error closing temp device:", e); } } }
         }
    }

    let onDisconnectCallback = null;
    function setOnDisconnectCallback(callback) { onDisconnectCallback = callback; }
    function onDisconnect(reason) { if (onDisconnectCallback) { onDisconnectCallback(reason); } else { console.log("onDisconnect (no callback):", reason); } }
    function onUnexpectedDisconnect(event) { if (device?.device_ === event.device) { console.log("Unexpected disconnect detected"); if (!device.disconnected) { device.disconnected = true; onDisconnect("Device disconnected unexpectedly"); } } }

    // --- CORE Connect Function ---
    async function connect(usbDevice, interfaceIndex = 0) {
        if (!usbDevice) throw new Error("No USB device provided"); let interfaces = dfu.findDeviceDfuInterfaces(usbDevice);
        if (interfaces.length === 0) { throw new Error("Device has no DFU interfaces"); }
        if (interfaceIndex < 0 || interfaceIndex >= interfaces.length) { console.warn(`Invalid interface index ${interfaceIndex}, using 0.`); interfaceIndex = 0; }
        fixInterfaceNames(usbDevice, interfaces).catch(err => console.warn("Failed to fix names:", err));
        let dfuDevice = new dfu.Device(usbDevice, interfaces[interfaceIndex]);
        try {
            console.log("Waiting briefly before opening device...");
            // <<< CHANGE: Use standard Promise/setTimeout instead of sleep >>>
            await new Promise(resolve => setTimeout(resolve, 200));
            // <<< END CHANGE >>>
            console.log("Opening device..."); await dfuDevice.open(); console.log("Device opened.");
        } catch (error) { console.error("Failed to open device:", error); throw error; }
        try {
            console.log("Getting DFU properties..."); let desc = await getDFUDescriptorProperties(dfuDevice);
            console.log("DFU properties:", desc); dfuDevice.properties = desc;
        } catch (error) { console.warn("Could not get DFU properties: " + error); }
        dfuDevice.logDebug = logDebug; dfuDevice.logInfo = logInfo; dfuDevice.logWarning = logWarning; dfuDevice.logError = logError; dfuDevice.logProgress = logProgress; dfuDevice.logSuccess = logSuccess;
        device = dfuDevice; console.log("Device connection established:", device); return device;
    }

    // --- Firmware Loading ---
    let firmwareFile = null;
    function loadFirmware(url = "zephyr.signed.bin") {
        return new Promise((resolve, reject) => {
            let fr = new FileReader();
            fr.onloadend = () => { if (fr.result?.byteLength > 0) { firmwareFile = fr.result; console.log(`FW loaded (${firmwareFile.byteLength} bytes)`); resolve(firmwareFile); } else { console.error("FW error: Empty content."); firmwareFile = null; reject(new Error("Failed read FW: Empty")); } };
            fr.onerror = (err) => { console.error("FW read error:", err); firmwareFile = null; reject(new Error(`Failed read FW: ${err}`)); };
            console.log("Fetching firmware from:", url); fetch(url)
                .then(resp => { if (!resp.ok) throw new Error(`HTTP ${resp.status} fetching ${url}`); if (resp.headers.get("content-length") === "0") throw new Error("FW empty (Content-Length 0)."); return resp.blob(); })
                .then(blob => { if (blob.size === 0) throw new Error("Fetched FW blob empty."); fr.readAsArrayBuffer(blob); })
                .catch(error => { console.error("Fetch FW error:", error); firmwareFile = null; reject(error); }); });
    }
    function getFirmwareFile() { return firmwareFile; }

    // --- Initialize Basic Listeners ---
     function init() {
        if (typeof navigator.usb !== 'undefined') {
             try { navigator.usb.removeEventListener("disconnect", onUnexpectedDisconnect); } catch(e) {}
             navigator.usb.addEventListener("disconnect", onUnexpectedDisconnect);
             console.log("Disconnect listener added/updated by dfuUtil.init().");
        } else { console.warn('WebUSB not available.'); }
    }

    // --- Public API ---
    return {
        init: init, connect: connect, loadFirmware: loadFirmware, getFirmwareFile: getFirmwareFile,
        setOnDisconnectCallback: setOnDisconnectCallback, setLogContext: setLogContext,
        logInfo: logInfo, logWarning: logWarning, logError: logError, logProgress: logProgress, logSuccess: logSuccess,
        clearLog: clearLog, getDevice: function() { return device; }, };

})();

// Call init() immediately after the IIFE has executed
dfuUtil.init();