// Create a div element for the crosshair
const crosshair = document.createElement('div');
crosshair.style.position = 'fixed';
crosshair.style.top = '50%';
crosshair.style.left = '50%';
crosshair.style.transform = 'translate(-50%, -50%)'; // Centering the crosshair
crosshair.style.width = '20px';
crosshair.style.height = '20px';
crosshair.style.pointerEvents = 'none'; // So it doesn't interfere with mouse events

// Create the horizontal line of the crosshair
const horizontalLine = document.createElement('div');
horizontalLine.style.position = 'absolute';
horizontalLine.style.top = 'calc(50% - 1px)'; // Adjusted to be exactly centered
horizontalLine.style.left = '0';
horizontalLine.style.width = '100%';
horizontalLine.style.height = '2px';
horizontalLine.style.backgroundColor = 'red';

// Create the vertical line of the crosshair
const verticalLine = document.createElement('div');
verticalLine.style.position = 'absolute';
verticalLine.style.top = '0';
verticalLine.style.left = 'calc(50% - 1px)'; // Adjusted to be exactly centered
verticalLine.style.width = '2px';
verticalLine.style.height = '100%';
verticalLine.style.backgroundColor = 'red';

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
	'position: fixed; top: 4rem; right: 20px; font-size: 20px; background-color: rgba(255,255,255,0.4); padding: 1rem; border-radius: 5px;';
const container = document.createElement('div');
container.style.cssText =
	'display: grid; grid-template-columns: auto auto; grid-gap: 15px; align-items: center;';

// Create title
const title = document.createElement('div');
title.innerText = 'Height Estimation';
title.style.cssText =
	'grid-column: 1 / span 2; text-align: center; font-weight: bold; margin: 10px;';

const button_style =
	'min-width: 7rem; width: 100%; height: auto; background-color: blue; color: white; border: none; border-radius: 5px; padding: 10px; align-self: center; justify-self: center; cursor: pointer;';

// Create buttons
const button_1 = document.createElement('button');
button_1.innerText = 'Point 1';
button_1.onclick = handleClick_point1;
button_1.style.cssText = button_style;

const button_2 = document.createElement('button');
button_2.innerText = 'Point 2';
button_2.onclick = handleClick_point2;
button_2.style.cssText = button_style;

const display_style =
	'width: 7rem; min-height: 24px; background-color: lightgray; color: black; padding: 10px; border-radius: 5px; text-align: center;align-self:center;justify-self:center;';

// Create input field or toggle
const input_modifier = document.createElement('input');
input_modifier.type = 'number';
input_modifier.placeholder = '0';
input_modifier.style.cssText = display_style;

// Create display areas
const text_modifier = document.createElement('div');
text_modifier.style.cssText = display_style + 'overflow:hidden;';
text_modifier.textContent = `Modifier(cm)`;

const text_height = document.createElement('div');
text_height.style.cssText = display_style + 'overflow:hidden;';
text_height.textContent = `Height(m)`;

const display_1 = document.createElement('div');
display_1.style.cssText = display_style;

const display_2 = document.createElement('div');
display_2.style.cssText = display_style;

const text_distance = document.createElement('div');
text_distance.textContent = `Distance(m)`;
text_distance.classList.add('display-area');

const display_distance = document.createElement('div');
display_distance.classList.add('display-area');

const display_height = document.createElement('div');
display_height.style.cssText = display_style;

// Append elements to container
container.appendChild(title);
container.appendChild(text_modifier);
container.appendChild(input_modifier);
container.appendChild(button_1);
container.appendChild(text_distance);
container.appendChild(display_1);
container.appendChild(display_distance);
container.appendChild(button_2);
container.appendChild(text_height);
container.appendChild(display_2);
container.appendChild(display_height);

// Add container to body
outer.appendChild(container);
body.appendChild(outer);

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
