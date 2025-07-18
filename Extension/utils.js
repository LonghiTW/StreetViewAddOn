const utils = {
    toRadians(degrees) {
        return degrees * Math.PI / 180;
    },
    toDegrees(radians) {
        return radians * 180 / Math.PI;
    }
};

const geo = {
	// Get destination coordinates
    // https://github.com/chrisveness/geodesy/blob/master/latlon-ellipsoidal-vincenty.js#L129
	destinationPoint(lat, lon, distance, bearing) {
        const φ1 = utils.toRadians(lat);
        const λ1 = utils.toRadians(lon);
        const α1 = utils.toRadians(bearing);
    
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
    
        return {
            lat: utils.toDegrees(φ2),
            lon: utils.toDegrees(λ2),
        };
    }
};