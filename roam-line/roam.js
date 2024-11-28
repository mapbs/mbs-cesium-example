
/**
 * 漫游class
 * 此为开源版代码 禁止下载后售卖
 * 
 * 商务合作qq：274113729
 * 闲鱼号：图界mbs
 * 
 * B站地址：https://space.bilibili.com/43506538
 * gitee地址：https://gitee.com/mapbs
 * github地址：https://github.com/mapbs
 */
class roam {
    constructor(attr) {
        this.Cesium = attr.Cesium;
        this.viewer = attr.viewer;
        this.pos = attr.pos;
        if (attr.model == undefined) {
            attr.model = {
                url: "",
                scale: 0,
                width: 0
            };
        }
        this.model = attr.model;
        this.speed = attr.speed;
        if (attr.posAngel == undefined) {
            attr.posAngel = {
                rx: -100,
                ry: 0,
                rz: 50,
            };
        }
        this.posAngel = attr.posAngel;
        this.isPaused = false;

        this.animateEntity = null;
        this.polylineEntity = null;

        let _this = this;
        this.viewer.scene.preRender.addEventListener((scene, time) => {
            _this.traceHandler();
        });
        
        this.start();
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
    }
    chunkArray(array, chunkSize) {
        return Array.from({ length: Math.ceil(array.length / chunkSize) }, (_, index) => {
            return array.slice(index * chunkSize, index * chunkSize + chunkSize);
        });
    }
    start() {
        let Cesium = this.Cesium;
        let viewer = this.viewer;
        let pos = this.pos;
        let _this = this;

        let pos2 = this.chunkArray(pos, 3);
        let positions = [];
        for (let i = 0; i < pos2.length; i++) {
            positions.push(Cesium.Cartesian3.fromDegrees(pos2[i][0], pos2[i][1], pos2[i][2]));
        }
        const entity = viewer.entities.add({
            polyline: {
                positions: positions,
                width: 0,
                material: Cesium.Color.RED,
            },
        });
        const start = Cesium.JulianDate.fromDate(new Date(2024, 1, 1, 12));
        const stop = Cesium.JulianDate.addSeconds(
            start,
            (positions.length - 1) * 100,
            new Cesium.JulianDate()
        );
        const property = new Cesium.SampledPositionProperty();
        positions.forEach((position, index) => {
            const time = Cesium.JulianDate.addSeconds(
                start,
                index * 100,
                new Cesium.JulianDate()
            );
            property.addSample(time, position);
        });
        viewer.clock.startTime = start.clone();
        viewer.clock.stopTime = stop.clone();
        viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
        viewer.clock.currentTime = start.clone();

        viewer.timeline.zoomTo(start, stop);
        let animateEntity = null;
        try{
            animateEntity = viewer.entities.add({
                id: "animateEntity",
                availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
                    start: start,
                    stop: stop
                })]),
                position: property,
                orientation: new Cesium.VelocityOrientationProperty(property),
                model: {
                    uri: _this.model.url,
                    scale: _this.model.scale
                },
                path: {
                    resolution: 1,
                    material: new Cesium.PolylineGlowMaterialProperty({
                        glowPower: 0.1,
                        color: Cesium.Color.YELLOW
                    }),
                    width: _this.model.width
                }
            });
        }catch(e){

        }
        animateEntity.position.setInterpolationOptions({
            interpolationDegree: 5,
            interpolationAlgorithm: Cesium.LagrangePolynomialApproximation,
        });

        animateEntity.orientation.position.setInterpolationOptions({
            interpolationDegree: 5,
            interpolationAlgorithm: Cesium.LagrangePolynomialApproximation,
        });

        viewer.trackedEntity = animateEntity;

        viewer.clock.shouldAnimate = true;
        this.animateEntity = animateEntity;
        this.polylineEntity = entity;

    }
    traceHandler() {
        let Cesium = this.Cesium;
        let viewer = this.viewer;

        let _this = this;
        let animateEntity = this.animateEntity;
        if (viewer.clock.currentTime != undefined && animateEntity != null) {

            let center = animateEntity.position.getValue(
                viewer.clock.currentTime
            );
            let orientation = animateEntity.orientation.getValue(
                viewer.clock.currentTime
            )
            if (center != undefined) {

                let transform = Cesium.Transforms.eastNorthUpToFixedFrame(center);
                transform = Cesium.Matrix4.fromRotationTranslation(Cesium.Matrix3.fromQuaternion(orientation), center);
                //viewer.camera.lookAtTransform(transform, new Cesium.Cartesian3(-100, 0, 50))
                viewer.camera.lookAtTransform(transform, new Cesium.Cartesian3(_this.posAngel.rx, _this.posAngel.ry, _this.posAngel.rz))
                //viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY)
            }
        }
    }
    pauseFligt() {
        let viewer = this.viewer;

        if (this.isPaused) {
            viewer.clock.shouldAnimate = true;
        } else {
            viewer.clock.shouldAnimate = false;
        }
        this.isPaused = !this.isPaused;
    }
    exitFlight() {
        let viewer = this.viewer;

        viewer.clock.shouldAnimate = false;
        viewer.trackedEntity = undefined;
        viewer.entities.remove(this.animateEntity);
        viewer.entities.remove(this.polylineEntity);
        this.animateEntity = null;
        viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    }
    updateSpeed(){
        let viewer = this.viewer;
        viewer.clock._multiplier = this.speed;
    }
}
