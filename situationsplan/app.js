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
      Config.baseMap, {
        useMapImage: true,

      }
    ))


    $(".logo-med").attr({
      "title": "Lunds kommun"
    });



    on(map, 'layers-add-result', function () {
      map.zoom(12);
      map.centerAt(new Point([102236, 6214000], new SpatialReference({ wkid: 3008 })));
    });

    var printBoundsLayer = new esri.layers.GraphicsLayer();
    map.addLayer(printBoundsLayer)

    // Used to store searches, active property, jobs and more while the user navigates
    window.state = {
      jobs: {}
    }

    var searchDivName = (window.navigator.userAgent.indexOf("Edge") > -1) ? "" : "search";
    var search = new Search({
      sources: [
        {
          featureLayer: new FeatureLayer(Config.fastighetFeatureServer, {
            infoTemplate: new InfoTemplate("${FASTIGHET}", PrintDialog.html())
          }),
          outFields: ["FASTIGHET"],
          displayField: "FASTIGHET",
          suggestionTemplate: "${FASTIGHET}",
          name: "Fastighet",
          placeholder: "Sök adress ellerfastighet...",
          minCharacters: 2,
          enableSuggestions: true,
          autoNavigate: false
        },
        {
          featureLayer: new FeatureLayer(Config.adressFeatureServer, {
            infoTemplate: new InfoTemplate("${ADRESS}", PrintDialog.html())
          }),
          outFields: ["ADRESS", "FASTIGHET"],
          displayField: "ADRESS",
          suggestionTemplate: "${ADRESS} ${FASTIGHET}",
          name: "Adress",
          placeholder: "Sök adress ellerfastighet...",
          minCharacters: 2,
          enableSuggestions: true,
          autoNavigate: false
        }
      ],
      allPlaceholder: "Sök adress ellerfastighet...",
      map: map,
      enableSourcesMenu: false
    }, searchDivName);


      search.startup();

    window.submitPrintJob = function () {
      var selectedProperty = window.state.selectedProperty;
      var printTask = new PrintTask(Config.printingService + "/GPServer/Export%20Web%20Map");

      //$('#print-result').append('<div id="loader" class="lds-dual-ring"></div>')
      $('#print-form').hide();
      $('#print-result').hide();
      $('#print-loading').show();


      var template = new PrintTemplate();
      template.exportOptions = {};
      template.format = "PDF";
      template.layout = $("#template").val();
      template.preserveScale = false;

      var params = new PrintParameters();
      params.map = map;
      params.extraParameters = {}
      params.extraParameters.Web_Map_as_JSON = webMapAsJSON()
      params.template = template

      printTask.execute(params, function (result) {
        $('#print-loading').hide();
        $('#print-result').show();

        PrintDialog.showResult(result)

      }, function (error) {
        $('#print-loading').hide();
        $('#print-error').show();
        console.log("Fail", error)
      });
    }


    function webMapAsJSON() {
      return JSON.stringify(
        {
          "mapOptions": {
            "showAttribution": true, "extent": map.extent
            , "spatialReference": { "wkid": 3008, "latestWkid": 3008 }
            , "scale": parseInt($("#scale").val())
          }
          , "operationalLayers": [{ "id": "Lund_Situationsplan_4770", "title": "Lund_Situationsplan", "opacity": 1, "minScale": 0, "maxScale": 0, "url": "https://minserver.minstad.se/arcgis/rest/services/extern/Lund_Situationsplan/MapServer", "visibleLayers": [501, 503, 500, 502, 504, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20, 31, 21, 22, 23, 24, 25, 26, 27, 28, 29] }], "exportOptions": { "outputSize": [670, 500], "dpi": 300 }, "layoutOptions": {
            "titleText": "", "authorText": "", "copyrightText": ""
            , "customTextElements": [{ "FASTIGHET": window.state.selectedProperty }], "scaleBarOptions": {}, "legendOptions": { "operationalLayers": [] }
          }
        });
    }


    // As soon as user selects adress/fastighet
    on(search, 'select-result', function (e) {
      // After a result is selected, subsequent imidiate searches ignores the searchstring and fetches OBJECTID=0. 3.25 bug? Tried the following:
      //$("#search_input").val(''); // no effect but prompts the user to write something new        UPDATE: BREAKS IE11
      //search.set('value',''); // closes current selection
      //search.hide(); // no effect
      //search.show(); // no effect


      // Override normal
      map.setScale(500)
      map.centerAt(
        new Point(
          (e.result.extent.xmin + e.result.extent.xmax) / 2,
          (e.result.extent.ymin + e.result.extent.ymax) / 2,
          new SpatialReference({ wkid: 3008 })
        )
      )

      setInterval(function () {
        window.updatePrintExtent()
      }, 500);

      // Case Adress - use RealEstateName
      if (e.result.feature.attributes.ADRESS) {
        window.state.selectedProperty = e.result.feature.attributes.FASTIGHET + " (" + e.result.feature.attributes.ADRESS + ")";
        return;
      }

      // Case Fastighet use fastighet
      window.state.selectedProperty = e.result.feature.attributes.FASTIGHET;
    });

    // Hide help on search focus
    on(search, 'focus', function (e) {
      window.closeModal()
    });

    window.closeModal = function () {
      $.modal.close()
    }

    window.updatePrintExtent = function () {
      printBoundsLayer.clear()

      var poly = new Polygon({
        "rings": [printBounds()],
        "spatialReference": { "wkid": 3008 }

      });
      var fs = new SimpleFillSymbol(
        SimpleFillSymbol.STYLE_SOLID,
        new SimpleLineSymbol(
          SimpleLineSymbol.STYLE_DASH,
          new Color([255, 0, 0]),
          2
        ),
        new Color([255, 255, 0, 0.01])
      );

      printBoundsLayer.add(new Graphic(poly, fs));
    }

    function printBounds() {
      var scale = parseInt($("#scale").val())
      var format = $("#template").val()

      var xmin = map.extent.getCenter().x - scale * Config.paperSpace[format].width / 2
      var ymin = map.extent.getCenter().y - scale * Config.paperSpace[format].height / 2
      var xmax = map.extent.getCenter().x + scale * Config.paperSpace[format].width / 2
      var ymax = map.extent.getCenter().y + scale * Config.paperSpace[format].height / 2

      return [
        [xmin, ymin],
        [xmax, ymin],
        [xmax, ymax],
        [xmin, ymax],
        [xmin, ymin]
      ]
    }
  });