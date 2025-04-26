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
    let currentDevice = null; // Holds the connected dfu.Device object (could be dfu.Device or dfuse.Device)
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

    // --- MODIFIED: loadState with Robust Validation ---
    function loadState() {
        const savedState = sessionStorage.getItem(stateKey);
        const savedSerial = sessionStorage.getItem(serialKey) || '';
        let stateIsValid = false;

        // Basic validation: Is it a known state? Exclude terminal states.
        if (savedState && Object.values(STATE).includes(savedState) &&
            savedState !== STATE.IDLE && savedState !== STATE.FLASH_COMPLETE && savedState !== STATE.ERROR)
        {
            // Contextual validation: Check if required serial exists for intermediate states
            const requiresSerial = [
                STATE.WAITING_DISCONNECT, STATE.PROMPT_REFRESH_1,
                STATE.PROMPT_CONNECT_STAGE2, STATE.CONNECTING_STAGE2,
                STATE.WAITING_STABLE, STATE.PROMPT_REFRESH_2,
                STATE.PROMPT_CONNECT_FLASH, STATE.CONNECTING_FLASH,
                STATE.FLASHING
            ].includes(savedState);

            if (requiresSerial && !savedSerial) {
                // Invalid state: Intermediate step requires a serial number, but none found.
                console.warn(`Invalid saved state detected: State '${savedState}' requires a serial number, but none found in sessionStorage. Resetting.`);
                stateIsValid = false;
            } else {
                // State seems plausible
                stateIsValid = true;
            }
        } else if (savedState === STATE.ERROR) {
            // Allow loading the ERROR state so user sees the message and reset button
            stateIsValid = true;
        }


        if (stateIsValid) {
           currentState = savedState;
           serial = savedSerial; // Restore serial
           console.log("State loaded:", currentState, "Serial:", serial);
        } else {
            // Default to IDLE if state is invalid, missing, or a terminal state (excluding ERROR)
            if (savedState && savedState !== STATE.IDLE && savedState !== STATE.ERROR) {
              console.log(`Invalid or terminal state '${savedState}' found. Resetting to IDLE.`);
            } else {
              console.log("No valid state loaded, starting fresh.");
            }
            // Clear everything and set to IDLE
            currentState = STATE.IDLE;
            serial = '';
            sessionStorage.removeItem(stateKey);
            sessionStorage.removeItem(serialKey);
        }
    }

    function clearState() {
        currentState = STATE.IDLE;
        currentDevice = null;
        // Ensure global 'device' potentially used by dfu scripts is also cleared
        // Check if dfuUtil exists and has a getDevice method before clearing
        if (dfuUtil && typeof dfuUtil.getDevice === 'function' && dfuUtil.getDevice()) {
            // Ideally dfu-util manages its own 'device' variable internally.
            // Direct manipulation of window.device should be avoided if possible.
            // Relying on dfuUtil.getDevice() being null after disconnect/clear is safer.
            console.log("Clearing currentDevice reference.");
        }
        serial = '';
        connectAttempts = 0;
        sessionStorage.removeItem(stateKey);
        sessionStorage.removeItem(serialKey);
        console.log("State cleared");
        if (dfuUtil && downloadLog) dfuUtil.clearLog(downloadLog); // Clear log on reset
        updateUI(); // Update UI to reflect cleared state
    }

    // --- UI Update Logic ---
    function updateStatus(message, type = 'info') {
        if (!statusDisplay) {
            // Don't log warning repeatedly if called before init completes
            // console.warn("Status display element not found.");
            return;
        }
        statusDisplay.textContent = message;
        // Use classList for better class management
        statusDisplay.className = ''; // Clear existing classes first
        statusDisplay.classList.add('status', `status-${type}`); // Add base and type class
        // Avoid logging status updates before DFU util is ready
        if (dfuUtil) {
          console.log(`Status Update (${type}): ${message}`);
        }
    }

    function updateUI() {
        if (!connectButton) {
            // Don't log error repeatedly if called before init completes
            // console.error("Connect button element not found during UI update!");
            return;
        }
        // Log state only if DFU util is available (indicates basic init happened)
        if (dfuUtil) {
          console.log("Updating UI for state:", currentState);
        }


        let buttonDisabled = false;
        let buttonText = "Flash My Critter!"; // Default text
        const dfuseFields = document.getElementById("dfuseFields");

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
                 // Should not happen with frozen STATE object
                 updateStatus("Unknown application state", "error");
                 buttonText = "Error";
                 buttonDisabled = true;
        }
        // Apply changes to the button
        connectButton.textContent = buttonText;
        connectButton.disabled = buttonDisabled;

        // Show/hide DfuSe fields based on connected device type
        if (dfuseFields) {
             // Check if dfuse object and Device constructor exist before using instanceof
            const isDfuSeDevice = typeof dfuse !== 'undefined' && typeof dfuse.Device === 'function' && currentDevice instanceof dfuse.Device;
            dfuseFields.hidden = !isDfuSeDevice;
            // console.log("DfuSe fields hidden:", dfuseFields.hidden); // Optional: keep for debugging
        } else {
            // Only warn once if element not found during init maybe?
            // console.warn("DfuSe fields element not found.");
        }
    }

    // --- Error Handling ---
    function handleError(error, userMsg = "An error occurred. Check console.") {
        console.error("Error caught:", error); // Log the full error object
        // Extract a useful message for logging/display
        const messageToLog = (error instanceof Error) ? error.message : String(error);

        // Log error details unless it's just asking for user interaction
        if (dfuUtil && !(error instanceof NeedsUserGestureError)) {
             dfuUtil.logError(`Error: ${messageToLog}`);
        } else if (!dfuUtil) {
            // Log to console if dfuUtil isn't ready yet
            console.error(`Error before DFU Util ready: ${messageToLog}`);
        }
        // Update user-facing status
        updateStatus(userMsg, "error");
        // Transition to error state to allow reset
        saveState(STATE.ERROR);
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
          // Ensure DFU libraries are available before proceeding
          if (typeof dfu === 'undefined' || typeof dfuUtil === 'undefined') {
                throw new Error("Core DFU libraries (dfu.js, dfu-util.js) not available.");
          }

          dfuUtil.logInfo(`Connection attempt ${connectAttempts}: VID=0x${attemptVid.toString(16)}, Serial=${attemptSerial || 'any'}, PromptAllowed=${allowRequestPrompt}`);

          // Define filters based on provided VID/Serial
          const filters = [{ vendorId: attemptVid }];
          if (attemptSerial) {
              filters[0].serialNumber = attemptSerial;
          }

          // 1. Check already permitted devices
          try {
              const devices = await navigator.usb.getDevices();
              dfuUtil.logInfo(`Found ${devices.length} permitted devices. Checking for match...`);
              const matchingDevice = devices.find(d => {
                  let vidMatch = d.vendorId === attemptVid;
                  let serialMatch = !attemptSerial || d.serialNumber === attemptSerial;
                  // Check if the device exposes *any* DFU interface using the library function
                  let dfuCapable = dfu.findDeviceDfuInterfaces(d).length > 0;
                  return vidMatch && serialMatch && dfuCapable;
              });

              if (matchingDevice) {
                  dfuUtil.logInfo(`Found permitted matching device: ${matchingDevice.productName || 'Unknown'} (Serial: ${matchingDevice.serialNumber || 'N/A'})`);
                  // Attempt to connect using dfuUtil, which returns dfu.Device or dfuse.Device
                  const connectedDfuDevice = await dfuUtil.connect(matchingDevice);
                  connectAttempts = 0; // Reset attempts on success
                  dfuUtil.logSuccess(`Connected to permitted device.`);
                  currentDevice = connectedDfuDevice; // Store reference
                  return connectedDfuDevice; // Return the dfu.Device/dfuse.Device object
              } else {
                   dfuUtil.logInfo("No matching permitted device found.");
              }
          } catch (error) {
              dfuUtil.logWarning(`Error checking permitted devices: ${error.message}. Proceeding to request prompt if allowed.`);
          }

          // 2. If no permitted device found/connected, request permission if allowed
          if (!allowRequestPrompt) {
                dfuUtil.logWarning("Device permission required, but cannot prompt automatically in this state.");
                throw new NeedsUserGestureError("Device permission required, user interaction needed.");
           }

           dfuUtil.logInfo("Requesting device permission from user...");
           try {
              // Prompt user to select a device
              const selectedUsbDevice = await navigator.usb.requestDevice({ filters: filters });
              // Update VID and Serial based on user selection, as it might differ slightly
              vid = selectedUsbDevice.vendorId;
              serial = selectedUsbDevice.serialNumber || '';
              sessionStorage.setItem(serialKey, serial); // Save potentially new serial

              dfuUtil.logInfo(`User selected device: ${selectedUsbDevice.productName || 'Unknown'} (VID: 0x${vid.toString(16)}, Serial: ${serial || 'N/A'})`);

              // Connect to the selected device using dfuUtil
              const connectedDfuDevice = await dfuUtil.connect(selectedUsbDevice);
              connectAttempts = 0; // Reset attempts on success
              dfuUtil.logSuccess(`Connected to user-selected device.`);
              currentDevice = connectedDfuDevice; // Store reference
              return connectedDfuDevice; // Return the dfu.Device/dfuse.Device object
           } catch(error) {
               // Handle specific errors from requestDevice
               if (error.name === 'NotFoundError') {
                   throw new Error("No device selected or found by the user.");
               } else if (error.name === 'SecurityError') {
                    throw new Error("Device request blocked by browser security settings (requires secure context/HTTPS).");
               }
               // Rethrow other errors (like connection issues after selection)
               throw new Error(`Error requesting/connecting device: ${error.message}`);
           }
    }

    /**
     * Performs the actual firmware download process using the currentDevice object.
     */
    async function runFlashWorkflow() {
          if (!currentDevice) { handleError(new Error("runFlashWorkflow called with no device."), "Device not connected."); return; }
          if (currentState !== STATE.FLASHING) { console.warn("runFlashWorkflow called in incorrect state:", currentState); return; }
          if (!dfuUtil) { handleError(new Error("dfuUtil missing."), "Internal error: DFU utility not available."); return; }

          const firmware = dfuUtil.getFirmwareFile();
          if (!firmware) { handleError(new Error("Firmware not loaded."), "Firmware file is missing!"); return; }

          // Determine DFU properties safely from the currentDevice object
          const transferSize = currentDevice.properties?.TransferSize ?? 1024; // Default transfer size
          const manifestationTolerant = currentDevice.properties?.ManifestationTolerant ?? true; // Default true is safer

          dfuUtil.logInfo(`Starting firmware flash... (Size: ${firmware.byteLength} bytes)`);
          dfuUtil.logInfo(`Using TransferSize: ${transferSize}, ManifestationTolerant: ${manifestationTolerant}`);

          // Handle DfuSe specific address if device is DfuSe type
          // Check if dfuse object and Device constructor exist before using instanceof
          if (typeof dfuse !== 'undefined' && typeof dfuse.Device === 'function' && currentDevice instanceof dfuse.Device) {
              const dfuseStartAddressField = document.getElementById("dfuseStartAddress");
              let addrStr = dfuseStartAddressField?.value?.trim();
              // Default to a common STM32 start address if empty/invalid, or 0x0 if that fails
              let addr = parseInt(addrStr || "0x08000000", 16);
              if (isNaN(addr)) addr = 0; // Fallback if default is invalid


              // Validate address if possible (requires memoryInfo on the dfuse.Device object)
              if (currentDevice.memoryInfo) {
                  if (!isNaN(addr) && currentDevice.getSegment(addr)) {
                      currentDevice.startAddress = addr; // Set the start address on the device object
                      dfuUtil.logInfo(`Using DfuSe start address: 0x${addr.toString(16)}`);
                  } else {
                      const firstSegment = currentDevice.getFirstWritableSegment();
                      if (firstSegment) {
                          currentDevice.startAddress = firstSegment.start;
                          dfuUtil.logWarning(`Invalid/missing address. Using default DfuSe start address: 0x${firstSegment.start.toString(16)}`);
                      } else {
                          handleError(new Error("DfuSe device has no writable segment!"), "Cannot flash DfuSe device: No writable memory found.");
                          return;
                      }
                  }
              } else if (!isNaN(addr)) {
                   currentDevice.startAddress = addr; // Use provided address if memoryInfo not available
                   dfuUtil.logInfo(`Using provided DfuSe start address (no validation): 0x${addr.toString(16)}`);
              } else {
                   handleError(new Error("Could not determine DfuSe start address."), "DfuSe configuration error: Invalid address.");
                   return;
              }
          }

          // Start the download process
          try {
              if (downloadLog) dfuUtil.clearLog(downloadLog); // Clear log before flashing
              dfuUtil.logInfo("Starting firmware download to device...");

              // Call the do_download method *on the currentDevice object*.
              // This will correctly call either dfu.Device.do_download or dfuse.Device.do_download.
              await currentDevice.do_download(transferSize, firmware, manifestationTolerant);

              dfuUtil.logSuccess("Firmware download process completed successfully.");
              saveState(STATE.FLASH_COMPLETE); // Transition to complete state

          } catch (error) {
              // Provide more specific error message if possible
              handleError(error, `Flashing process failed: ${error.message || 'Unknown DFU error'}`);
          }
      }


    // --- Main Button Click Handler ---
    async function handleConnectClick() {
        // If in Error state, treat button click as a reset
        if (currentState === STATE.ERROR) {
            clearState(); // Resets state, clears logs, updates UI
            if (dfuUtil) dfuUtil.logInfo("State reset. Please try the connection process again.");
            return;
        }

        // Prevent clicks during busy/prompt states that don't require user clicks
        if ([STATE.CONNECTING_STAGE1, STATE.WAITING_DISCONNECT, STATE.CONNECTING_STAGE2,
             STATE.WAITING_STABLE, STATE.CONNECTING_FLASH, STATE.FLASHING,
             STATE.PROMPT_REFRESH_1, STATE.PROMPT_REFRESH_2, STATE.FLASH_COMPLETE].includes(currentState)) {
             console.warn(`Button clicked in non-interactive state: ${currentState}. Ignoring.`);
             return; // Ignore click
        }

         // Check if firmware is loaded when starting from IDLE
         if (currentState === STATE.IDLE && !firmwareLoaded) {
             updateStatus("Firmware is still loading, please wait...", "info");
             return;
         }
         // Ensure DFU util is ready before proceeding
         if (!dfuUtil) {
             handleError(new Error("DFU Utility not ready."), "Initialization error, please refresh.");
             return;
         }

         // --- Handle states where user click IS expected/required ---

         // 1. Start the process from IDLE state
         if (currentState === STATE.IDLE) {
             connectAttempts = 0; // Reset connection attempts
             saveState(STATE.CONNECTING_STAGE1); // Update state immediately
             if (downloadLog) dfuUtil.clearLog(downloadLog); // Clear previous logs
             dfuUtil.logInfo("Starting Stage 1 connection...");

             try {
                 // Allow user prompt for the first connection attempt
                 // Store result in a temp variable, `currentDevice` updated within attemptConnection
                 await attemptConnection(vid, null, true);
                 // No need to check currentDevice here, attemptConnection throws on failure or updates it

                 // *** VERIFY DEVICE IS MCUBOOT ***
                 if (!currentDevice || !currentDevice.device_ || currentDevice.device_.productName !== 'MCUBOOT') {
                      // Throw a specific error to be caught below
                      throw new Error(`Incorrect device connected: ${currentDevice?.device_?.productName || 'Unknown'}. Expected 'MCUBOOT'.`);
                 }

                 dfuUtil.logSuccess(`Connected to ${currentDevice.device_.productName} (Stage 1). Serial: ${currentDevice.device_.serialNumber || 'N/A'}`);
                 serial = currentDevice.device_.serialNumber || ''; // Capture the serial number

                 // Detach sequence
                 dfuUtil.logInfo("Waiting briefly before detaching for mode switch...");
                 await new Promise(resolve => setTimeout(resolve, 300)); // Short delay

                 saveState(STATE.WAITING_DISCONNECT, serial); // Update state before detach command
                 await currentDevice.detach();
                 dfuUtil.logInfo("Detach command sent. Waiting for device disconnect...");

                 // Wait for disconnection (with timeout)
                 await Promise.race([
                     currentDevice.waitDisconnected(5000), // Wait up to 5 seconds
                     new Promise((_, reject) => setTimeout(() => reject(new Error("Device did not disconnect within 5 seconds after detach.")), 5000))
                 ]);
                 dfuUtil.logInfo("Device disconnected (or timed out waiting).");

                 // Transition to refresh prompt *only if* still in the waiting state
                 // This prevents transitioning if an error occurred or disconnect was handled differently
                 if (currentState === STATE.WAITING_DISCONNECT) {
                     saveState(STATE.PROMPT_REFRESH_1, serial);
                 }

             } catch (error) {
                  // Provide user-friendly messages for common errors
                  if (error.message?.toLowerCase().includes("stall")) { handleError(error, "Device stalled. Please reconnect & try again."); }
                  else if (error.message?.includes("disconnect within 5 seconds")) {
                      // If timeout occurs but we expected disconnect, proceed cautiously
                      if (currentState === STATE.WAITING_DISCONNECT) {
                          dfuUtil.logWarning("Device disconnect timeout after detach, proceeding to refresh prompt anyway.");
                          saveState(STATE.PROMPT_REFRESH_1, serial); // Assume it worked, prompt refresh
                      } else {
                          handleError(error, "Device disconnect timeout unexpectedly."); // Unexpected timeout
                      }
                  }
                  else if (error.message?.includes("No device selected")) {
                       dfuUtil.logWarning("Device selection cancelled by user.");
                       clearState(); // Reset to idle if user cancels
                  }
                  else if (error instanceof NeedsUserGestureError) {
                       // This shouldn't happen here as allowRequestPrompt=true, but handle defensively
                       dfuUtil.logWarning("User gesture needed unexpectedly during Stage 1.");
                       clearState(); // Go back to idle
                  }
                  else if (error.message?.includes("Incorrect device connected")) {
                      // Handle the specific error thrown for wrong device type
                      handleError(error, "Wrong mode! Put Critter in DFU (Step 1) and try again.");
                       // currentDevice might be the wrong device, try closing it
                       if (currentDevice) { try { await currentDevice.close(); } catch(e) { /* ignore close error */ } currentDevice = null; }
                       clearState(); // Reset fully
                  }
                   else {
                       // General error handling
                       handleError(error, `Connection failed (Stage 1): ${error.message}`);
                   }

                  // Cleanup: Ensure device is closed if an error occurred mid-process, unless already handled
                  if (currentDevice && !error.message?.includes("Incorrect device connected")) {
                      try { await currentDevice.close(); } catch(e) { /* ignore close error */ }
                      currentDevice = null;
                  }

                  // Ensure state is Error unless it was reset to IDLE or proceeded to REFRESH_1
                  if (![STATE.IDLE, STATE.PROMPT_REFRESH_1, STATE.ERROR].includes(currentState)) {
                      saveState(STATE.ERROR);
                  }
             }
         }

         // 2. Handle click when Stage 2 connection permission is needed
         else if (currentState === STATE.PROMPT_CONNECT_STAGE2) {
              saveState(STATE.CONNECTING_STAGE2, serial); // Update state
              dfuUtil.logInfo("Attempting Stage 2 connection after user click...");
              try {
                  // Allow user prompt again for this stage, using stored serial
                  await attemptConnection(vid, serial, true);
                  // No need to check currentDevice, error thrown on failure or updates it

                  dfuUtil.logSuccess(`Reconnected to ${currentDevice.device_.productName} (Stage 2). Serial: ${serial || 'N/A'}`);
                  saveState(STATE.WAITING_STABLE, serial);
                  await new Promise(resolve => setTimeout(resolve, 1500)); // Wait for device stability

                  // Attempt to clear any lingering error status from DFU device
                  try {
                      dfuUtil.logInfo("Checking DFU status...");
                      let status = await currentDevice.getStatus();
                      dfuUtil.logInfo(`DFU Status: State=${status.state}, Status=${status.status}`);
                      // Check if dfu constant exists before using
                      if (typeof dfu !== 'undefined' && status.state === dfu.dfuERROR) {
                          dfuUtil.logWarning("Device in DFU error state, attempting to clear...");
                          await currentDevice.clearStatus();
                          dfuUtil.logInfo("Cleared DFU error state.");
                      }
                  } catch (e) {
                      dfuUtil.logWarning(`Couldn't check/clear DFU status: ${e}`);
                  }

                  // Proceed to the next refresh prompt
                  saveState(STATE.PROMPT_REFRESH_2, serial);

              } catch (error) {
                   if (error.message?.includes("No device selected")) {
                       dfuUtil.logWarning("Device selection cancelled by user.");
                       saveState(STATE.PROMPT_CONNECT_STAGE2); // Go back to waiting for click
                   } else {
                       handleError(error, `Connection failed (Stage 2): ${error.message}`);
                   }
              }
         }

         // 3. Handle click when final Flash connection permission is needed
         else if (currentState === STATE.PROMPT_CONNECT_FLASH) {
              saveState(STATE.CONNECTING_FLASH, serial); // Update state
              dfuUtil.logInfo("Attempting final connection for flashing after user click...");
              try {
                  // Allow user prompt for the final time, using stored serial
                  await attemptConnection(vid, serial, true);
                   // No need to check currentDevice, error thrown on failure or updates it

                  dfuUtil.logSuccess(`Reconnected to ${currentDevice.device_.productName} (Ready to Flash!). Serial: ${serial || 'N/A'}`);

                  // Transition to Flashing state and run the workflow
                  saveState(STATE.FLASHING, serial);
                  await runFlashWorkflow(); // This will handle its own errors and final state transition

              } catch (error) {
                   if (error.message?.includes("No device selected")) {
                       dfuUtil.logWarning("Device selection cancelled by user.");
                       saveState(STATE.PROMPT_CONNECT_FLASH); // Go back to waiting for click
                   } else {
                       handleError(error, `Connection failed (Final Flash): ${error.message}`);
                   }
              }
         }
    } // End handleConnectClick


     // --- Logic to run automatically after page refresh ---
     async function runAutoConnectSequence() {
          // Ensure DFU util is initialized
          if (!dfuUtil) {
              console.error("DfuUtil not ready, cannot run auto-connect sequence.");
              return;
          }
          console.log("Checking for auto-connect sequence. Current state:", currentState);

           // Add validation: If in a state requiring serial, but serial is missing, reset.
           const requiresSerial = [
                STATE.PROMPT_REFRESH_1, STATE.PROMPT_CONNECT_STAGE2, STATE.CONNECTING_STAGE2,
                STATE.WAITING_STABLE, STATE.PROMPT_REFRESH_2,
                STATE.PROMPT_CONNECT_FLASH, STATE.CONNECTING_FLASH,
                STATE.FLASHING
           ].includes(currentState);

           if (requiresSerial && !serial) {
               console.warn(`Auto-connect aborted: State '${currentState}' requires serial, but none found. Resetting.`);
               clearState();
               dfuUtil.logWarning("Inconsistent state detected on load. Process reset.");
               return;
           }


          // A. After first refresh, try to auto-connect Stage 2
          if (currentState === STATE.PROMPT_REFRESH_1) {
               dfuUtil.logInfo("Detected state PROMPT_REFRESH_1. Attempting automatic Stage 2 connection...");
               // Immediately transition state to indicate connection attempt
               saveState(STATE.CONNECTING_STAGE2, serial);
               try {
                    // DO NOT allow prompt here - rely on existing permissions granted before refresh
                    await attemptConnection(vid, serial, false);
                    // No need to check currentDevice, error thrown on failure or updates it

                    dfuUtil.logSuccess(`Auto-reconnected to ${currentDevice.device_.productName} (Stage 2). Serial: ${serial || 'N/A'}`);
                    saveState(STATE.WAITING_STABLE, serial);
                    await new Promise(resolve => setTimeout(resolve, 1500)); // Stabilize

                     // Attempt to clear status after auto-connect
                    try {
                        dfuUtil.logInfo("Checking DFU status after auto-reconnect...");
                        let status = await currentDevice.getStatus();
                         dfuUtil.logInfo(`DFU Status: State=${status.state}, Status=${status.status}`);
                         // Check if dfu constant exists
                        if (typeof dfu !== 'undefined' && status.state === dfu.dfuERROR) {
                            dfuUtil.logWarning("Device in DFU error state, attempting clear...");
                            await currentDevice.clearStatus();
                            dfuUtil.logInfo("Cleared DFU error state.");
                        }
                    } catch (e) { dfuUtil.logWarning("Couldn't check/clear DFU status (auto Stage 2): " + e); }

                    // Proceed to next refresh prompt
                    saveState(STATE.PROMPT_REFRESH_2, serial);

               } catch (error) {
                    if (error instanceof NeedsUserGestureError) {
                         // This is the expected path if permissions weren't granted/persisted across refresh
                         dfuUtil.logWarning("Permissions needed for Stage 2 (not persisted). Asking user to click.");
                         saveState(STATE.PROMPT_CONNECT_STAGE2, serial); // Ask user to click button
                    } else {
                        // Handle other unexpected errors during auto-connect
                        handleError(error, `Automatic connection failed (Stage 2): ${error.message}`);
                    }
               }
           }
           // B. After second refresh, try to auto-connect for Flash
           else if (currentState === STATE.PROMPT_REFRESH_2) {
                dfuUtil.logInfo("Detected state PROMPT_REFRESH_2. Attempting automatic Flash connection...");
                // Immediately transition state
                saveState(STATE.CONNECTING_FLASH, serial);
                try {
                     // DO NOT allow prompt here
                     await attemptConnection(vid, serial, false);
                     // No need to check currentDevice, error thrown on failure or updates it

                     dfuUtil.logSuccess(`Auto-reconnected to ${currentDevice.device_.productName} (Ready to Flash!). Serial: ${serial || 'N/A'}`);
                     saveState(STATE.FLASHING, serial);
                     await runFlashWorkflow(); // Start flashing

                } catch (error) {
                     if (error instanceof NeedsUserGestureError) {
                         // Expected path if permissions didn't persist
                         dfuUtil.logWarning("Permissions needed for Flash (not persisted). Asking user to click.");
                         saveState(STATE.PROMPT_CONNECT_FLASH, serial); // Ask user to click button
                     } else {
                         handleError(error, `Automatic connection failed (Final Flash): ${error.message}`);
                     }
                }
           } else {
                // If not in a state requiring auto-connect, just ensure UI is up-to-date
                console.log("No automatic connection action needed for current state:", currentState);
                updateUI(); // Ensure UI reflects the loaded state correctly
           }
     }

    // --- Initialization Function ---
    function initializePage() {
         console.log("Initializing μCritter Pupdate Page...");

         // --- Cache DOM Element References ---
         connectButton = document.getElementById("connect");
         statusDisplay = document.getElementById("status");
         downloadLog = document.getElementById("downloadLog");
         const webUsbNotice = document.getElementById("browserNotice");
         const layoutWrapper = document.querySelector(".layout-wrapper"); // Main flex container
         const instructionsColumn = document.querySelector(".instructions-column");

         // --- Check WebUSB Support ---
         const isWebUsbSupported = typeof navigator.usb !== 'undefined';
         if (!isWebUsbSupported) {
             console.warn("WebUSB is not supported by this browser.");
             if (webUsbNotice) {
                 webUsbNotice.innerHTML = `<p><strong>Woof! This browser doesn't support WebUSB.</strong></p><p>Please use <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong> on a desktop computer (Windows, macOS, Linux, Android) to flash your Critter.</p><p><a class="download-btn" href="https://www.google.com/chrome/" target="_blank" rel="noopener">Get Chrome</a> <a class="download-btn" href="https://www.microsoft.com/edge" target="_blank" rel="noopener" style="margin-left: 10px;">Get Edge</a></p>`;
                 webUsbNotice.hidden = false;
             }
             // Hide the main flashing/instructions content if WebUSB is unavailable
             if (layoutWrapper) layoutWrapper.style.display = 'none';
             // Stop further initialization
             return;
         } else {
             // Ensure notice is hidden and layout is visible if supported
             if (webUsbNotice) webUsbNotice.hidden = true;
             if (layoutWrapper) layoutWrapper.style.display = 'flex'; // Ensure flex display is set
         }

          // --- Load Previous State (with validation) ---
          // Do this *before* initializing DFU util, so DFU util logs reflect correct initial state
          loadState();

         // --- Initialize DFU Utility ---
         // Ensure dfu-util.js (which defines DfuUtil constructor or dfuUtil object) and dfu.js are loaded
         // Check specifically for the global dfuUtil object created by dfu-util.js
         // Use window.dfuUtil to access the global variable set by dfu-util.js
         if (typeof window.dfuUtil === 'undefined' || typeof dfu === 'undefined') {
             console.error("DFU library (dfu.js or dfu-util.js) not loaded or initialized!");
             handleError(new Error("Page setup error: DFU library missing."), "Initialization Failed: Core library missing.");
             return; // Stop initialization
         }
         // Assign to cached variable
         dfuUtil = window.dfuUtil;

         // Now perform initialization using the dfuUtil object
         try {
             // dfuUtil.init() is likely called by dfu-util.js itself.
             // Linking the log context is the main task here.
             if (downloadLog) {
                dfuUtil.setLogContext(downloadLog);
                console.log("DfuUtil log context set.");
             } else {
                 console.error("Log display element (#downloadLog) not found!");
                 handleError(new Error("Page setup error: Log display missing."), "Initialization Failed: Log display missing.");
                 return;
             }

             console.log("DfuUtil initialization checks passed.");
         } catch (error) {
              handleError(error, "Failed to initialize DFU Utility.");
              return; // Stop if DFU util fails
         }

        // --- Setup DFU Disconnect Callback ---
        dfuUtil.setOnDisconnectCallback((reason) => {
            console.log("Device disconnect detected.", "Reason:", reason, "Current state:", currentState);
             // Handle unexpected disconnects during active phases
             if ( ![STATE.IDLE, STATE.ERROR, STATE.FLASH_COMPLETE,
                    STATE.WAITING_DISCONNECT, // Expected disconnect after detach
                    STATE.PROMPT_REFRESH_1, STATE.PROMPT_REFRESH_2, // States between connections
                    STATE.PROMPT_CONNECT_STAGE2, STATE.PROMPT_CONNECT_FLASH // Waiting for user click
                   ].includes(currentState) )
             {
                 // Only handle error if device wasn't already closed/nulled out
                  if (currentDevice) {
                     handleError(new Error("Device disconnected unexpectedly."), "Device Disconnected Unexpectedly!");
                     currentDevice = null; // Clear the device reference
                  } else {
                      dfuUtil.logWarning("Disconnect event for an already cleared device reference.");
                  }
             } else if (currentState === STATE.WAITING_DISCONNECT) {
                 // Log expected disconnect but let the main flow handle state transition
                 dfuUtil.logInfo("Device disconnected as expected after detach command.");
                 currentDevice = null; // Clear reference after expected disconnect too
             } else {
                 // Disconnect during idle, error, complete, or prompt states - just log
                 dfuUtil.logInfo(`Device disconnected during non-critical state: ${currentState}`);
                 currentDevice = null; // Clear reference
             }
             // Update UI to reflect disconnected state if needed (e.g., disable buttons)
             updateUI();
        });

        // --- Load Firmware Asynchronously ---
        // Update UI immediately based on loaded state (button might be disabled)
        updateUI(); // Set initial button state (likely "Loading Firmware...")
        dfuUtil.loadFirmware("zephyr.signed.bin") // Path to your firmware file
           .then(() => {
                firmwareLoaded = true;
                dfuUtil.logInfo("Firmware loaded and ready.");
                // Update UI again now that firmware is loaded
                // This will enable the button if the state is IDLE
                updateUI();
            })
           .catch(err => {
               firmwareLoaded = false;
               // Display specific error to user
               handleError(err, `Could not load firmware: ${err.message}. Please refresh.`);
               // UI will be updated by handleError to show error state
           });

        // --- Add Event Listeners ---
        if (!connectButton) {
             handleError(new Error("Page setup error: Connect button missing."), "Initialization Failed: Connect button missing.");
             return;
        }
        connectButton.addEventListener('click', handleConnectClick); // Add main click handler

        // --- Setup OS Instruction Toggling ---
        const osButtons = document.querySelectorAll('.os-btn');
        // Ensure instructionsColumn is valid before querying inside it
        const instructionsSections = instructionsColumn ? instructionsColumn.querySelectorAll('section.instructions[data-ins]') : []; // Select only OS-specific sections
        const introSection = document.getElementById('intro-instructions'); // Common intro section

        // Function to switch displayed instructions based on OS
        function switchOS(os) {
           // Add check for instructionsColumn existence
           if (!instructionsSections.length || !introSection || !osButtons.length || !instructionsColumn) {
               console.warn("Instruction elements missing, cannot switch OS view.");
               return;
           }
           console.log("Switching instructions view to:", os);
           // Hide all OS-specific sections first
           instructionsSections.forEach(sec => { sec.hidden = true; });
           // Show the selected OS section
           const sectionToShow = instructionsColumn.querySelector(`section.instructions[data-ins="${os}"]`);
           if(sectionToShow) {
               sectionToShow.hidden = false;
           } else {
               console.warn(`Instruction section for OS '${os}' not found.`);
               // Fallback to Linux if specific OS not found? Or show nothing?
               // For now, just warns.
           }
           // Always ensure the intro section is visible (unless all instructions are hidden)
           introSection.hidden = !sectionToShow; // Hide intro if no specific section is shown
           // Update button active state
           osButtons.forEach(btn => { btn.classList.toggle('active', btn.dataset.os === os); });
        }

        // --- Enhanced OS Detection including Android ---
        const ua = navigator.userAgent;
        const platform = navigator.platform; // Sometimes more reliable for Mac/iOS
        let detectedOS = 'linux'; // Default to Linux

        if (/android/i.test(ua)) {
            // Check if likely Chrome on Android
            if (/chrome/i.test(ua) && !/edg/i.test(ua)) { // Exclude Edge which includes Chrome UA string
                 detectedOS = 'android';
                 console.log("Detected Android (Chrome).");
            } else {
                console.log("Detected Android (Non-Chrome browser - WebUSB might not work).");
                // Keep 'linux' as default or handle specific non-chrome android case if needed
                // For now, let's stick with linux default to show some instructions.
                // Alternatively, you could set detectedOS = 'android' and have a notice in those instructions.
                 detectedOS = 'android'; // Let's show Android instructions but user should use Chrome
            }
        } else if (/Win/.test(ua) || /Win/.test(platform)) {
            detectedOS = 'win';
        } else if (/Mac|iPod|iPhone|iPad/.test(platform)) {
            detectedOS = 'mac';
        }
        // Linux is the fallback default if none of the above match.
        console.log("Final Detected OS for instructions:", detectedOS);
        switchOS(detectedOS); // Set initial view

        // Add click listeners to OS buttons
        osButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Get OS from data attribute and switch view
                const selectedOs = e.target.dataset.os;
                if (selectedOs) {
                    switchOS(selectedOs);
                }
            });
        });

        // --- Trigger Auto-Connect Sequence (Delayed) ---
        // Run after a short delay to allow the page/scripts to fully settle
        console.log("Scheduling auto-connect sequence check...");
        setTimeout(runAutoConnectSequence, 500); // 500ms delay

    } // End initializePage

    // --- Run Initialization on DOMContentLoaded ---
    // Ensures the DOM is ready before trying to access elements
    if (document.readyState === 'loading') { // Handle cases where script runs before DOMContentLoaded
        document.addEventListener("DOMContentLoaded", initializePage);
    } else { // Handle cases where script runs after DOMContentLoaded
        initializePage();
    }

})(); // End main IIFE