require(["esri/SpatialReference", "esri/map", "esri/dijit/Search", "esri/layers/FeatureLayer",  "esri/InfoTemplate", "dojo/domReady!", "dojo/on", "esri/basemaps"], 
function (SpatialReference, Map, Search, FeatureLayer,InfoTemplate, domReady, on, esriBasemaps) {

    // error
    esriBasemaps.baskarta = {
        baseMapLayers: [{url: "https://platsen.helsingborg.se/arcgis/rest/services/Bygglov/situationsplan/MapServer"}
        ],
        thumbnailUrl: "https://www.example.com/images/thumbnail_2014-11-25_61051.png",
        title: "baskarta"
    };
    
    // works
    esriBasemaps.delorme = {
        baseMapLayers: [{url: "https://services.arcgisonline.com/ArcGIS/rest/services/Specialty/DeLorme_World_Base_Map/MapServer"}
        ],
        thumbnailUrl: "https://www.example.com/images/thumbnail_2014-11-25_61051.png",
        title: "Delorme"
      };    

    var map = new Map("map", {
        basemap: "gray",
        //spatialReference: new SpatialReference(3008),
        center: [12.7, 56.03], // lon, lat
        zoom: 12
    });

    // Used to store searches, active property, jobs and more while the user navigates
    window.state = {
        jobs: {}
    }

    var search = new Search({
        sources: [{
            featureLayer: new FeatureLayer("https://gisdata2.helsingborg.se/arcgis/rest/services/Fastigheter/Adress_till_fastighet/FeatureServer/0", {
            outFields: ["*"],
            infoTemplate: new InfoTemplate("${RealEstateName}", `
                <p>Informationstext Informationstext Informationstext Informationstext Informationstext Informationstext Informationstext Informationstext Informationstext Informationstext Informationstext Informationstext Informationstext Informationstext </p>
                <select id="scale">
                    <option value="500">500</option>
                    <option value="200">200</option>
                </select>
                <select id="template">
                    <option value="A4">A4</option>
                    <option value="A3">A3</option>
                </select>
                <button id='download-pdf'>Ladda ner PDF</button>
                <div id="print-result"></div>
            `)}),
            outFields: ["RealEstateName","Name"],
            displayField: "RealEstateName",
            suggestionTemplate: "FASTIGHET ${RealEstateName}: ADRESS ${Name}",
            name: "${RealEstateName}",
            placeholder: "example: Shawn Smith",
            enableSuggestions: true
        }],
        map: map
    }, "search");

    search.startup();

    function submitPrintJob() {
        $.get({            
            url: "https://gisdata.helsingborg.se/arcgis/rest/services/Utskriftstjanster/PrintSituationsplan/GPServer/Export%20Web%20Map/submitJob?f=json&Web_Map_as_JSON=" + webMapAsEncodedJSON() + "&Format=&Layout_Template=" + template() + "&printFlag=true",
            success(result) {
                console.log("Successfully submited job!");
                console.log(result)
                window.pollInterval = setInterval(function() { pollForPrintResult(result.jobId) }, 500);                
                window.state.jobs[result.jobId] = window.state.selectedProperty;
            },
            failure(error) {
                alert("Could not submit job!");
                console.log("ERROR!", error)
            }
        })
    }
    
    function webMapAsEncodedJSON() {
        return encodeURI(JSON.stringify(
            {  
                "mapOptions":{  
                    "showAttribution":false,
                    "extent": map.extent,
                    "spatialReference":{  
                        "wkid":102100
                    },
                    "scale": parseInt($("#scale").val())
                },
                "operationalLayers":[  
                    {  
                        "id":"defaultBasemap",
                        "title":"Topografisk världskarta",
                        "opacity":1,
                        "minScale":0,
                        "maxScale":0,
                        "url":"https://platsen.helsingborg.se/arcgis/rest/services/Bygglov/situationsplan/MapServer"
                    }
                ],
                "exportOptions":{  
                    "outputSize":[  
                        670,
                        500
                    ],
                    "dpi":240
                },
                "layoutOptions":{  
                    "titleText":"",
                    "authorText":"",
                    "copyrightText":"",
                    "customTextElements":[
                        {"fastighet": window.state.selectedProperty}
                    ],
                    "scaleBarOptions":{  
            
                    },
                    "legendOptions":{  
                        "operationalLayers":[  
            
                        ]
                    }
                }
            }
        ))
    }

    function template() {
        return $("#template").val();
    }

    function pollForPrintResult(jobId) {
        console.log("polling!");
        $.get({
            url: "https://gisdata.helsingborg.se/arcgis/rest/services/Utskriftstjanster/PrintSituationsplan/GPServer/Export%20Web%20Map/jobs/" + jobId + "/results/Output_File?f=json&returnType=data&dojo.preventCache=1533818509983",
            success(result) {                
                // 400 response gives 200 status hence we need to check for errors also in the success section
                if(result.hasOwnProperty('error')) {                    
                    return
                }

                clearInterval(window.pollInterval);
                console.log(result)
                $('#print-result').append("<a target='_blank' href='" + result.value.url + "'>" + window.state.jobs[jobId] + "</a></br>")
                
            },
            failure(error) {
                alert("There was an error!")
                console.log("ERROR!", error)                                
            }
        })        
    }


    on(search,'select-result', function(e) {        
        window.state.selectedProperty = e.result.name;
    });

    // Cant fetch elements in infoTemplate on the fly, resort
    $("html").on('click', function(e) {
        if(e.target.id == "download-pdf") {
            submitPrintJob();
        }
    });    
});