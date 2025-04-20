# Street View Add-On
## Features
* Height Estimation
* Coordinates Estimation
## How to use
### DevTool
1. Open Google Street View.
2. Open DevTool(F12).
3. Copy [commands](https://github.com/LonghiTW/StreetViewAddOn/blob/main/commands.js) and paste it to console.
4. Close DevTool(F12).
### Browser Bookmark
1. Add a new bookmark with a name of your choice.
2. Paste the code below into the URL field of the bookmark:
```js
javascript:(async () => {
  try {
    const response = await fetch("https://raw.githubusercontent.com/LonghiTW/StreetViewAddOn/main/commands.js");
    const script = await response.text();
    eval(script);
  } catch (error) {
    console.error(error);
    alert("Failed to load the script.");
  }
})();
```
3. Use this bookmark on Google Maps.
### Extension (Recommend)
1. Download [ZIP](https://github.com/LonghiTW/StreetViewAddOn/releases) and unzip it.
2. Go to the Extensions page by entering `chrome://extensions` in a new tab.
3. Enable **Developer Mode** by clicking the toggle.
4. Click the **Load unpacked** button and select the directory of the folder you just unzip.
5. Done! Open Google Street View to check.

## How does it work
1. From the Street View URL, we can retrieve the **Coordinates**, **Yaw** (bearing), and **Pitch** of the camera.
2. The **Distance** to the object is determined using the camera height (2.5m) and the Pitch when capturing the intersection point between the object and the floor.
3. The **Height** of the object is determined using the Distance and the Pitch when capturing the object's vertex.
4. The **Coordinates** of the object can be determined using the Coordinates, the Distance and the Yaw of the camera when capturing the object.
## Note
This tool is based on an easy Trigonometric Measurements method, so there have some principles need to know.
1. The intersection point between object and ground and the point you want to measure must be on the same vertical line.
2. ~~The object and camera must be on the same height plane, so the closer the camera is to the building, the more accurate the estimate will typically be.~~
3. ~~Street View must be captured by a Street View car with a camera height of 2.5 m, not a Street View Trekker.~~
> Now you can deal with these situations mentioned in 3 and 4 by adding modifier.
4. The Coordinates of the camera are not necessarily correct, especially images taken by Street View Trekker. The Yaw and pitch may also have a bit distortion.

![Height Estimation.png](https://github.com/LonghiTW/HeightEstimationForGMaps/blob/main/Height%20Estimation.png)
> Materials from [いらすとや](https://www.irasutoya.com/)
