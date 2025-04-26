var dfu = {};

(function() {
    'use strict';

    // DFU request constants
    dfu.DETACH = 0x00;
    dfu.DNLOAD = 0x01;
    dfu.UPLOAD = 0x02;
    dfu.GETSTATUS = 0x03;
    dfu.CLRSTATUS = 0x04;
    dfu.GETSTATE = 0x05;
    dfu.ABORT = 6;

    // DFU state constants
    dfu.appIDLE = 0;
    dfu.appDETACH = 1;
    dfu.dfuIDLE = 2;
    dfu.dfuDNLOAD_SYNC = 3;
    dfu.dfuDNBUSY = 4;
    dfu.dfuDNLOAD_IDLE = 5;
    dfu.dfuMANIFEST_SYNC = 6;
    dfu.dfuMANIFEST = 7;
    dfu.dfuMANIFEST_WAIT_RESET = 8;
    dfu.dfuUPLOAD_IDLE = 9;
    dfu.dfuERROR = 10;

    // DFU status constants
    dfu.STATUS_OK = 0x0; // No error
    // Other DFU status codes (from spec) could be added here if needed for detailed error handling

    /**
     * DFU Device object constructor.
     * @param {USBDevice} device - The WebUSB device instance.
     * @param {object} settings - The DFU interface settings (configuration, interface, alternate).
     */
    dfu.Device = function(device, settings) {
        this.device_ = device; // The underlying WebUSB device
        this.settings = settings; // Selected DFU interface settings
        this.intfNumber = settings["interface"].interfaceNumber; // Interface number for requests
        this.properties = null; // To store DFU functional descriptor properties
        this.logDebug = function(msg) {}; // Placeholder, should be overridden
        this.logInfo = function(msg) { console.log(msg); }; // Fallback
        this.logWarning = function(msg) { console.warn(msg); }; // Fallback
        this.logError = function(msg) { console.error(msg); }; // Fallback
        this.logProgress = function(done, total) { console.log(done + '/' + total); }; // Fallback
        this.logSuccess = function(msg) { console.log(msg); }; // Fallback
    };

    /**
     * Finds DFU interfaces on a given WebUSB device.
     * @param {USBDevice} device - The WebUSB device.
     * @returns {Array<object>} - An array of DFU interface settings objects.
     */
    dfu.findDeviceDfuInterfaces = function(device) {
        let interfaces = [];
        if (!device.configurations) return interfaces; // Guard against unconfigured devices

        for (let conf of device.configurations) {
            for (let intf of conf.interfaces) {
                for (let alt of intf.alternates) {
                    // Check for standard DFU interface class, subclass, and protocol (Runtime or DFU Mode)
                    if (alt.interfaceClass == 0xFE &&    // Application Specific Class
                        alt.interfaceSubclass == 0x01 && // Device Firmware Update Subclass
                        (alt.interfaceProtocol == 0x01 || // DFU Runtime Protocol
                         alt.interfaceProtocol == 0x02)) { // DFU Mode Protocol
                        let settings = {
                            "configuration": conf,
                            "interface": intf,
                            "alternate": alt,
                            "name": alt.interfaceName // May be null, might need manual reading
                        };
                        interfaces.push(settings);
                    }
                }
            }
        }
        return interfaces;
    }

    /**
     * Finds all connected devices with DFU interfaces.
     * @returns {Promise<Array<dfu.Device>>} - A promise resolving to an array of dfu.Device objects.
     */
    dfu.findAllDfuInterfaces = function() {
        return navigator.usb.getDevices().then(
            devices => {
                let matches = [];
                for (let device of devices) {
                    let interfaces = dfu.findDeviceDfuInterfaces(device);
                    for (let interface_ of interfaces) {
                        matches.push(new dfu.Device(device, interface_))
                    }
                }
                return matches;
            }
        )
    };

    // --- Device Prototype Methods ---

    /**
     * Opens the device, selects the configuration, claims the interface, and selects the alternate setting.
     * @returns {Promise<void>}
     */
    dfu.Device.prototype.open = async function() {
        await this.device_.open();
        const confValue = this.settings.configuration.configurationValue;
        // Select configuration if necessary
        if (this.device_.configuration === null ||
            this.device_.configuration.configurationValue != confValue) {
            await this.device_.selectConfiguration(confValue);
        }

        // Claim interface if necessary
        const intfNumber = this.settings["interface"].interfaceNumber;
        if (!this.device_.configuration.interfaces[intfNumber].claimed) {
            await this.device_.claimInterface(intfNumber);
        }

        // Select alternate interface if necessary
        const altSetting = this.settings.alternate.alternateSetting;
        let intf = this.device_.configuration.interfaces[intfNumber];
        if (intf.alternate === null ||
            intf.alternate.alternateSetting != altSetting ||
            intf.alternates.length > 1) { // Also select if multiple alternates exist, even if current is correct
            try {
                await this.device_.selectAlternateInterface(intfNumber, altSetting);
            } catch (error) {
                 // Workaround for Chrome issue #711285: Ignore redundant SET_INTERFACE request
                 // This might happen if the device is already in the correct alternate setting.
                if (intf.alternate !== null && intf.alternate.alternateSetting == altSetting &&
                    error.message?.includes("Unable to set device interface.")) {
                    this.logWarning(`Redundant SET_INTERFACE request ignored for altSetting ${altSetting}`);
                } else {
                    throw error; // Rethrow other errors
                }
            }
        }
    }

    /**
     * Closes the device connection.
     * @returns {Promise<void>}
     */
    dfu.Device.prototype.close = async function() {
        try {
            // Attempt to release the interface before closing
             if (this.device_.opened && this.device_.configuration && this.device_.configuration.interfaces[this.intfNumber]?.claimed) {
                 await this.device_.releaseInterface(this.intfNumber).catch(e => this.logWarning("Release interface error (ignored): " + e));
             }
            await this.device_.close();
        } catch (error) {
            // Log error but don't throw, as closing might fail if device disconnected unexpectedly
            this.logError("Error during device close: " + error);
        }
    };

    /**
     * Reads the device descriptor.
     * @returns {Promise<DataView>} - A promise resolving to the device descriptor data.
     */
    dfu.Device.prototype.readDeviceDescriptor = function() {
        const GET_DESCRIPTOR = 0x06;
        const DT_DEVICE = 0x01;
        const wValue = (DT_DEVICE << 8); // Descriptor type and index

        return this.device_.controlTransferIn({
            "requestType": "standard",
            "recipient": "device",
            "request": GET_DESCRIPTOR,
            "value": wValue,
            "index": 0 // Language ID (not applicable for device descriptor)
        }, 18).then( // Device descriptor is 18 bytes
            result => {
                if (result.status == "ok") {
                     return Promise.resolve(result.data);
                } else {
                    return Promise.reject(result.status);
                }
            }
        );
    };

    /**
     * Reads a string descriptor from the device.
     * @param {number} index - The string descriptor index.
     * @param {number} [langID=0] - The language ID (0 to get supported languages, typically 0x0409 for US English).
     * @returns {Promise<string|Array<number>>} - A promise resolving to the string or an array of langIDs if index is 0.
     */
    dfu.Device.prototype.readStringDescriptor = async function(index, langID = 0) {
        const GET_DESCRIPTOR = 0x06;
        const DT_STRING = 0x03;
        const wValue = (DT_STRING << 8) | index;

        const request_setup = {
            "requestType": "standard",
            "recipient": "device",
            "request": GET_DESCRIPTOR,
            "value": wValue,
            "index": langID
        }

        try {
            // Read length first (bLength is the first byte)
            var result = await this.device_.controlTransferIn(request_setup, 1);

            if (result.status == "ok" && result.data?.byteLength > 0) {
                const bLength = result.data.getUint8(0);
                if (bLength > 0) {
                    // Retrieve the full descriptor
                    result = await this.device_.controlTransferIn(request_setup, bLength);
                    if (result.status == "ok" && result.data?.byteLength === bLength) {
                        // bDescriptorType is the second byte
                        const bDescriptorType = result.data.getUint8(1);
                        if (bDescriptorType !== DT_STRING) {
                             throw new Error(`Incorrect descriptor type: ${bDescriptorType}, expected ${DT_STRING}`);
                        }
                        // Actual string data starts from the third byte (index 2)
                        const len = (bLength - 2) / 2; // UCS-2 characters (2 bytes each)
                        let u16_words = [];
                        for (let i = 0; i < len; i++) {
                            u16_words.push(result.data.getUint16(2 + i * 2, true)); // Little-endian
                        }
                        if (langID == 0) {
                            // Return the langID array
                            return u16_words;
                        } else {
                            // Decode from UCS-2 into a JavaScript string
                            return String.fromCharCode(...u16_words);
                        }
                    } else {
                         throw new Error(`Failed to read full string descriptor: status=${result.status}, length=${result.data?.byteLength}`);
                    }
                } else {
                     return ""; // Empty descriptor (length is 0)
                }
            } else {
                 throw new Error(`Failed to read string descriptor length: status=${result.status}, length=${result.data?.byteLength}`);
            }
        } catch (error) {
            throw `Error reading string descriptor ${index} (langID ${langID}): ${error}`;
        }
    };

    /**
     * Reads and populates interface names by reading string descriptors.
     * @returns {Promise<object>} - A promise resolving to a nested object mapping config/interface/alt to names.
     */
    dfu.Device.prototype.readInterfaceNames = async function() {
        const DT_INTERFACE = 4;
        const US_ENGLISH_LANGID = 0x0409;

        let configs = {};
        let allStringIndices = new Set();
        if (!this.device_.configurations) return {}; // Guard

        for (let configIndex = 0; configIndex < this.device_.configurations.length; configIndex++) {
            try {
                const rawConfig = await this.readConfigurationDescriptor(configIndex);
                if (!rawConfig) continue;
                let configDesc = dfu.parseConfigurationDescriptor(rawConfig);
                let configValue = configDesc.bConfigurationValue;
                configs[configValue] = {};

                // Find all interface descriptors and collect their iInterface string indices
                for (let desc of configDesc.descriptors) {
                    if (desc.bDescriptorType == DT_INTERFACE) {
                        if (!(desc.bInterfaceNumber in configs[configValue])) {
                            configs[configValue][desc.bInterfaceNumber] = {};
                        }
                        configs[configValue][desc.bInterfaceNumber][desc.bAlternateSetting] = desc.iInterface;
                        if (desc.iInterface > 0) {
                            allStringIndices.add(desc.iInterface);
                        }
                    }
                }
            } catch (error) {
                this.logWarning(`Could not read/parse config descriptor ${configIndex}: ${error}`);
            }
        }

        let strings = {};
        // Retrieve all unique interface name strings
        for (let index of allStringIndices) {
            try {
                strings[index] = await this.readStringDescriptor(index, US_ENGLISH_LANGID);
            } catch (error) {
                this.logWarning(`Failed to read string descriptor index ${index}: ${error}`);
                strings[index] = null; // Mark as failed
            }
        }

        // Map the retrieved strings back into the config structure
        for (let configValue in configs) {
            for (let intfNumber in configs[configValue]) {
                for (let alt in configs[configValue][intfNumber]) {
                    const iIndex = configs[configValue][intfNumber][alt];
                    configs[configValue][intfNumber][alt] = strings[iIndex] || null; // Use null if reading failed
                }
            }
        }
        return configs;
    };

    // --- Descriptor Parsing Functions ---

    /** Parses the raw device descriptor data. */
    dfu.parseDeviceDescriptor = function(data) {
        return {
            bLength:            data.getUint8(0),
            bDescriptorType:    data.getUint8(1),
            bcdUSB:             data.getUint16(2, true), // USB spec version
            bDeviceClass:       data.getUint8(4),
            bDeviceSubClass:    data.getUint8(5),
            bDeviceProtocol:    data.getUint8(6),
            bMaxPacketSize:     data.getUint8(7), // Max packet size for EP0
            idVendor:           data.getUint16(8, true),
            idProduct:          data.getUint16(10, true),
            bcdDevice:          data.getUint16(12, true), // Device release number
            iManufacturer:      data.getUint8(14), // Index of manufacturer string
            iProduct:           data.getUint8(15), // Index of product string
            iSerialNumber:      data.getUint8(16), // Index of serial number string
            bNumConfigurations: data.getUint8(17),
        };
    };

    /** Parses the raw configuration descriptor data (including sub-descriptors). */
    dfu.parseConfigurationDescriptor = function(data) {
        let descriptorData = new DataView(data.buffer, data.byteOffset + 9, data.byteLength - 9); // Sub-descriptors start after header
        let descriptors = dfu.parseSubDescriptors(descriptorData);
        return {
            bLength:            data.getUint8(0),
            bDescriptorType:    data.getUint8(1), // Should be 0x02
            wTotalLength:       data.getUint16(2, true), // Total length of this descriptor + all sub-descriptors
            bNumInterfaces:     data.getUint8(4),
            bConfigurationValue:data.getUint8(5), // ID for this configuration
            iConfiguration:     data.getUint8(6), // Index of string descriptor for this config
            bmAttributes:       data.getUint8(7), // Bitmap (e.g., self-powered, remote wakeup)
            bMaxPower:          data.getUint8(8), // Max power consumption (in 2mA units)
            descriptors:        descriptors // Array of parsed sub-descriptors
        };
    };

    /** Parses the raw interface descriptor data. */
    dfu.parseInterfaceDescriptor = function(data) {
        return {
            bLength:            data.getUint8(0),
            bDescriptorType:    data.getUint8(1), // Should be 0x04
            bInterfaceNumber:   data.getUint8(2), // ID for this interface
            bAlternateSetting:  data.getUint8(3), // ID for this alternate setting
            bNumEndpoints:      data.getUint8(4), // Number of endpoints used (excluding EP0)
            bInterfaceClass:    data.getUint8(5),
            bInterfaceSubClass: data.getUint8(6),
            bInterfaceProtocol: data.getUint8(7),
            iInterface:         data.getUint8(8), // Index of string descriptor for this interface
            descriptors:        [] // Placeholder for endpoint/functional descriptors
        };
    };

    /** Parses the raw DFU functional descriptor data. */
    dfu.parseFunctionalDescriptor = function(data) {
        return {
            bLength:           data.getUint8(0),
            bDescriptorType:   data.getUint8(1), // Should be 0x21
            bmAttributes:      data.getUint8(2), // DFU attributes bitmap
            wDetachTimeOut:    data.getUint16(3, true), // Timeout in ms for detach
            wTransferSize:     data.getUint16(5, true), // Preferred transfer size
            bcdDFUVersion:     data.getUint16(7, true)  // DFU specification version
        };
    };

    /** Parses an array of raw sub-descriptors (interfaces, endpoints, functional, etc.). */
    dfu.parseSubDescriptors = function(descriptorData) {
        const DT_INTERFACE = 4;
        const DT_ENDPOINT = 5;
        const DT_DFU_FUNCTIONAL = 0x21;
        const USB_CLASS_APP_SPECIFIC = 0xFE;
        const USB_SUBCLASS_DFU = 0x01;

        let remainingData = descriptorData;
        let descriptors = [];
        let currIntf = null; // Track the current interface descriptor being processed
        let inDfuIntf = false; // Track if we are inside a DFU interface's scope

        while (remainingData.byteLength >= 2) { // Need at least length and type bytes
            let bLength = remainingData.getUint8(0);
            // Basic validation for descriptor length
            if (bLength < 2 || bLength > remainingData.byteLength) {
                console.error(`Invalid descriptor length: ${bLength} (remaining: ${remainingData.byteLength})`);
                break;
            }
            let bDescriptorType = remainingData.getUint8(1);
            let descData = new DataView(remainingData.buffer, remainingData.byteOffset, bLength);

            if (bDescriptorType == DT_INTERFACE) {
                currIntf = dfu.parseInterfaceDescriptor(descData);
                // Check if this interface is specifically a DFU interface
                inDfuIntf = (currIntf.bInterfaceClass == USB_CLASS_APP_SPECIFIC &&
                             currIntf.bInterfaceSubClass == USB_SUBCLASS_DFU);
                descriptors.push(currIntf); // Add the interface descriptor to the main list
            } else if (inDfuIntf && bDescriptorType == DT_DFU_FUNCTIONAL) {
                // If we are inside a DFU interface, parse the functional descriptor
                let funcDesc = dfu.parseFunctionalDescriptor(descData);
                descriptors.push(funcDesc); // Add functional descriptor to the main list as well
                if (currIntf) {
                    // Also associate this functional descriptor with its parent interface
                    currIntf.descriptors.push(funcDesc);
                }
            } else {
                // Handle other descriptor types (like Endpoint) or descriptors outside DFU interfaces
                let desc = {
                    bLength: bLength,
                    bDescriptorType: bDescriptorType,
                    data: descData // Store raw data for other types if needed later
                    // Could potentially parse Endpoint descriptors here too if needed
                };
                 if (currIntf) {
                     // Associate with the current interface if we are inside one
                     currIntf.descriptors.push(desc);
                 } else {
                     // Or add to the main list if not currently inside an interface scope
                     descriptors.push(desc);
                 }
                 // If we encounter a non-functional descriptor within a DFU interface,
                 // we might assume the DFU-specific part is over.
                 // if (inDfuIntf) { inDfuIntf = false; } // Optional: depends on descriptor ordering rules
            }

            // Advance the view to the next descriptor
            remainingData = new DataView(remainingData.buffer, remainingData.byteOffset + bLength);
        }

        return descriptors;
    };

    /**
     * Reads the full configuration descriptor for a given index.
     * @param {number} index - The configuration index (usually 0).
     * @returns {Promise<DataView>} - A promise resolving to the raw configuration descriptor data.
     */
    dfu.Device.prototype.readConfigurationDescriptor = function(index) {
        const GET_DESCRIPTOR = 0x06;
        const DT_CONFIGURATION = 0x02;
        const wValue = ((DT_CONFIGURATION << 8) | index);

        return this.device_.controlTransferIn({
            "requestType": "standard",
            "recipient": "device",
            "request": GET_DESCRIPTOR,
            "value": wValue,
            "index": 0
        }, 4).then( // Read first 4 bytes to get wTotalLength
            result => {
                if (result.status == "ok" && result.data?.byteLength >= 4) {
                    let wLength = result.data.getUint16(2, true);
                    // Now read the full descriptor using the obtained length
                    return this.device_.controlTransferIn({
                        "requestType": "standard",
                        "recipient": "device",
                        "request": GET_DESCRIPTOR,
                        "value": wValue,
                        "index": 0
                    }, wLength);
                } else {
                    return Promise.reject(`Failed to read configuration descriptor length: ${result.status}`);
                }
            }
        ).then(
            result => {
                if (result.status == "ok") {
                    return Promise.resolve(result.data);
                } else {
                    return Promise.reject(`Failed to read full configuration descriptor: ${result.status}`);
                }
            }
        );
    };

    // --- DFU Standard Requests ---

    /**
     * Sends a DFU class-specific OUT request.
     * @param {number} bRequest - The DFU request code (e.g., dfu.DNLOAD).
     * @param {ArrayBuffer|DataView} [data] - The data payload for the request.
     * @param {number} [wValue=0] - The wValue for the control transfer (often block number).
     * @returns {Promise<number>} - A promise resolving to the number of bytes written.
     */
    dfu.Device.prototype.requestOut = function(bRequest, data, wValue = 0) {
        return this.device_.controlTransferOut({
            "requestType": "class", // DFU requests are class-specific
            "recipient": "interface", // Target the DFU interface
            "request": bRequest,
            "value": wValue,
            "index": this.intfNumber // DFU interface number
        }, data).then(
            result => {
                if (result.status == "ok") {
                    return Promise.resolve(result.bytesWritten);
                } else {
                    return Promise.reject(result.status);
                }
            },
            error => {
                // Provide more context in the rejection
                return Promise.reject(`ControlTransferOut failed (req ${bRequest}, val ${wValue}): ${error}`);
            }
        );
    };

    /**
     * Sends a DFU class-specific IN request.
     * @param {number} bRequest - The DFU request code (e.g., dfu.GETSTATUS).
     * @param {number} wLength - The number of bytes to read.
     * @param {number} [wValue=0] - The wValue for the control transfer.
     * @returns {Promise<DataView>} - A promise resolving to the data read.
     */
    dfu.Device.prototype.requestIn = function(bRequest, wLength, wValue = 0) {
        return this.device_.controlTransferIn({
            "requestType": "class",
            "recipient": "interface",
            "request": bRequest,
            "value": wValue,
            "index": this.intfNumber
        }, wLength).then(
            result => {
                if (result.status == "ok") {
                    return Promise.resolve(result.data);
                } else {
                    return Promise.reject(result.status);
                }
            },
            error => {
                 // Provide more context in the rejection
                return Promise.reject(`ControlTransferIn failed (req ${bRequest}, val ${wValue}, len ${wLength}): ${error}`);
            }
        );
    };

    /** Sends a DFU_DETACH request. */
    dfu.Device.prototype.detach = function() {
        // wValue = timeout in ms (optional, device-specific)
        return this.requestOut(dfu.DETACH, undefined, 1000);
    }

    /**
     * Waits for the device to disconnect.
     * @param {number} timeout - Maximum time in milliseconds to wait.
     * @returns {Promise<dfu.Device>} - A promise resolving when the device disconnects or rejecting on timeout.
     */
    dfu.Device.prototype.waitDisconnected = async function(timeout) {
        let device = this;
        let usbDevice = this.device_;
        return new Promise(function(resolve, reject) {
            let timeoutID = null;
            if (timeout > 0) {
                timeoutID = setTimeout(() => {
                    navigator.usb.removeEventListener("disconnect", onDisconnect);
                    // Only reject if disconnect event hasn't already happened
                    if (device.disconnected !== true) {
                        reject("Disconnect timeout expired");
                    }
                    // If already disconnected, resolve() below handles it
                }, timeout);
            }

            const onDisconnect = (event) => {
                if (event.device === usbDevice) {
                    if (timeoutID) { clearTimeout(timeoutID); }
                    device.disconnected = true; // Mark internally
                    navigator.usb.removeEventListener("disconnect", onDisconnect);
                    event.stopPropagation(); // Prevent potential bubbling issues
                    resolve(device); // Resolve the promise with the device object
                }
            };

            // Check if already disconnected before adding listener (race condition)
            if (device.disconnected === true) {
                if (timeoutID) clearTimeout(timeoutID);
                resolve(device);
                return;
            }

            navigator.usb.addEventListener("disconnect", onDisconnect);
        });
    };

    /** Sends a DFU_DNLOAD request with data for a specific block. */
    dfu.Device.prototype.download = function(data, blockNum) {
        return this.requestOut(dfu.DNLOAD, data, blockNum);
    };
    dfu.Device.prototype.dnload = dfu.Device.prototype.download; // Alias

    /** Sends a DFU_UPLOAD request to read data for a specific block. */
    dfu.Device.prototype.upload = function(length, blockNum) {
        return this.requestIn(dfu.UPLOAD, length, blockNum)
    };

    /** Sends a DFU_CLRSTATUS request to clear error states. */
    dfu.Device.prototype.clearStatus = function() {
        return this.requestOut(dfu.CLRSTATUS);
    };
    dfu.Device.prototype.clrStatus = dfu.Device.prototype.clearStatus; // Alias

    /** Sends a DFU_GETSTATUS request to get the device's current state and status. */
    dfu.Device.prototype.getStatus = function() {
        return this.requestIn(dfu.GETSTATUS, 6).then( // DFU status response is 6 bytes
            data => {
                // Basic validation
                if (data.byteLength !== 6) {
                     return Promise.reject(`Invalid DFU status response length: ${data.byteLength}`);
                }
                return Promise.resolve({
                    // bStatus: Device's interpretation of the error code (0 = OK)
                    "status": data.getUint8(0),
                    // bwPollTimeout: Minimum time (ms) device needs before next request
                    "pollTimeout": data.getUint32(1, true) & 0xFFFFFF, // Lower 3 bytes
                    // bState: Current state of the DFU device machine
                    "state": data.getUint8(4),
                    // iString: Optional string descriptor index (rarely used)
                    // "iString": data.getUint8(5)
                });
             },
            error =>
                Promise.reject(`DFU GETSTATUS failed: ${error}`)
        );
    };

    /** Sends a DFU_GETSTATE request. */
    dfu.Device.prototype.getState = function() {
        return this.requestIn(dfu.GETSTATE, 1).then(
            data => Promise.resolve(data.getUint8(0)),
            error => Promise.reject(`DFU GETSTATE failed: ${error}`)
        );
    };

    /** Sends a DFU_ABORT request. */
    dfu.Device.prototype.abort = function() {
        return this.requestOut(dfu.ABORT);
    };

    /** Attempts to abort the current operation and return the device to idle state. */
    dfu.Device.prototype.abortToIdle = async function() {
        await this.abort();
        let state = await this.getState();
        if (state == dfu.dfuERROR) {
            await this.clearStatus();
            state = await this.getState();
        }
        if (state != dfu.dfuIDLE) {
            throw `Failed to return to idle state after abort: state ${state}`;
        }
    };

    // --- High-Level Operations ---

    /**
     * Performs a DFU UPLOAD operation to read data from the device.
     * @param {number} xfer_size - The requested transfer size per block.
     * @param {number} [max_size=Infinity] - Maximum number of bytes to read.
     * @param {number} [first_block=0] - The starting block number.
     * @returns {Promise<Blob>} - A promise resolving to a Blob containing the uploaded data.
     */
    dfu.Device.prototype.do_upload = async function(xfer_size, max_size = Infinity, first_block = 0) {
        let transaction = first_block;
        let blocks = []; // Store DataView objects
        let bytes_read = 0;

        this.logInfo("Copying data from DFU device to browser...");
        // Initialize progress
        this.logProgress(0, Number.isFinite(max_size) ? max_size : undefined);

        let result;
        let bytes_to_read;
        do {
            bytes_to_read = Math.min(xfer_size, max_size - bytes_read);
            if (bytes_to_read <= 0) break; // Don't request 0 bytes

            result = await this.upload(bytes_to_read, transaction++);
            this.logDebug(`Read ${result.byteLength} bytes (requested ${bytes_to_read}) for block ${transaction-1}`);

            if (result.byteLength > 0) {
                blocks.push(result); // Store the DataView
                bytes_read += result.byteLength;
            }

            // Update progress
            if (Number.isFinite(max_size)) {
                this.logProgress(bytes_read, max_size);
            } else {
                this.logProgress(bytes_read);
            }

            // Stop if we received less than requested (likely end of data)
            // or if we've reached the max size.
        } while ((bytes_read < max_size) && (result.byteLength === bytes_to_read));

        if (bytes_read === max_size && Number.isFinite(max_size)) {
             this.logInfo("Read maximum requested size.");
             // Consider if abort is needed based on specific device/protocol behavior
             // await this.abortToIdle();
        } else {
            this.logInfo("Upload finished.");
        }

        this.logSuccess(`Read ${bytes_read} bytes total.`);

        // Combine the DataViews into a single ArrayBuffer efficiently
        let totalBuffer = new Uint8Array(bytes_read);
        let offset = 0;
        for (const block of blocks) {
             // Create a Uint8Array view of the DataView's buffer section
             totalBuffer.set(new Uint8Array(block.buffer, block.byteOffset, block.byteLength), offset);
             offset += block.byteLength;
        }

        return new Blob([totalBuffer], { type: "application/octet-stream" });
    };

    /**
     * Polls the device status until a condition is met or an error occurs.
     * @param {function(number): boolean} state_predicate - Function that returns true if the target state is reached.
     * @returns {Promise<object>} - A promise resolving to the final DFU status object.
     */
    dfu.Device.prototype.poll_until = async function(state_predicate) {
        let dfu_status;
        try {
            dfu_status = await this.getStatus();
        } catch (error) {
            this.logError(`poll_until: Initial getStatus failed - ${error}`);
            throw new Error(`poll_until: Initial getStatus failed - ${error}`);
        }

        let device = this;
        async function async_sleep(duration_ms) {
            // Basic sleep function using setTimeout
            return new Promise(resolve => {
                device.logDebug(`Sleeping for ${duration_ms}ms...`);
                setTimeout(resolve, duration_ms);
            });
        }

        while (!state_predicate(dfu_status.state) && dfu_status.state != dfu.dfuERROR) {
            // Use the pollTimeout reported by the device, with sanity checks
            let pollTimeout = dfu_status.pollTimeout;
            if (pollTimeout < 5) { // Prevent busy-waiting
                 pollTimeout = 5;
            } else if (pollTimeout > 5000) { // Prevent excessively long waits
                 this.logWarning(`pollTimeout seems high (${pollTimeout}ms), capping to 5000ms`);
                 pollTimeout = 5000;
            }
            await async_sleep(pollTimeout);
            try {
                 dfu_status = await this.getStatus(); // Poll status again
            } catch (error) {
                 this.logError(`poll_until: getStatus failed during loop - ${error}`);
                 throw new Error(`poll_until: getStatus failed during loop - ${error}`);
            }
        }

        // Handle DFU error state if encountered
        if (dfu_status.state === dfu.dfuERROR) {
             this.logError(`Device entered ERROR state (status=${dfu_status.status})`);
             try {
                  await this.clearStatus(); // Attempt to clear the error
                  dfu_status = await this.getStatus(); // Check state again after clearing
                  this.logInfo(`Status after clear: state=${dfu_status.state}, status=${dfu_status.status}`);
                  // If still in error or not the target state, it's a persistent error
                  if (dfu_status.state === dfu.dfuERROR || !state_predicate(dfu_status.state)) {
                       throw new Error(`DFU Error Status ${dfu_status.status}`);
                  }
                  // If clearing worked and we reached the target state, proceed
             } catch (clearError) {
                  throw new Error(`DFU Error Status ${dfu_status.status}, and clear failed: ${clearError}`);
             }
        }

        // Return the status object that satisfied the predicate or was reached after clearing error
        return dfu_status;
    };

    /** Polls until the device reaches the specified idle state. */
    dfu.Device.prototype.poll_until_idle = function(idle_state) {
        return this.poll_until(state => (state == idle_state));
    };

    /**
     * Performs a DFU DOWNLOAD operation to write data to the device.
     * @param {number} xfer_size - The requested transfer size per block.
     * @param {ArrayBuffer} data - The firmware data to write.
     * @param {boolean} manifestationTolerant - Whether the device handles manifestation without reset.
     * @returns {Promise<void>}
     */
    dfu.Device.prototype.do_download = async function(xfer_size, data, manifestationTolerant) {
        let bytes_sent = 0;
        let expected_size = data.byteLength;
        let transaction = 0; // DFU block number starts from 0 for download

        if (!data || expected_size === 0) {
            throw new Error("No data provided for download.");
        }

        this.logInfo(`Copying data from browser to DFU device (${expected_size} bytes)...`);
        this.logProgress(bytes_sent, expected_size); // Initial progress

        // Check initial state and clear error if needed
        try {
             let status = await this.getStatus();
             this.logDebug(`Initial state: ${status.state}, status: ${status.status}`);
             if (status.state === dfu.dfuERROR) {
                  this.logWarning("Device in error state, attempting to clear...");
                  await this.clearStatus();
                  status = await this.getStatus(); // Re-check status
                  if (status.state === dfu.dfuERROR) {
                       throw new Error(`Device stuck in DFU error state ${status.status}`);
                  }
             }
             // Ensure we are in a state ready for download (typically dfuIDLE)
             if (status.state !== dfu.dfuIDLE && status.state !== dfu.dfuDNLOAD_IDLE) {
                 this.logWarning(`Device not in idle state (${status.state}), attempting abort...`);
                 await this.abortToIdle(); // Try to force idle
             }
        } catch(error) {
             throw new Error(`Failed to get/prepare initial DFU status: ${error}`);
        }

        // Main download loop
        while (bytes_sent < expected_size) {
            const bytes_left = expected_size - bytes_sent;
            const chunk_size = Math.min(bytes_left, xfer_size);
            const block_num = transaction++; // DFU block number for this chunk
            let chunk_data = data.slice(bytes_sent, bytes_sent + chunk_size);
            let dfu_status; // Declare status variable for this block

            try {
                this.logDebug(`Sending block ${block_num} (${chunk_size} bytes)...`);
                await this.download(chunk_data, block_num); // Send data
                this.logDebug(`Sent ${chunk_size} bytes for block ${block_num}`); // Log sent size

                // Poll until device signals it's ready for the next block (dfuDNLOAD_IDLE)
                dfu_status = await this.poll_until_idle(dfu.dfuDNLOAD_IDLE);
                this.logDebug(`Status after block ${block_num}: state=${dfu_status.state}, status=${dfu_status.status}`);

            } catch (error) {
                // Catch errors during download or polling for this block
                throw `Error during DFU download block ${block_num}: ${error}`;
            }

            // Check status after polling for this block
            if (dfu_status.status != dfu.STATUS_OK) {
                 this.logError(`DFU DOWNLOAD failed on block ${block_num}: State=${dfu_status.state}, Status=${dfu_status.status}`);
                throw `DFU DOWNLOAD failed state=${dfu_status.state}, status=${dfu_status.status}`;
            }

            // Update progress based on the chunk size sent
            bytes_sent += chunk_size;
            this.logProgress(bytes_sent, expected_size);
        }

        // Final phase: Send Zero-Length Packet (ZLP) to signal end of data
        this.logDebug("Sending Zero-Length Packet (ZLP) to finalize download...");
        try {
            let dfu_status; // Declare status variable for ZLP phase
            await this.download(new ArrayBuffer(0), transaction++); // Send ZLP with next block number

            // Poll after ZLP. Device should transition towards manifest phase.
            // The target state depends on whether the device is manifestation tolerant.
             if (manifestationTolerant) {
                 this.logInfo("Polling for dfuIDLE (manifestation tolerant)...");
                 // Tolerant devices might go directly to IDLE or briefly through MANIFEST states
                 dfu_status = await this.poll_until(state => (state == dfu.dfuIDLE || state == dfu.dfuMANIFEST_WAIT_RESET || state == dfu.dfuMANIFEST_SYNC));
             } else {
                 this.logInfo("Polling for dfuMANIFEST_SYNC (manifestation not tolerant)...");
                 // Non-tolerant devices usually require explicit manifestation sync
                 dfu_status = await this.poll_until(state => (state == dfu.dfuMANIFEST_SYNC || state == dfu.dfuMANIFEST_WAIT_RESET));
             }

            this.logDebug(`Status after ZLP poll: state=${dfu_status.state}, status=${dfu_status.status}`);

            // Check status after ZLP polling
            if (dfu_status.status != dfu.STATUS_OK) {
                 this.logError(`DFU ZLP/Manifest phase failed: State=${dfu_status.state}, Status=${dfu_status.status}`);
                throw `DFU ZLP/Manifest phase failed state=${dfu_status.state}, status=${dfu_status.status}`;
            }

        } catch (error) {
             // Catch errors specifically during the ZLP send or subsequent poll
            throw `Error during final DFU download phase (ZLP): ${error}`;
        }

        this.logSuccess(`Wrote ${bytes_sent} bytes`);
        this.logInfo("Manifesting new firmware (via reset)...");

        // --- Final Reset ---
        // Attempt USB reset to make the device exit DFU mode and run the new firmware.
        // This is often where OS-specific issues occur (like the original Windows error).
        this.logDebug("Attempting final device reset...");
        try {
            await this.device_.reset();
            this.logInfo("Device reset command sent successfully.");
        } catch (error) {
            // Use the refined error handling from the previous step
            const errorString = String(error);
            if (errorString.includes("Unable to reset the device.") ||
                errorString.includes("Device unavailable.") ||
                errorString.includes("The device was disconnected.")) {
                // Log these common, expected errors as warnings/debug, not critical failures
                this.logWarning(`Expected error during reset (device likely disconnected/re-enumerated): ${errorString}`);
                // Assume reset happened or will happen, proceed.
            } else {
                 // Log unexpected errors during reset more seriously
                 this.logError(`Unexpected error during final reset: ${errorString}`);
                 // Optionally re-throw if this should halt the process from the caller's perspective
                 // throw new Error(`Unexpected error during reset for manifestation: ${error}`);
            }
        }

        // Download process considered complete at this point.
        return;
    };

})(); // End IIFE