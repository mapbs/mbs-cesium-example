
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
  window.viewer = viewer;
  add3DTiles(
    "/libs/model/40866/tileset.json",
    null,
    viewer
  );
  highlight(viewer);
  highlightClick(viewer);
  //定位
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(-75.597905, 40.039034, 500),
    orientation: {
      heading: 5.426926684703881,
      pitch: -0.2791305753706699,
      roll: 6.282719687781836,
    },
  });
  console.log(`
* 此为开源版代码 禁止下载后售卖
* 
* 商务合作qq：274113729
* 闲鱼号：图界mbs
* 
* B站地址：https://space.bilibili.com/43506538
* gitee地址：https://gitee.com/mapbs
* github地址：https://github.com/mapbs`
         )
})();

function add3DTiles(url, params, viewer) {
  let _this = this;
  Cesium.Cesium3DTileset.fromUrl(url, {
    //仅用于调试。确定是否仅应使用上一帧中的分幅进行渲染。
    debugColorizeTiles: false,
    debugFreezeFrame: false,
    //三角网debug
    enableDebugWireframe: false,
    debugWireframe: false,
    //包围盒debug
    debugShowBoundingVolume: false,
    //包围盒debug
    debugShowContentBoundingVolume: false,
    debugShowViewerRequestVolume: false,
    //显示每个包围盒的三角面数量
    debugShowRenderingStatistics: false,
    //显示每个包围盒的内存占用
    debugShowMemoryUsage: false,
    //显示每个包围盒的url路径
    debugShowUrl: false,
    //隐藏属性------------------------
    colorBlendMode: Cesium.ColorBlendMode.HIGHLIGHT,
    colorBlendAmountEnabled: Cesium.ColorBlendMode.HIGHLIGHT,
  }).then((tileset) => {
    tileset = viewer.scene.primitives.add(tileset);

    if (params != undefined && params != null) {
      tileset._root.transform = _this.updateMatrix(params);
    }
    viewer.flyTo(tileset);
    console.log("All tiles are loaded 加载完成");



    return tileset;
  });
}
function highlightClick(viewer) {
  window.mousePickedEntity = null;
  window.mousePickedHandler = new Cesium.ScreenSpaceEventHandler(
    viewer.canvas
  );
  window.mousePickedHandler.setInputAction(function (movement) {

    if (window.mousePickedEntity != null) {
      mousePickedEntity.primitive.getGeometryInstanceAttributes(
        mousePickedEntity.id
      ).color = [255, 255, 255, 1];
    }
    var pickingEntity = viewer.scene.pick(movement.position);
    if (pickingEntity != undefined) {
      // viewer.scene.primitives._primitives[0].geometryInstances.id
      console.log(pickingEntity);
      if (pickingEntity.primitive instanceof Cesium.ClassificationPrimitive) {
        pickingEntity.primitive.getGeometryInstanceAttributes(
          pickingEntity.id
        ).color = [103, 194, 58, 180];
        mousePickedEntity = pickingEntity;
        var mouse = viewer.scene.pickPosition(movement.position);
        let texts = pickingEntity.id.id
          .split("#")[0]
          .split("_")[1]
          .split(" ");
        console.log(texts);
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}
//高亮
function highlight(viewer) {
  console.log(buildJson);
  let dataResult = [];
  for (let i = 0; i < buildJson.length; i++) {
    let currLonLat = buildJson[i].lonlats;
    let currTemp = [];
    for (let j = 0; j < currLonLat.length; j++) {
      currTemp.push([currLonLat[j][0], currLonLat[j][1]]);
    }
    var objectTemp = {
      xy: currTemp.flat(2),
      id: i,
      name: buildJson[i].name,
      dataArr: "",
    };
    dataResult.push(objectTemp);

    var features = turf.points(currTemp);
    var center = turf.center(features);
    center = center.geometry.coordinates;
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(center[0], center[1], buildJson[i].minHeight + buildJson[i].height),
      label: {
        text: buildJson[i].name,
        font: "20px Helvetica",
        fillColor: Cesium.Color.SKYBLUE,
        outlineColor: Cesium.Color.BLACK,
        showBackground:true,
        backgroundColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      },
    });
  }
  splitRegionType(
    viewer,
    "zhezhao",
    dataResult,
    [59, 101, 210, 0]
  );
}
// 将RGB颜色转为cesium识别的 如255 255 255 1 转为 1 1 1 1
// eslint-disable-next-line no-unused-vars
function colorTrans(R, G, B, A) {
  const color = [R / 255, G / 255, B / 255, A]
  return color
}
// 假如3dtiles中没有处理好的属性对象,使用此方法自定义生成遮罩高亮显示的对象
// 按划定区域高亮显示某些建筑  分类  一个datas为一个类
// 多个对象传递,进入requ_type集合
function splitRegionType(viewer, collection, datas, color) {
  color = colorTrans(color[0], color[1], color[2], color[3])
  for (let i = 0; i < datas.length; i++) {
    const xy = datas[i].xy
    const id = datas[i].id
    const name = datas[i].name
    const polygonHierarchy = {
      positions: Cesium.Cartesian3.fromDegreesArray(xy)
    }
    const idss = id + '_' + name
    const primitive = polygonClassPrimitive(collection, idss, polygonHierarchy, color, datas[i])
    viewer.scene.primitives.add(primitive);
  }
}
function polygonClassPrimitive(collection, id, pos, color, attr) {
  const extrudedPolygon = new Cesium.GeometryInstance({
    geometry: new Cesium.PolygonGeometry({
      polygonHierarchy: pos,
      vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
      extrudedHeight: 1000,
      height: -90
      // attributes: attr
    }),
    attributes: {
      color: new Cesium.ColorGeometryInstanceAttribute(
        color[0],
        color[1],
        color[2],
        color[3]
      )
    },
    id: {
      id: id + '#' + collection,
      data: attr
    }
  })
  // 添加primitives几何图形和外观ClassificationPrimitive呈现
  const primitive = new Cesium.ClassificationPrimitive({
    geometryInstances: extrudedPolygon,
    releaseGeometryInstances: false,
    classificationType: Cesium.ClassificationType.CESIUM_3D_TILE // 3D Tiles进行分类
    // asynchronous: false
  })
  return primitive
}

function resizeWindow() {
  function setDivHeight() {
    var div = document.getElementById('map');
    div.style.height = window.innerHeight + 'px';
  }

  window.onload = setDivHeight;

  window.addEventListener('resize', setDivHeight);
}