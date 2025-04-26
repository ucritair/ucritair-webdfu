var dfu = {};

(function() {
    'use strict';

    dfu.DETACH = 0x00;
    dfu.DNLOAD = 0x01;
    dfu.UPLOAD = 0x02;
    dfu.GETSTATUS = 0x03;
    dfu.CLRSTATUS = 0x04;
    dfu.GETSTATE = 0x05;
    dfu.ABORT = 6;

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

    dfu.STATUS_OK = 0x0;

    dfu.Device = function(device, settings) {
        this.device_ = device;
        this.settings = settings;
        this.intfNumber = settings["interface"].interfaceNumber;
    };

    dfu.findDeviceDfuInterfaces = function(device) {
        let interfaces = [];
        for (let conf of device.configurations) {
            for (let intf of conf.interfaces) {
                for (let alt of intf.alternates) {
                    if (alt.interfaceClass == 0xFE &&
                        alt.interfaceSubclass == 0x01 &&
                        (alt.interfaceProtocol == 0x01 || alt.interfaceProtocol == 0x02)) {
                        let settings = {
                            "configuration": conf,
                            "interface": intf,
                            "alternate": alt,
                            "name": alt.interfaceName
                        };
                        interfaces.push(settings);
                    }
                }
            }
        }

        return interfaces;
    }

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

    dfu.Device.prototype.logDebug = function(msg) {
        // Replaced with dfu-util logging
    };

    dfu.Device.prototype.logInfo = function(msg) {
        console.log(msg); // Fallback if not overridden
    };

    dfu.Device.prototype.logWarning = function(msg) {
        console.warn(msg); // Fallback if not overridden
    };

    dfu.Device.prototype.logError = function(msg) {
        console.error(msg); // Fallback if not overridden
    };

    dfu.Device.prototype.logProgress = function(done, total) {
        if (typeof total === 'undefined') {
            console.log(done)
        } else {
            console.log(done + '/' + total);
        }
    };

    dfu.Device.prototype.open = async function() {
        await this.device_.open();
        const confValue = this.settings.configuration.configurationValue;
        if (this.device_.configuration === null ||
            this.device_.configuration.configurationValue != confValue) {
            await this.device_.selectConfiguration(confValue);
        }

        const intfNumber = this.settings["interface"].interfaceNumber;
        if (!this.device_.configuration.interfaces[intfNumber].claimed) {
            await this.device_.claimInterface(intfNumber);
        }

        const altSetting = this.settings.alternate.alternateSetting;
        let intf = this.device_.configuration.interfaces[intfNumber];
        if (intf.alternate === null ||
            intf.alternate.alternateSetting != altSetting ||
            intf.alternates.length > 1) { // Added check for multiple alternates
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

    dfu.Device.prototype.close = async function() {
        try {
            // Release interface before closing might help on some OSes
             if (this.device_.configuration && this.device_.configuration.interfaces[this.intfNumber]?.claimed) {
                 await this.device_.releaseInterface(this.intfNumber).catch(e => console.warn("Release interface error:", e));
             }
            await this.device_.close();
        } catch (error) {
            // Log error but don't throw, as closing might fail if device disconnected
            console.log("Error during device close:", error);
        }
    };

    dfu.Device.prototype.readDeviceDescriptor = function() {
        const GET_DESCRIPTOR = 0x06;
        const DT_DEVICE = 0x01;
        const wValue = (DT_DEVICE << 8);

        return this.device_.controlTransferIn({
            "requestType": "standard",
            "recipient": "device",
            "request": GET_DESCRIPTOR,
            "value": wValue,
            "index": 0
        }, 18).then(
            result => {
                if (result.status == "ok") {
                     return Promise.resolve(result.data);
                } else {
                    return Promise.reject(result.status);
                }
            }
        );
    };

    dfu.Device.prototype.readStringDescriptor = async function(index, langID) {
        if (typeof langID === 'undefined') {
            langID = 0;
        }

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
            // Read length first
            var result = await this.device_.controlTransferIn(request_setup, 1);

            if (result.status == "ok" && result.data.byteLength > 0) {
                const bLength = result.data.getUint8(0);
                if (bLength > 0) {
                    // Retrieve the full descriptor
                    result = await this.device_.controlTransferIn(request_setup, bLength);
                    if (result.status == "ok") {
                        const len = (bLength-2) / 2;
                        let u16_words = [];
                        for (let i=0; i < len; i++) {
                            u16_words.push(result.data.getUint16(2+i*2, true));
                        }
                        if (langID == 0) {
                            // Return the langID array
                            return u16_words;
                        } else {
                            // Decode from UCS-2 into a string
                            return String.fromCharCode.apply(String, u16_words);
                        }
                    }
                } else {
                     return ""; // Empty descriptor
                }
            }
        } catch (error) {
            throw `Failed to read string descriptor ${index} (langID ${langID}): ${error}`;
        }

        throw `Failed to read string descriptor ${index}: ${result?.status || 'unknown error'}`;
    };


    dfu.Device.prototype.readInterfaceNames = async function() {
        const DT_INTERFACE = 4;

        let configs = {};
        let allStringIndices = new Set();
        if (!this.device_.configurations) return {}; // Guard against missing configurations

        for (let configIndex=0; configIndex < this.device_.configurations.length; configIndex++) {
            const rawConfig = await this.readConfigurationDescriptor(configIndex);
            if (!rawConfig) continue; // Skip if reading failed
            let configDesc = dfu.parseConfigurationDescriptor(rawConfig);
            let configValue = configDesc.bConfigurationValue;
            configs[configValue] = {};

            // Retrieve string indices for interface names
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
        }

        let strings = {};
        // Retrieve interface name strings (using default langID 0x0409 = English)
        for (let index of allStringIndices) {
            try {
                strings[index] = await this.readStringDescriptor(index, 0x0409);
            } catch (error) {
                console.warn("Failed to read string descriptor", index, error);
                strings[index] = null;
            }
        }

        // Map names back
        for (let configValue in configs) {
            for (let intfNumber in configs[configValue]) {
                for (let alt in configs[configValue][intfNumber]) {
                    const iIndex = configs[configValue][intfNumber][alt];
                    configs[configValue][intfNumber][alt] = strings[iIndex];
                }
            }
        }

        return configs;
    };


    dfu.parseDeviceDescriptor = function(data) {
        return {
            bLength:            data.getUint8(0),
            bDescriptorType:    data.getUint8(1),
            bcdUSB:             data.getUint16(2, true),
            bDeviceClass:       data.getUint8(4),
            bDeviceSubClass:    data.getUint8(5),
            bDeviceProtocol:    data.getUint8(6),
            bMaxPacketSize:     data.getUint8(7),
            idVendor:           data.getUint16(8, true),
            idProduct:          data.getUint16(10, true),
            bcdDevice:          data.getUint16(12, true),
            iManufacturer:      data.getUint8(14),
            iProduct:           data.getUint8(15),
            iSerialNumber:      data.getUint8(16),
            bNumConfigurations: data.getUint8(17),
        };
    };

    dfu.parseConfigurationDescriptor = function(data) {
        let descriptorData = new DataView(data.buffer.slice(9)); // Start after header
        let descriptors = dfu.parseSubDescriptors(descriptorData);
        return {
            bLength:            data.getUint8(0),
            bDescriptorType:    data.getUint8(1),
            wTotalLength:       data.getUint16(2, true),
            bNumInterfaces:     data.getUint8(4),
            bConfigurationValue:data.getUint8(5),
            iConfiguration:     data.getUint8(6),
            bmAttributes:       data.getUint8(7),
            bMaxPower:          data.getUint8(8),
            descriptors:        descriptors
        };
    };

    dfu.parseInterfaceDescriptor = function(data) {
        return {
            bLength:            data.getUint8(0),
            bDescriptorType:    data.getUint8(1),
            bInterfaceNumber:   data.getUint8(2),
            bAlternateSetting:  data.getUint8(3),
            bNumEndpoints:      data.getUint8(4),
            bInterfaceClass:    data.getUint8(5),
            bInterfaceSubClass: data.getUint8(6),
            bInterfaceProtocol: data.getUint8(7),
            iInterface:         data.getUint8(8),
            descriptors:        [] // Sub-descriptors stored here
        };
    };

    dfu.parseFunctionalDescriptor = function(data) {
        return {
            bLength:           data.getUint8(0),
            bDescriptorType:   data.getUint8(1), // Should be 0x21
            bmAttributes:      data.getUint8(2),
            wDetachTimeOut:    data.getUint16(3, true),
            wTransferSize:     data.getUint16(5, true),
            bcdDFUVersion:     data.getUint16(7, true)
        };
    };

    dfu.parseSubDescriptors = function(descriptorData) {
        const DT_INTERFACE = 4;
        const DT_ENDPOINT = 5;
        const DT_DFU_FUNCTIONAL = 0x21;
        const USB_CLASS_APP_SPECIFIC = 0xFE;
        const USB_SUBCLASS_DFU = 0x01;

        let remainingData = descriptorData;
        let descriptors = [];
        let currIntf = null; // Track the current interface descriptor
        let inDfuIntf = false; // Track if we are inside a DFU interface scope

        while (remainingData.byteLength >= 2) { // Need at least length and type
            let bLength = remainingData.getUint8(0);
            if (bLength < 2 || bLength > remainingData.byteLength) {
                console.error("Invalid descriptor length:", bLength);
                break;
            }
            let bDescriptorType = remainingData.getUint8(1);
            let descData = new DataView(remainingData.buffer, remainingData.byteOffset, bLength);

            if (bDescriptorType == DT_INTERFACE) {
                currIntf = dfu.parseInterfaceDescriptor(descData);
                // Check if this interface is a DFU interface
                inDfuIntf = (currIntf.bInterfaceClass == USB_CLASS_APP_SPECIFIC &&
                             currIntf.bInterfaceSubClass == USB_SUBCLASS_DFU);
                descriptors.push(currIntf); // Add interface to the main list
            } else if (inDfuIntf && bDescriptorType == DT_DFU_FUNCTIONAL) {
                let funcDesc = dfu.parseFunctionalDescriptor(descData);
                descriptors.push(funcDesc); // Add functional descriptor to the main list
                if (currIntf) {
                    // Associate functional descriptor with the current DFU interface
                    currIntf.descriptors.push(funcDesc);
                }
            } else {
                // Handle other descriptor types (like Endpoint) or non-DFU interfaces
                let desc = {
                    bLength: bLength,
                    bDescriptorType: bDescriptorType,
                    data: descData // Store raw data for other types if needed
                };
                 if (currIntf) {
                     // Associate with the current interface if applicable
                     currIntf.descriptors.push(desc);
                 } else {
                     // Or add to the main list if not inside an interface scope (shouldn't happen often)
                     descriptors.push(desc);
                 }
                 // Reset DFU interface scope if we encounter a non-functional descriptor within it
                 // inDfuIntf = false; // Depends on exact structure, might not be needed
            }

            // Advance to the next descriptor
            remainingData = new DataView(remainingData.buffer, remainingData.byteOffset + bLength);
        }

        return descriptors;
    };


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
                if (result.status == "ok" && result.data.byteLength >= 4) {
                    let wLength = result.data.getUint16(2, true);
                    // Now read the full descriptor
                    return this.device_.controlTransferIn({
                        "requestType": "standard",
                        "recipient": "device",
                        "request": GET_DESCRIPTOR,
                        "value": wValue,
                        "index": 0
                    }, wLength);
                } else {
                    return Promise.reject("Failed to read configuration descriptor length: " + result.status);
                }
            }
        ).then(
            result => {
                if (result.status == "ok") {
                    return Promise.resolve(result.data);
                } else {
                    return Promise.reject("Failed to read full configuration descriptor: " + result.status);
                }
            }
        );
    };

    dfu.Device.prototype.requestOut = function(bRequest, data, wValue=0) {
        return this.device_.controlTransferOut({
            "requestType": "class",
            "recipient": "interface",
            "request": bRequest,
            "value": wValue,
            "index": this.intfNumber
        }, data).then(
            result => {
                if (result.status == "ok") {
                    return Promise.resolve(result.bytesWritten);
                } else {
                    return Promise.reject(result.status);
                }
            },
            error => {
                return Promise.reject("ControlTransferOut failed: " + error);
            }
        );
    };

    dfu.Device.prototype.requestIn = function(bRequest, wLength, wValue=0) {
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
                return Promise.reject("ControlTransferIn failed: " + error);
            }
        );
    };

    dfu.Device.prototype.detach = function() {
        return this.requestOut(dfu.DETACH, undefined, 1000); // 1s timeout for detach
    }

    dfu.Device.prototype.waitDisconnected = async function(timeout) {
        let device = this;
        let usbDevice = this.device_;
        return new Promise(function(resolve, reject) {
            let timeoutID = null; // Initialize timeoutID
            if (timeout > 0) {
                timeoutID = setTimeout(() => { // Use arrow function for correct 'this'
                    navigator.usb.removeEventListener("disconnect", onDisconnect);
                    if (device.disconnected !== true) {
                        reject("Disconnect timeout expired");
                    }
                    // If already disconnected, timeout doesn't matter, resolve below will handle it
                }, timeout);
            }

            const onDisconnect = (event) => { // Use arrow function
                if (event.device === usbDevice) {
                    if (timeoutID) { // Clear timeout if disconnect happens first
                        clearTimeout(timeoutID);
                    }
                    device.disconnected = true; // Mark as disconnected
                    navigator.usb.removeEventListener("disconnect", onDisconnect);
                    event.stopPropagation(); // Prevent other listeners
                    resolve(device);
                }
            };

            // Check if already disconnected before adding listener
            if (device.disconnected === true) {
                if (timeoutID) clearTimeout(timeoutID);
                resolve(device);
                return;
            }

            navigator.usb.addEventListener("disconnect", onDisconnect);
        });
    };


    dfu.Device.prototype.download = function(data, blockNum) {
        return this.requestOut(dfu.DNLOAD, data, blockNum);
    };

    dfu.Device.prototype.dnload = dfu.Device.prototype.download; // Alias

    dfu.Device.prototype.upload = function(length, blockNum) {
        return this.requestIn(dfu.UPLOAD, length, blockNum)
    };

    dfu.Device.prototype.clearStatus = function() {
        return this.requestOut(dfu.CLRSTATUS);
    };

    dfu.Device.prototype.clrStatus = dfu.Device.prototype.clearStatus; // Alias

    dfu.Device.prototype.getStatus = function() {
        return this.requestIn(dfu.GETSTATUS, 6).then( // DFU status is 6 bytes
            data => {
                // Check data length for safety
                if (data.byteLength !== 6) {
                     return Promise.reject("Invalid DFU status response length: " + data.byteLength);
                }
                return Promise.resolve({
                    // bStatus - Device's interpretation of the error code
                    "status": data.getUint8(0),
                    // bwPollTimeout - Minimum time (ms) device needs before processing next request
                    "pollTimeout": data.getUint32(1, true) & 0xFFFFFF, // Only 3 bytes used
                    // bState - Current state of the DFU device
                    "state": data.getUint8(4),
                    // iString - Optional string descriptor index (often unused)
                    // "iString": data.getUint8(5)
                });
             },
            error =>
                Promise.reject("DFU GETSTATUS failed: " + error)
        );
    };

    dfu.Device.prototype.getState = function() {
        return this.requestIn(dfu.GETSTATE, 1).then(
            data => Promise.resolve(data.getUint8(0)),
            error => Promise.reject("DFU GETSTATE failed: " + error)
        );
    };

    dfu.Device.prototype.abort = function() {
        return this.requestOut(dfu.ABORT);
    };

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

    dfu.Device.prototype.do_upload = async function(xfer_size, max_size=Infinity, first_block=0) {
        let transaction = first_block;
        let blocks = [];
        let bytes_read = 0;

        this.logInfo("Copying data from DFU device to browser");
        // Initialize progress to 0
        this.logProgress(0, Number.isFinite(max_size) ? max_size : undefined);

        let result;
        let bytes_to_read;
        do {
            bytes_to_read = Math.min(xfer_size, max_size - bytes_read);
            if (bytes_to_read <= 0) break; // Avoid reading 0 bytes

            result = await this.upload(bytes_to_read, transaction++);
            this.logDebug(`Read ${result.byteLength} bytes (requested ${bytes_to_read})`);
            if (result.byteLength > 0) {
                blocks.push(result); // Push DataView directly
                bytes_read += result.byteLength;
            }

            if (Number.isFinite(max_size)) {
                this.logProgress(bytes_read, max_size);
            } else {
                this.logProgress(bytes_read);
            }

            // Break if we received less data than requested (often signifies end of data)
            // or if we've read the maximum requested size.
        } while ((bytes_read < max_size) && (result.byteLength === bytes_to_read));

        if (bytes_read === max_size && Number.isFinite(max_size)) {
             this.logInfo("Read maximum requested size.");
             // Don't necessarily abort here, might depend on protocol
             // await this.abortToIdle();
        } else {
            this.logInfo("Upload finished.");
        }

        this.logSuccess(`Read ${bytes_read} bytes total.`); // Use logSuccess

        // Combine DataViews into a single ArrayBuffer, then Blob
        let totalBuffer = new Uint8Array(bytes_read);
        let offset = 0;
        for (const block of blocks) {
             totalBuffer.set(new Uint8Array(block.buffer, block.byteOffset, block.byteLength), offset);
             offset += block.byteLength;
        }

        return new Blob([totalBuffer], { type: "application/octet-stream" });
    };


    dfu.Device.prototype.poll_until = async function(state_predicate) {
        let dfu_status;
        try {
            dfu_status = await this.getStatus();
        } catch (error) {
            // If getStatus fails (e.g., device disconnects), rethrow
            this.logError("poll_until: getStatus failed - " + error);
            throw new Error("poll_until: getStatus failed - " + error);
        }


        let device = this;
        async function async_sleep(duration_ms) {
            return new Promise(function(resolve) { // Removed reject
                device.logDebug(`Sleeping for ${duration_ms}ms...`);
                setTimeout(resolve, duration_ms);
            });
        }

        while (!state_predicate(dfu_status.state) && dfu_status.state != dfu.dfuERROR) {
            // Ensure pollTimeout is reasonable
            let PTime = dfu_status.pollTimeout;
            if (PTime < 5) { // Prevent too-rapid polling
                 PTime = 5;
            } else if (PTime > 5000) { // Prevent excessive waits
                 this.logWarning(`pollTimeout seems high (${PTime}ms), capping to 5000ms`);
                 PTime = 5000;
            }
            await async_sleep(PTime);
            try {
                 dfu_status = await this.getStatus();
            } catch (error) {
                 // If getStatus fails during polling, rethrow
                 this.logError("poll_until: getStatus failed during loop - " + error);
                 throw new Error("poll_until: getStatus failed during loop - " + error);
            }
        }

        // Check for DFU error state after loop
        if (dfu_status.state === dfu.dfuERROR) {
             this.logError(`Device entered ERROR state ${dfu_status.status}`);
             try {
                  await this.clearStatus(); // Attempt to clear error
                  dfu_status = await this.getStatus(); // Check state again after clearing
                  this.logInfo(`Status after clear: state=${dfu_status.state}, status=${dfu_status.status}`);
                  // If still in error or not the target state, throw
                  if (dfu_status.state === dfu.dfuERROR || !state_predicate(dfu_status.state)) {
                       throw new Error(`DFU Error Status ${dfu_status.status}`);
                  }
                  // If clearing worked and we reached the target state, return the status
             } catch (clearError) {
                  throw new Error(`DFU Error Status ${dfu_status.status}, clear failed: ${clearError}`);
             }
        }

        return dfu_status; // Return the status that satisfied the predicate
    };

    dfu.Device.prototype.poll_until_idle = function(idle_state) {
        return this.poll_until(state => (state == idle_state));
    };

    dfu.Device.prototype.do_download = async function(xfer_size, data, manifestationTolerant) {
        let bytes_sent = 0;
        let expected_size = data.byteLength;
        let transaction = 0; // DFU block number starts from 0

        if (!data || expected_size === 0) {
            throw new Error("No data provided for download.");
        }

        this.logInfo(`Copying data from browser to DFU device (${expected_size} bytes)...`);

        // Initialize progress to 0
        this.logProgress(bytes_sent, expected_size);

        // Initial state check and clear if necessary
        try {
             let status = await this.getStatus();
             this.logDebug(`Initial state: ${status.state}, status: ${status.status}`);
             if (status.state === dfu.dfuERROR) {
                  this.logWarning("Device in error state, attempting to clear...");
                  await this.clearStatus();
                  status = await this.getStatus();
                  if (status.state === dfu.dfuERROR) {
                       throw new Error(`Device stuck in DFU error state ${status.status}`);
                  }
             }
        } catch(error) {
             throw new Error("Failed to get initial DFU status: " + error);
        }

        while (bytes_sent < expected_size) {
            const bytes_left = expected_size - bytes_sent;
            const chunk_size = Math.min(bytes_left, xfer_size);
            const block_num = transaction++; // Block number for this chunk

            let chunk_data = data.slice(bytes_sent, bytes_sent + chunk_size);

            let bytes_written = 0;
            let dfu_status;
            try {
                this.logDebug(`Sending block ${block_num} (${chunk_size} bytes)...`);
                bytes_written = await this.download(chunk_data, block_num);
                this.logDebug(`Sent ${bytes_written} bytes for block ${block_num}`);

                 // Poll until idle state is reached after download command
                dfu_status = await this.poll_until_idle(dfu.dfuDNLOAD_IDLE);
                this.logDebug(`Status after block ${block_num}: state=${dfu_status.state}, status=${dfu_status.status}`);

            } catch (error) {
                throw `Error during DFU download block ${block_num}: ${error}`;
            }

            // Check status after polling
            if (dfu_status.status != dfu.STATUS_OK) {
                 this.logError(`DFU DOWNLOAD failed: State=${dfu_status.state}, Status=${dfu_status.status}`);
                throw `DFU DOWNLOAD failed state=${dfu_status.state}, status=${dfu_status.status}`;
            }

            // Note: bytes_written from controlTransferOut isn't always reliable for DFU block size.
            // Trust the chunk_size for progress update.
            bytes_sent += chunk_size;
            this.logProgress(bytes_sent, expected_size);
        }

        this.logDebug("Sending Zero-Length Packet (ZLP) to finalize download...");
        try {
            // Send ZLP using block number 'transaction'
            await this.download(new ArrayBuffer(0), transaction++);
            this.logDebug(`Status after ZLP: state=${dfu_status.state}, status=${dfu_status.status}`);

            // Poll after ZLP. Device should transition towards manifest phase.
            // Target state depends on manifestationTolerant.
             if (manifestationTolerant) {
                 this.logInfo("Polling for dfuIDLE (manifestation tolerant)...");
                 dfu_status = await this.poll_until(state => (state == dfu.dfuIDLE || state == dfu.dfuMANIFEST_WAIT_RESET || state == dfu.dfuMANIFEST_SYNC));
             } else {
                 this.logInfo("Polling for dfuMANIFEST_SYNC (manifestation not tolerant)...");
                 dfu_status = await this.poll_until(state => (state == dfu.dfuMANIFEST_SYNC || state == dfu.dfuMANIFEST_WAIT_RESET));
             }

            this.logDebug(`Status after ZLP poll: state=${dfu_status.state}, status=${dfu_status.status}`);

            if (dfu_status.status != dfu.STATUS_OK) {
                 this.logError(`DFU ZLP failed: State=${dfu_status.state}, Status=${dfu_status.status}`);
                throw `DFU ZLP failed state=${dfu_status.state}, status=${dfu_status.status}`;
            }

        } catch (error) {
            throw "Error during final DFU download phase (ZLP): " + error;
        }

        this.logSuccess(`Wrote ${bytes_sent} bytes`);
        this.logInfo("Manifesting new firmware...");

        // --- Reset Logic ---
        // Reset is often needed to exit DFU mode and run the new application.
        // This might fail on some OS/device combos, especially if the device
        // disconnects quickly after manifestation.
        this.logDebug("Attempting final device reset...");
        try {
            await this.device_.reset();
            this.logInfo("Device reset successfully.");
        } catch (error) {
            // *** MODIFIED CATCH BLOCK ***
            const errorString = String(error); // Convert error to string for robust comparison
            if (errorString.includes("Unable to reset the device.") ||
                errorString.includes("Device unavailable.") ||
                errorString.includes("The device was disconnected.")) {
                // Log these common post-DFU reset issues as warnings/debug, not errors
                this.logWarning("Expected error during reset (device likely disconnected/re-enumerated): " + errorString);
                 // Successfully ignored, do nothing more. The device likely reset itself.
            } else {
                 // This is an unexpected error during reset
                 this.logError("Unexpected error during reset for manifestation: " + errorString);
                // Optionally re-throw if you need the calling code to know about unexpected reset failures
                // throw new Error("Unexpected error during reset for manifestation: " + error);
            }
        }

        // Download process completed (reset attempt made, may or may not have thrown ignored error)
        return;
    };

})(); // End IIFE