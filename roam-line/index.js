
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
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(116, 33, 100000),
    orientation: {
      heading: 5.426926684703881,
      pitch: -0.2791305753706699,
      roll: 6.282719687781836,
    },
  });

  document.addEventListener('DOMContentLoaded', function() {
    var start = document.getElementById('start');
    start.addEventListener('click', function() {
      startRoam(viewer);
    });

    var pause = document.getElementById('pause');
    pause.addEventListener('click', function() {
      pauseFligt();
    });

    var exit = document.getElementById('exit');
    exit.addEventListener('click', function() {
      exitFlight();
    });
  });

})();

function startRoam(viewer) {
  let pos = [
    121.4679071949, 31.1814451617, 1000,
    121.4690034018, 31.1781192525, 1000,
    121.4654757119, 31.1780925253, 1000,
    121.4658688311, 31.1795718981, 500,
    121.4638926286, 31.1796314788, 1000,
    121.4594609910, 31.1768173038, 1000,
    121.4572200732, 31.1777291609, 200,
    121.4551244958, 31.1776017240, 1000,
    121.4535788691, 31.1785638348, 1000,
    121.4518803841, 31.1821140089, 800,
    121.4550632957, 31.1830994982, 1000,
    121.4576668635, 31.1854399589, 1000,
    121.4593317801, 31.1834835664, 1000,
    121.4636342606, 31.1841680219, 1000,
    121.4640702228, 31.1824844139, 1000,
    121.4617589321, 31.1823605580, 1000,
    121.4633780110, 31.1811289340, 1000,
    121.4657956286, 31.1823919290, 1000,
    121.4673846294, 31.1837075570, 800];
  let params = {
    rx: -100,
    ry: 0,
    rz: 50,
    scale: 1,
    lineShow: true,
    speed: 1,
  };
  window.roamObject = new roam({
    Cesium: Cesium,
    viewer: viewer,
    pos: pos,
    model: {
      url: "/libs/model/gltf/Cesium_Air.glb",
      scale: params.scale,
      width: 10
    },
    posAngel: {
      rx: params.rx,
      ry: params.ry,
      rz: params.rz,
    },
    speed: 2,
    isPaused: false
  });
}
//暂停/继续 漫游
function pauseFligt() {
  window.roamObject.pauseFligt();
}
//退出漫游
function exitFlight(){
  window.roamObject.exitFlight();
}
function resizeWindow() {
  function setDivHeight() {
    var div = document.getElementById('map');
    div.style.height = window.innerHeight + 'px';
  }

  window.onload = setDivHeight;

  window.addEventListener('resize', setDivHeight);
}