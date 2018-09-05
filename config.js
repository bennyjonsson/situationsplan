define(function(){
    return {
        baseMap: "https://platsen.helsingborg.se/arcgis/rest/services/Bygglov/situationsplan/MapServer",
        mapToPrint: "https://platsen.helsingborg.se/arcgis/rest/services/Bygglov/situationsplan/MapServer",
        adressFeatureServer: "https://gisdata2.helsingborg.se/arcgis/rest/services/Fastigheter/Adress_till_fastighet/FeatureServer/0",
        fastighetFeatureServer: "https://gisdata2.helsingborg.se/arcgis/rest/services/Fastigheter/Alla_fastigheter/FeatureServer/0",
        printingService: "https://gisdata.helsingborg.se/arcgis/rest/services/Utskriftstjanster/PrintSituationsplan",
        printingServiceOperationalLayers: "https://platsen.helsingborg.se/arcgis/rest/services/Bygglov/situationsplan/MapServer"
    };
});