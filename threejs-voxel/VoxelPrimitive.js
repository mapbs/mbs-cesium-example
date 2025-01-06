
/**
 * 此为开源版代码 禁止下载后售卖
 * 
 * 商务合作qq：274113729
 * 闲鱼号：图界mbs
 * 
 * B站地址：https://space.bilibili.com/43506538
 * gitee地址：https://gitee.com/mapbs
 * github地址：https://github.com/mapbs
 */
var Check = Cesium.Check;
var createGuid = Cesium.createGuid;
var defaultValue = Cesium.defaultValue;
var defined = Cesium.defined;
var destroyObject = Cesium.destroyObject;
var DeveloperError = Cesium.DeveloperError;
var PixelFormat = Cesium.PixelFormat;
var ContextLimits = Cesium.ContextLimits;
var PixelDatatype = Cesium.PixelDatatype;
var Sampler = Cesium.Sampler;
var Cartesian3 = Cesium.Cartesian3;
function Texture3D(options) {
    options = defaultValue(options, defaultValue.EMPTY_OBJECT);

    Check.defined("options.context", options.context);

    const context = options.context;
    let width = options.width;
    let height = options.height;
    let depth = options.depth;
    let source = options.source;

    const pixelFormat = defaultValue(options.pixelFormat, PixelFormat.RGBA);
    const pixelDatatype = defaultValue(options.pixelDataType, PixelDatatype.UNSIGNED_BYTE);
    const internalFormat = PixelFormat.toInternalFormat(pixelFormat, pixelDatatype, context);

    if (!defined(width) || !defined(height) || !defined(depth)) {
        throw new DeveloperError(
            "options requires a source field to create an 3d texture. width or height or dimension fileds"
        )
    }

    Check.typeOf.number.greaterThan("width", width, 0);

    if (width > ContextLimits.maximumTextureSize) {
        throw new DeveloperError(
            "width must be less than or equal to the maximum texture size"
        );
    }

    Check.typeOf.number.greaterThan("height", height, 0);

    if (height > ContextLimits.maximumTextureSize) {
        throw new DeveloperError(
            "height must be less than or equal to the maximum texture size"
        );
    }

    Check.typeOf.number.greaterThan("dimensions", depth, 0);

    if (depth > ContextLimits.maximumTextureSize) {
        throw new DeveloperError(
            "dimension must be less than or equal to the maximum texture size"
        );
    }

    if (!PixelFormat.validate(pixelFormat)) {
        throw new DeveloperError("Invalid options.pixelFormat.");
    }

    if (!PixelDatatype.validate(pixelDatatype)) {
        throw new DeveloperError("Invalid options.pixelDatatype.");
    }

    let initialized = true;
    const gl = context._gl;
    const textureTarget = gl.TEXTURE_3D;
    const texture = gl.createTexture();

    const lxs= gl.getParameter(gl.ACTIVE_TEXTURE);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(textureTarget, texture);
    let unpackAlignment = 4;
    if (defined(source) && defined(source.arrayBufferView)) {
        unpackAlignment = PixelFormat.alignmentInBytes(pixelFormat, pixelDatatype, width);//??
    }

    gl.pixelStorei(gl.UNPACK_ALIGNMENT, unpackAlignment);
    gl.pixelStorei(
        gl.UNPACK_COLORSPACE_CONVERSION_WEBGL,
        gl.BROWSER_DEFAULT_WEBGL
    );

    if (defined(source)) {
        if (defined(source.arrayBufferView)) {
            let arrayBufferView = source.arrayBufferView;
            gl.texImage3D(
                textureTarget,
                0,
                internalFormat,
                width,
                height,
                depth,
                0,//border
                pixelFormat,
                PixelDatatype.toWebGLConstant(pixelDatatype, context),
                arrayBufferView
            );
            initialized = true;
        }
    }
    gl.bindTexture(textureTarget, null);
    this._id = createGuid();
    this._context = context;
    this._textureFilterAnisotropic = context._textureFilterAnisotropic;
    this._textureTarget = textureTarget;
    this._texture = texture;
    this._internalFormat = internalFormat;
    this._pixelFormat = pixelFormat;
    this._pixelDatatype = pixelDatatype;
    this._width = width;
    this._height = height;
    this._depth = depth;
    this._dimensions = new Cartesian3(width, height, depth);
    this._hasMinmap = false;
    this._sizeInBytes = 4;
    this._preMultiplyAlpha = false;
    this._flipY = false;
    this._initialized = initialized;
    this._sampler = undefined;

    this.sampler = defined(options.sampler) ? options.sampler : new Sampler();
}

