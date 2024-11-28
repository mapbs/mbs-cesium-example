/**
 * 热力图3d类
 * 
 * 此为开源版代码 禁止下载后售卖
 * 
 * 商务合作qq：274113729
 * 闲鱼号：图界mbs
 * 
 * B站地址：https://space.bilibili.com/43506538
 * gitee地址：https://gitee.com/mapbs
 * github地址：https://github.com/mapbs
 */
class heatmap3d {
    constructor() {
        this.primitive = null;
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
    /**
     * 创建热力图曲面几何
     * @private
     * @param {?num} param.viewer - Mbs.Viewer 对象表示向哪个视口添加
     * @param {?num} param.currHeight - 距地高度
     * @param {?num} param.bounds - 生成几何矩形范围
     * @param {?num} param.opacity - 透明度
     * @param {?num} param.density - 曲面网格密度 数组 例[0.01,0.01]
     * @param {?Object} param.data - 数据对象
     * @param {?Object} param.colors - 设置颜色区间
     */
    heatmapSurface(param) {
        /**
         * @ignore
         */
        this.viewer = param.viewer;
        /**
         * @param {?num} param.currHeight - 距地高度
         */
        if (param.groundHeight == undefined) {
            param.groundHeight = 100.0;
        }
        this.groundHeight = param.groundHeight;
        if (param.currHeight == undefined) {
            param.currHeight = 100.0;
        }
        this.currHeight = param.currHeight;
        /**
         * @param {?num} param.bounds - 当前范围
         */
        this.bounds = param.bounds;
        if (param.opacity == undefined) {
            param.opacity = 1.0;
        }
        /**
         * @param {?num} param.opacity - 透明度
         */
        this.opacity = param.opacity;
        this.heatmap = null;
        if (param.density == undefined) {
            param.density = [100, 50];
        }
        /**
         * @param {?num} param.density - 网格划分密度 [0.01,0.01]
         */
        this.density = param.density;
        if (param.range == undefined) {
            param.range = [0, 100];
        }
        /**
         * @param {?num} param.range - 值范围 [0,100]
         */
        this.range = param.range;
        /**
         * @ignore
         * @param {?num} param.radius - 插值过渡半径大小
         */
        this.radius = 50.0;
        /**
         * @ignore
         * @param {?num} param.blur - 圆弧模糊程度 0-1.0
         */
        this.blur = 0.85;
        let bounds = this.bounds;
        /**
         * @ignore
         * @param {?num} param.width - 热力图贴图宽度
         */
        this.width = 500 * (bounds[2] - bounds[0]) / (bounds[3] - bounds[1]);
        /**
         * @ignore
         * @param {?num} param.height - 热力图贴图高度
         */
        this.height = 500;
        if (param.data == undefined) {
            param.data = [];
            this.randomPointNum = 100;
            for (let i = 0; i < this.randomPointNum; i++) {
                let lon = Math.random() * (bounds[2] - bounds[0]) + bounds[0];
                let lat = Math.random() * (bounds[3] - bounds[1]) + bounds[1];
                let value = Math.random() * 100;
                let x = Math.round(((lon - bounds[0]) / (bounds[2] - bounds[0])) * this.width);
                let y =
                    this.height - Math.round(((lat - bounds[1]) / (bounds[3] - bounds[1])) * this.height);
                param.data.push({ x: x, y: y, value: value });
            }
        }
        /**
         * @param {?num} param.data - 基础数据
         */
        else {
            let currData = [];
            for (let i = 0; i < param.data.length; i++) {
                let lon = param.data[i].lon;
                let lat = param.data[i].lat;
                let value = param.data[i].value;

                let x = Math.round(((lon - bounds[0]) / (bounds[2] - bounds[0])) * this.width);
                let y =
                    this.height - Math.round(((lat - bounds[1]) / (bounds[3] - bounds[1])) * this.height);
                currData.push({ x: x, y: y, value: value });
            }
            this.data = currData;
        }

        if (param.colors == undefined) {
            param.colors = {
                ".0": "#A0A5F0",
                ".1": "blue",
                ".45": "green",
                ".65": "yellow",
                ".8": "orange",
                ".95": "red"
            };
        }
        /**
         * @param {?object} param.colors - 颜色数组
         */
        this.colors = param.colors;

        if (param.curveType == undefined) {
            param.curveType = 0;
        }

        this.curveType = param.curveType;

        this.generateCurve();
    }
    removeAll() {
        this.viewer.scene.primitives.remove(this.primitive);

        //移除canvas元素
        const elementToRemove = document.getElementById('curved-canvas');
        if (elementToRemove) {
            elementToRemove.parentNode.removeChild(elementToRemove);
        }

    }
    updateHeatmapSurface(param) {
        this.removeAll();
        this.heatmapSurface(param);
    }
    generateCurve() {
        this.createHeatmap(this.data);
        this.createPrimitive();
    }
    /**
    * 使用heatmap创建热力图贴图
    * @ignore
    * @param {!string} ElementId - html的Element节点
    * @return {object} - viewer视口对象
    */
    createHeatmap(data) {
        let _this = this;
        var domElement = document.createElement("div");
        domElement.setAttribute(
            "style",
            "width: " + this.width + "px; height: " + this.height + "px; margin: 0px; display: none;"
        );
        domElement.setAttribute(
            "id",
            "curved-canvas"
        );
        document.body.appendChild(domElement);
        this.heatmap = h337.create({
            container: domElement,
            radius: _this.radius,
            maxOpacity: _this.opacity,
            //minOpacity: 0.1,
            minOpacity: _this.opacity,
            blur: _this.blur,
            backgroundColor: "yellow",
            gradient: _this.colors,
        });
        this.heatmap.setData({
            min: this.range[0],
            max: this.range[1],
            data: data,
        });
    }
    /**
    * 创建cesium的Primitive 0是曲面 1是曲面体
    * @ignore
    * @param {!string} ElementId - html的Element节点
    * @return {object} - viewer视口对象
    */
    createPrimitive() {
        let viewer = this.viewer;

        let _this = this;
        let instance = this.generateGeometryInstance(); //primitive的geometry是生成立体图的关键
        let appearance = new Cesium.MaterialAppearance({
            material: Cesium.Material.fromType("Image", {
                image: _this.heatmap._renderer.canvas, //热力图的canvas直接拿来做材质
            }),
        });
        let opt = {
            geometryInstances: instance,
            appearance: appearance,
            allowPicking: false,
            asynchronous: false,
        };

        this.primitive = viewer.scene.primitives.add(new Cesium.Primitive(opt));
    }
    generateGeometryInstance() {
        //let bounds = this.currBounds.split(",").map(Number);
        let bounds = this.bounds;
        const dWidth = bounds[2] - bounds[0],
            dHeight = bounds[3] - bounds[1],
            left = bounds[0],
            bottom = bounds[1];
        // const dx = this.density[0],
        //     dy = this.density[1],
        const dx = dWidth / this.density[0],
            dy = dHeight / this.density[1],
            h = 0,
            dh = this.currHeight; // 这里配置了插入间隔和起始高度、高度间隔

        let r = Math.floor(dWidth / dx),
            l = Math.floor(dHeight / dy);

        var grids = [];
        for (let i = 0; i < l; i++) {
            let row = [];
            for (let u = 0; u < r; u++) {
                let x = left + (u == r ? dWidth : u * dx),
                    y = bottom + (i == l ? dHeight : i * dy);
                let screen = {
                    x: Math.round(((x - left) / dWidth) * this.width),
                    y: this.height - Math.round(((y - bottom) / dHeight) * this.height),
                };

                let v = this.heatmap.getValueAt(screen);
                let color = this.heatmap._renderer.ctx.getImageData(screen.x, screen.y, 1, 1).data;
                row.push([
                    x,
                    y,
                    h + v * dh,
                    color.map((c) => c / 255),
                    [(x - left) / dWidth, (y - bottom) / dHeight],
                ]);
            }
            grids.push(row);
        }

        //grids = this.changeGrids(grids);
        const wgs84Positions = [];
        const indices = [];
        const colors = [];
        const sts = [];
        let vtxCursor = 0;
        let idxCursor = 0;
        let sheight = this.groundHeight;
        for (let i = 0; i < grids.length - 1; i++) {
            for (let u = 0; u < grids[i].length - 1; u++) {
                if (i != 0) {
                    let p1 = grids[i][u];
                    let p2 = grids[i][u + 1];
                    let p3 = grids[i + 1][u + 1];
                    let p4 = grids[i + 1][u];

                    this.addVertices(p1, wgs84Positions, colors, sts, sheight);
                    this.addVertices(p2, wgs84Positions, colors, sts, sheight);
                    this.addVertices(p3, wgs84Positions, colors, sts, sheight);
                    this.addVertices(p4, wgs84Positions, colors, sts, sheight);
                    indices.push(
                        idxCursor + 0,
                        idxCursor + 1,
                        idxCursor + 2,
                        idxCursor + 0,
                        idxCursor + 2,
                        idxCursor + 3
                    );
                    idxCursor += 4;
                }
            }
        }

        let _this = this;
        return new Cesium.GeometryInstance({
            // computeNormal会自动帮我们计算法向量
            geometry: Cesium.GeometryPipeline.computeNormal(
                _this.generateGeometry(wgs84Positions, colors, indices, sts)
            ),
        });
    }
    // 把信息写入点，可以在顶点着色器中取到
    addVertices(p, positions, colors, sts, vheight) {
        //转为cesium坐标
        const c3Position = Cesium.Cartesian3.fromDegrees(p[0], p[1], p[2] + vheight);
        positions.push(c3Position.x, c3Position.y, c3Position.z);
        // 这里配置了颜色渐变
        colors.push(p[3][0], p[3][1], p[3][2], p[3][3]);
        // 这里配置了贴图二维坐标
        sts.push(p[4][0], p[4][1]);
    }

    generateGeometry(positions, colors, indices, sts) {
        let attributes = new Cesium.GeometryAttributes({
            position: new Cesium.GeometryAttribute({
                componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                componentsPerAttribute: 3,
                values: new Float64Array(positions),
            }),
            color: new Cesium.GeometryAttribute({
                componentDatatype: Cesium.ComponentDatatype.FLOAT,
                componentsPerAttribute: 4,
                values: new Float32Array(colors),
            }),
            st: new Cesium.GeometryAttribute({
                componentDatatype: Cesium.ComponentDatatype.FLOAT,
                componentsPerAttribute: 2,
                values: new Float32Array(sts),
            }),
        });
        // 计算包围球
        const boundingSphere = Cesium.BoundingSphere.fromVertices(
            positions,
            new Cesium.Cartesian3(0.0, 0.0, 0.0),
            3
        );

        const geometry = new Cesium.Geometry({
            attributes: attributes,
            indices: indices,
            primitiveType: Cesium.PrimitiveType.TRIANGLES,
            boundingSphere: boundingSphere,
        });
        return geometry;
    }
    //-----------------------------------------------------------------------------------------------------------------------------------------------------------

}