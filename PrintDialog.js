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
                            <option value="200">200</option> \
                            <option value="500" selected>500</option> \
                            <option value="1000">1000</option> \
                            <option value="2000">2000</option> \
                            <option value="5000">5000</option> \
                        </select> \
                        <label for="template">Format</label> \
                        <select class="form-control" id="template" onchange="window.updatePrintExtent()"> \
                            <option value="A3">A3</option> \
                            <option value="A4" selected>A4</option> \
                        </select> \
                        <div id="print-form-submit">\
                            <button class="btn btn-success" id="download-pdf" onclick="window.submitPrintJob()">Ladda ner PDF</button> \
                            <button class="btn" onclick="location.href=`/situationsplan`;">Börja om</button> \
                        </div>\
                    </div> \
                </div>\
                <div id="print-loading" hidden>\
                    <div id="loader" class="lds-dual-ring"></div>\
                </div> \
                <div id="print-error" hidden>\
                    <p> Någonting gick fel! Försök igen, eller kontakta sbf.itgis@helsingborg.se </p>\
                </div> \
                <div id="print-result" hidden></div>'
        },

        showResult: function(result) {            
            $('#print-result').append("<p>" + Config.successMessage + "</p>")
            $('#print-result').append("<a target='_blank' href='" + result.url + "'><button class='btn btn-success'>Öppna PDF!</button></a>")
            $('#print-result').append("<button class='btn' onclick='window.resetForm()'>Ändra</button>")
            $('#print-result').append("<button class='btn' onclick='location.href=`/situationsplan`;'>Börja om</button>")

            
            
        }
    };
});