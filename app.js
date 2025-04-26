// ==================================================
// Main Page Logic - Interactive Flash Workflow
// ==================================================
(function() { // Wrap page logic in IIFE to avoid global scope pollution
    // --- Element References (cached on initialization) ---
    let connectButton = null;
    let statusDisplay = null;
    let downloadLog = null;
    let dfuUtil = null; // Will hold the DfuUtil instance (assigned during init)

    // --- State Definitions (using const for immutability) ---
    const STATE = Object.freeze({ // Use Object.freeze for safety
        IDLE: 'idle',
        CONNECTING_STAGE1: 'connecting_stage1',
        WAITING_DISCONNECT: 'waiting_disconnect',
        PROMPT_REFRESH_1: 'prompt_refresh_1',
        PROMPT_CONNECT_STAGE2: 'prompt_connect_stage2',
        CONNECTING_STAGE2: 'connecting_stage2',
        WAITING_STABLE: 'waiting_stable',
        PROMPT_REFRESH_2: 'prompt_refresh_2',
        PROMPT_CONNECT_FLASH: 'prompt_connect_flash',
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
    let vid = 0x2FE3; // μCritter Vendor ID
    const pidStage1 = 0x0100; // μCritter PID Stage 1 (MCUBOOT) - 256 decimal
    const pidStage2 = 0xFFFF; // μCritter PID Stage 2 (MCUBOOT) - 65535 decimal
    let serial = ''; // Store device serial number across refreshes
    let firmwareLoaded = false; // Flag for firmware loading status


    // --- Session Storage Keys (using const for keys) ---
    const stateKey = 'ucritterFlashState';
    const serialKey = 'ucritterFlashSerial';

    // --- Custom Error for User Gesture Requirement ---
    class NeedsUserGestureError extends Error {
        constructor(message = "User interaction required to proceed.") { super(message); this.name = "NeedsUserGestureError"; }
    }

    // --- State Management Functions ---
    function saveState(stateToSave, deviceSerial = serial) {
        if (!Object.values(STATE).includes(stateToSave)) { console.error("Attempted to save invalid state:", stateToSave); return; }
        currentState = stateToSave; sessionStorage.setItem(stateKey, stateToSave);
        if (deviceSerial) { sessionStorage.setItem(serialKey, deviceSerial); } else { sessionStorage.removeItem(serialKey); }
        console.log("State saved:", stateToSave, "Serial:", deviceSerial || 'N/A'); updateUI();
    }

    async function loadState() {
        const savedState = sessionStorage.getItem(stateKey); const savedSerial = sessionStorage.getItem(serialKey) || ''; let stateIsValid = false; let requiresSerial = false;
        console.log(`Attempting load: State=${savedState}, Serial=${savedSerial}`);
        if (savedState && Object.values(STATE).includes(savedState) && savedState !== STATE.IDLE && savedState !== STATE.FLASH_COMPLETE) {
            requiresSerial = [ STATE.WAITING_DISCONNECT, STATE.PROMPT_REFRESH_1, STATE.PROMPT_CONNECT_STAGE2, STATE.CONNECTING_STAGE2, STATE.WAITING_STABLE, STATE.PROMPT_REFRESH_2, STATE.PROMPT_CONNECT_FLASH, STATE.CONNECTING_FLASH, STATE.FLASHING, STATE.ERROR ].includes(savedState);
            if (requiresSerial && !savedSerial) { console.warn(`Invalid: State '${savedState}' needs serial.`); stateIsValid = false; }
            else { stateIsValid = true; console.log(`State '${savedState}' initially valid.`); }
        } else if (savedState === STATE.ERROR) { stateIsValid = true; requiresSerial = true; console.log("State is ERROR, initially valid."); }
        if (stateIsValid && requiresSerial && savedSerial && typeof navigator.usb !== 'undefined') {
            console.log(`State '${savedState}' needs serial '${savedSerial}'. Verifying device...`);
            try { const devices = await navigator.usb.getDevices(); const matchingDevice = devices.find(d => d.serialNumber === savedSerial && d.vendorId === vid);
                if (!matchingDevice) { console.warn(`Required serial '${savedSerial}' not found. Resetting.`); stateIsValid = false; }
                else { console.log(`Matching device found. State valid.`); }
            } catch (error) { console.error("Error checking devices:", error); stateIsValid = false; }
        }
        if (stateIsValid) { currentState = savedState; serial = savedSerial; console.log("State loaded:", currentState); }
        else { if (savedState && savedState !== STATE.IDLE) { console.log(`State '${savedState}' invalid/inconsistent. Resetting.`); } else { console.log("No valid state/already IDLE."); }
            currentState = STATE.IDLE; serial = ''; sessionStorage.removeItem(stateKey); sessionStorage.removeItem(serialKey); }
    }

    function clearState() {
        const previousState = currentState; currentState = STATE.IDLE; currentDevice = null;
        if (dfuUtil?.getDevice()) { console.log("Clearing currentDevice ref."); }
        serial = ''; connectAttempts = 0; sessionStorage.removeItem(stateKey); sessionStorage.removeItem(serialKey);
        console.log(`State cleared (was ${previousState})`); if (dfuUtil && downloadLog) dfuUtil.clearLog(downloadLog); updateUI();
    }

    // --- UI Update Logic ---
    function updateStatus(message, type = 'info') { if (!statusDisplay) return; statusDisplay.textContent = message; statusDisplay.className = `status status-${type}`; if (dfuUtil) console.log(`Status (${type}): ${message}`); }
    function updateUI() {
        if (!connectButton) return; if (dfuUtil) console.log("Updating UI for state:", currentState);
        let buttonDisabled = false; let buttonText = "Flash My Critter!";
        switch (currentState) {
            case STATE.IDLE: updateStatus("Ready to connect", "info"); buttonText = firmwareLoaded ? "Flash My Critter!" : "Loading Firmware..."; buttonDisabled = !firmwareLoaded; break;
            case STATE.CONNECTING_STAGE1: case STATE.CONNECTING_STAGE2: case STATE.CONNECTING_FLASH: updateStatus(`Connecting (${currentState})... Check pop-up!`, "info"); buttonText = "Connecting..."; buttonDisabled = true; break;
            case STATE.WAITING_DISCONNECT: updateStatus("Stage 1 Connected. Switching...", "info"); buttonText = "Switching..."; buttonDisabled = true; if (dfuUtil) dfuUtil.logInfo("Attempting detach..."); break;
            case STATE.PROMPT_REFRESH_1: updateStatus("Stage 1 Done! REFRESH PAGE NOW.", "prompt"); buttonText = "REFRESH PAGE NOW"; buttonDisabled = true; if (dfuUtil) dfuUtil.logSuccess("Ready for 1st refresh."); break;
            case STATE.PROMPT_CONNECT_STAGE2: updateStatus("Click button for Stage 2 permission.", "prompt"); buttonText = "Connect Stage 2"; buttonDisabled = false; if (dfuUtil) dfuUtil.logWarning("Needs Stage 2 permission."); break;
            case STATE.PROMPT_CONNECT_FLASH: updateStatus("Click button for Flash permission.", "prompt"); buttonText = "Connect to Flash"; buttonDisabled = false; if (dfuUtil) dfuUtil.logWarning("Needs final permission."); break;
            case STATE.WAITING_STABLE: updateStatus("Stage 2 Connected. Stabilizing...", "info"); buttonText = "Stabilizing..."; buttonDisabled = true; if (dfuUtil) dfuUtil.logInfo("Stabilizing..."); break;
            case STATE.PROMPT_REFRESH_2: updateStatus("Stage 2 Ready! REFRESH PAGE AGAIN.", "prompt"); buttonText = "REFRESH PAGE AGAIN"; buttonDisabled = true; if (dfuUtil) dfuUtil.logSuccess("Ready for final refresh."); break;
            case STATE.FLASHING: updateStatus("Flashing Firmware... Do not disconnect!", "info"); buttonText = "Flashing..."; buttonDisabled = true; if (dfuUtil) dfuUtil.logInfo("Starting flash..."); break;
            case STATE.FLASH_COMPLETE: updateStatus("Pupdate Complete! Critter rebooting.", "success"); buttonText = "Done!"; buttonDisabled = true; if (dfuUtil) dfuUtil.logSuccess("Flashed successfully!"); setTimeout(clearState, 6000); break;
            case STATE.ERROR: buttonText = "Error Occurred - Reset?"; buttonDisabled = false; break;
            default: updateStatus("Unknown state", "error"); buttonText = "Error"; buttonDisabled = true;
        }
        connectButton.textContent = buttonText; connectButton.disabled = buttonDisabled;
    }

    // --- Error Handling ---
    function handleError(error, userMsg = "An error occurred.") {
        console.error("Error caught:", error); const messageToLog = (error instanceof Error) ? error.message : String(error);
        if (dfuUtil && !(error instanceof NeedsUserGestureError)) { dfuUtil.logError(`Error: ${messageToLog}`); }
        else if (!dfuUtil) { console.error(`Error before DFU Util: ${messageToLog}`); }
        updateStatus(userMsg, "error"); if (currentState !== STATE.ERROR) { saveState(STATE.ERROR); }
    }

    // --- Core Connection and Flashing Logic ---
    async function attemptConnection(attemptVid, attemptSerial, allowRequestPrompt = false) {
          connectAttempts++; if (connectAttempts > MAX_CONNECT_ATTEMPTS) throw new Error(`Max attempts (${MAX_CONNECT_ATTEMPTS})`);
          if (typeof dfu === 'undefined' || typeof dfuUtil === 'undefined') throw new Error("Core DFU libs missing");
          dfuUtil.logInfo(`Connect attempt ${connectAttempts}: VID=${attemptVid.toString(16)}, Serial=${attemptSerial||'any'}, Prompt=${allowRequestPrompt}`);
          const filter = [{ vendorId: attemptVid }]; if (attemptSerial) filter[0].serialNumber = attemptSerial;
          try { const devices = await navigator.usb.getDevices(); dfuUtil.logInfo(`Found ${devices.length} permitted`);
              const matching = devices.find(d => (d.vendorId === attemptVid) && (!filter[0].serialNumber || d.serialNumber === filter[0].serialNumber) && (dfu.findDeviceDfuInterfaces(d).length > 0));
              if (matching) { dfuUtil.logInfo(`Found permitted: ${matching.productName || 'Unknown'}`); const c = await dfuUtil.connect(matching); connectAttempts = 0; dfuUtil.logSuccess(`Connected permitted.`); currentDevice = c; return c; }
              else { dfuUtil.logInfo("No matching permitted found."); }
          } catch (e) { dfuUtil.logWarning(`Error checking devices: ${e.message||e}.`); }
          if (!allowRequestPrompt) { dfuUtil.logWarning("Needs permission, cannot prompt."); throw new NeedsUserGestureError("Needs permission"); }
          const promptFilter = [{ vendorId: attemptVid }]; dfuUtil.logInfo(`Requesting permission: ${JSON.stringify(promptFilter)}`);
           try { const usbDevice = await navigator.usb.requestDevice({ filters: promptFilter }); vid = usbDevice.vendorId; serial = usbDevice.serialNumber || ''; sessionStorage.setItem(serialKey, serial);
              dfuUtil.logInfo(`User selected: ${usbDevice.productName || 'Unknown'} (VID: ${vid}, PID: ${usbDevice.productId}, Ser: ${serial||'N/A'})`); // Log PID too
              const c = await dfuUtil.connect(usbDevice); connectAttempts = 0; dfuUtil.logSuccess(`Connected user selection.`); currentDevice = c; return c;
           } catch(e) {
               if (e.name === 'NotFoundError') { if (promptFilter?.length > 0) { dfuUtil.logError("Prompt failed: No matching device found."); throw new Error("No matching device found."); } else { throw new Error("No device selected."); } }
               else if (e.name === 'SecurityError') { throw new Error("Security Error (HTTPS?)."); }
               throw new Error(`Request/connect error: ${e.message || e}`);
           }
    }

    async function runFlashWorkflow() {
          if (!currentDevice) { handleError(new Error("No device for flash."), "Device not connected."); return; } if (currentState !== STATE.FLASHING) { console.warn("Wrong state for flash:", currentState); return; } if (!dfuUtil) { handleError(new Error("dfuUtil missing."), "Internal error."); return; }
          const firmware = dfuUtil.getFirmwareFile(); if (!firmware) { handleError(new Error("FW missing."), "Firmware missing!"); return; }
          const transferSize = currentDevice.properties?.TransferSize ?? 1024; const manifestationTolerant = currentDevice.properties?.ManifestationTolerant ?? true;
          dfuUtil.logInfo(`Starting flash (${firmware.byteLength}B)...`); dfuUtil.logInfo(`Using Size:${transferSize}, Manifest:${manifestationTolerant}`);
          try { if (downloadLog) dfuUtil.clearLog(downloadLog); dfuUtil.logInfo("Sending firmware..."); await currentDevice.do_download(transferSize, firmware, manifestationTolerant); dfuUtil.logSuccess("Download complete."); saveState(STATE.FLASH_COMPLETE); }
          catch (error) { handleError(error, `Flashing failed: ${error.message || 'DFU error'}`); }
      }

    async function handleConnectClick() {
        if (currentState === STATE.ERROR) { clearState(); if (dfuUtil) dfuUtil.logInfo("State reset."); return; }
        if ([STATE.CONNECTING_STAGE1, STATE.WAITING_DISCONNECT, STATE.CONNECTING_STAGE2, STATE.WAITING_STABLE, STATE.CONNECTING_FLASH, STATE.FLASHING, STATE.PROMPT_REFRESH_1, STATE.PROMPT_REFRESH_2, STATE.FLASH_COMPLETE].includes(currentState)) { console.warn(`Click ignored in state: ${currentState}.`); return; }
        if (currentState === STATE.IDLE && !firmwareLoaded) { updateStatus("FW loading...", "info"); return; } if (!dfuUtil) { handleError(new Error("DFU Util missing."), "Init error."); return; }

        if (currentState === STATE.IDLE) {
             connectAttempts = 0; saveState(STATE.CONNECTING_STAGE1); if (downloadLog) dfuUtil.clearLog(downloadLog); dfuUtil.logInfo("Starting connection process...");
             try {
                 // Connect to whatever device the user selects
                 await attemptConnection(vid, null, true);
                 // currentDevice is now set by attemptConnection

                 // Check the Product ID of the connected device
                 const connectedPid = currentDevice.device_.productId;
                 serial = currentDevice.device_.serialNumber || ''; // Capture serial here
                 dfuUtil.logInfo(`Connected initial device: PID = ${connectedPid} (0x${connectedPid.toString(16)}), Serial = ${serial || 'N/A'}`);

                 // <<< --- PID Check Logic --- >>>
                 if (connectedPid === pidStage2) { // Check against 0xFFFF (65535)
                     // Device is already in Stage 2! This likely happened after the Windows restart.
                     dfuUtil.logWarning("Device already detected in Stage 2 (PID 0xFFFF). Skipping detach.");
                     // We have the serial, jump state to prompt for Stage 2 connection
                     // (even though already connected, this preserves the flow for user gesture)
                     saveState(STATE.PROMPT_CONNECT_STAGE2, serial);
                     // Optionally, could try jumping straight to runAutoConnectSequence logic for stage 2 here?
                     // For simplicity, let's stick to the standard prompt flow.

                 } else if (connectedPid === pidStage1) { // Check against 0x0100 (256)
                     // Device is in Stage 1, proceed with normal detach sequence
                     dfuUtil.logSuccess(`Connected Stage 1: ${currentDevice.device_.productName}`);
                     dfuUtil.logInfo("Waiting briefly before detaching...");
                     await new Promise(resolve => setTimeout(resolve, 300));
                     saveState(STATE.WAITING_DISCONNECT, serial);
                     await currentDevice.detach(); // Potential stall point
                     dfuUtil.logInfo("Detach sent. Waiting disconnect...");
                     await Promise.race([ currentDevice.waitDisconnected(5000), new Promise((_, r) => setTimeout(() => r(new Error("Disconnect timeout")), 5000)) ]);
                     dfuUtil.logInfo("Disconnected/timeout."); if (currentState === STATE.WAITING_DISCONNECT) { saveState(STATE.PROMPT_REFRESH_1, serial); }
                 } else {
                     // Unexpected Product ID
                     throw new Error(`Unexpected device connected: PID 0x${connectedPid.toString(16)}. Expected 0x${pidStage1.toString(16)} or 0x${pidStage2.toString(16)}.`);
                 }
                 // <<< --- End PID Check Logic --- >>>

             } catch (error) {
                  // Error Handling (includes PID check error)
                  if (error.message?.toLowerCase().includes("stall")) { handleError(error, "Device stalled. Reset & retry."); }
                  else if (error.message?.includes("Disconnect timeout")) { if (currentState === STATE.WAITING_DISCONNECT) { dfuUtil.logWarning("Disconnect timeout, proceeding anyway."); saveState(STATE.PROMPT_REFRESH_1, serial); } else { handleError(error, "Timeout."); } }
                  else if (error.message?.includes("No device selected")) { dfuUtil.logWarning("Selection cancelled."); clearState(); }
                  else if (error.message?.includes("No matching device found")) { handleError(error, "Connect failed: No matching device."); clearState(); }
                  else if (error instanceof NeedsUserGestureError) { dfuUtil.logWarning("Gesture needed unexpectedly."); clearState(); }
                  else if (error.message?.includes("Incorrect device connected") || error.message?.includes("Unexpected device connected")) { // Catch our new error too
                        handleError(error, `Wrong device/mode detected: ${error.message}. Use Bootloader (Step 1).`);
                        if (currentDevice) { try { await currentDevice.close(); } catch(e){} currentDevice = null; } clearState();
                   }
                  else { handleError(error, `Connection Error: ${error.message || error}`); }
                  // Cleanup and final state check
                  if (currentDevice && !error.message?.includes("device connected")) { try { await currentDevice.close(); } catch(e){} currentDevice = null; } // Avoid closing if already closed due to wrong device
                  if (![STATE.IDLE, STATE.PROMPT_REFRESH_1, STATE.PROMPT_CONNECT_STAGE2, STATE.ERROR].includes(currentState)) { saveState(STATE.ERROR); } // Added PROMPT_CONNECT_STAGE2 here
             }
        }
        else if (currentState === STATE.PROMPT_CONNECT_STAGE2) {
              saveState(STATE.CONNECTING_STAGE2, serial); dfuUtil.logInfo("Attempting Stage 2...");
              try {
                  dfuUtil.logInfo("Waiting before requesting (Stage 2)..."); await new Promise(resolve => setTimeout(resolve, 500));
                  await attemptConnection(vid, serial, true);
                  dfuUtil.logSuccess(`Reconnected Stage 2: ${currentDevice.device_.productName}`); saveState(STATE.WAITING_STABLE, serial); await new Promise(resolve => setTimeout(resolve, 1500));
                  try { dfuUtil.logInfo("Checking status..."); let s = await currentDevice.getStatus(); dfuUtil.logInfo(`Status: S${s.state}, S${s.status}`); if (typeof dfu !== 'undefined' && s.state === dfu.dfuERROR) { dfuUtil.logWarning("Error state, clearing..."); await currentDevice.clearStatus(); dfuUtil.logInfo("Cleared."); } }
                  catch (e) { dfuUtil.logWarning(`Status check failed: ${e}`); } saveState(STATE.PROMPT_REFRESH_2, serial);
              } catch (error) {
                   if (error.message?.includes("No device selected")) { dfuUtil.logWarning("Selection cancelled."); saveState(STATE.PROMPT_CONNECT_STAGE2); }
                   else if (error.message?.includes("No matching device found")) { handleError(error, "Connect failed: No matching device for Stage 2."); saveState(STATE.PROMPT_CONNECT_STAGE2); }
                   else { handleError(error, `Connect Stage 2 Error: ${error.message || error}`); }
              }
        }
        else if (currentState === STATE.PROMPT_CONNECT_FLASH) {
              saveState(STATE.CONNECTING_FLASH, serial); dfuUtil.logInfo("Attempting final connect...");
              try {
                   dfuUtil.logInfo("Waiting before requesting (Flash)..."); await new Promise(resolve => setTimeout(resolve, 500)); await attemptConnection(vid, serial, true);
                   dfuUtil.logSuccess(`Reconnected for Flash: ${currentDevice.device_.productName}`); saveState(STATE.FLASHING, serial); await runFlashWorkflow();
              } catch (error) {
                   if (error.message?.includes("No device selected")) { dfuUtil.logWarning("Selection cancelled."); saveState(STATE.PROMPT_CONNECT_FLASH); }
                   else if (error.message?.includes("No matching device found")) { handleError(error, "Connect failed: No matching device for Flash."); saveState(STATE.PROMPT_CONNECT_FLASH); }
                   else { handleError(error, `Connect Final Error: ${error.message || error}`); }
              }
         }
    } // End handleConnectClick

     async function runAutoConnectSequence() {
          if (!dfuUtil) { console.error("DfuUtil missing."); return; } console.log("Checking auto-connect. State:", currentState);
           const requiresSerialCheck = [ STATE.PROMPT_REFRESH_1, STATE.PROMPT_CONNECT_STAGE2, STATE.CONNECTING_STAGE2, STATE.WAITING_STABLE, STATE.PROMPT_REFRESH_2, STATE.PROMPT_CONNECT_FLASH, STATE.CONNECTING_FLASH, STATE.FLASHING ].includes(currentState);
           if (requiresSerialCheck && !serial) { console.warn(`Auto-connect aborted: State '${currentState}' needs serial.`); clearState(); dfuUtil.logWarning("Inconsistent state."); return; }

          if (currentState === STATE.PROMPT_REFRESH_1) {
               dfuUtil.logInfo("Auto Stage 2 connect..."); saveState(STATE.CONNECTING_STAGE2, serial);
               try {
                   dfuUtil.logInfo("Waiting before auto-connect (Stage 2)..."); await new Promise(resolve => setTimeout(resolve, 500)); await attemptConnection(vid, serial, false);
                   dfuUtil.logSuccess(`Auto-reconnected Stage 2.`); saveState(STATE.WAITING_STABLE, serial); await new Promise(resolve => setTimeout(resolve, 1500));
                    try { dfuUtil.logInfo("Checking status..."); let s=await currentDevice.getStatus(); dfuUtil.logInfo(`Status: S${s.state}, S${s.status}`); if(typeof dfu !== 'undefined' && s.state===dfu.dfuERROR){ dfuUtil.logWarning("Error state, clearing..."); await currentDevice.clearStatus(); dfuUtil.logInfo("Cleared."); } }
                   catch (e) { dfuUtil.logWarning("Status check failed: " + e); } saveState(STATE.PROMPT_REFRESH_2, serial);
               } catch (error) { if (error instanceof NeedsUserGestureError) { dfuUtil.logWarning("Needs permission for Stage 2."); saveState(STATE.PROMPT_CONNECT_STAGE2, serial); } else { handleError(error, `Auto connect Stage 2 failed: ${error.message || error}`); } }
           }
           else if (currentState === STATE.PROMPT_REFRESH_2) {
                dfuUtil.logInfo("Auto Flash connect..."); saveState(STATE.CONNECTING_FLASH, serial);
                try {
                    dfuUtil.logInfo("Waiting before auto-connect (Flash)..."); await new Promise(resolve => setTimeout(resolve, 500)); await attemptConnection(vid, serial, false);
                    dfuUtil.logSuccess(`Auto-reconnected for Flash.`); saveState(STATE.FLASHING, serial); await runFlashWorkflow();
                } catch (error) { if (error instanceof NeedsUserGestureError) { dfuUtil.logWarning("Needs permission for Flash."); saveState(STATE.PROMPT_CONNECT_FLASH, serial); } else { handleError(error, `Auto connect Flash failed: ${error.message || error}`); } }
           } else { console.log("No auto-connect needed for state:", currentState); updateUI(); }
     }

    // --- Initialization Function ---
    async function initializePage() {
         console.log("Initializing μCritter Pupdate Page...");
         connectButton = document.getElementById("connect"); statusDisplay = document.getElementById("status"); downloadLog = document.getElementById("downloadLog");
         const webUsbNotice = document.getElementById("browserNotice"); const layoutWrapper = document.querySelector(".layout-wrapper"); const instructionsColumn = document.querySelector(".instructions-column");
         const isWebUsbSupported = typeof navigator.usb !== 'undefined';
         if (!isWebUsbSupported) { console.warn("WebUSB not supported."); if (webUsbNotice) { webUsbNotice.innerHTML = `<p><strong>WebUSB not supported.</strong> Use Chrome/Edge.</p>`; webUsbNotice.hidden = false; } if (layoutWrapper) layoutWrapper.style.display = 'none'; return; }
         else { if (webUsbNotice) webUsbNotice.hidden = true; if (layoutWrapper) layoutWrapper.style.display = 'flex'; }

          await loadState(); // Load state first

         if (typeof window.dfuUtil === 'undefined') { handleError(new Error("DFU util missing."), "Init Error: DFU util missing."); return; }
         dfuUtil = window.dfuUtil;
         if (typeof dfu === 'undefined') { handleError(new Error("Core DFU missing."), "Init Error: Core DFU lib missing."); return; }

         try { if (downloadLog) { dfuUtil.setLogContext(downloadLog); console.log("Log context set."); } else { console.error("Log element missing!"); handleError(new Error("Log element missing."), "Init Error: Log display missing."); return; }
             console.log("dfuUtil checks passed."); }
         catch (error) { handleError(error, "Failed to initialize DFU Utility."); return; }

        dfuUtil.setOnDisconnectCallback((reason) => {
            console.log("Disconnect detected.", "Reason:", reason, "State:", currentState);
             if ( ![STATE.IDLE, STATE.ERROR, STATE.FLASH_COMPLETE, STATE.WAITING_DISCONNECT, STATE.PROMPT_REFRESH_1, STATE.PROMPT_REFRESH_2, STATE.PROMPT_CONNECT_STAGE2, STATE.PROMPT_CONNECT_FLASH].includes(currentState) ) {
                  if (currentDevice) { handleError(new Error("Device disconnected."), "Device Disconnected!"); currentDevice = null; } else { dfuUtil.logWarning("Disconnect event for cleared ref."); }
             } else if (currentState === STATE.WAITING_DISCONNECT) { dfuUtil.logInfo("Disconnected as expected."); currentDevice = null; }
             else { dfuUtil.logInfo(`Disconnected in state: ${currentState}`); currentDevice = null; } updateUI(); });

        updateUI(); // Initial UI update
        dfuUtil.loadFirmware("zephyr.signed.bin") .then(() => { firmwareLoaded = true; dfuUtil.logInfo("Firmware loaded."); updateUI(); }) .catch(err => { firmwareLoaded = false; handleError(err, `FW load failed: ${err.message}. Refresh.`); });
        if (!connectButton) { handleError(new Error("Connect button missing."), "Init Error: Connect button missing."); return; } connectButton.addEventListener('click', handleConnectClick);
        const osButtons = document.querySelectorAll('.os-btn'); const instructionsSections = instructionsColumn ? instructionsColumn.querySelectorAll('section.instructions[data-ins]') : []; const introSection = document.getElementById('intro-instructions');
        function switchOS(os) { if (!instructionsSections.length || !introSection || !osButtons.length || !instructionsColumn) { console.warn("Instruction elements missing."); return; } console.log("Switching view to:", os); instructionsSections.forEach(sec => { sec.hidden = true; }); const sectionToShow = instructionsColumn.querySelector(`section.instructions[data-ins="${os}"]`); if(sectionToShow) { sectionToShow.hidden = false; } else { console.warn(`Instruction section missing for: '${os}'`); } if (introSection) { introSection.hidden = !sectionToShow; } osButtons.forEach(btn => { btn.classList.toggle('active', btn.dataset.os === os); }); }
        const ua = navigator.userAgent; const platform = navigator.platform; let detectedOS = 'linux';
        if (/android/i.test(ua)) { if (/chrome/i.test(ua) && !/edg/i.test(ua)) { detectedOS = 'android'; console.log("Detected Android (Chrome)."); } else { console.log("Detected Android (Non-Chrome browser)."); detectedOS = 'android'; } }
        else if (/Win/.test(ua) || /Win/.test(platform)) { detectedOS = 'win'; } else if (/Mac|iPod|iPhone|iPad/.test(platform)) { detectedOS = 'mac'; } console.log("Final Detected OS:", detectedOS); switchOS(detectedOS);
        osButtons.forEach(btn => { btn.addEventListener('click', (e) => { const os = e.target.dataset.os; if (os) { switchOS(os); } }); });
        console.log("Scheduling auto-connect..."); if (typeof runAutoConnectSequence === "function") { setTimeout(runAutoConnectSequence, 500); } else { console.error("runAutoConnectSequence missing!"); }
    } // End initializePage

    if (document.readyState === 'loading') { document.addEventListener("DOMContentLoaded", initializePage); } else { initializePage(); }
})(); // End main IIFE