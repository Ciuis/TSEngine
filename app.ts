var engine: TSEngine.Engine;

/**
 * The main entry point
 */
window.onload = function () {
    engine = new TSEngine.Engine();
    engine.start();
}

window.onresize = function () {
    engine.resize();
}