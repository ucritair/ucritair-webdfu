# ucritair-webdfu
Web utility for flashing firmware to the uCritAir

let firmwareReader = new FileReader();
firmwareReader.onloadend = function() {
	firmwareFile = firmwareReader.result;
};
fetch("zephyr.signed.bin")
.then((resp) => resp.blob())
.then((blob) => {
	firmwareReader.readAsArrayBuffer(blob);
});

Runtime: [2fe3:0100] cfg=1, intf=2, alt=0, name="MCUBOOT" serial="DB5428D0A8E34818"
DFU: [2fe3:ffff] cfg=1, intf=0, alt=0, name="MCUBOOT" serial="DB5428D0A8E34818"
