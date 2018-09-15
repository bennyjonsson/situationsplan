define(function(){
    return {
        baseMap: "https://.../arcgis/rest/services/Bygglov/situationsplan/MapServer",        
        adressFeatureServer: "https://.../arcgis/rest/services/Fastigheter/Adress_till_fastighet/FeatureServer/0",
        fastighetFeatureServer: "https://.../arcgis/rest/services/Fastigheter/Alla_fastigheter/FeatureServer/0",
        printingService: "https://.../arcgis/rest/services/Utskriftstjanster/PrintSituationsplan",
        mapToPrint: "https://.../arcgis/rest/services/Bygglov/situationsplan/MapServer",

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