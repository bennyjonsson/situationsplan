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
    "esri/geometry/Polygon",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/Color",
    "esri/graphic",
    "esri/tasks/PrintTemplate",
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
    Polygon,
    SimpleFillSymbol,
    SimpleLineSymbol,
    Color,
    Graphic,
    PrintTemplate,
    // Custom modules
    Config,
    PrintDialog
) {
    var map = new Map("map");

    map.addLayer(ArcGISDynamicMapServiceLayer(
        Config.mapToPrint,{
            useMapImage: true
        }
    ))

    on(map, 'layers-add-result', function() {
        map.zoom(12);
        map.centerAt(new Point([102236, 6214000],new SpatialReference({ wkid:3008 })));
    });

    var printBoundsLayer = new esri.layers.GraphicsLayer();
    map.addLayer(printBoundsLayer)    

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

    window.submitPrintJob = function() {
        var selectedProperty = window.state.selectedProperty;
        var printTask = new PrintTask(Config.printingService  + "/GPServer/Export%20Web%20Map");

        $('#print-result').append('<div id="loader" class="lds-dual-ring"></div>')

        var template = new PrintTemplate();
        template.exportOptions = {};
        template.format = "PDF";
        template.layout = $("#template").val()  ;
        template.preserveScale = false;

        var params = new PrintParameters();
        params.map = map;
        params.extraParameters = {}
        params.extraParameters.Web_Map_as_JSON = webMapAsJSON()        
        params.template = template                
        
        printTask.execute(params, function(result) {            
                $('#print-result').append("<a target='_blank' href='" + result.url + "'><button class='btn btn-success'>" + selectedProperty + "</button></a></br>")
                $('.lds-dual-ring').remove()            
        }, function(error) {
            alert("Error, please review console.")
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
                },
                "layout": $("#template").val()
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
        
        on(map, 'extent-change', function() {
            window.updatePrintExtent()
        })
    });

    // Hide help on search focus
    on(search,'focus', function(e) {
        window.closeModal()
    });
    
    window.closeModal = function() {
        setTimeout(function() {
            try {
                document.elementFromPoint(1, 1).click();                    
            } catch(error) {
                //ignore
            }            
        }, 100)                
    }

    /*
    // Cant fetch elements in infoTemplate on the fly, resort
    $("html").on('click', function(e) {
        if(e.target.id == "download-pdf") {
            window.submitPrintJob();
        }
    });
    */

    // Called on map move, or template format/scale selection
    window.updatePrintExtent = function() {
        printBoundsLayer.clear()        

        var poly = new Polygon({
            //"rings": [[[98236, 6217000], [101536, 6214500], [98236, 6211000], [98236, 6217000]]],
            "rings": [ printBounds() ],
            "spatialReference":{"wkid":3008 }

        });
        var fs = new SimpleFillSymbol(
                SimpleFillSymbol.STYLE_SOLID,
                new SimpleLineSymbol(
                    SimpleLineSymbol.STYLE_DASH,
                    new Color([255,0,0]),
                    2
                ),
                new Color([255,255,0,0.01])
        );

        printBoundsLayer.add(new Graphic(poly, fs));        
    }

    function printBounds() {
        return [
            [map.extent.getCenter().x-printSideLength()/2, map.extent.getCenter().y-printSideLength()/2],
            [map.extent.getCenter().x+printSideLength()/2, map.extent.getCenter().y-printSideLength()/2],
            [map.extent.getCenter().x+printSideLength()/2, map.extent.getCenter().y+printSideLength()/2],
            [map.extent.getCenter().x-printSideLength()/2, map.extent.getCenter().y+printSideLength()/2],
            [map.extent.getCenter().x-printSideLength()/2, map.extent.getCenter().y-printSideLength()/2]
        ]
    }

    // ASSUMES SQUARE TEMPLATES! CURRENTLY USES THE SHORTEST SIDE.
    function printSideLength() {
        var scale = parseInt($("#scale").val())
        var format = $("#template").val()
        var paperSpace = {
            A4: 0.19,
            A3: 0.26
        }

        return scale*paperSpace[format]
    }

});

// Remove basemap
    // Add overview map at zoom out (Set in MXD!)

// EXTENT BUFFER 
    // Improve by exact corresponding rectangular measurments

// STYLE INFO BOX AND RESULT PRENTATION