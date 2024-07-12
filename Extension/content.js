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

	// Create input field or toggle
	const input_modifier = document.createElement('input');
	input_modifier.type = 'number';
    input_modifier.placeholder = '0';
	input_modifier.classList.add('display-area');
	
	const label_distance = document.createElement('label');
    label_distance.classList.add('toggle-label');
    label_distance.setAttribute('for', 'toggle');

	// Create buttons
	const button_point1 = document.createElement('button');
	button_point1.innerText = 'Point 1';
	button_point1.onclick = handleClick_point1;
	button_point1.classList.add('button');

	const button_point2 = document.createElement('button');
	button_point2.innerText = 'Point 2';
	button_point2.onclick = handleClick_point2;
	button_point2.classList.add('button');

	// Create display areas
	const text_modifier = document.createElement('div');
	text_modifier.classList.add('display-area') + 'overflow:hidden;';
	text_modifier.textContent = `Modifier(cm)`;
	
	const text_height = document.createElement('div');
	text_height.classList.add('display-area') + 'overflow:hidden;';
	text_height.textContent = `Height(m)`;

	const display_point1 = document.createElement('div');
	display_point1.classList.add('display-area');

	const display_point2 = document.createElement('div');
	display_point2.classList.add('display-area');
	
	const text_distance = document.createElement('div');
	//text_distance.type = 'checkbox';
	text_distance.textContent = `Distance(m)`;
	text_distance.classList.add('display-area');
	
	const display_distance = document.createElement('div');
	display_distance.classList.add('display-area');

	const display_height = document.createElement('div');
	display_height.classList.add('display-area');

	// Append elements to container
	container.appendChild(title);
	container.appendChild(text_modifier);
	container.appendChild(input_modifier);
	container.appendChild(button_point1);
	container.appendChild(text_distance);
	container.appendChild(display_point1);
	container.appendChild(display_distance);
	container.appendChild(button_point2);
	container.appendChild(text_height);
	container.appendChild(display_point2);
	container.appendChild(display_height);

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
	
	let modifier = parseFloat(input_modifier.value) / 100 || 0;
	let ground = 2.5 - modifier;

	// Functions to handle button clicks
	function handleClick_point1() {
		let url_1 = location.href;
		display_point1.textContent = `${url_1.split(/,|t\//)[5]}`;
		value_1 = Number(url_1.split(/,|t\//)[5]) - 90;

		if (value_1 === null || value_2 === null) {
			if (value_1 < 0) {
				let distance = -ground * cot((value_1 / 180) * Math.PI);
				display_distance.textContent = `${distance.toFixed(2)}`;
			} else return; // Do nothing
		}

		if ((value_1 === value_2) || (value_1 > 0 && value_2 > 0) || (value_1 < 0 && value_2 < 0)) {
			display_height.textContent = 'Error';
			display_distance.textContent = 'Error';
			return;
		}

		if (value_1 < value_2) {
			let distance = -ground * cot((value_1 / 180) * Math.PI);
			display_distance.textContent = `${distance.toFixed(2)}`;
			let height = distance * Math.tan((value_2 / 180) * Math.PI) + ground;
			display_height.textContent = `${height.toFixed(2)}`;
		} else {
			// value_1 > value_2
			let distance = -ground * cot((value_2 / 180) * Math.PI);
			display_distance.textContent = `${distance.toFixed(2)}`;
			let height = distance * Math.tan((value_1 / 180) * Math.PI) + ground;
			display_height.textContent = `${height.toFixed(2)}`;
		}
	}

	function handleClick_point2() {
		let url_2 = location.href;
		display_point2.textContent = `${url_2.split(/,|t\//)[5]}`;
		value_2 = Number(url_2.split(/,|t\//)[5]) - 90;

		if (value_1 === null || value_2 === null) {
			if (value_2 < 0) {
				let distance = -ground * cot((value_2 / 180) * Math.PI);
				display_distance.textContent = `${distance.toFixed(2)}`;
			} else return; // Do nothing
		}

		if ((value_1 === value_2) || (value_1 > 0 && value_2 > 0) || (value_1 < 0 && value_2 < 0)) {
			display_height.textContent = 'Error';
			display_distance.textContent = 'Error';
			return;
		}

		if (value_1 < value_2) {
			let distance = -ground * cot((value_1 / 180) * Math.PI);
			display_distance.textContent = `${distance.toFixed(2)}`;
			let height = distance * Math.tan((value_2 / 180) * Math.PI) + ground;
			display_height.textContent = `${height.toFixed(2)}`;
		} else {
			// value_1 > value_2
			let distance = -ground * cot((value_2 / 180) * Math.PI);
			display_distance.textContent = `${distance.toFixed(2)}`;
			let height = distance * Math.tan((value_1 / 180) * Math.PI) + ground;
			display_height.textContent = `${height.toFixed(2)}`;
		}
	}
})();
