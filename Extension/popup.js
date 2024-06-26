(async () => {
	let btn = document.getElementById('open');

	btn.innerHTML = 'Loading...';
	let open = (await chrome.storage.sync.get('open')).open;
	btn.innerText = open ? 'Close' : 'Open';
	btn.onclick = async () => {
		open = (await chrome.storage.sync.get('open')).open;
		chrome.storage.sync.set({
			open: !open,
			opentab: (await chrome.storage.sync.get('opentab')).opentab,
		});
		btn.innerText = open ? 'Open' : 'Close';
	};
})();
