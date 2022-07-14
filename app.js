var engine;
/**
 * The main entry point
 */
window.onload = function () {
    engine = new TSEngine.Engine();
    engine.start();
};
window.onresize = function () {
    engine.resize();
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
            this.loadShaders();
            this._shader.use();
            this.createBuffer();
            this.resize();
            this.mainLoop();
        };
        /**
         * Resizes the canvas to fit the window.
         */
        Engine.prototype.resize = function () {
            if (this._canvas !== undefined) {
                this._canvas.width = window.innerWidth;
                this._canvas.height = window.innerHeight;
                TSEngine.gl.viewport(0, 0, this._canvas.width, this._canvas.height);
            }
        };
        Engine.prototype.mainLoop = function () {
            TSEngine.gl.clear(TSEngine.gl.COLOR_BUFFER_BIT);
            TSEngine.gl.bindBuffer(TSEngine.gl.ARRAY_BUFFER, this._buffer);
            TSEngine.gl.vertexAttribPointer(0, 3, TSEngine.gl.FLOAT, false, 0, 0);
            TSEngine.gl.enableVertexAttribArray(0);
            TSEngine.gl.drawArrays(TSEngine.gl.TRIANGLES, 0, 3);
            requestAnimationFrame(this.mainLoop.bind(this));
        };
        Engine.prototype.createBuffer = function () {
            this._buffer = TSEngine.gl.createBuffer();
            var vertices = [
                //x, y, z
                0, 0, 0,
                0, 0.5, 0,
                0.5, 0.5, 0
            ];
            TSEngine.gl.bindBuffer(TSEngine.gl.ARRAY_BUFFER, this._buffer);
            TSEngine.gl.bufferData(TSEngine.gl.ARRAY_BUFFER, new Float32Array(vertices), TSEngine.gl.STATIC_DRAW);
            TSEngine.gl.bindBuffer(TSEngine.gl.ARRAY_BUFFER, undefined);
            TSEngine.gl.disableVertexAttribArray(0);
        };
        Engine.prototype.loadShaders = function () {
            var vertexShaderSource = "\n                        attribute vec3 a_position;\n                          \n                        void main() {\n                            gl_Position = vec4(a_position, 1.0);\n                        }";
            var fragmentShaderSource = "\n                        precision mediump float;\n                        \n                        void main() {\n                            gl_FragColor = vec4(1.0);\n                        }";
            this._shader = new TSEngine.Shader("base", vertexShaderSource, fragmentShaderSource);
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
var TSEngine;
(function (TSEngine) {
    /**
     * WebGL shader
     */
    var Shader = /** @class */ (function () {
        /**
         *
         * @param name The name of shader.
         * @param vertexSrc The source of vertex shader.
         * @param fragmentSrc The source of fragment shader.
         */
        function Shader(name, vertexSrc, fragmentSrc) {
            var vertexShader = this.loadShader(vertexSrc, TSEngine.gl.VERTEX_SHADER);
            var fragmentShader = this.loadShader(fragmentSrc, TSEngine.gl.FRAGMENT_SHADER);
            this.createProgram(vertexShader, fragmentShader);
        }
        Object.defineProperty(Shader.prototype, "name", {
            /**
             * Name of shader.
             */
            get: function () {
                return this._name;
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Use shader.
         */
        Shader.prototype.use = function () {
            TSEngine.gl.useProgram(this._program);
        };
        Shader.prototype.loadShader = function (source, shaderType) {
            var shader = TSEngine.gl.createShader(shaderType);
            TSEngine.gl.shaderSource(shader, source);
            TSEngine.gl.compileShader(shader);
            var error = TSEngine.gl.getShaderInfoLog(shader);
            if (error !== "") {
                throw new Error("Error compiling shader '" + this._name + "' : " + error);
            }
            return shader;
        };
        Shader.prototype.createProgram = function (vertexShader, fragmentShader) {
            this._program = TSEngine.gl.createProgram();
            TSEngine.gl.attachShader(this._program, vertexShader);
            TSEngine.gl.attachShader(this._program, fragmentShader);
            TSEngine.gl.linkProgram(this._program);
            var error = TSEngine.gl.getProgramInfoLog(this._program);
            if (error !== "") {
                throw new Error("Error linking shader '" + this._name + "' : " + error);
            }
        };
        return Shader;
    }());
    TSEngine.Shader = Shader;
})(TSEngine || (TSEngine = {}));
//# sourceMappingURL=app.js.map