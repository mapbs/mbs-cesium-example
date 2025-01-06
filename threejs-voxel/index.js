
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
(function () {
  //请修改为你自己的cesium-ion token
  Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkYWNmOTc1NC02N2U0LTQzZGMtOGRhNC1lOTJjNjFiMWIzZjgiLCJpZCI6MTMzMzE0LCJpYXQiOjE3MTM4NDk4NzJ9.uIiDvn99Slv79KZrGoMizfV3hGvuWNZq3c_50IRXE-c'
  //----------------------------------------------------------------------------------------------------
  resizeWindow();
  let viewer = mbs.utils.initMap("map");

  //定位
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(109.9, 40, 50000),
    orientation: {
      heading: Cesium.Math.toRadians(-0),
      pitch: Cesium.Math.toRadians(-90),
      roll: 0.0,
    },
  });

  setThreejsVolumn(viewer);
})();

function setThreejsVolumn(viewer){
  const fragmentShaderSource = `
precision highp float;
precision highp sampler3D;

uniform float slice_size;
uniform sampler3D volumnTexture_lxs;
uniform vec3 halfdim;

out vec4 color;

in vec3 vOrigin;
in vec3 vDirection;
in vec2 vst;

uniform float threshold;
uniform float steps;

vec2 hitBox( vec3 orig, vec3 dir ) {
    vec3 box_min = vec3( -halfdim );
    vec3 box_max = vec3( halfdim );
    vec3 inv_dir = 1.0 / dir;
    vec3 tmin_tmp = ( box_min - orig ) * inv_dir;
    vec3 tmax_tmp = ( box_max - orig ) * inv_dir;
    vec3 tmin = min( tmin_tmp, tmax_tmp );
    vec3 tmax = max( tmin_tmp, tmax_tmp );
    float t0 = max( tmin.x, max( tmin.y, tmin.z ) );
    float t1 = min( tmax.x, min( tmax.y, tmax.z ) );
    return vec2( t0, t1 );
}

float getData(vec3 pos_lxs){
    vec3 pos=pos_lxs/(halfdim*2.);
    
    return texture(volumnTexture_lxs,pos).a;
}

#define epsilon 0.0001
vec3 normal( vec3 coord ) {
    if ( coord.x < epsilon ) return vec3( 1.0, 0.0, 0.0 );
    if ( coord.y < epsilon ) return vec3( 0.0, 1.0, 0.0 );
    if ( coord.z < epsilon ) return vec3( 0.0, 0.0, 1.0 );
    if ( coord.x > 1.0 - epsilon ) return vec3( - 1.0, 0.0, 0.0 );
    if ( coord.y > 1.0 - epsilon ) return vec3( 0.0, - 1.0, 0.0 );
    if ( coord.z > 1.0 - epsilon ) return vec3( 0.0, 0.0, - 1.0 );

    float step = 0.01;
    float x = getData( coord + vec3( - step, 0.0, 0.0 ) ) - getData( coord + vec3( step, 0.0, 0.0 ) );
    float y = getData( coord + vec3( 0.0, - step, 0.0 ) ) - getData( coord + vec3( 0.0, step, 0.0 ) );
    float z = getData( coord + vec3( 0.0, 0.0, - step ) ) - getData( coord + vec3( 0.0, 0.0, step ) );

    return normalize( vec3( x, y, z ) );
}

void main()
{
    vec3 rayDir=normalize(vDirection);
    vec2 bounds=hitBox(vOrigin,rayDir);

    if(bounds.x>bounds.y) discard;
    bounds.x=max(bounds.x,0.0);

    vec3 p=vOrigin+bounds.x*rayDir;
    vec3 inc=1.0/abs(rayDir);
    float delta=min(inc.x,min(inc.y,inc.z));
    delta/=steps;

    for ( float t = bounds.x; t < bounds.y; t += delta ){
        float d=getData(p+halfdim);
        if(d>threshold){
            color.rgb=normal(p+0.5)*0.5+(p*1.5+0.25);
            // color=vec4(d);
            color.a=1.;
            break;
        }
        p+=rayDir*delta;
    }

    if(color.a==0.) discard;
}
`;
      const fragmentShaderSource2 = `
precision highp float;
precision highp sampler3D;

uniform float slice_size;
uniform sampler3D volumnTexture_lxs;
uniform vec3 halfdim;

out vec4 color;

in vec3 vOrigin;
in vec3 vDirection;
in vec2 vst;

uniform vec3 base;
uniform float threshold;
uniform float range;
uniform float opacity;
uniform float steps;
uniform float frame;

uint wang_hash(uint seed)
{
        seed = (seed ^ 61u) ^ (seed >> 16u);
        seed *= 9u;
        seed = seed ^ (seed >> 4u);
        seed *= 0x27d4eb2du;
        seed = seed ^ (seed >> 15u);
        return seed;
}

float randomFloat(inout uint seed)
{
        return float(wang_hash(seed)) / 4294967296.;
}

vec2 hitBox( vec3 orig, vec3 dir ) {
    vec3 box_min = vec3( -halfdim );
    vec3 box_max = vec3( halfdim );
    vec3 inv_dir = 1.0 / dir;
    vec3 tmin_tmp = ( box_min - orig ) * inv_dir;
    vec3 tmax_tmp = ( box_max - orig ) * inv_dir;
    vec3 tmin = min( tmin_tmp, tmax_tmp );
    vec3 tmax = max( tmin_tmp, tmax_tmp );
    float t0 = max( tmin.x, max( tmin.y, tmin.z ) );
    float t1 = min( tmax.x, min( tmax.y, tmax.z ) );
    return vec2( t0, t1 );
}

float getData(vec3 pos_lxs){
    vec3 pos=pos_lxs/(halfdim*2.);
    
    return texture(volumnTexture_lxs,pos).a;
    //return texture(volumnTexture_lxs,pos_lxs).a;
}

float shading( vec3 coord ) {
    float step = 0.01;
    return getData( coord + vec3( - step ) ) - getData( coord + vec3( step ) );
}

vec4 linearToSRGB( in vec4 value ) {
    return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}

void main(){
    vec3 rayDir = normalize( vDirection );
    vec2 bounds = hitBox( vOrigin, rayDir );
    if ( bounds.x > bounds.y ) discard;
    bounds.x = max( bounds.x, 0.0 );
    vec3 p = vOrigin + bounds.x * rayDir;
    vec3 inc = 1.0 / abs( rayDir );
    float delta = min( inc.x, min( inc.y, inc.z ) );
    delta /= steps;

    // Jitter

    // Nice little seed from
    // https://blog.demofox.org/2020/05/25/casual-shadertoy-path-tracing-1-basic-camera-diffuse-emissive/
    uint seed = uint( gl_FragCoord.x ) * uint( 1973 ) + uint( gl_FragCoord.y ) * uint( 9277 ) + uint( frame ) * uint( 26699 );
    vec3 size = vec3( textureSize( volumnTexture_lxs, 0 ) );
    float randNum = randomFloat( seed ) * 2.0 - 1.0;
    p += rayDir * randNum * ( 1.0 / size );
    vec4 ac = vec4( base, 0.0 );
    for ( float t = bounds.x; t < bounds.y; t += delta ) {
        float d = getData( p + 0.5 );
        d = smoothstep( threshold - range, threshold + range, d ) * opacity;
        float col = shading( p + 0.5 ) * 3.0 + ( ( p.x + p.y ) * 0.25 ) + 0.2;
        ac.rgb += ( 1.0 - ac.a ) * d * col;
        ac.a += ( 1.0 - ac.a ) * d;
        if ( ac.a >= 0.95 ) break;
        p += rayDir * delta;
    }
    color = linearToSRGB( ac );
    if ( color.a == 0.0 ) discard;
}
`;

this.cloudParams= {
  threshold: 0.25,
  opacity: 0.25,
  range: 0.1,
  steps: 200,
  frame: 0,
  x: 1,
  y: 1,
  z: 1,
};
this.perlinParams={
  threshold: 0.6,
  steps: 200,
};
// 创建dat.GUI实例
var gui = new dat.GUI();

let f = gui.addFolder('cloud设置');
f.add(this.cloudParams,'threshold',0,1);
f.add(this.cloudParams,'opacity',0,1);
f.add(this.cloudParams,'range',0,1);
f.add(this.cloudParams,'steps',0,300);
f.open();

let f1 = gui.addFolder('perlin设置');
f1.add(this.perlinParams,'threshold',0,1);
f1.add(this.perlinParams,'steps',0,300);
f1.open();
      const dim_lxs = new Cesium.Cartesian3(this.cloudParams.x, this.cloudParams.y, this.cloudParams.z);
      var geometry = Cesium.BoxGeometry.fromDimensions({
        vertexFormat: Cesium.VertexFormat.POSITION_AND_ST,
        dimensions: dim_lxs,
      });
      let params = {
        scaleX: 10000,
        scaleY: 10000,
        scaleZ: 10000,
        tx: 110,
        ty: 40,
        tz: 4000,
        // scaleX: Cesium.Ellipsoid.WGS84.maximumRadius*2,
        // scaleY: Cesium.Ellipsoid.WGS84.maximumRadius*2,
        // scaleZ: Cesium.Ellipsoid.WGS84.maximumRadius*2,
        // tx: -Cesium.Ellipsoid.WGS84.maximumRadius,
        // ty: -Cesium.Ellipsoid.WGS84.maximumRadius,
        // tz: -Cesium.Ellipsoid.WGS84.maximumRadius,
        rx: 0, //X轴（经度）方向旋转角度（单位：度）
        ry: 0, //Y轴（纬度）方向旋转角度（单位：度）
        rz: 0, //Z轴（高程）方向旋转角度（单位：度）
      };
      const primitive_modelMatrix = mbs.utils.updateMatrix(params);

      let params1 = {
        scaleX: 10000,
        scaleY: 10000,
        scaleZ: 10000,
        tx: 109.8,
        ty: 40,
        tz: 8000,
        rx: 0, //X轴（经度）方向旋转角度（单位：度）
        ry: 0, //Y轴（纬度）方向旋转角度（单位：度）
        rz: 0, //Z轴（高程）方向旋转角度（单位：度）
      };
      const primitive_modelMatrix1 = mbs.utils.updateMatrix(params1);
      /**
       * 生成体数据
       */
      const size = 128;
      //data在0~255之间
      const data = new Uint8Array(size * size * size);
      const data1 = new Uint8Array(size * size * size);
      let dx, dy, dz;
      let dx1, dy1, dz1;
      let i = 0;
      let i1 = 0;
      //const perlin = new ImprovedNoise();
      const perlin = new ImprovedNoise();
      for (let z = 0; z < size; z++) {
        for (let y = 0; y < size; y++) {
          for (let x = 0; x < size; x++) {
            //-------------------------------------------------------------------
            dx1 = (x * 1.0) / size;
            dy1 = (y * 1.0) / size;
            dz1 = (z * 1.0) / size;
            const d1 = perlin.noise(dx1 * 6.5, dy1 * 6.5, dz1 * 6.5);
            data1[i1++] = d1 * 128 + 128;
            //-------------------------------------------------------------------
            dx = (x - size / 2) / size;
            dy = (y - size / 2) / size;
            dz = (z - size / 2) / size;
            var temp = Cesium.Cartesian3.distance(
              new Cesium.Cartesian3(0, 0, 0),
              new Cesium.Cartesian3(dx, dy, dz)
            );
            const d = 1.0 - temp;
            data[i++] =
              (128 + 128 * perlin.noise((x * 0.05) / 1.5, y * 0.05, (z * 0.05) / 1.5)) *
              d *
              d;
            //-------------------------------------------------------------------
          }
        }
      }

      //console.log(data);

      const options = {
        modelMatrix: primitive_modelMatrix,
        geometry_lxs: geometry,
        data: data,
        dim: dim_lxs,
        size: size,
        params: this.cloudParams,
        fragmentShaderSource: fragmentShaderSource2,
      };

      viewer.scene.primitives.add(new VoxelPrimitive(options));

      const options1 = {
        modelMatrix: primitive_modelMatrix1,
        geometry_lxs: geometry,
        data: data1,
        dim: dim_lxs,
        size: size,
        params: this.perlinParams,
        fragmentShaderSource: fragmentShaderSource,
      };

      viewer.scene.primitives.add(new VoxelPrimitive(options1));
}

function resizeWindow() {
  function setDivHeight() {
    var div = document.getElementById('map');
    div.style.height = window.innerHeight + 'px';
  }

  window.onload = setDivHeight;

  window.addEventListener('resize', setDivHeight);
}