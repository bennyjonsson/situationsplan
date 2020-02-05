define(["config.js"], function(Config) {

    window.resetForm = function() {
            $('#print-form').show();
            $('#print-loading').hide();
            $('#print-error').hide();        
            $('#print-result').empty();
            $('#print-result').hide();
    }

    return {
        html: function() {
            // IE11 does not support multiline strings, use lines ending with \ instead
            return '\
                <div id="print-form">\
                    <div class="form-group"> \
                        <label for="scale">Skala</label> \
                        <select class="form-control" id="scale" onchange="window.updatePrintExtent()"> \
                            <option value="200">1:200</option> \
                            <option value="400" selected>1:400</option> \
                            <option value="1000">1:1000</option> \
                        </select> \
                        <label for="template">Format</label> \
                        <select class="form-control" id="template" onchange="window.updatePrintExtent()"> \
                            <option value="A4" selected>A4</option> \
                            <option value="A3" >A3</option> \
                        </select> \
                        <div id="print-form-submit">\
                            <button class="btn btn-success" id="download-pdf" onclick="window.submitPrintJob()">Skapa PDF</button> \
                        </div>\
                    </div> \
                </div>\
                <div id="print-loading" hidden>\
                    <div id="loader" class="lds-dual-ring"></div>\
                </div> \
                <div id="print-error" hidden>\
                    <p> Någonting gick fel! Försök igen, eller kontakta kartor@lund.se </p>\
                </div> \
                <div id="print-result" hidden></div>'
        },

        showResult: function(result) {            
            $('#print-result').append("<p>Nu kan du hämta din karta.</p>")
            $('#print-result').append("<a target='_blank' href='" + result.url + "'><button class='btn btn-success'>Hämta PDF!</button></a>")
            // $('#print-result').append("<button class='btn' onclick='window.resetForm()'>Ändra</button>")
            // $('#print-result').append('<button class="btn" onclick="location.href='+"'/situationsplan/'" + ';">Sök på nytt</button>')

            
            
        }
    };
});