function ReportsGraphs() {
}

ReportsGraphs.prototype.getMappingType = function(inputType) {
    if (inputType == 'TIMELINE') {
        return 'lines';
    } else if (inputType == 'COUNTERS') {
        return 'pie';
    } else {
        return 'unknown';
    }
}

ReportsGraphs.prototype.doDrawAll = function(input) {
    var inputData = input.data;

    var nbGraphs = inputData.length + 1;
    var canvasHeigthWithMargins = input.topMargin + (nbGraphs * input.canvasHeigth) + ((nbGraphs - 1) * input.betweenGraphMargin) + input.bottomMargin;
    var canvasHeigthGraph = input.canvasHeigth;

    var translateX = input.leftMargin;

    var graphStructure = new killbillGraph.GraphStructure();


    graphStructure.setupDomStructure();
    var canvas = graphStructure.createCanvas([input.topMargin, input.rightMargin, input.bottomMargin, input.leftMargin],
            input.canvasWidth, canvasHeigthWithMargins);


    var curTranslateY = input.topMargin;
    var curTranslateLabelY = curTranslateY + (canvasHeigthGraph / 2);

    for (var i = 0; i < inputData.length; i++) {
        var curInput = inputData[i];
        var curType = this.getMappingType(curInput.type);
        var curData = curInput.data;
        var curTitle = curInput.title;

        log.debug("Drawing '" + curTitle + "'");
        log.trace(curData);

        // Add the xAxis tick first for ordering purpose.
        var nextTranslateY = curTranslateY + canvasHeigthGraph;
        var xAxisCanvaGroup;
        if (curType == 'lines' || curType == 'layers') {
            xAxisCanvaGroup = graphStructure.createCanvasGroup(canvas, translateX, nextTranslateY);
        }

        var canvasGrp = graphStructure.createCanvasGroup(canvas, translateX, curTranslateY);
        var theGraph;
        if (curType == 'lines') {
            theGraph = new killbillGraph.KBLinesGraph(canvasGrp, curTitle, curData, input.canvasWidth, canvasHeigthGraph, d3.scale.category20b());
            theGraph.drawLines();
            theGraph.addLegend();
        } else if (curType == 'layers') {
            theGraph = new killbillGraph.KBLayersGraph(canvasGrp, curTitle, curData, input.canvasWidth, canvasHeigthGraph, d3.scale.category20c());
            theGraph.drawStackLayers();
            theGraph.addLegend();
        } else if (curType == 'pie') {
            theGraph = new killbillGraph.KBPie(canvasGrp, curTitle, curData, input.canvasWidth, canvasHeigthGraph, d3.scale.category20c(), true);
            theGraph.drawPie();
            theGraph.addLegend();
        } else if (curType == 'histogram') {
            var canvasGrp = graphStructure.createCanvasGroup(canvas, translateX, curTranslateY);
            theGraph = new killbillGraph.KBHistogram(canvasGrp, curTitle, curData, input.canvasWidth, canvasHeigthGraph, d3.scale.category20c());
            theGraph.drawHistogram();
        }

        curTranslateLabelY = curTranslateLabelY;
        curTranslateY = nextTranslateY;

        if (curType == 'lines' || curType == 'layers') {
            theGraph.createXAxis(xAxisCanvaGroup, canvasHeigthGraph);
        }
        theGraph.addOnMouseHandlers();
        curTranslateY = curTranslateY + input.betweenGraphMargin;
    }
}

ReportsGraphs.prototype.drawAll = function(dataForAllReports) {
    var input = new killbillGraph.KBInputGraphs(800, 400, 80, 80, 80, 80, 160, dataForAllReports);
    this.doDrawAll(input);
}