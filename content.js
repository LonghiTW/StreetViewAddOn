(async () => {
	let enabled = (await chrome.storage.sync.get('enabled')).enabled;
	let opentab = (await chrome.storage.sync.get('opentab')).opentab;

	console.log('enabled:', enabled, ', opentab:', opentab);

	if (opentab === undefined) {
		console.log('Setting default value');
		chrome.storage.sync.set({ enabled: true, opentab: true });
		enabled = true;
		opentab = true;
	}
	if (!enabled) return;

	// Create a div element for the crosshair
	const crosshair = document.createElement('div');
	crosshair.classList.add('crosshair');

    const horizontalLine = document.createElement('div');
    horizontalLine.classList.add('horizontal-line');

    const verticalLine = document.createElement('div');
    verticalLine.classList.add('vertical-line');

	// Append lines to the crosshair
	crosshair.appendChild(horizontalLine);
	crosshair.appendChild(verticalLine);

	// Append the crosshair to the body of the document
	document.body.appendChild(crosshair);

	// Create body
	const body = document.getElementsByTagName('body')[0];

	// Create container for all elements

	const outer = document.createElement('div');
    outer.classList.add('outer-container');

    const container = document.createElement('div');
    container.classList.add('inner-container');

	// Create title
	const title = document.createElement('div');
	title.innerText = 'Height Estimation';
    title.classList.add('title');

	// Create buttons
	const button_1 = document.createElement('button');
	button_1.innerText = 'Point 1';
	button_1.onclick = handleClick_1;
	button_1.classList.add('button');

	const button_2 = document.createElement('button');
	button_2.innerText = 'Point 2';
	button_2.onclick = handleClick_2;
	button_2.classList.add('button');

	// Create display areas
	const height_3 = document.createElement('div');
	height_3.classList.add('display-area') + 'overflow:hidden;';
	height_3.textContent = `Height(m)`;

	const display_1 = document.createElement('div');
	display_1.classList.add('display-area');

	const display_2 = document.createElement('div');
	display_2.classList.add('display-area');

	const display_3 = document.createElement('div');
	display_3.classList.add('display-area');

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
	toggleButton.classList.add('toggle-button');
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
		chrome.storage.sync.set({
				opentab: toggle,
			})
			.then(() => {
				console.log('Toggled!');
			});
	}

	toggleButton.addEventListener('click', () => {
		toggleChange();
	});

	body.appendChild(toggleButton);
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
