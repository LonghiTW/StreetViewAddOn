
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
const body = document.getElementsByTagName("body")[0];

// Create container for all elements
const container = document.createElement('div');
container.style.cssText = "position: fixed; top: 3rem; right: 20px; display: grid; grid-template-columns: auto auto auto; grid-gap: 15px; align-items: center;font-size:20px;background-color:rgba(255,255,255,0.6);";

// Create title
const title = document.createElement('div');
title.innerText = "Height Estimation";
title.style.cssText = "grid-column: 1 / span 3; text-align: center; font-weight: bold; margin-bottom: 10px;";

const children_style = "min-width: 6rem;width:100%; height: auto; background-color: blue; color: white; border: none; border-radius: 5px; padding: 10px;align-self:center;justify-self:center;"

// Create buttons
const button_1 = document.createElement('button');
button_1.innerText = "Point 1";
button_1.onclick = handleClick_1;
button_1.style.cssText = children_style;

const button_2 = document.createElement('button');
button_2.innerText = "Point 2";
button_2.onclick = handleClick_2;
button_2.style.cssText = children_style;

const display_style = "width: 6rem; min-height: 24px; background-color: lightgray; color: black; padding: 10px; border-radius: 5px; text-align: center;align-self:center;justify-self:center;";

// Create display areas
const height_3 = document.createElement('div');
height_3.style.cssText = display_style+'overflow:hidden;'
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
body.appendChild(container);

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

  if (value_1 > 0 && value_2 > 0 || value_1 < 0 && value_2 < 0) {
    display_3.textContent = "Error";
    return;
  }
  
  if (value_1 === value_2) {
    display_3.textContent = "Error";
  } else if (value_1 < value_2) {
    let height = -2.5 * cot(value_1 / 180 * Math.PI) * Math.tan(value_2 / 180 * Math.PI) + 2.5;
    display_3.textContent = `${height.toFixed(2)}`;
  } else { // value_1 > value_2
    let height = -2.5 * cot(value_2 / 180 * Math.PI) * Math.tan(value_1 / 180 * Math.PI) + 2.5;
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

  if (value_1 > 0 && value_2 > 0 || value_1 < 0 && value_2 < 0) {
    display_3.textContent = "Error";
    return;
  }
  
  if (value_1 === value_2) {
    display_3.textContent = "Error";
  } else if (value_1 < value_2) {
    let height = -2.5 * cot(value_1 / 180 * Math.PI) * Math.tan(value_2 / 180 * Math.PI) + 2.5;
    display_3.textContent = `${height.toFixed(2)}`;
  } else { // value_1 > value_2
    let height = -2.5 * cot(value_2 / 180 * Math.PI) * Math.tan(value_1 / 180 * Math.PI) + 2.5;
    display_3.textContent = `${height.toFixed(2)}`;
}
}