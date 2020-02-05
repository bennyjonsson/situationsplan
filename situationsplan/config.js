define(function(){
    return {
        baseMap: "https://minserver.minstad.se/arcgis/rest/services/extern/Lund_Situationsplan/MapServer",
        adressFeatureServer: "https://minserver.minstad.se/arcgis/rest/services/extern/Lund_Situationsplan_Identify/MapServer/0",
        fastighetFeatureServer: "https://minserver.minstad.se/arcgis/rest/services/extern/Lund_Situationsplan_Identify/MapServer/8",
        printingService: "https://minserver.minstad.se/arcgis/rest/services/PrintingService_Situationsplan",
        mapToPrint: "https://minserver.minstad.se/arcgis/rest/services/extern/Lund_Situationsplan/MapServer",

        // Layout dataframe width/height
        paperSpace: {
            A4: {
                width: 0.190007,
                height: 0.202946
            },
            A3: {
                width: 0.2687578,
                height: 0.3044507
            }
        }
    };
});
