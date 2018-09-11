define(function(){
    return {
        baseMap: "https://platsen.helsingborg.se/arcgis/rest/services/Bygglov/situationsplan2/MapServer",        
        adressFeatureServer: "https://gisdata2.helsingborg.se/arcgis/rest/services/Fastigheter/Adress_till_fastighet/FeatureServer/0",
        fastighetFeatureServer: "https://gisdata2.helsingborg.se/arcgis/rest/services/Fastigheter/Alla_fastigheter/FeatureServer/0",
        printingService: "https://gisdata.helsingborg.se/arcgis/rest/services/Utskriftstjanster/PrintSituationsplan",
        mapToPrint: "https://platsen.helsingborg.se/arcgis/rest/services/Bygglov/situationsplan/MapServer",

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
        },

        successMessage: "Din beställning är nu färdig. Tänk på att skriva ut i verklig storlek, för att få den i rätt skala."
    };
});