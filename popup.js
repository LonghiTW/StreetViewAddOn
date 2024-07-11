(async () => {
  document.addEventListener('DOMContentLoaded', async function () {
    const SwitchStatus = document.getElementById('MainSwitch');
  
    // Get initial status
    const { enabled } = await chrome.storage.sync.get('enabled');
  
    // Set checkbox status
    SwitchStatus.checked = enabled;
  
    // Listen change of checkbox status
    SwitchStatus.addEventListener('change', async () => {
      const isChecked = SwitchStatus.checked;
  
      // Update status
      await chrome.storage.sync.set({
        enabled: isChecked,
        opentab: (await chrome.storage.sync.get('opentab')).opentab,
      });
    });
  });
})();
