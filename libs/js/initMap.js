const initMap = function (domId) {
  const obj = [6378137.0, 6378137.0, 6356752.3142451793];
  Cesium.Ellipsoid.WGS84 = Object.freeze(
    new Cesium.Ellipsoid(obj[0], obj[1], obj[2])
  );
  let terrain = null;
  let terrainFlag = true;
  if (terrainFlag) {
    terrain = Cesium.Terrain.fromWorldTerrain({
      //requestWaterMask: true,
      requestVertexNormals: true,
    });
  }
  const viewer = new Cesium.Viewer(domId, {
    terrain: terrain,
    homeButton: false, // home键
    geocoder: false, // 地址编码  查找控件
    baseLayerPicker: false, // 图层选择控件
    animation: true, // 动画
    timeline: true, // 时间轴
    fullscreenButton: false, // 全屏显示
    infoBox: false, // 点击要素之后浮窗
    sceneModePicker: false, // 投影方式  三维/二维控件
    navigationInstructionsInitiallyVisible: false, // 导航指令
    navigationHelpButton: false, // 帮助信息
    selectionIndicator: false, // 选择
    shadows: true, //光照的阴影效果
    contextOptions: {
      //requestWebgl1: true,
      requestWebgl2: true,
    },
  });

  // 关闭logo
  // viewer.camera.percentageChanged = 0.01
  viewer._cesiumWidget._creditContainer.style.display = "none";
  // 移除双击锁定默认事件
  viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
    Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
  );
  // viewer.scene.screenSpaceCameraController.minimumZoomDistance = 100;
  // viewer.scene.screenSpaceCameraController.maximumZoomDistance = 300;
  viewer.camera.percentageChanged = 0.01;
  //viewer.scene.globe.enableLighting = true;   // 启用光照
  return viewer;
}

const toLonLat = function (cartesian3, viewer) {
  const ellipsoid = viewer.scene.globe.ellipsoid
  // var cartesian3=new Cesium.Cartesian3(x,y,z);
  const cartographic = ellipsoid.cartesianToCartographic(cartesian3)
  const lat = Cesium.Math.toDegrees(cartographic.latitude)
  const lon = Cesium.Math.toDegrees(cartographic.longitude)
  const alt = cartographic.height
  return [lon, lat, alt];
}
// 经纬度转世界坐标
const formLonLat = function (lonlat) {
  // var lonlat = [106,39];
  const position = Cesium.Cartesian3.fromDegrees(lonlat[0], lonlat[1], lonlat[2])
  return position;
}

// 矩阵 旋转平移缩放 通用方法
const updateMatrix = function (params) {
  // 旋转
  let mx = Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(params.rx));
  let my = Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(params.ry));
  let mz = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(params.rz));
  let rotationX = Cesium.Matrix4.fromRotationTranslation(mx);
  let rotationY = Cesium.Matrix4.fromRotationTranslation(my);
  let rotationZ = Cesium.Matrix4.fromRotationTranslation(mz);
  // 平移
  let position = Cesium.Cartesian3.fromDegrees(params.tx, params.ty, params.tz);
  let m = Cesium.Transforms.eastNorthUpToFixedFrame(position);
  // 通过一个平移向量Cartesian3，创建一个4X4矩阵
  // let translation =  new Cesium.Cartesian3( 0, 0, 20 );
  // let m4 = Cesium.Matrix4.fromTranslation(translation);

  // 旋转、平移矩阵相乘
  Cesium.Matrix4.multiply(m, rotationX, m);
  Cesium.Matrix4.multiply(m, rotationY, m);
  Cesium.Matrix4.multiply(m, rotationZ, m);

  // 比例大小
  // var scale = Cesium.Matrix4.fromUniformScale(this.params.scale);
  let scale = Cesium.Matrix4.fromScale(
    new Cesium.Cartesian3(params.scaleX, params.scaleY, params.scaleZ)
  );

  Cesium.Matrix4.multiply(m, scale, m);

  return m;
}

const flyCenter = function (attr) {

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(attr.position[0], attr.position[1], attr.position[2]),
    orientation: {
      heading: Cesium.Math.toRadians(attr.heading),
      pitch: Cesium.Math.toRadians(attr.pitch),
      roll: 0.0
    }
  })
}

const mbs = {
  utils:{
    initMap:initMap,
    toLonLat:toLonLat,
    formLonLat:formLonLat,
    updateMatrix:updateMatrix,
    flyCenter:flyCenter
  }
}

var module = {
	exports: {}
};

if (module && module.exports) {
	module.exports = mbs.utils;
}