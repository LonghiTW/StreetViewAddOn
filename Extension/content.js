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
	button_point1.innerText = 'Point 1';
	button_point1.onclick =  () => handleClick_point(1);
	button_point1.classList.add('button');

	const button_point2 = document.createElement('button');
	button_point2.innerText = 'Point 2';
	button_point2.onclick =  () => handleClick_point(2);
	button_point2.classList.add('button');

	// Create coordinates button
	const button_coords = document.createElement('button');
	button_coords.innerText = 'Coordinates';
	button_coords.onclick = handleClick_coords;
	button_coords.classList.add('coords');
	
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
	container.appendChild(button_point2);
	container.appendChild(display_point1);
	container.appendChild(display_point2);
	container.appendChild(text_distance);
	container.appendChild(text_height);
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
	let pitch_1 = null;
        let pitch_2 = null;
        let bearing_1 = null;
        let bearing_2 = null;

	let modifier = parseFloat(input_modifier.value) / 100 || 0;
	let ground = 2.5 - modifier;

        let endPoint = { lat: null, lon: null };

	// Mathematical calculations
	function cot(x) {
		return 1 / Math.tan(x);
	}
	
	function toRadians(degrees) {
	    return degrees * Math.PI / 180;
	}

	function toDegrees(radians) {
	    return radians * 180 / Math.PI;
	}

	function GetAdjacent(alpha) {
	    return -ground * cot(toRadians(alpha));
	}

	// Get destination coordinates
	// https://github.com/chrisveness/geodesy/blob/master/latlon-ellipsoidal-vincenty.js#L129
        function destinationPoint(lat, lon, distance, bearing) {
            const φ1 = toRadians(lat);
            const λ1 = toRadians(lon);
            const α1 = toRadians(bearing);
        
            // WGS-84 ellipsoid
            const a = 6378137; // Equatorial radius
            const f = 1 / 298.257223563; // Inverse flattening
            const b = (1 - f) * a; // Polar radius
        
            const sinα1 = Math.sin(α1);
            const cosα1 = Math.cos(α1);
        
            const tanU1 = (1 - f) * Math.tan(φ1);
            const cosU1 = 1 / Math.sqrt(1 + tanU1 * tanU1);
            const sinU1 = tanU1 * cosU1;
        
            const σ1 = Math.atan2(tanU1, cosα1);
            const sinα = cosU1 * sinα1;
            const cosSqα = 1 - sinα * sinα;
            const uSq = cosSqα * (a * a - b * b) / (b * b);
            const A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
            const B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));
        
            let σ = distance / (b * A);
            let sinσ, cosσ, Δσ, cos2σm;
        
            let σʹ = null;
            let iterations = 0;
            do {
                cos2σm = Math.cos(2 * σ1 + σ);
                sinσ = Math.sin(σ);
                cosσ = Math.cos(σ);
                const Δσ = B * sinσ * (cos2σm + B / 4 * (cosσ * (-1 + 2 * cos2σm * cos2σm) - B / 6 * cos2σm * (-3 + 4 * sinσ * sinσ) * (-3 + 4 * cos2σm * cos2σm)));
                σʹ = σ;
                σ = distance / (b * A) + Δσ;
            } while (Math.abs(σ - σʹ) > 1e-12 && ++iterations < 100);
        
            const x = sinU1 * sinσ - cosU1 * cosσ * cosα1;
            const φ2 = Math.atan2(sinU1 * cosσ + cosU1 * sinσ * cosα1, (1 - f) * Math.sqrt(sinα * sinα + x * x));
            const λ = Math.atan2(sinσ * sinα1, cosU1 * cosσ - sinU1 * sinσ * cosα1);
            const C = f / 16 * cosSqα * (4 + f * (4 - 3 * cosSqα));
            const L = λ - (1 - C) * f * sinα * (σ + C * sinσ * (cos2σm + C * cosσ * (-1 + 2 * cos2σm * cos2σm)));
            const λ2 = λ1 + L;
        
            const α2 = Math.atan2(sinα, -x);
        
            return {
                lat: toDegrees(φ2),
                lon: toDegrees(λ2),
            };
        }

        // URL processing
        function parseUrl(url) {
            const parts = url.split(/,|t\/|@|h,/);
            const lat = Number(parts[1]);
            const lon = Number(parts[2]);
            const bearing = Number(parts[5]);
            const pitch = Number(parts[6]) - 90;
            return { lat, lon, bearing, pitch };
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
        
            if (pitch_1 === null || pitch_2 === null) {
                if ((pointIndex === 1 && pitch_1 < 0) || (pointIndex === 2 && pitch_2 < 0)) {
                    const pitch = pointIndex === 1 ? pitch_1 : pitch_2;
                    let distance = GetAdjacent(pitch);
                    display_distance.textContent = `${distance.toFixed(2)}`;
        
                    const bearing = pointIndex === 1 ? bearing_1 : bearing_2;
                    endPoint = destinationPoint(lat, lon, distance, bearing);
                    button_coords.innerText = `Coords: ${endPoint.lat.toFixed(5)}, ${endPoint.lon.toFixed(5)}`;
                    console.log(`End Point: ${endPoint.lat}, ${endPoint.lon}`);
                }
                return; // Do nothing
            }
        
            if ((pitch_1 === pitch_2) || (pitch_1 > 0 && pitch_2 > 0) || (pitch_1 < 0 && pitch_2 < 0)) {
                display_height.textContent = 'Error';
                display_distance.textContent = 'Error';
                return;
            } else {
                let minPitch = Math.min(pitch_1, pitch_2);
                let maxPitch = Math.max(pitch_1, pitch_2);
        
                let distance = GetAdjacent(minPitch);
                display_distance.textContent = `${distance.toFixed(2)}`;
                let height = distance * Math.tan(toRadians(maxPitch)) + ground;
                display_height.textContent = `${height.toFixed(2)}`;
        
                let bearing = (bearing_1 + bearing_2) / 2;
                endPoint = destinationPoint(lat, lon, distance, bearing);
                button_coords.innerText = `Coords: ${endPoint.lat.toFixed(5)}, ${endPoint.lon.toFixed(5)}`;
                console.log(`End Point: ${endPoint.lat}, ${endPoint.lon}`);
            }
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
        
        function updateWhenModifierChange() {
        	modifier = parseFloat(input_modifier.value) / 100 || 0;
        	ground = 2.5 - modifier;
        	
        	let url_2 = location.href;
        	const { lat, lon } = parseUrl(url_2);
        	if (pitch_1 === null || pitch_2 === null) {
        		if (pitch_2 < 0) {
        			let distance = GetAdjacent(pitch_2);
        			display_distance.textContent = `${distance.toFixed(2)}`;
        
        			endPoint = destinationPoint(lat, lon, distance, bearing_2);
        			button_coords.innerText = `Coords: ${endPoint.lat.toFixed(5)}, ${endPoint.lon.toFixed(5)}`;
        			console.log(`End Point: ${endPoint.lat}, ${endPoint.lon}`);
        			
        		}
        		if (pitch_1 < 0) {
        			let distance = GetAdjacent(pitch_1);
        			display_distance.textContent = `${distance.toFixed(2)}`;
        
        			endPoint = destinationPoint(lat, lon, distance, bearing_1);
        			button_coords.innerText = `Coords: ${endPoint.lat.toFixed(5)}, ${endPoint.lon.toFixed(5)}`;
        			console.log(`End Point: ${endPoint.lat}, ${endPoint.lon}`);
        
        		}
        		return; // Do nothing
        	}
        
        	else if ((pitch_1 === pitch_2) || (pitch_1 > 0 && pitch_2 > 0) || (pitch_1 < 0 && pitch_2 < 0)) {
        		display_height.textContent = 'Error';
        		display_distance.textContent = 'Error';
        		return;
        	
        	} else {
                let minPitch = Math.min(pitch_1, pitch_2);
                let maxPitch = Math.max(pitch_1, pitch_2);
        
        		let distance = GetAdjacent(minPitch);
        		display_distance.textContent = `${distance.toFixed(2)}`;
        		let height = distance * Math.tan(toRadians(maxPitch)) + ground;
        		display_height.textContent = `${height.toFixed(2)}`;
        		
        		let bearing = (bearing_1 + bearing_2) / 2
        		endPoint = destinationPoint(lat, lon, distance, bearing);
        		button_coords.innerText = `Coords: ${endPoint.lat.toFixed(5)}, ${endPoint.lon.toFixed(5)}`;
        		console.log(`End Point: ${endPoint.lat}, ${endPoint.lon}`);
        		
        	}
        }
        
        input_modifier.addEventListener('input', updateWhenModifierChange);
})();
