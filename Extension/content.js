if (typeof browser === "undefined") {
  var browser = chrome;
}

(async () => {
    let enabled = (await browser.storage.sync.get('enabled')).enabled;
    let opentab = (await browser.storage.sync.get('opentab')).opentab;

    console.log('enabled:', enabled, ', opentab:', opentab);

    if (opentab === undefined) {
        console.log('Setting default value');
        browser.storage.sync.set({ enabled: true, opentab: true });
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
    
    // Create container for distortion checkbox
    const heightContainer = document.createElement('div');
    heightContainer.classList.add('height-container');

    // Create title
    const title = document.createElement('div');
    title.innerText = 'Street View Add-On';
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
    button_point1.title = 'Click to set Point, double click to reset.';
    button_point1.innerText = 'Point 1';
    button_point1.onclick =  () => handleClick_point(1);
    button_point1.classList.add('button');

    const button_point2 = document.createElement('button');
    button_point2.title = 'Click to set Point, double click to reset.';
    button_point2.innerText = 'Point 2';
    button_point2.onclick =  () => handleClick_point(2);
    button_point2.classList.add('button');

    // Create coordinates button
    const button_coords = document.createElement('button');
    button_coords.title = 'The coordinates of object. Click to copy them.';
    button_coords.innerText = 'Coordinates';
    button_coords.onclick = handleClick_coords;
    button_coords.classList.add('coords');
    
    // Create display areas
    const text_modifier = document.createElement('div');
    text_modifier.title = 'Modify the height difference between object and camera.';
    text_modifier.classList.add('display-area') + 'overflow:hidden;';
    text_modifier.textContent = `Modifier(cm)`;
    
    const text_height = document.createElement('div');
    text_height.title = 'The height of object.';
    text_height.classList.add('display-area') + 'overflow:hidden;';
    text_height.textContent = `Height(m) - -`;

    const display_point1 = document.createElement('div');
    display_point1.classList.add('display-area');

    const display_point2 = document.createElement('div');
    display_point2.classList.add('display-area');
    
    const text_distance = document.createElement('div');
    //text_distance.type = 'checkbox';
    text_distance.title = 'The distance between object and camera.';
    text_distance.textContent = `Distance(m)`;
    text_distance.classList.add('display-area');
    
    const display_distance = document.createElement('div');
    display_distance.classList.add('display-area');

    const display_height = document.createElement('div');
    display_height.classList.add('display-area');
    
    // Create checkbox for distortion
    const checkbox_distortion = document.createElement('input');
    checkbox_distortion.title = 'Whether to consider BTE distortion.';
    checkbox_distortion.type = 'checkbox';
	checkbox_distortion.classList.add('distortion-checkbox');
    
    // Append text and checkbox to height container
    heightContainer.appendChild(text_height);
    heightContainer.appendChild(checkbox_distortion);

    // Append elements to container
    container.appendChild(title);
    container.appendChild(text_modifier);
    container.appendChild(input_modifier);
    container.appendChild(button_point1);
    container.appendChild(button_point2);
    container.appendChild(display_point1);
    container.appendChild(display_point2);
    container.appendChild(text_distance);
    container.appendChild(heightContainer);
    container.appendChild(display_distance);
    container.appendChild(display_height);
    container.appendChild(button_coords);

    // Add container to body
    outer.appendChild(container);
    body.appendChild(outer);

    let toggleButton = document.createElement('button');
    toggleButton.classList.add('toggle-button');
    let toggle = true;

    const compoents = [outer, crosshair];

    let toggleDisplay = document.createElement('img');
    toggleDisplay.src = browser.runtime.getURL('down.svg');
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
        browser.storage.sync.set({
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
    let pitch_1 = null;
    let pitch_2 = null;
    let bearing_1 = null;
    let bearing_2 = null;
    let ifdistortion = checkbox_distortion.checked;

    let modifier = parseFloat(input_modifier.value) / 100 || 0;
    let ground = 2.5 - modifier;

    let endPoint = { lat: null, lon: null };

    // URL processing
    function parseUrl(url) {
        const parts = url.split(/,|t\/|@|h,/);
        const lat = Number(parts[1]);
        const lon = Number(parts[2]);
        const bearing = Number(parts[5]);
        const pitch = Number(parts[6]) - 90;
        return { lat, lon, bearing, pitch };
    }
    
	// Mathematical calculations
    function GetAdjacent(alpha) {
        return -ground / Math.tan(utils.toRadians(alpha));
    }
	
    // Height & Coordinates estimation
    function estimate(pointIndex) {
        modifier = parseFloat(input_modifier.value) / 100 || 0;
        ground = 2.5 - modifier;
    
        let url = location.href;
        const { lat, lon } = parseUrl(url);
    
        if(typeof pointIndex === 'number'){
            if (pitch_1 === null || pitch_2 === null) {
                if ((pointIndex === 1 && pitch_1 < 0) || (pointIndex === 2 && pitch_2 < 0)) {
                    const pitch = pointIndex === 1 ? pitch_1 : pitch_2;
                    let distance = GetAdjacent(pitch);
                    display_distance.textContent = `${distance.toFixed(2)}`;
    
                    const bearing = pointIndex === 1 ? bearing_1 : bearing_2;
                    endPoint = geo.destinationPoint(lat, lon, distance, bearing);
                    let distortion = BTE_PROJECTION.getDistortion(endPoint);
                    console.log(`Distortion amount: ${distortion.value}`);
                    button_coords.innerText = `Coords: ${endPoint.lat.toFixed(5)}, ${endPoint.lon.toFixed(5)}`;
                    console.log(`End Point: ${endPoint.lat}, ${endPoint.lon}`);
                }
            return; // Do nothing
            }
        }
        
        if ((pitch_1 === pitch_2) || (pitch_1 > 0 && pitch_2 > 0) || (pitch_1 < 0 && pitch_2 < 0)) {
            display_height.textContent = 'Error';
            display_distance.textContent = 'Error';
            return;
        }
        
        let minPitch = Math.min(pitch_1, pitch_2);
        let maxPitch = Math.max(pitch_1, pitch_2);
        let distance = GetAdjacent(minPitch);
        display_distance.textContent = `${distance.toFixed(2)}`;
        let bearing = (bearing_1 + bearing_2) / 2;
        endPoint = geo.destinationPoint(lat, lon, distance, bearing);
        let distortion = BTE_PROJECTION.getDistortion(endPoint);
        console.log(`Distortion amount: ${distortion.value}`);
        
        ifdistortion = checkbox_distortion.checked;
        let height = distance * Math.tan(utils.toRadians(maxPitch)) + ground;
        if (ifdistortion) {
            let distortionheight = height * distortion.value
            display_height.textContent = `${distortionheight.toFixed(2)}`;
        } else {
            display_height.textContent = `${height.toFixed(2)}`;
        }
        
        button_coords.innerText = `Coords: ${endPoint.lat.toFixed(5)}, ${endPoint.lon.toFixed(5)}`;
        console.log(`End Point: ${endPoint.lat}, ${endPoint.lon}`);
    }
    
    // Functions to handle button clicks
    function handleClick_point(pointIndex) {
        let url = location.href;
        const { lat, lon, bearing: bearing_temp, pitch: pitch_temp } = parseUrl(url);
        
        if (pointIndex === 1) {
            pitch_1 = pitch_temp;
            bearing_1 = bearing_temp;
            display_point1.textContent = `${pitch_1 + 90}`;
        } else {
            pitch_2 = pitch_temp;
            bearing_2 = bearing_temp;
            display_point2.textContent = `${pitch_2 + 90}`;
        }
        estimate(pointIndex);
    }
    
    function handleDoubleClick_point(pointIndex) {
        if (pointIndex === 1) {
            console.log('Point 1 double clicked');
            pitch_1 = null;
            bearing_1 = null;
            display_point1.textContent = ``;
        } else {
            console.log('Point 2 double clicked');
            pitch_2 = null;
            bearing_2 = null;
            display_point2.textContent = ``;
        }
        display_distance.textContent = ``;
        display_height.textContent = ``;
        endPoint = { lat: null, lon: null }
        button_coords.innerText = 'Coordinates';
        pointIndex = (pointIndex === 1) ? 2 : 1;
        estimate(pointIndex);
    }
    
    function handleClick_coords() {
        if (endPoint.lat === null || endPoint.lon === null) {
            alert('No coordinates to copy!');
            return;
        }
    
        const text = `${endPoint.lat}, ${endPoint.lon}`;
        
        navigator.clipboard.writeText(text)
            .then(() => {
                alert(`Coordinates "${text}" copied to clipboard!`);
            })
            .catch(err => {
                console.error('Failed to copy coordinates: ', err);
            });
    }
    
    // Add click and double-click handlers
    button_point1.addEventListener('click', () => handleClick_point(1));
    button_point1.addEventListener('dblclick', () => handleDoubleClick_point(1));
    
    button_point2.addEventListener('click', () => handleClick_point(2));
    button_point2.addEventListener('dblclick', () => handleDoubleClick_point(2));
    
    input_modifier.addEventListener('input', estimate);
    checkbox_distortion.addEventListener('change', estimate);
})();
