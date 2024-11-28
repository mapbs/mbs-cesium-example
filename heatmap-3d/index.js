
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
  addHeatmap(viewer);
  //定位
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(116, 33, 100000),
    orientation: {
      heading: 5.426926684703881,
      pitch: -0.2791305753706699,
      roll: 6.282719687781836,
    },
  });
})();

function addHeatmap(viewer) {
  let panelParam = {
    bounds: [113, 34, 115, 35],
    groundHeight: 10000,
    currHeight: 100,
    densityX: 100,
    densityY: 50,
    randomNum: 200,
    opacity: 0.9
  };

  let currBounds = panelParam.bounds;
  let data = [];
  for (let i = 0; i < panelParam.randomNum; i++) {
    let x = Math.random() * (currBounds[2] - currBounds[0]) + currBounds[0];
    let y = Math.random() * (currBounds[3] - currBounds[1]) + currBounds[1];
    let value = Math.random() * 100;

    data.push({ lon: x, lat: y, value: value });
  }

  //创建曲面几何对象
  let myGeometry = new heatmap3d();

  //使用曲面几何对象生成一个3d热力图几何
  myGeometry.heatmapSurface({
    viewer: viewer,
    bounds: panelParam.bounds,
    opacity: panelParam.opacity,
    groundHeight: panelParam.groundHeight,
    currHeight: panelParam.currHeight,
    density: [panelParam.densityX, panelParam.densityY],
    data: data,
    colors: {
      "0.0": "#A0A5F0",
      "0.1": "blue",
      "0.45": "green",
      "0.65": "yellow",
      "0.8": "orange",
      "0.95": "red",
    },
    curveType: 0,
  });

      
}

function resizeWindow() {
  function setDivHeight() {
    var div = document.getElementById('map');
    div.style.height = window.innerHeight + 'px';
  }

  window.onload = setDivHeight;

  window.addEventListener('resize', setDivHeight);
}