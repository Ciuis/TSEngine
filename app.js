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
            //Set uniforms
            var colorPosition = this._shader.getUniformLocation("u_color");
            TSEngine.gl.uniform4f(colorPosition, 1, 0.5, 0, 1);
            this._buffer.bind();
            this._buffer.draw();
            TSEngine.gl.drawArrays(TSEngine.gl.TRIANGLES, 0, 3);
            requestAnimationFrame(this.mainLoop.bind(this));
        };
        Engine.prototype.createBuffer = function () {
            this._buffer = new TSEngine.GLBuffer(3);
            var positionAttrib = new TSEngine.AttribInfo();
            positionAttrib.loc = this._shader.getAttribLocation("a_position");
            positionAttrib.offset = 0;
            positionAttrib.size = 3;
            this._buffer.addAttribLocation(positionAttrib);
            var vertices = [
                //x, y, z
                0, 0, 0,
                0, 0.5, 0,
                0.5, 0.5, 0
            ];
            this._buffer.pushBackData(vertices);
            this._buffer.upload();
            this._buffer.unbind();
        };
        Engine.prototype.loadShaders = function () {
            var vertexShaderSource = "\n                        attribute vec3 a_position;\n                          \n                        void main() {\n                            gl_Position = vec4(a_position, 1.0);\n                        }";
            var fragmentShaderSource = "\n                        precision mediump float;\n                        \n                        uniform vec4 u_color;\n                        \n                        void main() {\n                            gl_FragColor = u_color;\n                        }";
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
         * Creates new shader.
         * @param name The name of shader.
         * @param vertexSrc The source of vertex shader.
         * @param fragmentSrc The source of fragment shader.
         */
        function Shader(name, vertexSrc, fragmentSrc) {
            this._attrib = {};
            this._uniforms = {};
            var vertexShader = this.loadShader(vertexSrc, TSEngine.gl.VERTEX_SHADER);
            var fragmentShader = this.loadShader(fragmentSrc, TSEngine.gl.FRAGMENT_SHADER);
            this.createProgram(vertexShader, fragmentShader);
            this.detectAttributes();
            this.detectUniforms();
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
        /**
         * Gets location of attribute with provided name.
         * @param name The name of attribute whose location we retrieve.
         */
        Shader.prototype.getAttribLocation = function (name) {
            if (this._attrib[name] === undefined) {
                throw new Error("Unable find attribute named '".concat(name, "' in shader named '").concat(this._name, "'"));
            }
            return this._attrib[name];
        };
        /**
         * Gets location of uniform with provided name.
         * @param name The name of uniform whose location we retrieve.
         */
        Shader.prototype.getUniformLocation = function (name) {
            if (this._uniforms[name] === undefined) {
                throw new Error("Unable find uniform named '".concat(name, "' in shader named '").concat(this._name, "'"));
            }
            return this._uniforms[name];
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
        Shader.prototype.detectAttributes = function () {
            var attribCount = TSEngine.gl.getProgramParameter(this._program, TSEngine.gl.ACTIVE_ATTRIBUTES);
            for (var i = 0; i < attribCount; ++i) {
                var info = TSEngine.gl.getActiveAttrib(this._program, i);
                if (!info) {
                    break;
                }
                this._attrib[info.name] = TSEngine.gl.getAttribLocation(this._program, info.name);
            }
        };
        Shader.prototype.detectUniforms = function () {
            var uniformCount = TSEngine.gl.getProgramParameter(this._program, TSEngine.gl.ACTIVE_UNIFORMS);
            for (var i = 0; i < uniformCount; ++i) {
                var info = TSEngine.gl.getActiveUniform(this._program, i);
                if (!info) {
                    break;
                }
                this._uniforms[info.name] = TSEngine.gl.getUniformLocation(this._program, info.name);
            }
        };
        return Shader;
    }());
    TSEngine.Shader = Shader;
})(TSEngine || (TSEngine = {}));
var TSEngine;
(function (TSEngine) {
    /**
     * Provides info for GLBuffer attribute.
     */
    var AttribInfo = /** @class */ (function () {
        function AttribInfo() {
        }
        return AttribInfo;
    }());
    TSEngine.AttribInfo = AttribInfo;
    var GLBuffer = /** @class */ (function () {
        /**
         * Creates a new GL buffer.
         * @param elementSize The size of each element in buffer.
         * @param dataType The datatype of buffer (gl.FLOAT by default).
         * @param targetBufferType The buffer target type. Can be gl.ARRAY_BUFFER or gl.ELEMENT_ARRAY_BUFFER (gl.ARRAY_BUFFER by default).
         * @param mode The drawing mode. Can be gl.TRIANGLES or gl.LINES (gl.TRIANGLES by default).
         */
        function GLBuffer(elementSize, dataType, targetBufferType, mode) {
            if (dataType === void 0) { dataType = TSEngine.gl.FLOAT; }
            if (targetBufferType === void 0) { targetBufferType = TSEngine.gl.ARRAY_BUFFER; }
            if (mode === void 0) { mode = TSEngine.gl.TRIANGLES; }
            this._hasAttribLocation = false;
            this._data = [];
            this._attribs = [];
            this._elementSize = elementSize;
            this._dataType = dataType;
            this._targetBufferType = targetBufferType;
            this._mode = mode;
            //determine byte size
            switch (this._dataType) {
                case TSEngine.gl.FLOAT:
                case TSEngine.gl.INT:
                case TSEngine.gl.UNSIGNED_INT:
                    this._typeSize = 4;
                    break;
                case TSEngine.gl.SHORT:
                case TSEngine.gl.UNSIGNED_SHORT:
                    this._typeSize = 2;
                    break;
                case TSEngine.gl.BYTE:
                case TSEngine.gl.UNSIGNED_BYTE:
                    this._typeSize = 1;
                    break;
                default:
                    throw new Error("Unrecognized data type: " + dataType.toString());
            }
            this._stride = this._elementSize * this._typeSize;
            this._buffer = TSEngine.gl.createBuffer();
        }
        /**
         * Destructor.
         */
        GLBuffer.prototype.destroy = function () {
            TSEngine.gl.deleteBuffer(this._buffer);
        };
        /**
         * Buffer binding
         * @param isNormalized Shows if the data should be normalized (false by default).
         */
        GLBuffer.prototype.bind = function (isNormalized) {
            if (isNormalized === void 0) { isNormalized = false; }
            TSEngine.gl.bindBuffer(this._targetBufferType, this._buffer);
            if (this._hasAttribLocation) {
                for (var _i = 0, _a = this._attribs; _i < _a.length; _i++) {
                    var it = _a[_i];
                    TSEngine.gl.vertexAttribPointer(it.loc, it.size, this._dataType, isNormalized, this._stride, it.offset * this._typeSize);
                    TSEngine.gl.enableVertexAttribArray(it.loc);
                }
            }
        };
        /**
         * Unbind buffer.
         */
        GLBuffer.prototype.unbind = function () {
            for (var _i = 0, _a = this._attribs; _i < _a.length; _i++) {
                var it = _a[_i];
                TSEngine.gl.enableVertexAttribArray(it.loc);
            }
            TSEngine.gl.bindBuffer(TSEngine.gl.ARRAY_BUFFER, this._buffer);
        };
        /**
         * Add an attribute with provided info to buffer.
         * @param info Info to be added.
         */
        GLBuffer.prototype.addAttribLocation = function (info) {
            this._hasAttribLocation = true;
            this._attribs.push(info);
        };
        /**
         * Add data to buffer.
         * @param data
         */
        GLBuffer.prototype.pushBackData = function (data) {
            for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                var d = data_1[_i];
                this._data.push(d);
            }
        };
        /**
         * Upload buffer's data to GPU.
         */
        GLBuffer.prototype.upload = function () {
            TSEngine.gl.bindBuffer(this._targetBufferType, this._buffer);
            var bufferData;
            switch (this._dataType) {
                case TSEngine.gl.FLOAT:
                    bufferData = new Float32Array(this._data);
                    break;
                case TSEngine.gl.INT:
                    bufferData = new Int32Array(this._data);
                    break;
                case TSEngine.gl.UNSIGNED_INT:
                    bufferData = new Uint32Array(this._data);
                    break;
                case TSEngine.gl.SHORT:
                    bufferData = new Int16Array(this._data);
                    break;
                case TSEngine.gl.UNSIGNED_SHORT:
                    bufferData = new Uint16Array(this._data);
                    break;
                case TSEngine.gl.BYTE:
                    bufferData = new Int8Array(this._data);
                    break;
                case TSEngine.gl.UNSIGNED_BYTE:
                    bufferData = new Uint8Array(this._data);
                    break;
            }
            TSEngine.gl.bufferData(this._targetBufferType, bufferData, TSEngine.gl.STATIC_DRAW);
        };
        /**
         * Draws buffer
         */
        GLBuffer.prototype.draw = function () {
            if (this._targetBufferType === TSEngine.gl.ARRAY_BUFFER) {
                TSEngine.gl.drawArrays(this._mode, 0, this._data.length / this._elementSize);
            }
            else if (this._targetBufferType === TSEngine.gl.ELEMENT_ARRAY_BUFFER) {
                TSEngine.gl.drawElements(this._mode, this._data.length, this._dataType, 0);
            }
        };
        return GLBuffer;
    }());
    TSEngine.GLBuffer = GLBuffer;
})(TSEngine || (TSEngine = {}));
//# sourceMappingURL=app.js.map