// Creates a texture, and copies a subimage of the framebuffer to it.
Texture3D.fromFramebuffer = function (options) {
    options = defaultValue(options, defaultValue.EMPTY_OBJECT);
    Check.defined("options.context", options.context);

    const context = options.context;
    const gl = context._gl;

    const pixelFormat = defaultValue(options.pixelFormat, PixelFormat.RGB);
    const framebufferXOffset = defaultValue(options.framebufferXOffset, 0);
    const framebufferYOffset = defaultValue(options.framebufferYOffset, 0);
    const width = defaultValue(options.width, gl.drawingBufferWidth);
    const height = defaultValue(options.height, gl.drawingBufferHeight);
    const depth = defaultValue(options.depth, 128);
    const framebuffer = options.framebuffer;

    const texture=new Texture3D({
        context:context,
        width:width,
        height:height,
        pixelFormat:pixelFormat,
        source:{
            framebuffer:defined(framebuffer)?framebuffer:context.defaultFramebuffer,
            width:width,
            height:height,
            depth:depth,
        }
    });
    return texture;
};

Object.defineProperties(Texture3D.prototype,{
    id:{
        get:function(){
            return this._id;
        }
    },
    sampler:{
        get:function(){
            return this._sampler;
        },
        set:function(sampler){
            let minificationFilter=sampler.minificationFilter;
            let magnificationFilter=sampler.magnificationFilter;
            const context=this._context;
            const pixelFormat=this._pixelFormat;
            const pixelDatatype=this._pixelDatatype;

            const gl=context._gl;
            const target=this._textureTarget;

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(target,this._texture);
            // 3D 纹理不设置放大，缩小，重采样
            gl.texParameteri(target,gl.TEXTURE_MIN_FILTER,minificationFilter);
            gl.texParameteri(target,gl.TEXTURE_MAG_FILTER,magnificationFilter);
            gl.bindTexture(target,null);
            
            this._sampler=sampler;
        }
    },
    dimensions:{
        get:function(){
            return this._dimensions;
        }
    },
    width:{
        get:function(){
            return this._width;
        }
    },
    height:{
        get:function(){
            return this._height;
        }
    },
    depth:{
        get:function(){
            return this._depth;
        }
    },
    _target:{
        get:function(){
            return this._textureTarget;
        }
    }
});

Texture3D.prototype.isDestroyed=function(){
    return false;
}

Texture3D.prototype.destory=function(){
    this._context._gl.deleteTexture(this._texture);
    return destroyObject(this);
};
const vertexShaderSource = `
in vec3 position;
in vec2 st;

out vec3 vOrigin;
out vec3 vDirection;
out vec2 vst;

void main()
{    
  vOrigin=czm_encodedCameraPositionMCHigh+czm_encodedCameraPositionMCLow;
  vDirection=position-vOrigin;
  vst=st;

  gl_Position = czm_modelViewProjection * vec4(position,1.0);
}
`;


/**
 * 此为开源版代码 禁止下载后售卖
 * 
 * 商务合作qq：274113729
 * 闲鱼号：图界mbs
 * 
 * B站地址：https://space.bilibili.com/43506538
 * gitee地址：https://gitee.com/mapbs
 * github地址：https://github.com/mapbs
 */
