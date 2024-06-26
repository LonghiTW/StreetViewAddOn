(async () => {
	let open = (await chrome.storage.sync.get('open')).open;
	let opentab = (await chrome.storage.sync.get('opentab')).opentab;

	console.log(open, opentab, 'open, opentab');

	if (opentab === undefined) {
		console.log('Setting default value');
		chrome.storage.sync.set({ open: true, opentab: true });
		open = true;
		opentab = true;
	}
	if (!open) return;

	// Create a div element for the crosshair
	const crosshair = Object.assign(document.createElement('div'), {
		style:
			'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:20px;height:20px;pointer-events:none;',
	});
	const horizontalLine = Object.assign(document.createElement('div'), {
		style:
			'position:absolute;top:calc(50% - 1px);left:0;width:100%;height:2px;background-color:red;',
	});
	const verticalLine = Object.assign(document.createElement('div'), {
		style:
			'position:absolute;top:0;left:calc(50% - 1px);width:2px;height:100%;background-color:red;',
	});

	// Append lines to the crosshair
	crosshair.appendChild(horizontalLine);
	crosshair.appendChild(verticalLine);

	// Append the crosshair to the body of the document
	document.body.appendChild(crosshair);

	// Create body
	const body = document.getElementsByTagName('body')[0];

	// Create container for all elements

	const outer = document.createElement('div');
	outer.style.cssText =
		'position: fixed; top: 4rem; right: 20px;font-size:20px;background-color:rgba(255,255,255,0.4);padding:1rem;border-radius: 5px;';
	const container = document.createElement('div');
	container.style.cssText =
		'display: grid; grid-template-columns: auto auto auto; grid-gap: 15px; align-items: center;';

	// Create title
	const title = document.createElement('div');
	title.innerText = 'Height Estimation';
	title.style.cssText =
		'grid-column: 1 / span 3; text-align: center; font-weight: bold; margin: 10px;';

	const children_style =
		'min-width: 6rem;width:100%; height: auto; background-color: blue; color: white; border: none; border-radius: 5px; padding: 10px;align-self:center;justify-self:center;';

	// Create buttons
	const button_1 = document.createElement('button');
	button_1.innerText = 'Point 1';
	button_1.onclick = handleClick_1;
	button_1.style.cssText = children_style;

	const button_2 = document.createElement('button');
	button_2.innerText = 'Point 2';
	button_2.onclick = handleClick_2;
	button_2.style.cssText = children_style;

	const display_style =
		'width: 6rem; min-height: 24px; background-color: lightgray; color: black; padding: 10px; border-radius: 5px; text-align: center;align-self:center;justify-self:center;';

	// Create display areas
	const height_3 = document.createElement('div');
	height_3.style.cssText = display_style + 'overflow:hidden;';
	height_3.textContent = `Height(m)`;

	const display_1 = document.createElement('div');
	display_1.style.cssText = display_style;

	const display_2 = document.createElement('div');
	display_2.style.cssText = display_style;

	const display_3 = document.createElement('div');
	display_3.style.cssText = display_style;

	// Append elements to container
	container.appendChild(title);
	container.appendChild(button_1);
	container.appendChild(button_2);
	container.appendChild(height_3);
	container.appendChild(display_1);
	container.appendChild(display_2);
	container.appendChild(display_3);

	// Add container to body
	outer.appendChild(container);
	body.appendChild(outer);

	let toggleButton = document.createElement('button');
	toggleButton.style.cssText = `position: fixed; top: 4rem; right: 20px;font-size:20px;background-color:rgba(255,255,255,1);border-radius: 1000000px;z-index:200;width: 24px;height: 24px;`;
	let toggle = true;

	const compoents = [outer, crosshair];

	let toggleDisplay = document.createElement('img');
	toggleDisplay.src = chrome.runtime.getURL('down.svg');
	toggleButton.id = 'toggleDisplay';
	toggleButton.appendChild(toggleDisplay);

	async function toggleChange(update = true) {
		compoents.forEach((e) => {
			e.hidden = !e.hidden;
		});
		toggle = !toggle;
		toggleButton.animate(
			[{ transform: 'rotate(0deg)' }, { transform: 'rotate(180deg)' }],
			{
				fill: 'forwards',
				direction: !toggle ? 'alternate' : 'reverse',
				duration: 1000 * 0.15,
			},
		);
		if (!update) return;
		chrome.storage.sync
			.set({
				open: await chrome.storage.sync.get('open').open,
				opentab: toggle,
			})
			.then(() => {
				console.log('Saved');
			});
	}

	toggleButton.addEventListener('click', () => {
		toggleChange();
	});

	body.appendChild(toggleButton);
	console.log(opentab);
	if (!opentab) {
		toggleChange(false);
	}

	// Variables to store values
	let value_1 = null;
	let value_2 = null;

	function cot(x) {
		return 1 / Math.tan(x);
	}

	// Functions to handle button clicks
	function handleClick_1() {
		let url_1 = location.href;
		display_1.textContent = `${url_1.split(/,|t\//)[5]}`;
		value_1 = Number(url_1.split(/,|t\//)[5]) - 90;

		if (value_1 === null || value_2 === null) {
			return; // Do nothing
		}

		if ((value_1 > 0 && value_2 > 0) || (value_1 < 0 && value_2 < 0)) {
			display_3.textContent = 'Error';
			return;
		}

		if (value_1 === value_2) {
			display_3.textContent = 'Error';
		} else if (value_1 < value_2) {
			let height =
				-2.5 *
					cot((value_1 / 180) * Math.PI) *
					Math.tan((value_2 / 180) * Math.PI) +
				2.5;
			display_3.textContent = `${height.toFixed(2)}`;
		} else {
			// value_1 > value_2
			let height =
				-2.5 *
					cot((value_2 / 180) * Math.PI) *
					Math.tan((value_1 / 180) * Math.PI) +
				2.5;
			display_3.textContent = `${height.toFixed(2)}`;
		}
	}

	function handleClick_2() {
		let url_2 = location.href;
		display_2.textContent = `${url_2.split(/,|t\//)[5]}`;
		value_2 = Number(url_2.split(/,|t\//)[5]) - 90;

		if (value_1 === null || value_2 === null) {
			return; // Do nothing
		}

		if ((value_1 > 0 && value_2 > 0) || (value_1 < 0 && value_2 < 0)) {
			display_3.textContent = 'Error';
			return;
		}

		if (value_1 === value_2) {
			display_3.textContent = 'Error';
		} else if (value_1 < value_2) {
			let height =
				-2.5 *
					cot((value_1 / 180) * Math.PI) *
					Math.tan((value_2 / 180) * Math.PI) +
				2.5;
			display_3.textContent = `${height.toFixed(2)}`;
		} else {
			// value_1 > value_2
			let height =
				-2.5 *
					cot((value_2 / 180) * Math.PI) *
					Math.tan((value_1 / 180) * Math.PI) +
				2.5;
			display_3.textContent = `${height.toFixed(2)}`;
		}
	}
})();
