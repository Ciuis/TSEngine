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
            TSEngine.AssetManager.init();
            TSEngine.gl.clearColor(0, 0, 0, 1);
            this._basicShader = new TSEngine.BasicShader();
            this._basicShader.use();
            //Load materials
            TSEngine.MaterialManager.registerMaterial(new TSEngine.Material("crate", "assets/textures/crate.png", new TSEngine.Color(0, 128, 255, 255)));
            // Load
            this._projection = TSEngine.Mat4x4.orthographic(0, this._canvas.width, this._canvas.height, 0, -100.0, 100.0);
            this._sprite = new TSEngine.Sprite("test", "crate");
            this._sprite.load();
            this._sprite.position.x = 200;
            this._sprite.position.y = 100;
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
                TSEngine.gl.viewport(0, 0, TSEngine.gl.canvas.width, TSEngine.gl.canvas.height);
                this._projection = TSEngine.Mat4x4.orthographic(0, this._canvas.width, this._canvas.height, 0, -100.0, 100.0);
            }
        };
        Engine.prototype.mainLoop = function () {
            TSEngine.MessageBus.update(0);
            TSEngine.gl.clear(TSEngine.gl.COLOR_BUFFER_BIT);
            // Set uniforms.
            var projectionPosition = this._basicShader.getUniformLocation("u_projection");
            TSEngine.gl.uniformMatrix4fv(projectionPosition, false, new Float32Array(this._projection.data));
            this._sprite.draw(this._basicShader);
            requestAnimationFrame(this.mainLoop.bind(this));
        };
        return Engine;
    }());
    TSEngine.Engine = Engine;
})(TSEngine || (TSEngine = {}));
var TSEngine;
(function (TSEngine) {
    TSEngine.MESSAGE_ASSET_LOADER_ASSET_LOADED = "MESSAGE_ASSET_LOADER_ASSET_LOADED::";
    /**
     * Manage assets into engine.
     */
    var AssetManager = /** @class */ (function () {
        /** Private to enforce static method calls and prevent instantiation. */
        function AssetManager() {
        }
        /** Initialize manager */
        AssetManager.init = function () {
            AssetManager._loaders.push(new TSEngine.ImageAssetLoader());
        };
        /**
         * Register provided loader with asset manager.
         * @param loader The loader to register.
         */
        AssetManager.registerLoader = function (loader) {
            AssetManager._loaders.push(loader);
        };
        /** Callback made on asset loader when asset is loaded. */
        AssetManager.onAssetLoaded = function (asset) {
            AssetManager._loadedAssets[asset.name] = asset;
            TSEngine.Message.send(TSEngine.MESSAGE_ASSET_LOADER_ASSET_LOADED + asset.name, this, asset);
        };
        /**
         * Attempts to load asset using a registered asset loader.
         * @param assetName The name/url of asset to be loaded.
         */
        AssetManager.loadAsset = function (assetName) {
            var extension = assetName.split('.').pop().toLowerCase();
            for (var _i = 0, _a = AssetManager._loaders; _i < _a.length; _i++) {
                var l = _a[_i];
                if (l.supportedExtensions.indexOf(extension) !== -1) {
                    l.loadAsset(assetName);
                    return;
                }
            }
            console.warn("Unable to load asset with extension " + extension + " because there is no loader associated with it.");
        };
        /**
         * Indicates if an asset with provided name has been loaded.
         * @param assetName The name to check.
         */
        AssetManager.isAssetLoaded = function (assetName) {
            return AssetManager._loadedAssets[assetName] !== undefined;
        };
        AssetManager.getAsset = function (assetName) {
            if (AssetManager._loadedAssets[assetName] !== undefined) {
                return AssetManager._loadedAssets[assetName];
            }
            else {
                AssetManager.loadAsset(assetName);
            }
            return undefined;
        };
        AssetManager._loaders = [];
        AssetManager._loadedAssets = {};
        return AssetManager;
    }());
    TSEngine.AssetManager = AssetManager;
})(TSEngine || (TSEngine = {}));
var TSEngine;
(function (TSEngine) {
    var ImageAsset = /** @class */ (function () {
        function ImageAsset(name, data) {
            this.name = name;
            this.data = data;
        }
        Object.defineProperty(ImageAsset.prototype, "width", {
            get: function () {
                return this.data.width;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(ImageAsset.prototype, "height", {
            get: function () {
                return this.data.height;
            },
            enumerable: false,
            configurable: true
        });
        return ImageAsset;
    }());
    TSEngine.ImageAsset = ImageAsset;
    var ImageAssetLoader = /** @class */ (function () {
        function ImageAssetLoader() {
        }
        Object.defineProperty(ImageAssetLoader.prototype, "supportedExtensions", {
            get: function () {
                return ["png", "gif", "jpg"];
            },
            enumerable: false,
            configurable: true
        });
        ImageAssetLoader.prototype.loadAsset = function (assetName) {
            var image = new Image();
            image.onload = this.onImageLoaded.bind(this, assetName, image);
            image.src = assetName;
        };
        ImageAssetLoader.prototype.onImageLoaded = function (assetName, image) {
            console.log("onImageLoaded: assetName/image", assetName, image);
            var asset = new ImageAsset(assetName, image);
            TSEngine.AssetManager.onAssetLoaded(asset);
        };
        return ImageAssetLoader;
    }());
    TSEngine.ImageAssetLoader = ImageAssetLoader;
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
         */
        function Shader(name) {
            this._attrib = {};
            this._uniforms = {};
            this._name = name;
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
        Shader.prototype.load = function (vertexSrc, fragmentSrc) {
            var vertexShader = this.loadShader(vertexSrc, TSEngine.gl.VERTEX_SHADER);
            var fragmentShader = this.loadShader(fragmentSrc, TSEngine.gl.FRAGMENT_SHADER);
            this.createProgram(vertexShader, fragmentShader);
            this.detectAttributes();
            this.detectUniforms();
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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var TSEngine;
(function (TSEngine) {
    var BasicShader = /** @class */ (function (_super) {
        __extends(BasicShader, _super);
        function BasicShader() {
            var _this = _super.call(this, "basic") || this;
            _this.load(_this.getVertexSource(), _this.getFragmentSource());
            return _this;
        }
        BasicShader.prototype.getVertexSource = function () {
            return "\n                        attribute vec3 a_position;\n                        attribute vec2 a_texCoord;\n                        \n                        uniform mat4 u_projection;\n                        uniform mat4 u_model;\n                        \n                        varying vec2 v_texCoord;\n                          \n                        void main() {\n                            gl_Position = u_projection * u_model * vec4(a_position, 1.0);\n                            v_texCoord = a_texCoord;\n                        }";
        };
        BasicShader.prototype.getFragmentSource = function () {
            return "\n                        precision mediump float;\n                        \n                        uniform vec4 u_tint;\n                        uniform sampler2D u_diffuse;\n                        \n                        varying vec2 v_texCoord;\n                        \n                        void main() {\n                            gl_FragColor = u_tint * texture2D(u_diffuse, v_texCoord);\n                        }";
        };
        return BasicShader;
    }(TSEngine.Shader));
    TSEngine.BasicShader = BasicShader;
})(TSEngine || (TSEngine = {}));
var TSEngine;
(function (TSEngine) {
    var Color = /** @class */ (function () {
        function Color(r, g, b, a) {
            if (r === void 0) { r = 255; }
            if (g === void 0) { g = 255; }
            if (b === void 0) { b = 255; }
            if (a === void 0) { a = 255; }
            this._r = r;
            this._g = g;
            this._b = b;
            this._a = a;
        }
        Object.defineProperty(Color.prototype, "r", {
            // r
            get: function () {
                return this._r;
            },
            set: function (value) {
                this._r = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "rFloat", {
            get: function () {
                return this._r / 255.0;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "g", {
            // g
            get: function () {
                return this._g;
            },
            set: function (value) {
                this._g = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "gFloat", {
            get: function () {
                return this._g / 255.0;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "b", {
            //b
            get: function () {
                return this._b;
            },
            set: function (value) {
                this._b = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "bFloat", {
            get: function () {
                return this._b / 255.0;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "a", {
            //a
            get: function () {
                return this._a;
            },
            set: function (value) {
                this._a = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "aFloat", {
            get: function () {
                return this._a / 255.0;
            },
            enumerable: false,
            configurable: true
        });
        Color.prototype.toArray = function () {
            return [this._r, this._g, this._b, this._a];
        };
        Color.prototype.toFloatArray = function () {
            return [this._r / 255.0, this._g / 255.0, this._b / 255.0, this._a / 255.0];
        };
        Color.prototype.toFloat32Array = function () {
            return new Float32Array(this.toFloatArray());
        };
        Color.white = function () {
            return new Color(255, 255, 255, 255);
        };
        Color.black = function () {
            return new Color(0, 0, 0, 255);
        };
        Color.red = function () {
            return new Color(255, 0, 0, 255);
        };
        Color.green = function () {
            return new Color(0, 255, 0, 255);
        };
        Color.blue = function () {
            return new Color(0, 0, 255, 255);
        };
        return Color;
    }());
    TSEngine.Color = Color;
})(TSEngine || (TSEngine = {}));
var TSEngine;
(function (TSEngine) {
    var Material = /** @class */ (function () {
        function Material(name, diffuseTextureName, tint) {
            this._name = name;
            this._diffuseTextureName = diffuseTextureName;
            this._tint = tint;
            if (this._diffuseTextureName !== undefined) {
                this._diffuseTexture = TSEngine.TextureManager.getTexture(this._diffuseTextureName);
            }
        }
        Object.defineProperty(Material.prototype, "name", {
            get: function () {
                return this._name;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Material.prototype, "diffuseTextureName", {
            get: function () {
                return this._diffuseTextureName;
            },
            set: function (value) {
                if (this._diffuseTexture !== undefined) {
                    TSEngine.TextureManager.releaseTexture(this._diffuseTextureName);
                }
                this._diffuseTextureName = value;
                if (this._diffuseTextureName !== undefined) {
                    this._diffuseTexture = TSEngine.TextureManager.getTexture(this._diffuseTextureName);
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Material.prototype, "diffuseTexture", {
            get: function () {
                return this._diffuseTexture;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Material.prototype, "tint", {
            get: function () {
                return this._tint;
            },
            enumerable: false,
            configurable: true
        });
        Material.prototype.destroy = function () {
            TSEngine.TextureManager.releaseTexture(this._diffuseTextureName);
            this._diffuseTexture = undefined;
        };
        return Material;
    }());
    TSEngine.Material = Material;
})(TSEngine || (TSEngine = {}));
var TSEngine;
(function (TSEngine) {
    var MaterialReferenceNode = /** @class */ (function () {
        function MaterialReferenceNode(material) {
            this.referenceCount = 1;
            this.material = material;
        }
        return MaterialReferenceNode;
    }());
    var MaterialManager = /** @class */ (function () {
        function MaterialManager() {
        }
        MaterialManager.registerMaterial = function (material) {
            if (MaterialManager._materials[material.name] === undefined) {
                MaterialManager._materials[material.name] = new MaterialReferenceNode(material);
            }
        };
        MaterialManager.getMaterial = function (materialName) {
            if (MaterialManager._materials[materialName] === undefined) {
                return undefined;
            }
            else {
                MaterialManager._materials[materialName].referenceCount++;
                return MaterialManager._materials[materialName].material;
            }
        };
        MaterialManager.releaseMaterial = function (materialName) {
            if (MaterialManager._materials[materialName] === undefined) {
                console.warn("Cannot release  material which has not been registered");
            }
            else {
                MaterialManager._materials[materialName].referenceCount--;
                if (MaterialManager._materials[materialName].referenceCount < 1) {
                    MaterialManager._materials[materialName].material.destroy();
                    MaterialManager._materials[materialName].material = undefined;
                    delete MaterialManager._materials[materialName];
                }
            }
        };
        MaterialManager._materials = {};
        return MaterialManager;
    }());
    TSEngine.MaterialManager = MaterialManager;
})(TSEngine || (TSEngine = {}));
var TSEngine;
(function (TSEngine) {
    /**
     * 2-d sprite to be drawn on the screen.
     */
    var Sprite = /** @class */ (function () {
        /**
         * Creating new sprite.
         * @param name The name of sprite.
         * @param materialName The name of material to use in sprite.
         * @param width The width of sprite.
         * @param height The height of sprite.
         */
        function Sprite(name, materialName, width, height) {
            if (width === void 0) { width = 100; }
            if (height === void 0) { height = 100; }
            /**
             * Position on the screen..
             */
            this.position = new TSEngine.Vec3();
            this._name = name;
            this._width = width;
            this._height = height;
            this._materialName = materialName;
            this._material = TSEngine.MaterialManager.getMaterial(this._materialName);
        }
        Object.defineProperty(Sprite.prototype, "name", {
            get: function () {
                return this._name;
            },
            enumerable: false,
            configurable: true
        });
        Sprite.prototype.destroy = function () {
            this._buffer.destroy();
            TSEngine.MaterialManager.releaseMaterial(this._materialName);
            this._material = undefined;
            this._materialName = undefined;
        };
        /**
         * Loading routines on sprite
         */
        Sprite.prototype.load = function () {
            this._buffer = new TSEngine.GLBuffer(5);
            var positionAttrib = new TSEngine.AttribInfo();
            positionAttrib.loc = 0;
            positionAttrib.offset = 0;
            positionAttrib.size = 3;
            this._buffer.addAttribLocation(positionAttrib);
            var texCoordAttrib = new TSEngine.AttribInfo();
            texCoordAttrib.loc = 1;
            texCoordAttrib.offset = 3;
            texCoordAttrib.size = 2;
            this._buffer.addAttribLocation(texCoordAttrib);
            var vertices = [
                //x, y, z       ,u, v
                0.0, 0.0, 0.0, 0.0, 0.0,
                0.0, this._height, 0.0, 0.0, 1.0,
                this._width, this._height, 0.0, 1.0, 1.0,
                this._width, this._height, 0.0, 1.0, 1.0,
                this._width, 0.0, 0.0, 1.0, 0.0,
                0.0, 0.0, 0.0, 0.0, 0.0
            ];
            this._buffer.pushBackData(vertices);
            this._buffer.upload();
            this._buffer.unbind();
        };
        /**
         * Updates routines of sprite.
         * @param time The delta time in milliseconds since last update call.
         */
        Sprite.prototype.update = function (time) {
        };
        Sprite.prototype.draw = function (shader) {
            var modelLocation = shader.getUniformLocation("u_model");
            TSEngine.gl.uniformMatrix4fv(modelLocation, false, new Float32Array(TSEngine.Mat4x4.translation(this.position).data));
            var colorLocation = shader.getUniformLocation("u_tint");
            TSEngine.gl.uniform4fv(colorLocation, this._material.tint.toFloat32Array());
            if (this._material.diffuseTexture !== undefined) {
                this._material.diffuseTexture.activateAndBind(0);
                var diffuseLocation = shader.getUniformLocation("u_diffuse");
                TSEngine.gl.uniform1i(diffuseLocation, 0);
            }
            this._buffer.bind();
            this._buffer.draw();
        };
        return Sprite;
    }());
    TSEngine.Sprite = Sprite;
})(TSEngine || (TSEngine = {}));
var TSEngine;
(function (TSEngine) {
    var LEVEL = 0;
    var BORDER = 0;
    var TEMP_IMAGE_DATA = new Uint8Array([255, 255, 255, 255]);
    var Texture = /** @class */ (function () {
        function Texture(name, width, height) {
            if (width === void 0) { width = 1; }
            if (height === void 0) { height = 1; }
            this._isLoaded = false;
            this._name = name;
            this._width = width;
            this._height = height;
            this._handle = TSEngine.gl.createTexture();
            TSEngine.Message.subscribe(TSEngine.MESSAGE_ASSET_LOADER_ASSET_LOADED + this._name, this);
            this.bind();
            TSEngine.gl.texImage2D(TSEngine.gl.TEXTURE_2D, LEVEL, TSEngine.gl.RGBA, 1, 1, BORDER, TSEngine.gl.RGBA, TSEngine.gl.UNSIGNED_BYTE, TEMP_IMAGE_DATA);
            var asset = TSEngine.AssetManager.getAsset(this.name);
            if (asset !== undefined) {
                this.loadTextureFromAsset(asset);
            }
        }
        Object.defineProperty(Texture.prototype, "name", {
            get: function () {
                return this._name;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Texture.prototype, "isLoaded", {
            get: function () {
                return this._isLoaded;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Texture.prototype, "width", {
            get: function () {
                return this._width;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Texture.prototype, "height", {
            get: function () {
                return this._height;
            },
            enumerable: false,
            configurable: true
        });
        Texture.prototype.destroy = function () {
            TSEngine.gl.deleteTexture(this._handle);
        };
        Texture.prototype.activateAndBind = function (textureUnit) {
            if (textureUnit === void 0) { textureUnit = 0; }
            TSEngine.gl.activeTexture(TSEngine.gl.TEXTURE0 + textureUnit);
            this.bind();
        };
        Texture.prototype.bind = function () {
            TSEngine.gl.bindTexture(TSEngine.gl.TEXTURE_2D, this._handle);
        };
        Texture.prototype.unbind = function () {
            TSEngine.gl.bindTexture(TSEngine.gl.TEXTURE_2D, undefined);
        };
        Texture.prototype.onMessage = function (message) {
            if (message.code === TSEngine.MESSAGE_ASSET_LOADER_ASSET_LOADED + this._name) {
                this.loadTextureFromAsset(message.context);
            }
        };
        Texture.prototype.loadTextureFromAsset = function (asset) {
            this._width = asset.width;
            this._height = asset.height;
            this.bind();
            TSEngine.gl.texImage2D(TSEngine.gl.TEXTURE_2D, LEVEL, TSEngine.gl.RGBA, TSEngine.gl.RGBA, TSEngine.gl.UNSIGNED_BYTE, asset.data);
            if (this.isPowerOf2()) {
                TSEngine.gl.generateMipmap(TSEngine.gl.TEXTURE_2D);
            }
            else {
                /** Do not generate a mipmap and clamp wrapping to edge. */
                TSEngine.gl.texParameteri(TSEngine.gl.TEXTURE_2D, TSEngine.gl.TEXTURE_WRAP_S, TSEngine.gl.CLAMP_TO_EDGE);
                TSEngine.gl.texParameteri(TSEngine.gl.TEXTURE_2D, TSEngine.gl.TEXTURE_WRAP_T, TSEngine.gl.CLAMP_TO_EDGE);
                TSEngine.gl.texParameteri(TSEngine.gl.TEXTURE_2D, TSEngine.gl.TEXTURE_MIN_FILTER, TSEngine.gl.LINEAR);
            }
            this._isLoaded = true;
        };
        Texture.prototype.isPowerOf2 = function () {
            return (this.isValuePowerOf2(this._width) && this.isValuePowerOf2(this._height));
        };
        Texture.prototype.isValuePowerOf2 = function (value) {
            return (value & (value - 1)) == 0;
        };
        return Texture;
    }());
    TSEngine.Texture = Texture;
})(TSEngine || (TSEngine = {}));
var TSEngine;
(function (TSEngine) {
    var TextureReferenceNode = /** @class */ (function () {
        function TextureReferenceNode(texture) {
            this.referenceCount = 1;
            this.texture = texture;
        }
        return TextureReferenceNode;
    }());
    var TextureManager = /** @class */ (function () {
        function TextureManager() {
        }
        TextureManager.getTexture = function (textureName) {
            if (TextureManager._textures[textureName] === undefined) {
                var texture = new TSEngine.Texture(textureName);
                TextureManager._textures[textureName] = new TextureReferenceNode(texture);
            }
            else {
                TextureManager._textures[textureName].referenceCount++;
            }
            return TextureManager._textures[textureName].texture;
        };
        TextureManager.releaseTexture = function (textureName) {
            if (TextureManager._textures[textureName] === undefined) {
                console.warn("A texture named ".concat(textureName, " doesn't exist and cannot be released."));
            }
            else {
                TextureManager._textures[textureName].referenceCount--;
                if (TextureManager._textures[textureName].referenceCount < 1) {
                    TextureManager._textures[textureName].texture.destroy();
                    TextureManager._textures[textureName] = undefined;
                    delete TextureManager._textures[textureName];
                }
            }
        };
        TextureManager._textures = {};
        return TextureManager;
    }());
    TSEngine.TextureManager = TextureManager;
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
    /**
     * Two component vector (x, y).
     */
    var Vec2 = /** @class */ (function () {
        /**
         * Creates new vec2.
         * @param x The x component.
         * @param y The y component.
         */
        function Vec2(x, y) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            this._x = x;
            this._y = y;
        }
        Object.defineProperty(Vec2.prototype, "x", {
            get: function () {
                return this._x;
            },
            set: function (value) {
                this._x = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Vec2.prototype, "y", {
            get: function () {
                return this._y;
            },
            set: function (value) {
                this._y = value;
            },
            enumerable: false,
            configurable: true
        });
        Vec2.prototype.toArray = function () {
            return [this._x, this._y];
        };
        Vec2.prototype.toFloat32Array = function () {
            return new Float32Array(this.toArray());
        };
        return Vec2;
    }());
    TSEngine.Vec2 = Vec2;
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
var TSEngine;
(function (TSEngine) {
    var MessagePriority;
    (function (MessagePriority) {
        MessagePriority[MessagePriority["NORMAL"] = 0] = "NORMAL";
        MessagePriority[MessagePriority["HIGH"] = 1] = "HIGH";
    })(MessagePriority = TSEngine.MessagePriority || (TSEngine.MessagePriority = {}));
    var Message = /** @class */ (function () {
        function Message(code, sender, context, priority) {
            if (priority === void 0) { priority = MessagePriority.NORMAL; }
            this.code = code;
            this.sender = sender;
            this.context = context;
            this.priority = priority;
        }
        Message.send = function (code, sender, context) {
            TSEngine.MessageBus.post(new Message(code, sender, context, MessagePriority.NORMAL));
        };
        Message.sendPriority = function (code, sender, context) {
            TSEngine.MessageBus.post(new Message(code, sender, context, MessagePriority.HIGH));
        };
        Message.subscribe = function (code, handler) {
            TSEngine.MessageBus.addSubscription(code, handler);
        };
        Message.unsubscribe = function (code, handler) {
            TSEngine.MessageBus.removeSubscription(code, handler);
        };
        return Message;
    }());
    TSEngine.Message = Message;
})(TSEngine || (TSEngine = {}));
var TSEngine;
(function (TSEngine) {
    /** Message manager responsible for sending messages across the system. */
    var MessageBus = /** @class */ (function () {
        /** Hidden constructor to prevent instantiation. */
        function MessageBus() {
        }
        /**
         * Add a subscription to code using provided handler.
         * @param code The code to listen for.
         * @param handler The handler to be subscribed.
         */
        MessageBus.addSubscription = function (code, handler) {
            if (MessageBus._subscriptions[code] === undefined) {
                MessageBus._subscriptions[code] = [];
            }
            if (MessageBus._subscriptions[code].indexOf(handler) !== -1) {
                console.warn("Attempting to add a duplicate handler to code: " + code + ". Subscription not added.");
            }
            else {
                MessageBus._subscriptions[code].push(handler);
            }
        };
        /**
         * Remove subscription from code using provided handler.
         * @param code The code to listen for.
         * @param handler The handler to be removed.
         */
        MessageBus.removeSubscription = function (code, handler) {
            if (MessageBus._subscriptions[code] === undefined) {
                console.warn("Cannot unsubscribe handler from code: " + code + ". Because that code is not subscribed.");
                return;
            }
            var nodeIndex = MessageBus._subscriptions[code].indexOf(handler);
            if (nodeIndex !== -1) {
                MessageBus._subscriptions[code].splice(nodeIndex, 1);
            }
        };
        /**
         * Posts message to message system.
         * @param message The message to be sent.
         */
        MessageBus.post = function (message) {
            console.log("Message posted: ", message);
            var handlers = MessageBus._subscriptions[message.code];
            if (handlers === undefined) {
                return;
            }
            for (var _i = 0, handlers_1 = handlers; _i < handlers_1.length; _i++) {
                var h = handlers_1[_i];
                if (message.priority === TSEngine.MessagePriority.HIGH) {
                    h.onMessage(message);
                }
                else {
                    MessageBus._normalMessageQueue.push(new TSEngine.MessageSubscriptionNode(message, h));
                }
            }
        };
        MessageBus.update = function (time) {
            if (MessageBus._normalMessageQueue.length === 0) {
                return;
            }
            var messageLimit = Math.min(MessageBus._normalQueueMessagePerUpdate, MessageBus._normalMessageQueue.length);
            for (var i = 0; i < messageLimit; ++i) {
                var node = MessageBus._normalMessageQueue.pop();
                node.handler.onMessage(node.message);
            }
        };
        MessageBus._subscriptions = {};
        MessageBus._normalQueueMessagePerUpdate = 10;
        MessageBus._normalMessageQueue = [];
        return MessageBus;
    }());
    TSEngine.MessageBus = MessageBus;
})(TSEngine || (TSEngine = {}));
var TSEngine;
(function (TSEngine) {
    var MessageSubscriptionNode = /** @class */ (function () {
        function MessageSubscriptionNode(message, handler) {
            this.message = message;
            this.handler = handler;
        }
        return MessageSubscriptionNode;
    }());
    TSEngine.MessageSubscriptionNode = MessageSubscriptionNode;
})(TSEngine || (TSEngine = {}));
//# sourceMappingURL=app.js.map