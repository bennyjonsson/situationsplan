require([
    "esri/SpatialReference",
    "esri/map",
    "esri/dijit/Search",
    "esri/layers/FeatureLayer", 
    "esri/InfoTemplate",
    "dojo/domReady!",
    "dojo/on",
    "esri/basemaps",
    "esri/tasks/PrintTask",
    "esri/tasks/PrintParameters",
    "esri/tasks/DataFile",
    // Custom modules
    "config.js"
], 
function (
    SpatialReference,
    Map,
    Search,
    FeatureLayer,
    InfoTemplate,
    domReady,
    on,
    esriBasemaps,
    PrintTask,
    PrintParameters,
    DataFile,
    // Custom modules
    Config
) {
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
        sources: [
            {
                featureLayer: new FeatureLayer(Config.fastighetFeatureServer, {
                outFields: ["*"],
                infoTemplate: new InfoTemplate("${fastighet}", `
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
                outFields: ["fastighet"],
                displayField: "fastighet",
                suggestionTemplate: "FASTIGHET ${fastighet}",
                name: "Fastighet",
                placeholder: "Sök fastighet eller adress...",
                enableSuggestions: true
            },            
            {
                featureLayer: new FeatureLayer(Config.adressFeatureServer, {
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
                outFields: ["Name", "RealEstateName"],
                displayField: "Name",
                suggestionTemplate: "FASTIGHET ${RealEstateName}: ADRESS ${Name}",
                name: "Adress",
                placeholder: "Sök fastighet eller adress...",
                enableSuggestions: true
            }
    ],
        allPlaceholder: "Sök fastighet eller adress ...",
        map: map,
    }, "search");

    search.startup();

    function submitPrintJob() {
        var selectedProperty = window.state.selectedProperty;
        var printTask = new PrintTask(Config.printingService  + "/GPServer/Export%20Web%20Map");

        $('#print-result').append('<div id="loader" class="lds-dual-ring"></div>')

        var params = new PrintParameters();
        params.map = map;
        params.extraParameters = {}
        params.extraParameters.Web_Map_as_JSON = webMapAsJSON()
        var file = new DataFile()
        file.url = selectedProperty;
        params.extraParameters.Output_File = selectedProperty; //file;
        params.template = $("#template").val()
        
        printTask.execute(params, function(result) {
            console.log("Success!", result)
                $('#print-result').append("<a target='_blank' href='" + result.url + "'>" + selectedProperty + "</a></br>")
                $('.lds-dual-ring').remove()            
        }, function(error) {
            console.log("Fail", error)
        });
    }
    
    function webMapAsJSON() {        
        return JSON.stringify(
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
                        "url": Config.mapToPrint
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
        )
    }

    // Keep track of the selected object
    on(search,'select-result', function(e) {        
        // Case Adress - use RealEstateName
        if(e.result.feature.attributes.RealEstateName) {            
            window.state.selectedProperty = e.result.feature.attributes.RealEstateName;    
            return
        }

        // Case Fastighet use fastighet
        window.state.selectedProperty = e.result.feature.attributes.fastighet;    
    });

    // Cant fetch elements in infoTemplate on the fly, resort
    $("html").on('click', function(e) {
        if(e.target.id == "download-pdf") {
            submitPrintJob();
        }
    });
});

// Set file 
    // DataFile in Output_File no effect!
// Splash popup?
    // https://dojotoolkit.org/reference-guide/1.10/dijit/Dialog.html
// Remove basemap
    // https://developers.arcgis.com/javascript/3/jsapi/arcgisdynamicmapservicelayer-amd.html
