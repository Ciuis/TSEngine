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
            // Load
            this._projection = TSEngine.Mat4x4.orthographic(0, this._canvas.width, 0, this._canvas.height, -100.0, 100.0);
            this._sprite = new TSEngine.Sprite("test");
            this._sprite.load();
            this._sprite.position.x = 200;
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
                TSEngine.gl.viewport(-1, 1, 1, -1);
            }
        };
        Engine.prototype.mainLoop = function () {
            TSEngine.gl.clear(TSEngine.gl.COLOR_BUFFER_BIT);
            // Set uniforms.
            var colorPosition = this._shader.getUniformLocation("u_color");
            TSEngine.gl.uniform4f(colorPosition, 1, 0.5, 0, 1);
            var projectionPosition = this._shader.getUniformLocation("u_projection");
            TSEngine.gl.uniformMatrix4fv(projectionPosition, false, new Float32Array(this._projection.data));
            var modelLocation = this._shader.getUniformLocation("u_model");
            TSEngine.gl.uniformMatrix4fv(modelLocation, false, new Float32Array(TSEngine.Mat4x4.translation(this._sprite.position).data));
            this._sprite.draw();
            requestAnimationFrame(this.mainLoop.bind(this));
        };
        Engine.prototype.loadShaders = function () {
            var vertexShaderSource = "\n                        attribute vec3 a_position;\n                        \n                        uniform mat4 u_projection;\n                        uniform mat4 u_model;\n                          \n                        void main() {\n                            gl_Position = u_projection * u_model * vec4(a_position, 1.0);\n                        }";
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
    var Sprite = /** @class */ (function () {
        function Sprite(name, width, height) {
            if (width === void 0) { width = 100; }
            if (height === void 0) { height = 100; }
            this.position = new TSEngine.Vec3();
            this._name = name;
            this._width = width;
            this._height = height;
        }
        Sprite.prototype.load = function () {
            this._buffer = new TSEngine.GLBuffer(3);
            var positionAttrib = new TSEngine.AttribInfo();
            positionAttrib.loc = 0;
            positionAttrib.offset = 0;
            positionAttrib.size = 3;
            this._buffer.addAttribLocation(positionAttrib);
            var vertices = [
                //x, y, z
                0.0, 0.0, 0.0,
                0.0, this._height, 0.0,
                this._width, this._height, 0.0,
                this._width, this._height, 0.0,
                this._width, 0.0, 0.0,
                0.0, 0.0, 0.0
            ];
            this._buffer.pushBackData(vertices);
            this._buffer.upload();
            this._buffer.unbind();
        };
        Sprite.prototype.update = function (time) {
        };
        Sprite.prototype.draw = function () {
            this._buffer.bind();
            this._buffer.draw();
        };
        return Sprite;
    }());
    TSEngine.Sprite = Sprite;
})(TSEngine || (TSEngine = {}));
var TSEngine;
(function (TSEngine) {
    var Mat4x4 = /** @class */ (function () {
        function Mat4x4() {
            this._data = [];
            this._data = [
                1.0, 0.0, 0.0, 0.0,
                0.0, 1.0, 0.0, 0.0,
                0.0, 0.0, 1.0, 0.0,
                0.0, 0.0, 0.0, 1.0
            ];
        }
        Object.defineProperty(Mat4x4.prototype, "data", {
            get: function () {
                return this._data;
            },
            enumerable: false,
            configurable: true
        });
        Mat4x4.identity = function () {
            return new Mat4x4();
        };
        Mat4x4.orthographic = function (left, right, bottom, top, nearClip, farClip) {
            var m = new Mat4x4();
            var lr = 1.0 / (left - right);
            var bt = 1.0 / (bottom - top);
            var nf = 1.0 / (nearClip - farClip);
            m._data[0] = -2.0 * lr;
            m._data[5] = -2.0 * bt;
            m._data[10] = 2.0 * nf;
            m._data[12] = (left + right) * lr;
            m._data[13] = (top + bottom) * bt;
            m._data[14] = (farClip + nearClip) * nf;
            return m;
        };
        Mat4x4.translation = function (position) {
            var m = new Mat4x4();
            m._data[12] = position.x;
            m._data[13] = position.y;
            m._data[14] = position.z;
            return m;
        };
        return Mat4x4;
    }());
    TSEngine.Mat4x4 = Mat4x4;
})(TSEngine || (TSEngine = {}));
var TSEngine;
(function (TSEngine) {
    var Vec3 = /** @class */ (function () {
        function Vec3(x, y, z) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            if (z === void 0) { z = 0; }
            this._x = x;
            this._y = y;
            this._z = z;
        }
        Object.defineProperty(Vec3.prototype, "x", {
            get: function () {
                return this._x;
            },
            set: function (value) {
                this._x = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Vec3.prototype, "y", {
            get: function () {
                return this._y;
            },
            set: function (value) {
                this._y = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Vec3.prototype, "z", {
            get: function () {
                return this._z;
            },
            set: function (value) {
                this._z = value;
            },
            enumerable: false,
            configurable: true
        });
        Vec3.prototype.toArray = function () {
            return [this._x, this._y, this._z];
        };
        Vec3.prototype.toFloat32Array = function () {
            return new Float32Array(this.toArray());
        };
        return Vec3;
    }());
    TSEngine.Vec3 = Vec3;
})(TSEngine || (TSEngine = {}));
//# sourceMappingURL=app.js.map