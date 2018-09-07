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
    "esri/layers/ArcGISDynamicMapServiceLayer",
    // Custom modules    
    "config.js",
    "PrintDialog.js"
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
    ArcGISDynamicMapServiceLayer,
    // Custom modules
    Config,
    PrintDialog
) {
    var map = new Map("map", {
        //basemap: "gray",
        //spatialReference: new SpatialReference(3008),
        center: [102236, 6214000], //12.7, 56.03], // lon, lat
        zoom: 12
    });    

    map.addLayer(ArcGISDynamicMapServiceLayer(
        Config.mapToPrint,{
            useMapImage: true
        }
    ))



    // Used to store searches, active property, jobs and more while the user navigates
    window.state = {
        jobs: {}
    }

    var search = new Search({
        sources: [
            {
                featureLayer: new FeatureLayer(Config.fastighetFeatureServer, {
                outFields: ["*"],
                infoTemplate: new InfoTemplate("${fastighet}", PrintDialog.html())}),
                outFields: ["fastighet"],
                displayField: "fastighet",
                suggestionTemplate: "${fastighet}",
                name: "Fastighet",
                placeholder: "Sök fastighet eller adress...",
                enableSuggestions: true
            },            
            {
                featureLayer: new FeatureLayer(Config.adressFeatureServer, {
                outFields: ["*"],
                infoTemplate: new InfoTemplate("${RealEstateName}", PrintDialog.html())}),
                outFields: ["Name", "RealEstateName"],
                displayField: "Name",
                suggestionTemplate: "${RealEstateName} / ${Name}",
                name: "Adress",
                placeholder: "Sök fastighet eller adress...",
                enableSuggestions: true
            }
    ],
        allPlaceholder: "Sök fastighet eller adress ...",
        map: map,
        enableSourcesMenu: false
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
                $('#print-result').append("<button class='btn btn-success'><a target='_blank' href='" + result.url + "'>" + selectedProperty + "</a></button></br>")
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
                        "wkid":3008
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

    // Hide help on search focus
    on(search,'focus', function(e) {
        setTimeout(function() {
            try {
                document.elementFromPoint(1, 1).click();                    
            } catch(error) {
                //ignore
            }            
        }, 100)                
    });    

    // Cant fetch elements in infoTemplate on the fly, resort
    $("html").on('click', function(e) {
        if(e.target.id == "download-pdf") {
            submitPrintJob();
        }
    });
});

// Set file name
    // DataFile in Output_File no effect!
// Remove basemap
    // How set center
    // Add overview map at zoom out

// EXTENT BUFFER 
