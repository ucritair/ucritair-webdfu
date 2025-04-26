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
        this.memoryInfo = null; // Add placeholder for potential DfuSe info
        this.startAddress = NaN; // Add placeholder for potential DfuSe info
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
                            "name": alt.interfaceName // Store descriptor name if available
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

    // Default logging functions (can be overridden)
    dfu.Device.prototype.logDebug = function(msg) { console.debug(msg); };
    dfu.Device.prototype.logInfo = function(msg) { console.log(msg); };
    dfu.Device.prototype.logWarning = function(msg) { console.warn(msg); };
    dfu.Device.prototype.logError = function(msg) { console.error(msg); };
    dfu.Device.prototype.logProgress = function(done, total) { console.log(done + '/' + total); };
    dfu.Device.prototype.logSuccess = function(msg) { console.log(msg); }; // Add success log stub

    dfu.Device.prototype.open = async function() {
        await this.device_.open();
        const confValue = this.settings.configuration.configurationValue;
        // Select configuration if necessary
        if (this.device_.configuration === null || this.device_.configuration.configurationValue !== confValue) {
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
        if (intf.alternate === null || intf.alternate.alternateSetting != altSetting) {
            await this.device_.selectAlternateInterface(intfNumber, altSetting);
        }
    }

    dfu.Device.prototype.close = async function() {
        try {
            // Release interface before closing
            if (this.device_.configuration && this.settings?.["interface"]?.interfaceNumber !== undefined) {
                 try {
                     await this.device_.releaseInterface(this.settings["interface"].interfaceNumber);
                 } catch(e) {
                     this.logWarning(`Failed to release interface ${this.settings["interface"].interfaceNumber}: ${e}`);
                 }
            }
            await this.device_.close();
            this.logInfo("Device closed");
        } catch (error) {
            this.logError(`Error closing device: ${error}`);
        }
    };

    // Read device descriptor (standard USB request)
    dfu.Device.prototype.readDeviceDescriptor = function() { /* ... unchanged ... */ };
    // Read string descriptor (standard USB request)
    dfu.Device.prototype.readStringDescriptor = async function(index, langID) { /* ... unchanged ... */ };
    // Read interface names using string descriptors
    dfu.Device.prototype.readInterfaceNames = async function() { /* ... unchanged ... */ };
    // Parse various descriptor types
    dfu.parseDeviceDescriptor = function(data) { /* ... unchanged ... */ };
    dfu.parseConfigurationDescriptor = function(data) { /* ... unchanged ... */ };
    dfu.parseInterfaceDescriptor = function(data) { /* ... unchanged ... */ };
    dfu.parseFunctionalDescriptor = function(data) { /* ... unchanged ... */ };
    dfu.parseSubDescriptors = function(descriptorData) { /* ... unchanged ... */ };
    // Read configuration descriptor (standard USB request)
    dfu.Device.prototype.readConfigurationDescriptor = function(index) { /* ... unchanged ... */ };

    // DFU Class Specific Requests
    dfu.Device.prototype.requestOut = function(bRequest, data, wValue=0) {
        return this.device_.controlTransferOut({
            "requestType": "class", "recipient": "interface",
            "request": bRequest, "value": wValue, "index": this.intfNumber
        }, data).then(
            result => {
                if (result.status === "ok") { return Promise.resolve(result.bytesWritten); }
                else { return Promise.reject(result.status); }
            },
            error => { return Promise.reject("ControlTransferOut failed: " + error); }
        );
    };

    dfu.Device.prototype.requestIn = function(bRequest, wLength, wValue=0) {
        return this.device_.controlTransferIn({
            "requestType": "class", "recipient": "interface",
            "request": bRequest, "value": wValue, "index": this.intfNumber
        }, wLength).then(
            result => {
                if (result.status === "ok") { return Promise.resolve(result.data); }
                else { return Promise.reject(result.status); }
            },
            error => { return Promise.reject("ControlTransferIn failed: " + error); }
        );
    };

    // DFU Commands
    dfu.Device.prototype.detach = function() { return this.requestOut(dfu.DETACH, undefined, 1000); } // wValue is timeout
    dfu.Device.prototype.download = function(data, blockNum) { return this.requestOut(dfu.DNLOAD, data, blockNum); };
    dfu.Device.prototype.dnload = dfu.Device.prototype.download; // Alias
    dfu.Device.prototype.upload = function(length, blockNum) { return this.requestIn(dfu.UPLOAD, length, blockNum); };
    dfu.Device.prototype.clearStatus = function() { return this.requestOut(dfu.CLRSTATUS); };
    dfu.Device.prototype.clrStatus = dfu.Device.prototype.clearStatus; // Alias
    dfu.Device.prototype.getStatus = function() {
        return this.requestIn(dfu.GETSTATUS, 6).then(
            data => Promise.resolve({
                "status": data.getUint8(0),
                "pollTimeout": data.getUint32(1, true) & 0xFFFFFF, // 3 bytes only
                "state": data.getUint8(4)
            }),
            error => Promise.reject("DFU GETSTATUS failed: " + error)
        );
    };
    dfu.Device.prototype.getState = function() {
        return this.requestIn(dfu.GETSTATE, 1).then(
            data => Promise.resolve(data.getUint8(0)),
            error => Promise.reject("DFU GETSTATE failed: " + error)
        );
    };
    dfu.Device.prototype.abort = function() { return this.requestOut(dfu.ABORT); };

    // Higher level functions
     dfu.Device.prototype.waitDisconnected = async function(timeout) {
        let device = this;
        let usbDevice = this.device_;
        this.logInfo(`Waiting for disconnect for ${timeout}ms...`);
        return new Promise((resolve, reject) => {
            let timeoutID = null;
            const onDisconnect = (event) => {
                if (event.device === usbDevice) {
                    this.logDebug("Disconnect event received for the device.");
                    navigator.usb.removeEventListener("disconnect", onDisconnect);
                    if (timeoutID !== null) { clearTimeout(timeoutID); }
                    this.disconnected = true; // Mark instance as disconnected
                    resolve(device); // Resolve with the device instance
                }
            };

            navigator.usb.addEventListener("disconnect", onDisconnect);

            if (timeout > 0) {
                timeoutID = setTimeout(() => {
                    navigator.usb.removeEventListener("disconnect", onDisconnect);
                    this.logWarning("Disconnect timeout expired.");
                    reject(new Error("waitDisconnected timeout expired"));
                }, timeout);
            }
        });
    };

    dfu.Device.prototype.abortToIdle = async function() { /* ... unchanged ... */ };

    dfu.Device.prototype.do_upload = async function(xfer_size, max_size=Infinity, first_block=0) { /* ... unchanged ... */ };

    // Polling helper
    dfu.Device.prototype.poll_until = async function(state_predicate) {
        let dfu_status;
        try {
             dfu_status = await this.getStatus();
        } catch (error) {
             return Promise.reject("DFU GETSTATUS failed during poll: " + error);
        }


        let device = this;
        function async_sleep(duration_ms) {
            return new Promise(function(resolve, reject) {
                // device.logDebug("Sleeping for " + duration_ms + "ms"); // Verbose
                setTimeout(resolve, duration_ms);
            });
        }

        while (!state_predicate(dfu_status.state) && dfu_status.state != dfu.dfuERROR) {
            await async_sleep(dfu_status.pollTimeout);
            try {
                dfu_status = await this.getStatus();
            } catch (error) {
                 return Promise.reject("DFU GETSTATUS failed during poll: " + error);
             }
        }

        return dfu_status; // Return final status object
    };

    dfu.Device.prototype.poll_until_idle = function(idle_state) {
        return this.poll_until(state => (state == idle_state));
    };

    // Download process
    dfu.Device.prototype.do_download = async function(xfer_size, data, manifestationTolerant) {
        let bytes_sent = 0;
        let expected_size = data.byteLength;
        let transaction = 0;

        if (!this.properties?.CanDnload) {
            throw new Error("Device does not support download!");
        }

        this.logInfo(`Downloading ${expected_size} bytes...`);
        this.logProgress(bytes_sent, expected_size);

        // Clear status before starting download
        try {
            let status = await this.getStatus();
            if (status.state == dfu.dfuERROR) {
                await this.clearStatus();
                this.logInfo("Cleared device error status before download.");
                status = await this.getStatus(); // Check again
                if (status.state == dfu.dfuERROR) {
                     throw new Error("Device stuck in DFU error state.");
                }
            }
            // Ensure device is in idle state
             if (status.state !== dfu.dfuIDLE && status.state !== dfu.dfuDNLOAD_IDLE) {
                 this.logWarning(`Device not in idle state (${status.state}), attempting abort...`);
                 await this.abortToIdle(); // Try to reset to idle
             }

        } catch (error) {
            throw new Error("Failed to get/clear status before download: " + error);
        }


        while (bytes_sent < expected_size) {
            const bytes_left = expected_size - bytes_sent;
            const chunk_size = Math.min(bytes_left, xfer_size);

            let bytes_written = 0;
            let dfu_status;
            try {
                // Send chunk
                bytes_written = await this.download(data.slice(bytes_sent, bytes_sent + chunk_size), transaction++);
                // Poll until idle
                dfu_status = await this.poll_until_idle(dfu.dfuDNLOAD_IDLE);
            } catch (error) {
                throw new Error(`Error during DFU download transaction ${transaction-1}: ${error}`);
            }

            if (dfu_status.status != dfu.STATUS_OK) {
                await this.abortToIdle(); // Attempt abort on failure
                throw new Error(`DFU DOWNLOAD failed state=${dfu_status.state}, status=${dfu_status.status}`);
            }

            // this.logDebug("Wrote " + bytes_written + " bytes"); // Verbose
            bytes_sent += bytes_written;
            this.logProgress(bytes_sent, expected_size);
        }
        this.logInfo(`Sent ${bytes_sent} bytes`);

        // Send empty block to signal end (zero-length transaction)
        this.logInfo("Sending final zero-length download packet...");
        try {
            await this.download(new ArrayBuffer([]), transaction++);
        } catch (error) {
            throw new Error("Error during final zero-length DFU download: " + error);
        }

        // Poll until manifest or idle state
        this.logInfo("Waiting for manifestation...");
        let final_status;
        try {
             final_status = await this.poll_until(state => (state == dfu.dfuIDLE || state == dfu.dfuMANIFEST));
        } catch(error) {
            // Allow proceeding even if polling fails, device might reset too fast
             this.logWarning("Polling after download failed (device might have reset): " + error);
             final_status = { status: dfu.STATUS_OK, state: dfu.dfuMANIFEST }; // Assume it worked if polling failed
        }


        if (final_status.status != dfu.STATUS_OK) {
            await this.abortToIdle(); // Attempt abort
            throw new Error(`DFU MANIFEST failed state=${final_status.state}, status=${final_status.status}`);
        }
        this.logInfo("Manifestation complete (or device resetting).");


        // Try to reset the device (graceful handling of expected errors)
        if (manifestationTolerant) {
             this.logDebug("Manifestation tolerant, device should remain connected.");
             // We might still be able to issue a reset, but often not required
             try {
                this.logDebug("Attempting final reset...");
                await this.device_.reset();
                 this.logInfo("USB reset command sent.");
            } catch (error) {
                // *** MODIFIED CATCH BLOCK FOR RESET ***
                const errorString = String(error);
                if (errorString.includes("Unable to reset the device") || // Chrome/Edge?
                    errorString.includes("NotFoundError") ||             // Standard?
                    errorString.includes("NetworkError"))                // Older spec?
                {
                    this.logInfo("Final reset failed (device likely already reset/disconnected). This is usually OK.");
                } else {
                    // Log other errors as warnings, but don't fail the whole process
                    this.logWarning("Unexpected error during final reset: " + error);
                }
            }
        } else {
            this.logInfo("Device not manifestation tolerant, should disconnect/reset automatically.");
            // Don't try reset command here, device should be gone.
        }

        return; // Indicate success
    }; // End do_download

})(); // End DFU IIFE