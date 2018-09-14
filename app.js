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
    "esri/geometry/Point",
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
    Point,
    // Custom modules
    Config,
    PrintDialog
) {
    var map = new Map("map");

    map.addLayer(ArcGISDynamicMapServiceLayer(
        Config.baseMap,{
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
                enableSuggestions: true,
                autoNavigate: false
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
                enableSuggestions: true,
                autoNavigate: false
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

        //$('#print-result').append('<div id="loader" class="lds-dual-ring"></div>')
        $('#print-form').hide();
        $('#print-result').hide();
        $('#print-loading').show();


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
            $('#print-loading').hide();                        
            $('#print-result').show();

            PrintDialog.showResult(result)            
                            
        }, function(error) {
            $('#print-loading').hide();
            $('#print-error').show();
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
        
        map.centerAt(
            new Point(
                (e.result.extent.xmin+e.result.extent.xmax)/2,
                (e.result.extent.ymin+e.result.extent.ymax)/2,
                new SpatialReference({ wkid:3008 })
            )
        )        
        map.setScale(500)

        // Listen for when to change printBounds
        on(map, 'extent-change', function() {            
            window.updatePrintExtent()
        })        
        
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

    window.updatePrintExtent = function() {
        printBoundsLayer.clear()        

        var poly = new Polygon({
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
        var scale = parseInt($("#scale").val())
        var format = $("#template").val()        
        
        var xmin = map.extent.getCenter().x-scale*Config.paperSpace[format].width/2
        var ymin = map.extent.getCenter().y-scale*Config.paperSpace[format].height/2
        var xmax = map.extent.getCenter().x+scale*Config.paperSpace[format].width/2
        var ymax = map.extent.getCenter().y+scale*Config.paperSpace[format].height/2

        return [
            [xmin, ymin],
            [xmax, ymin],
            [xmax, ymax],
            [xmin, ymax],
            [xmin, ymin]            
        ]
    }
});