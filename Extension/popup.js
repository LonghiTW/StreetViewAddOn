if (typeof browser === "undefined") {
  var browser = chrome;
}

(async () => {
  document.addEventListener('DOMContentLoaded', async function () {
    const SwitchStatus = document.getElementById('MainSwitch');
  
    // Get initial status
    const { enabled } = await browser.storage.sync.get('enabled');
  
    // Set checkbox status
    SwitchStatus.checked = enabled;
  
    // Listen change of checkbox status
    SwitchStatus.addEventListener('change', async () => {
      const isChecked = SwitchStatus.checked;
  
      // Update status
      await browser.storage.sync.set({
        enabled: isChecked,
        opentab: (await browser.storage.sync.get('opentab')).opentab,
      });
    });
  });
})();