class VoxelPrimitive {
    constructor(options) {
        this.drawCommand = undefined;

        if (Cesium.defined(options)) {
            this.modelMatrix = options.modelMatrix;
            this.geometry_lxs = options.geometry_lxs;
            this.data = options.data;
            this.halfdim = new Cesium.Cartesian3();
            this.size = options.size;
            this.params = options.params;

            this.fragmentShaderSource = options.fragmentShaderSource;
            Cesium.Cartesian3.divideByScalar(options.dim, 2, this.halfdim);
        }
    }
    createCommand(context) {
        if (!Cesium.defined(this.geometry_lxs)) return;
        const geometry = Cesium.BoxGeometry.createGeometry(this.geometry_lxs);
        //const geometry = Cesium.EllipsoidGeometry.createGeometry(this.geometry_lxs);
        const attributelocations =
            Cesium.GeometryPipeline.createAttributeLocations(geometry);
        this.vertexarray = Cesium.VertexArray.fromGeometry({
            context: context,
            geometry: geometry,
            attributes: attributelocations,
        });
        const renderstate = Cesium.RenderState.fromCache({
            depthTest: {
                enabled: true,
            },
            cull: {
                enabled: true,
                face: Cesium.CullFace.BACK
            }
        });
        
        const shaderProgram = Cesium.ShaderProgram.fromCache({
            context: context,
            vertexShaderSource: vertexShaderSource,
            fragmentShaderSource: this.fragmentShaderSource,
            attributeLocations: attributelocations,
        });
        const that = this;
        //------------------------------
        //shadertoy 火特效
        // let terrainMap = viewer.scene.frameState.context.defaultTexture;
        // Cesium.Resource.fetchImage({
        //     url: 'iChannel1.png'
        // }).then((image) => {
        //     terrainMap = new Cesium.Texture({
        //         context: viewer.scene.frameState.context,
        //         source: image,
        //         sampler: new Cesium.Sampler({
        //             wrapS: Cesium.TextureWrap.REPEAT,
        //             wrapT: Cesium.TextureWrap.REPEAT,
        //             magnificationFilter: Cesium.TextureMagnificationFilter.LINEAR,
        //             minificationFilter: Cesium.TextureMinificationFilter.LINEAR_MIPMAP_LINEAR
        //         })
        //     });
        //     terrainMap.generateMipmap();
        // });
        // let terrainMap2 = viewer.scene.frameState.context.defaultTexture;
        // Cesium.Resource.fetchImage({
        //     url: 'iChannel2.png'
        // }).then((image) => {
        //     terrainMap2 = new Cesium.Texture({
        //         context: viewer.scene.frameState.context,
        //         source: image,
        //         sampler: new Cesium.Sampler({
        //             wrapS: Cesium.TextureWrap.REPEAT,
        //             wrapT: Cesium.TextureWrap.REPEAT,
        //             magnificationFilter: Cesium.TextureMagnificationFilter.LINEAR,
        //             minificationFilter: Cesium.TextureMinificationFilter.LINEAR_MIPMAP_LINEAR
        //         })
        //     });
        //     terrainMap2.generateMipmap();
        // });
        //--------------------------------
        let current = performance.now();
        const uniformap = {
            slice_size() {
                return size;
            },
            volumnTexture_lxs() {
                return that.getTexture(context);
            },
            halfdim() {
                return that.halfdim;
            },

            base(){ return new Cesium.Color(121/255,138/255,160/255); },
            // threshold(){ return 0.25; },
            // opacity(){ return 0.05; },
            // range() { return 0.1; },
            // steps(){ return 200; },
            // frame(){ return 0; }
            threshold(){ return that.params.threshold; },
            //清晰度
            opacity(){ return that.params.opacity; },
            //模糊度
            range() { return that.params.range; },
            steps(){ return that.params.steps; },
            frame(){ return that.params.frame; },

            iTime:function(){
                return (performance.now() - current)/1000
            },
            // iChannel0:function(){
            //     return terrainMap;
            // },
            // iChannel2:function(){
            //     return terrainMap2;
            // }
        };

        this.drawCommand = new Cesium.DrawCommand({
            boundingVolume: this.geometry_lxs.boundingSphere,
            modelMatrix: this.modelMatrix,
            pass: Cesium.Pass.OPAQUE,
            //pass: Cesium.Pass.TRANSLUCENT,
            shaderProgram: shaderProgram,
            renderState: renderstate,
            vertexArray: this.vertexarray,
            uniformMap: uniformap,
        });
    }
    
    getTexture(context) {
        let size = this.size;
        if (!this.texture) {
            const texture_size = Math.ceil(Math.sqrt(this.data.length));
            this.texture = new Texture3D({
                width: size,
                height: size,
                depth: size,
                context: context,
                flipY: false,
                pixelFormat: Cesium.PixelFormat.ALPHA,
                pixelDataType: Cesium.ComponentDatatype.fromTypedArray(this.data),
                source: {
                    width: texture_size,
                    height: texture_size,
                    arrayBufferView: this.data,
                },
                sampler: new Cesium.Sampler({
                    minificationFilter: Cesium.TextureMinificationFilter.LINEAR,
                    magnificationFilter: Cesium.TextureMagnificationFilter.LINEAR,
                    // minificationFilter: Cesium.TextureMinificationFilter.Nearest,
                    // magnificationFilter: Cesium.TextureMagnificationFilter.Nearest,
                }),
            });
        }

        return this.texture;
    }
    update(frameState) {
        if (!this.drawCommand) {
            this.createCommand(frameState.context);
        }
        frameState.commandList.push(this.drawCommand);
    }
    isDestroyed(){

    }
}
