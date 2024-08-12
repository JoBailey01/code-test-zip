/**
 * Given an HTML element, remove the last children until only <limit> children remain
 * This is primarily used to remove rows from a table until only the header row remains (in which case limit=the number of columns in the table)
 */
function clearElement(element, limit){
    while(element.children.length > limit) element.removeChild(element.lastChild);
}

/**
 * Thanks to the answers in this StackOverflow post: https://stackoverflow.com/questions/13607278/html5-restricting-input-characters
 * 
 * Prevent non-numeric input to the ZIP code input box
 */
function filterInput(e){
    let t = e.target;
    //Remove invalid characters
    t.value = t.value.replace(/[^\d]/, '');

    //Force correct length (5 characters)
    if(t.value.length > 5) t.value = t.value.slice(0,5);
}

document.getElementById("zip").addEventListener('input', filterInput);

//This function handles an incoming zip code from the form on the HTML page
function handleZip(zip){
    //Ignore incomplete responses
    let pattern = new RegExp("[0-9]{5}");
    if(!pattern.test(zip.value)) return;

    //Callback function for the GET request
    function callback(api_data, code){
        //Parse incoming data
        var data = JSON.parse(api_data);
        
        var head = document.getElementById("out_header");
        var table = document.getElementById("places");

        //Clear the table element
        clearElement(table, 0);

        //If there is no data, that means the zip code is not found
        if(data["post code"] === undefined){
            //console.log("Bad code "+code);
            head.textContent = `The zip code ${code} does not exist in the United States.`;
            return;
        }

        //Otherwise, display the data from the API
        if(data.places.length > 0){
            head.textContent = `Zip code ${data["post code"]}`;

            //Add header row
            var topRow = table.insertRow();
            
            //Dummy cell (image column)
            topRow.insertCell().style.width = "200px";

            //State cell
            var stateName = topRow.insertCell();
            stateName.style.fontWeight = 1000;
            stateName.style.width = "250px";
            stateName.style.fontSize = "25px";
            stateName.appendChild(document.createTextNode("State\n"));

            //Place cell
            var placeName = topRow.insertCell();
            placeName.style.fontWeight = 1000;
            placeName.style.width = "250px";
            placeName.style.fontSize = "25px";
            placeName.appendChild(document.createTextNode("Place\n"));

            //Lat/long
            var latlong = topRow.insertCell();
            latlong.style.fontWeight = 1000;
            latlong.style.width = "250px";
            latlong.style.fontSize = "25px";
            latlong.appendChild(document.createTextNode("Latitude / Longitude"));
            
            //Iterate over the places array
            for(var i = 0;i < data.places.length;i++){
                var place = data.places[i];

                //Add table data
                var row = table.insertRow();
                var cell1 = row.insertCell();

                //Add the state graphic
                var img = document.createElement("IMG");
                img.src = `states/${place["state abbreviation"]}.svg`;
                cell1.style.textAlign = "center";
                img.style.width = "150px";
                img.style.height = "150px";
                cell1.appendChild(img);

                //Add the state column
                var cell2 = row.insertCell();
                cell2.style.fontWeight = 500;
                //cell2.style.verticalAlign = "middle";
                cell2.style.verticalAlign = "top";
                cell2.style.paddingTop = "40px";
                cell2.style.fontSize = "25px";
                cell2.appendChild(document.createTextNode(place.state));

                //Add place name
                var cell3 = row.insertCell();
                cell3.style.fontWeight = 500;
                //cell3.style.verticalAlign = "middle";
                cell3.style.verticalAlign = "top";
                cell3.style.paddingTop = "40px";
                cell3.style.fontSize = "25px";
                cell3.appendChild(document.createTextNode(place["place name"]));


                //Add latitude/longitude
                var cell4 = row.insertCell();
                cell4.style.fontWeight = 400;
                //cell4.style.verticalAlign = "middle";
                cell4.style.verticalAlign = "top";
                cell4.style.paddingTop = "40px";
                cell4.style.fontSize = "25px";
                cell4.appendChild(document.createTextNode(`${place.latitude} / ${place.longitude}`));

            }
        } else {
            table.insertRow().insertCell().appendChild(document.createTextNode("We couldn't find any places associated with this zip code"));
        }
    }
    
    /**
     * The following code comes from Zippopotamus itself: https://www.zippopotam.us/
     */

    //Make an asynchronous GET request
    var client = new XMLHttpRequest();
    client.open("GET", "http://api.zippopotam.us/us/"+zip.value, true);
    client.onreadystatechange = function(){
        if(client.readyState==4) callback(client.responseText, zip.value);
    }
    client.send();
}