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
