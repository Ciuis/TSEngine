/**
 * The main entry point
 */
window.onload = function () {
    var engine = new TSEngine.Engine();
    engine.start();
};
var TSEngine;
(function (TSEngine) {
    /**
     * The main game engine class.
     */
    var Engine = /** @class */ (function () {
        /**
         * Creates new engine.
         */
        function Engine() {
        }
        /**
         * Starts engine.
         */
        Engine.prototype.start = function () {
            this._canvas = TSEngine.GLUtilities.init();
            TSEngine.gl.clearColor(0, 0, 0, 1);
            this.mainLoop();
        };
        Engine.prototype.mainLoop = function () {
            TSEngine.gl.clear(TSEngine.gl.COLOR_BUFFER_BIT);
            requestAnimationFrame(this.mainLoop.bind(this));
        };
        return Engine;
    }());
    TSEngine.Engine = Engine;
})(TSEngine || (TSEngine = {}));
var TSEngine;
(function (TSEngine) {
    /**
     * Responsible for setting up a WebGL rendering context.
     */
    var GLUtilities = /** @class */ (function () {
        function GLUtilities() {
        }
        /**
         * Initializes WebGL potentially using a canvas with id matching if it is defined.
         * @param elementId The in of the element to search for.
         */
        GLUtilities.init = function (elementId) {
            var canvas;
            if (elementId !== undefined) {
                canvas = document.getElementById(elementId);
                if (canvas === undefined) {
                    throw new Error("Cannot find a canvas element named: " + elementId);
                }
            }
            else {
                canvas = document.createElement("canvas");
                document.body.appendChild(canvas);
            }
            TSEngine.gl = canvas.getContext("webgl");
            if (TSEngine.gl === undefined) {
                throw new Error("Unable to initialize WebGL");
            }
            return canvas;
        };
        return GLUtilities;
    }());
    TSEngine.GLUtilities = GLUtilities;
})(TSEngine || (TSEngine = {}));
//# sourceMappingURL=app.js.map