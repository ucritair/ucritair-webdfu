// ==================================================
// Main Page Logic - Interactive Flash Workflow
// ==================================================
(function() { // Wrap page logic in IIFE to avoid global scope pollution
    // --- Element References (cached on initialization) ---
    let connectButton = null;
    let statusDisplay = null;
    let downloadLog = null;
    let dfuUtil = null; // Will hold the DfuUtil instance

    // --- State Definitions (using const for immutability) ---
    const STATE = Object.freeze({ // Use Object.freeze for safety
        IDLE: 'idle',
        CONNECTING_STAGE1: 'connecting_stage1',
        WAITING_DISCONNECT: 'waiting_disconnect',
        PROMPT_REFRESH_1: 'prompt_refresh_1',
        PROMPT_CONNECT_STAGE2: 'prompt_connect_stage2', // Ask user to click button for stage 2 permission
        CONNECTING_STAGE2: 'connecting_stage2',
        WAITING_STABLE: 'waiting_stable',
        PROMPT_REFRESH_2: 'prompt_refresh_2',
        PROMPT_CONNECT_FLASH: 'prompt_connect_flash', // Ask user to click button for final flash permission
        CONNECTING_FLASH: 'connecting_flash',
        FLASHING: 'flashing',
        FLASH_COMPLETE: 'flash_complete',
        ERROR: 'error'
    });

    // --- Application State Variables ---
    let currentState = STATE.IDLE;
    let currentDevice = null; // Holds the connected dfu.Device object
    let connectAttempts = 0;
    const MAX_CONNECT_ATTEMPTS = 5; // Prevent infinite loops
    let vid = 0x2FE3; // Default Vendor ID for μCritter DFU
    let serial = ''; // Store device serial number across refreshes
    let firmwareLoaded = false; // Flag for firmware loading status

    // --- Session Storage Keys (using const for keys) ---
    const stateKey = 'ucritterFlashState';
    const serialKey = 'ucritterFlashSerial';

    // --- Custom Error for User Gesture Requirement ---
    class NeedsUserGestureError extends Error {
        constructor(message = "User interaction required to proceed.") {
            super(message);
            this.name = "NeedsUserGestureError";
        }
    }

    // --- Helper: Short Delay ---
    async function sleep(duration_ms) {
        // No console log needed here if simpler version works
        return new Promise(resolve => setTimeout(resolve, duration_ms));
    }


    // --- State Management Functions ---
    function saveState(stateToSave, deviceSerial = serial) {
        if (!Object.values(STATE).includes(stateToSave)) {
            console.error("Attempted to save invalid state:", stateToSave);
            return;
        }
        currentState = stateToSave;
        sessionStorage.setItem(stateKey, stateToSave);
        // Only save serial if it's provided and non-empty
        if (deviceSerial) {
            sessionStorage.setItem(serialKey, deviceSerial);
        } else {
            // Clear serial from storage if not provided (e.g., during clearState)
            sessionStorage.removeItem(serialKey);
        }
        console.log("State saved:", stateToSave, "Serial:", deviceSerial || 'N/A');
        updateUI(); // Update UI whenever state changes
    }

    // --- MODIFIED: loadState is now async and checks for device presence ---
    async function loadState() {
        const savedState = sessionStorage.getItem(stateKey);
        const savedSerial = sessionStorage.getItem(serialKey) || '';
        let stateIsValid = false;
        let requiresSerial = false; // Keep track if serial was required

        console.log(`Attempting to load state: ${savedState}, Serial: ${savedSerial}`); // Added log

        // Basic validation: Is it a known state? Exclude terminal states.
        if (savedState && Object.values(STATE).includes(savedState) &&
            savedState !== STATE.IDLE && savedState !== STATE.FLASH_COMPLETE) // Keep ERROR state initially
        {
            // Contextual validation: Check if required serial exists for intermediate states
            requiresSerial = [
                STATE.WAITING_DISCONNECT, STATE.PROMPT_REFRESH_1,
                STATE.PROMPT_CONNECT_STAGE2, STATE.CONNECTING_STAGE2,
                STATE.WAITING_STABLE, STATE.PROMPT_REFRESH_2,
                STATE.PROMPT_CONNECT_FLASH, STATE.CONNECTING_FLASH,
                STATE.FLASHING, STATE.ERROR // Also check serial if in ERROR state from previous run
            ].includes(savedState);

            if (requiresSerial && !savedSerial) {
                // Invalid state: Intermediate step requires a serial number, but none found.
                console.warn(`Invalid saved state detected: State '${savedState}' requires a serial number, but none found in sessionStorage. Resetting.`);
                stateIsValid = false;
            } else {
                // State *seems* plausible based on storage values
                stateIsValid = true;
                 console.log(`State '${savedState}' seems initially valid.`);
            }
        } else if (savedState === STATE.ERROR) {
             // Allow loading ERROR state, serial check happens above
             stateIsValid = true;
             console.log("State is ERROR, initially valid.");
        }

        // --- ADDED DEVICE CHECK ---
        // If the state seems valid so far AND requires a specific serial number,
        // check if a device with that serial is actually permitted/connected right now.
        if (stateIsValid && requiresSerial && savedSerial && typeof navigator.usb !== 'undefined') { // Added check for WebUSB support
            console.log(`State '${savedState}' requires serial '${savedSerial}'. Verifying device presence...`);
            try {
                const devices = await navigator.usb.getDevices();
                const matchingDevice = devices.find(d => d.serialNumber === savedSerial && d.vendorId === vid);
                if (!matchingDevice) {
                    // No permitted device matching the stored serial was found!
                    // This implies an inconsistency (e.g., user disconnected device).
                    console.warn(`Saved state requires serial '${savedSerial}', but no matching permitted device found on load. Resetting state.`);
                    stateIsValid = false; // Invalidate the state
                } else {
                    console.log(`Matching permitted device found for serial '${savedSerial}'. State remains valid.`);
                }
            } catch (error) {
                console.error("Error checking permitted devices during loadState:", error);
                // If we can't even check devices, it's safer to reset state
                stateIsValid = false;
            }
        }
        // --- END DEVICE CHECK ---


        if (stateIsValid) {
           currentState = savedState;
           serial = savedSerial; // Restore serial
           console.log("State loaded successfully:", currentState, "Serial:", serial);
        } else {
            // Default to IDLE if state is invalid, missing, inconsistent, or a terminal state (excluding ERROR if it became invalid)
            if (savedState && savedState !== STATE.IDLE) { // Don't log reset if it was already IDLE
              console.log(`Saved state '${savedState}' was invalid or inconsistent. Resetting to IDLE.`);
            } else {
              console.log("No valid state loaded or state was IDLE, starting fresh.");
            }
            // Clear everything and set to IDLE
            currentState = STATE.IDLE;
            serial = '';
            sessionStorage.removeItem(stateKey);
            sessionStorage.removeItem(serialKey);
            // No need to call clearState() here, as we are setting the state directly
        }
    }

    function clearState() {
        const previousState = currentState; // Store previous state for logging if needed
        currentState = STATE.IDLE;
        currentDevice = null;
        // Check if dfuUtil exists and has a getDevice method before clearing
        if (dfuUtil && typeof dfuUtil.getDevice === 'function' && dfuUtil.getDevice()) {
            console.log("Clearing currentDevice reference.");
        }
        serial = '';
        connectAttempts = 0;
        sessionStorage.removeItem(stateKey);
        sessionStorage.removeItem(serialKey);
        console.log(`State cleared (was ${previousState})`);
        if (dfuUtil && downloadLog) dfuUtil.clearLog(downloadLog); // Clear log on reset
        updateUI(); // Update UI to reflect cleared state
    }

    // --- UI Update Logic ---
    function updateStatus(message, type = 'info') {
        if (!statusDisplay) {
            return;
        }
        statusDisplay.textContent = message;
        statusDisplay.className = ''; // Clear existing classes first
        statusDisplay.classList.add('status', `status-${type}`); // Add base and type class
        if (dfuUtil) {
          console.log(`Status Update (${type}): ${message}`);
        }
    }

    function updateUI() {
        if (!connectButton) {
            return;
        }
        if (dfuUtil) {
          console.log("Updating UI for state:", currentState);
        }

        let buttonDisabled = false;
        let buttonText = "Flash My Critter!"; // Default text
        // REMOVED: const dfuseFields = document.getElementById("dfuseFields");

        // Determine button text and disabled state based on current state
        switch (currentState) {
            case STATE.IDLE:
                updateStatus("Ready to connect", "info");
                buttonText = firmwareLoaded ? "Flash My Critter!" : "Loading Firmware...";
                buttonDisabled = !firmwareLoaded;
                break;
            case STATE.CONNECTING_STAGE1:
            case STATE.CONNECTING_STAGE2:
            case STATE.CONNECTING_FLASH:
                updateStatus(`Connecting (${currentState})... Check browser pop-up!`, "info");
                buttonText = "Connecting...";
                buttonDisabled = true;
                break;
            case STATE.WAITING_DISCONNECT:
                updateStatus("Stage 1 Connected. Switching device mode...", "info");
                buttonText = "Switching...";
                buttonDisabled = true;
                if (dfuUtil) dfuUtil.logInfo("Attempting detach..."); // Log action
                break;
             case STATE.PROMPT_REFRESH_1:
                updateStatus("Stage 1 Done! Please REFRESH PAGE NOW (Ctrl+R or Cmd+R).", "prompt");
                buttonText = "REFRESH PAGE NOW"; // Make it clear
                buttonDisabled = true; // Disable button, user must refresh
                if (dfuUtil) dfuUtil.logSuccess("Ready for first refresh. Please refresh the page.");
                break;
             case STATE.PROMPT_CONNECT_STAGE2:
                 updateStatus("Click button to grant permission for Stage 2.", "prompt");
                 buttonText = "Connect Stage 2";
                 buttonDisabled = false; // Enable button for user interaction
                 if (dfuUtil) dfuUtil.logWarning("Browser needs permission for Stage 2. Please click 'Connect Stage 2'.");
                 break;
             case STATE.PROMPT_CONNECT_FLASH:
                 updateStatus("Click button to grant permission for Flash.", "prompt");
                 buttonText = "Connect to Flash";
                 buttonDisabled = false; // Enable button for user interaction
                 if (dfuUtil) dfuUtil.logWarning("Browser needs final permission. Please click 'Connect to Flash'.");
                 break;
             case STATE.WAITING_STABLE:
                  updateStatus("Stage 2 Connected. Stabilizing...", "info");
                  buttonText = "Stabilizing...";
                  buttonDisabled = true;
                  if (dfuUtil) dfuUtil.logInfo("Waiting briefly for device to stabilize...");
                  break;
            case STATE.PROMPT_REFRESH_2:
                updateStatus("Stage 2 Ready! Please REFRESH PAGE AGAIN.", "prompt");
                buttonText = "REFRESH PAGE AGAIN"; // Make it clear
                buttonDisabled = true; // Disable button, user must refresh
                if (dfuUtil) dfuUtil.logSuccess("Ready for final refresh. Please refresh the page.");
                break;
            case STATE.FLASHING:
                updateStatus("Flashing Firmware... Do not disconnect!", "info");
                buttonText = "Flashing...";
                buttonDisabled = true;
                 if (dfuUtil) dfuUtil.logInfo("Starting firmware flash process...");
                break;
            case STATE.FLASH_COMPLETE:
                updateStatus("Pupdate Complete! Critter rebooting.", "success");
                buttonText = "Done!";
                buttonDisabled = true; // Disable button after completion
                if (dfuUtil) dfuUtil.logSuccess("Firmware flashed successfully! Your Critter should reboot now.");
                 // Reset state after a delay to allow user to see the message
                 setTimeout(clearState, 6000);
                break;
            case STATE.ERROR:
                // Status is set by handleError
                buttonText = "Error Occurred - Reset?"; // Prompt user to reset
                buttonDisabled = false; // Allow user to click to reset
                break;
            default:
                 updateStatus("Unknown application state", "error");
                 buttonText = "Error";
                 buttonDisabled = true;
        }
        // Apply changes to the button
        connectButton.textContent = buttonText;
        connectButton.disabled = buttonDisabled;

        // REMOVED: Show/hide DfuSe fields
    }

    // --- Error Handling ---
    function handleError(error, userMsg = "An error occurred. Check console.") {
        console.error("Error caught:", error); // Log the full error object
        const messageToLog = (error instanceof Error) ? error.message : String(error);

        if (dfuUtil && !(error instanceof NeedsUserGestureError)) {
             dfuUtil.logError(`Error: ${messageToLog}`);
        } else if (!dfuUtil) {
            console.error(`Error before DFU Util ready: ${messageToLog}`);
        }
        updateStatus(userMsg, "error");
        if (currentState !== STATE.ERROR) {
            saveState(STATE.ERROR);
        }
    }


    // --- Core Connection and Flashing Logic ---

    /**
     * Attempts to connect to the μCritter device.
     * Handles finding permitted devices and requesting permission if needed.
     * @param {number} attemptVid - The Vendor ID to filter by.
     * @param {string|null} attemptSerial - The Serial Number to filter by (if known).
     * @param {boolean} allowRequestPrompt - Whether to call navigator.usb.requestDevice().
     * @returns {Promise<dfu.Device>} Resolves with the connected device object (dfu.Device or dfuse.Device).
     * @throws {Error|NeedsUserGestureError} Throws error on failure or if user gesture is needed but not allowed.
     */
    async function attemptConnection(attemptVid, attemptSerial, allowRequestPrompt = false) {
          connectAttempts++;
          if (connectAttempts > MAX_CONNECT_ATTEMPTS) {
              throw new Error(`Maximum connection attempts (${MAX_CONNECT_ATTEMPTS}) reached.`);
          }
          if (typeof dfu === 'undefined' || typeof dfuUtil === 'undefined') {
                throw new Error("Core DFU libraries (dfu.js, dfu-util.js) not available.");
          }

          dfuUtil.logInfo(`Connection attempt ${connectAttempts}: VID=0x${attemptVid.toString(16)}, Serial=${attemptSerial || 'any'}, PromptAllowed=${allowRequestPrompt}`);

          const permittedDeviceFilter = [{ vendorId: attemptVid }];
          if (attemptSerial) {
              permittedDeviceFilter[0].serialNumber = attemptSerial;
          }

          // 1. Check already permitted devices
          try {
              const devices = await navigator.usb.getDevices();
              dfuUtil.logInfo(`Found ${devices.length} permitted devices. Checking for match using filter: ${JSON.stringify(permittedDeviceFilter)}`);
              const matchingDevice = devices.find(d => {
                  let vidMatch = d.vendorId === attemptVid;
                  let serialMatch = !permittedDeviceFilter[0].serialNumber || d.serialNumber === permittedDeviceFilter[0].serialNumber;
                  let dfuCapable = dfu.findDeviceDfuInterfaces(d).length > 0;
                  return vidMatch && serialMatch && dfuCapable;
              });

              if (matchingDevice) {
                  dfuUtil.logInfo(`Found permitted matching device: ${matchingDevice.productName || 'Unknown'} (Serial: ${matchingDevice.serialNumber || 'N/A'})`);
                  const connectedDfuDevice = await dfuUtil.connect(matchingDevice);
                  connectAttempts = 0;
                  dfuUtil.logSuccess(`Connected to permitted device.`);
                  currentDevice = connectedDfuDevice;
                  return connectedDfuDevice;
              } else {
                   dfuUtil.logInfo("No matching permitted device found.");
              }
          } catch (error) {
              dfuUtil.logWarning(`Error checking permitted devices: ${error.message || error}. Proceeding to request prompt if allowed.`);
          }

          // 2. If no permitted device found/connected, request permission if allowed
          if (!allowRequestPrompt) {
                dfuUtil.logWarning("Device permission required, but cannot prompt automatically in this state (likely requires user click).");
                throw new NeedsUserGestureError("Device permission required, user interaction needed.");
           }

           const promptFilter = [{ vendorId: attemptVid }];
           dfuUtil.logInfo(`Requesting device permission from user with filter: ${JSON.stringify(promptFilter)}`);

           try {
              const selectedUsbDevice = await navigator.usb.requestDevice({ filters: promptFilter });

              vid = selectedUsbDevice.vendorId;
              serial = selectedUsbDevice.serialNumber || '';
              sessionStorage.setItem(serialKey, serial);

              dfuUtil.logInfo(`User selected device: ${selectedUsbDevice.productName || 'Unknown'} (VID: 0x${vid.toString(16)}, Serial: ${serial || 'N/A'})`);

              const connectedDfuDevice = await dfuUtil.connect(selectedUsbDevice);
              connectAttempts = 0;
              dfuUtil.logSuccess(`Connected to user-selected device.`);
              currentDevice = connectedDfuDevice;
              return connectedDfuDevice;
           } catch(error) {
               if (error.name === 'NotFoundError') {
                   if (promptFilter && promptFilter.length > 0) {
                        dfuUtil.logError("Device selection prompt failed: No matching device found by Chrome, even though OS might see it.");
                        throw new Error("No matching device found by Chrome. Check OS/driver or connection.");
                   } else {
                        throw new Error("No device selected by the user.");
                   }
               } else if (error.name === 'SecurityError') {
                    throw new Error("Device request blocked by browser security settings (requires secure context/HTTPS).");
               }
               throw new Error(`Error requesting/connecting device: ${error.message || error}`);
           }
    }

    /**
     * Performs the actual firmware download process using the currentDevice object.
     * REMOVED DfuSe specific logic.
     */
    async function runFlashWorkflow() {
          if (!currentDevice) { handleError(new Error("runFlashWorkflow called with no device."), "Device not connected."); return; }
          if (currentState !== STATE.FLASHING) { console.warn("runFlashWorkflow called in incorrect state:", currentState); return; }
          if (!dfuUtil) { handleError(new Error("dfuUtil missing."), "Internal error: DFU utility not available."); return; }

          const firmware = dfuUtil.getFirmwareFile();
          if (!firmware) { handleError(new Error("Firmware not loaded."), "Firmware file is missing!"); return; }

          const transferSize = currentDevice.properties?.TransferSize ?? 1024;
          const manifestationTolerant = currentDevice.properties?.ManifestationTolerant ?? true;

          dfuUtil.logInfo(`Starting firmware flash... (Size: ${firmware.byteLength} bytes)`);
          dfuUtil.logInfo(`Using TransferSize: ${transferSize}, ManifestationTolerant: ${manifestationTolerant}`);

          // --- REMOVED DfuSe Address Handling ---

          // Start the download process
          try {
              if (downloadLog) dfuUtil.clearLog(downloadLog);
              dfuUtil.logInfo("Starting firmware download to device...");

              // Call the standard do_download method on the currentDevice object.
              await currentDevice.do_download(transferSize, firmware, manifestationTolerant);

              dfuUtil.logSuccess("Firmware download process completed successfully.");
              saveState(STATE.FLASH_COMPLETE); // Transition to complete state

          } catch (error) {
              handleError(error, `Flashing process failed: ${error.message || 'Unknown DFU error'}`);
          }
      }


    // --- Main Button Click Handler ---
    async function handleConnectClick() {
        if (currentState === STATE.ERROR) {
            clearState();
            if (dfuUtil) dfuUtil.logInfo("State reset. Please try the connection process again.");
            return;
        }
        if ([STATE.CONNECTING_STAGE1, STATE.WAITING_DISCONNECT, STATE.CONNECTING_STAGE2,
             STATE.WAITING_STABLE, STATE.CONNECTING_FLASH, STATE.FLASHING,
             STATE.PROMPT_REFRESH_1, STATE.PROMPT_REFRESH_2, STATE.FLASH_COMPLETE].includes(currentState)) {
             console.warn(`Button clicked in non-interactive state: ${currentState}. Ignoring.`);
             return;
        }
         if (currentState === STATE.IDLE && !firmwareLoaded) {
             updateStatus("Firmware is still loading, please wait...", "info");
             return;
         }
         if (!dfuUtil) {
             handleError(new Error("DFU Utility not ready."), "Initialization error, please refresh.");
             return;
         }

         // --- Handle states where user click IS expected/required ---
         if (currentState === STATE.IDLE) {
             connectAttempts = 0;
             saveState(STATE.CONNECTING_STAGE1);
             if (downloadLog) dfuUtil.clearLog(downloadLog);
             dfuUtil.logInfo("Starting Stage 1 connection...");
             try {
                 await attemptConnection(vid, null, true);
                 if (!currentDevice || !currentDevice.device_ || currentDevice.device_.productName !== 'MCUBOOT') {
                      throw new Error(`Incorrect device connected: ${currentDevice?.device_?.productName || 'Unknown'}. Expected 'MCUBOOT'.`);
                 }
                 dfuUtil.logSuccess(`Connected to ${currentDevice.device_.productName} (Stage 1). Serial: ${currentDevice.device_.serialNumber || 'N/A'}`);
                 serial = currentDevice.device_.serialNumber || '';
                 dfuUtil.logInfo("Waiting briefly before detaching for mode switch...");
                 await sleep(300);
                 saveState(STATE.WAITING_DISCONNECT, serial);
                 await currentDevice.detach(); // Potential stall point
                 dfuUtil.logInfo("Detach command sent. Waiting for device disconnect...");
                 await Promise.race([
                     currentDevice.waitDisconnected(5000),
                     new Promise((_, reject) => setTimeout(() => reject(new Error("Device did not disconnect within 5 seconds after detach.")), 5000))
                 ]);
                 dfuUtil.logInfo("Device disconnected (or timed out waiting).");
                 if (currentState === STATE.WAITING_DISCONNECT) {
                     saveState(STATE.PROMPT_REFRESH_1, serial);
                 }
             } catch (error) {
                  if (error.message?.toLowerCase().includes("stall")) { handleError(error, "Device stalled during mode switch. Please Reset and try again."); }
                  else if (error.message?.includes("disconnect within 5 seconds")) { if (currentState === STATE.WAITING_DISCONNECT) { dfuUtil.logWarning("Device disconnect timeout after detach, proceeding to refresh prompt anyway."); saveState(STATE.PROMPT_REFRESH_1, serial); } else { handleError(error, "Device disconnect timeout unexpectedly."); } }
                  else if (error.message?.includes("No device selected")) { dfuUtil.logWarning("Device selection cancelled by user."); clearState(); }
                  else if (error.message?.includes("No matching device found")) { handleError(error, "Connection failed: No matching device found by Chrome."); clearState(); }
                  else if (error instanceof NeedsUserGestureError) { dfuUtil.logWarning("User gesture needed unexpectedly during Stage 1."); clearState(); }
                  else if (error.message?.includes("Incorrect device connected")) { handleError(error, "Wrong mode! Put Critter in DFU (Step 1) and try again."); if (currentDevice) { try { await currentDevice.close(); } catch(e) {} currentDevice = null; } clearState(); }
                  else { handleError(error, `Connection failed (Stage 1): ${error.message || error}`); }
                  if (currentDevice && !error.message?.includes("Incorrect device connected")) { try { await currentDevice.close(); } catch(e) {} currentDevice = null; }
                  if (![STATE.IDLE, STATE.PROMPT_REFRESH_1, STATE.ERROR].includes(currentState)) { saveState(STATE.ERROR); }
             }
         }
         else if (currentState === STATE.PROMPT_CONNECT_STAGE2) {
              saveState(STATE.CONNECTING_STAGE2, serial);
              dfuUtil.logInfo("Attempting Stage 2 connection after user click...");
              try {
                  dfuUtil.logInfo("Waiting briefly before requesting device (Stage 2)...");
                  await sleep(500);
                  await attemptConnection(vid, serial, true);
                  dfuUtil.logSuccess(`Reconnected to ${currentDevice.device_.productName} (Stage 2). Serial: ${serial || 'N/A'}`);
                  saveState(STATE.WAITING_STABLE, serial);
                  await sleep(1500);
                  try {
                      dfuUtil.logInfo("Checking DFU status...");
                      let status = await currentDevice.getStatus();
                      dfuUtil.logInfo(`DFU Status: State=${status.state}, Status=${status.status}`);
                      if (typeof dfu !== 'undefined' && status.state === dfu.dfuERROR) { dfuUtil.logWarning("Device in DFU error state, attempting to clear..."); await currentDevice.clearStatus(); dfuUtil.logInfo("Cleared DFU error state."); }
                  } catch (e) { dfuUtil.logWarning(`Couldn't check/clear DFU status: ${e}`); }
                  saveState(STATE.PROMPT_REFRESH_2, serial);
              } catch (error) {
                   if (error.message?.includes("No device selected")) { dfuUtil.logWarning("Device selection cancelled by user."); saveState(STATE.PROMPT_CONNECT_STAGE2); }
                   else if (error.message?.includes("No matching device found")) { handleError(error, "Connection failed: No matching device found by Chrome for Stage 2."); saveState(STATE.PROMPT_CONNECT_STAGE2); }
                   else { handleError(error, `Connection failed (Stage 2): ${error.message || error}`); }
              }
         }
         else if (currentState === STATE.PROMPT_CONNECT_FLASH) {
              saveState(STATE.CONNECTING_FLASH, serial);
              dfuUtil.logInfo("Attempting final connection for flashing after user click...");
              try {
                   dfuUtil.logInfo("Waiting briefly before requesting device (Flash)...");
                   await sleep(500);
                  await attemptConnection(vid, serial, true);
                  dfuUtil.logSuccess(`Reconnected to ${currentDevice.device_.productName} (Ready to Flash!). Serial: ${serial || 'N/A'}`);
                  saveState(STATE.FLASHING, serial);
                  await runFlashWorkflow();
              } catch (error) {
                   if (error.message?.includes("No device selected")) { dfuUtil.logWarning("Device selection cancelled by user."); saveState(STATE.PROMPT_CONNECT_FLASH); }
                   else if (error.message?.includes("No matching device found")) { handleError(error, "Connection failed: No matching device found by Chrome for Flash."); saveState(STATE.PROMPT_CONNECT_FLASH); }
                   else { handleError(error, `Connection failed (Final Flash): ${error.message || error}`); }
              }
         }
    } // End handleConnectClick


     // --- Logic to run automatically after page refresh ---
     async function runAutoConnectSequence() {
          if (!dfuUtil) { console.error("DfuUtil not ready, cannot run auto-connect sequence."); return; }
          console.log("Checking for auto-connect sequence. Current state:", currentState);
           const requiresSerialCheck = [ STATE.PROMPT_REFRESH_1, STATE.PROMPT_CONNECT_STAGE2, STATE.CONNECTING_STAGE2, STATE.WAITING_STABLE, STATE.PROMPT_REFRESH_2, STATE.PROMPT_CONNECT_FLASH, STATE.CONNECTING_FLASH, STATE.FLASHING ].includes(currentState);
           if (requiresSerialCheck && !serial) { console.warn(`Auto-connect aborted: State '${currentState}' requires serial, but none found. Resetting.`); clearState(); dfuUtil.logWarning("Inconsistent state detected on load. Process reset."); return; }

          if (currentState === STATE.PROMPT_REFRESH_1) {
               dfuUtil.logInfo("Detected state PROMPT_REFRESH_1. Attempting automatic Stage 2 connection...");
               saveState(STATE.CONNECTING_STAGE2, serial);
               try {
                   dfuUtil.logInfo("Waiting briefly before auto-connecting (Stage 2)...");
                   await sleep(500);
                    await attemptConnection(vid, serial, false);
                    dfuUtil.logSuccess(`Auto-reconnected to ${currentDevice.device_.productName} (Stage 2). Serial: ${serial || 'N/A'}`);
                    saveState(STATE.WAITING_STABLE, serial);
                    await sleep(1500);
                    try {
                        dfuUtil.logInfo("Checking DFU status after auto-reconnect...");
                        let status = await currentDevice.getStatus();
                         dfuUtil.logInfo(`DFU Status: State=${status.state}, Status=${status.status}`);
                        if (typeof dfu !== 'undefined' && status.state === dfu.dfuERROR) { dfuUtil.logWarning("Device in DFU error state, attempting clear..."); await currentDevice.clearStatus(); dfuUtil.logInfo("Cleared DFU error state."); }
                    } catch (e) { dfuUtil.logWarning("Couldn't check/clear DFU status (auto Stage 2): " + e); }
                    saveState(STATE.PROMPT_REFRESH_2, serial);
               } catch (error) {
                    if (error instanceof NeedsUserGestureError) { dfuUtil.logWarning("Permissions needed for Stage 2 (not persisted). Asking user to click."); saveState(STATE.PROMPT_CONNECT_STAGE2, serial); }
                    else { handleError(error, `Automatic connection failed (Stage 2): ${error.message || error}`); }
               }
           }
           else if (currentState === STATE.PROMPT_REFRESH_2) {
                dfuUtil.logInfo("Detected state PROMPT_REFRESH_2. Attempting automatic Flash connection...");
                saveState(STATE.CONNECTING_FLASH, serial);
                try {
                    dfuUtil.logInfo("Waiting briefly before auto-connecting (Flash)...");
                    await sleep(500);
                     await attemptConnection(vid, serial, false);
                     dfuUtil.logSuccess(`Auto-reconnected to ${currentDevice.device_.productName} (Ready to Flash!). Serial: ${serial || 'N/A'}`);
                     saveState(STATE.FLASHING, serial);
                     await runFlashWorkflow();
                } catch (error) {
                     if (error instanceof NeedsUserGestureError) { dfuUtil.logWarning("Permissions needed for Flash (not persisted). Asking user to click."); saveState(STATE.PROMPT_CONNECT_FLASH, serial); }
                     else { handleError(error, `Automatic connection failed (Final Flash): ${error.message || error}`); }
                }
           } else {
                console.log("No automatic connection action needed for current state:", currentState);
                updateUI();
           }
     }

    // --- Initialization Function ---
    async function initializePage() {
         console.log("Initializing μCritter Pupdate Page...");

         connectButton = document.getElementById("connect");
         statusDisplay = document.getElementById("status");
         downloadLog = document.getElementById("downloadLog");
         const webUsbNotice = document.getElementById("browserNotice");
         const layoutWrapper = document.querySelector(".layout-wrapper");
         const instructionsColumn = document.querySelector(".instructions-column");

         const isWebUsbSupported = typeof navigator.usb !== 'undefined';
         if (!isWebUsbSupported) {
             console.warn("WebUSB is not supported by this browser.");
             if (webUsbNotice) { webUsbNotice.innerHTML = `<p><strong>Woof! This browser doesn't support WebUSB.</strong></p><p>Please use <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong> on a desktop computer (Windows, macOS, Linux, Android) to flash your Critter.</p><p><a class="download-btn" href="https://www.google.com/chrome/" target="_blank" rel="noopener">Get Chrome</a> <a class="download-btn" href="https://www.microsoft.com/edge" target="_blank" rel="noopener" style="margin-left: 10px;">Get Edge</a></p>`; webUsbNotice.hidden = false; }
             if (layoutWrapper) layoutWrapper.style.display = 'none';
             return;
         } else {
             if (webUsbNotice) webUsbNotice.hidden = true;
             if (layoutWrapper) layoutWrapper.style.display = 'flex';
         }

          await loadState(); // Await the async loadState

         // REMOVED: dfuUtil initialization check, assuming dfu-util.js handles global setup
         dfuUtil = window.dfuUtil; // Assign global dfuUtil from dfu-util.js
         if (!dfuUtil) {
             handleError(new Error("DFU Utility object not found."), "Initialization Failed: DFU utility missing.");
             return;
         }

         try {
             if (downloadLog) { dfuUtil.setLogContext(downloadLog); console.log("DfuUtil log context set."); }
             else { console.error("Log display element (#downloadLog) not found!"); handleError(new Error("Page setup error: Log display missing."), "Initialization Failed: Log display missing."); return; }
             dfuUtil.init(); // Ensure dfu-util basic init is called
             console.log("DfuUtil initialization checks passed.");
         } catch (error) { handleError(error, "Failed to initialize DFU Utility."); return; }

        dfuUtil.setOnDisconnectCallback((reason) => {
            console.log("Device disconnect detected.", "Reason:", reason, "Current state:", currentState);
             if ( ![STATE.IDLE, STATE.ERROR, STATE.FLASH_COMPLETE, STATE.WAITING_DISCONNECT, STATE.PROMPT_REFRESH_1, STATE.PROMPT_REFRESH_2, STATE.PROMPT_CONNECT_STAGE2, STATE.PROMPT_CONNECT_FLASH].includes(currentState) ) {
                  if (currentDevice) { handleError(new Error("Device disconnected unexpectedly."), "Device Disconnected Unexpectedly!"); currentDevice = null; }
                  else { dfuUtil.logWarning("Disconnect event for an already cleared device reference."); }
             } else if (currentState === STATE.WAITING_DISCONNECT) { dfuUtil.logInfo("Device disconnected as expected after detach command."); currentDevice = null; }
             else { dfuUtil.logInfo(`Device disconnected during non-critical state: ${currentState}`); currentDevice = null; }
             updateUI();
        });

        updateUI();
        dfuUtil.loadFirmware("zephyr.signed.bin")
           .then(() => { firmwareLoaded = true; dfuUtil.logInfo("Firmware loaded and ready."); updateUI(); })
           .catch(err => { firmwareLoaded = false; handleError(err, `Could not load firmware: ${err.message}. Please refresh.`); });

        if (!connectButton) { handleError(new Error("Page setup error: Connect button missing."), "Initialization Failed: Connect button missing."); return; }
        connectButton.addEventListener('click', handleConnectClick);

        const osButtons = document.querySelectorAll('.os-btn');
        const instructionsSections = instructionsColumn ? instructionsColumn.querySelectorAll('section.instructions[data-ins]') : [];
        const introSection = document.getElementById('intro-instructions');

        function switchOS(os) {
           if (!instructionsSections.length || !introSection || !osButtons.length || !instructionsColumn) { console.warn("Instruction elements missing, cannot switch OS view."); return; }
           console.log("Switching instructions view to:", os);
           instructionsSections.forEach(sec => { sec.hidden = true; });
           const sectionToShow = instructionsColumn.querySelector(`section.instructions[data-ins="${os}"]`);
           if(sectionToShow) { sectionToShow.hidden = false; } else { console.warn(`Instruction section for OS '${os}' not found.`); }
           if (introSection) { introSection.hidden = !sectionToShow; }
           osButtons.forEach(btn => { btn.classList.toggle('active', btn.dataset.os === os); });
        }

        const ua = navigator.userAgent;
        const platform = navigator.platform;
        let detectedOS = 'linux';
        if (/android/i.test(ua)) { if (/chrome/i.test(ua) && !/edg/i.test(ua)) { detectedOS = 'android'; console.log("Detected Android (Chrome)."); } else { console.log("Detected Android (Non-Chrome browser - WebUSB might not work)."); detectedOS = 'android'; } }
        else if (/Win/.test(ua) || /Win/.test(platform)) { detectedOS = 'win'; }
        else if (/Mac|iPod|iPhone|iPad/.test(platform)) { detectedOS = 'mac'; }
        console.log("Final Detected OS for instructions:", detectedOS);
        switchOS(detectedOS);

        osButtons.forEach(btn => { btn.addEventListener('click', (e) => { const selectedOs = e.target.dataset.os; if (selectedOs) { switchOS(selectedOs); } }); });

        console.log("Scheduling auto-connect sequence check...");
        if (typeof runAutoConnectSequence === "function") { setTimeout(runAutoConnectSequence, 500); }
        else { console.error("runAutoConnectSequence function not defined!"); }

    } // End initializePage

    if (document.readyState === 'loading') { document.addEventListener("DOMContentLoaded", initializePage); }
    else { initializePage(); }

})(); // End main IIFE