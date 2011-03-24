
// Properties set by attributes panel
var updateInterval;

// Monitor objects (see CommandMonitor.js)
var pingMonitor;
var monitorsRunning;

//
// Function: initMonitor()
// Called by load() when widget starts up to set up and start the monitors
//
function initMonitors()
{
    var conn = function () {
        setGaugeValue('connected', true);
    }
    
    var dis = function () {
        setGaugeValue('connected', false);
        setGaugeValue('scale-latency', 1000);
        setElementText('latency', 'Disconnected');
    }
    
    var lat = function (val) {
        setElementText('latency', val);
        valnum = parseFloat(val.replace(/ .*/,""));
        setGaugeValue('scale-latency', valnum);
    }
    
    pingMonitor = new PingMonitor(getRemoteAddr(), updateInterval, conn, dis, lat);
    pingMonitor.start();

    monitorsRunning = true;
}

//
// Function: setElementText(elementName, elementValue)
// Set the text contents of an HTML div
//
// elementName: Name of the element in the DOM
// elementValue: Text to display in the element
//
function setElementText(elementName, elementValue)
{
    var element = document.getElementById(elementName);
    if (element) {
        element.innerText = elementValue;
    }
}

function getElementText(elementName) {
    var element = document.getElementById(elementName);
    if (element)
        return element.value;
}

function getRemoteAddr() {
    return getElementText('remote');
}

//
// Function: setGaugeValue(gaugeId, value)
// Sets the value of one of the monitor gauges
//
// gaugeId: Gauge to set
// value: Value to set gauge to
//
function setGaugeValue (gaugeId, value)
{
    var element = document.getElementById(gaugeId);
    if (element != null && element.object != null && element.object.setValue != null) {
        element.object.setValue(value);
    }
}

//
// Function: load()
// Called by HTML body element's onload event when the widget is ready to start
//
function load()
{
    dashcode.setupParts();

    // Get the properties
    updateInterval = +attributes.updateInterval;
    if (!updateInterval) {
        updateInterval = 1;
    }

    // Set up command monitors
    initMonitors();
}

//
// Function: remove()
// Called when the widget has been removed from the Dashboard
//
function remove()
{
    // Stop any timers to prevent CPU usage
    // Remove any preferences as needed
    // widget.setPreferenceForKey(null, dashcode.createInstancePreferenceKey("your-key"));
}

//
// Function: hide()
// Called when the widget has been hidden
//
function hide()
{
    // Stop monitor timers to prevent CPU usage
    if (monitorsRunning) {
        pingMonitor.stop();
        monitorsRunning = false;
    }
}

//
// Function: show()
// Called when the widget has been shown
//
function show()
{
    // Restart any timers that were stopped on hide
    if (monitorsRunning === false) {
        pingMonitor.start();
        monitorsRunning = true;
    }
}

//
// Function: sync()
// Called when the widget has been synchronized with .Mac
//
function sync()
{
    // Retrieve any preference values that you need to be synchronized here
    // Use this for an instance key's value:
    // instancePreferenceValue = widget.preferenceForKey(null, dashcode.createInstancePreferenceKey("your-key"));
    //
    // Or this for global key's value:
    // globalPreferenceValue = widget.preferenceForKey(null, "your-key");
}

var old_remote_addr;

//
// Function: showBack(event)
// Called when the info button is clicked to show the back of the widget
//
// event: onClick event from the info button
//
function showBack(event)
{
    old_remote_addr = getRemoteAddr();
    var front = document.getElementById("front");
    var back = document.getElementById("back");

    if (window.widget) {
        widget.prepareForTransition("ToBack");
    }

    front.style.display="none";
    back.style.display="block";

    if (window.widget) {
        setTimeout('widget.performTransition();', 0);
    }
}

//
// Function: showFront(event)
// Called when the done button is clicked from the back of the widget.
// This function also refreshes the ping if the remote address was changed.
//
// event: onClick event from the done button
//
function showFront(event)
{
    var front = document.getElementById("front");
    var back = document.getElementById("back");

    if (window.widget) {
        widget.prepareForTransition("ToFront");
    }

    front.style.display="block";
    back.style.display="none";

    if (window.widget) {
        setTimeout('widget.performTransition();', 0);
    }
    
    if (old_remote_addr != getRemoteAddr()) {
        pingMonitor.stop();
        initMonitors();
    }
}

if (window.widget)
{
    widget.onremove = remove;
    widget.onhide = hide;
    widget.onshow = show;
    widget.onsync = sync;
}
