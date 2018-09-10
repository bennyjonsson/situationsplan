define(function(){
    return {
        html: function() {
            return `
                <div class="form-group">                    
                    <label for="scale">Skala</label>
                    <select class="form-control" id="scale" onchange="window.updatePrintExtent()">                        
                        <option value="500">500</option>
                        <option value="200">200</option>
                    </select>
                    <label for="template">Format</label>
                    <select class="form-control" id="template" onchange="window.updatePrintExtent()">
                        <option value="A4">A4</option>
                        <option value="A3">A3</option>
                    </select>
                </div>
                <button class="btn" id='download-pdf'>Ladda ner PDF</button>
                <div id="print-result"></div>`
        }
    };
});