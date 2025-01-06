/**
 * @license
 * Cesium - https://github.com/CesiumGS/cesium
 * Version 1.118
 *
 * Copyright 2011-2022 Cesium Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Columbus View (Pat. Pend.)
 *
 * Portions licensed separately.
 * See https://github.com/CesiumGS/cesium/blob/main/LICENSE.md for full licensing details.
 */

import {
  EllipseGeometry_default
} from "./chunk-YGTWKLFY.js";
import "./chunk-QZIWFSRM.js";
import "./chunk-YGNQJ4YI.js";
import "./chunk-26XJDV3D.js";
import "./chunk-G7IAO7CW.js";
import "./chunk-SC3TBKST.js";
import "./chunk-TDIGL45B.js";
import "./chunk-RRUO4QEK.js";
import "./chunk-2TRB253J.js";
import "./chunk-3PV5HQ2R.js";
import "./chunk-5OK5JFDP.js";
import "./chunk-TP4FFUAH.js";
import "./chunk-7HLZRYGD.js";
import "./chunk-7PFZ4Z7C.js";
import "./chunk-GUFV24F4.js";
import "./chunk-WOYQB5HM.js";
import {
  Cartesian3_default,
  Ellipsoid_default
} from "./chunk-GX5LMUGZ.js";
import "./chunk-ETC45PHH.js";
import "./chunk-UICVDDCQ.js";
import "./chunk-U2LSTOMA.js";
import "./chunk-EODIOQ35.js";
import "./chunk-DIVFF6DK.js";
import {
  defined_default
} from "./chunk-IF2OX6R4.js";

// packages/engine/Source/Workers/createEllipseGeometry.js
function createEllipseGeometry(ellipseGeometry, offset) {
  if (defined_default(offset)) {
    ellipseGeometry = EllipseGeometry_default.unpack(ellipseGeometry, offset);
  }
  ellipseGeometry._center = Cartesian3_default.clone(ellipseGeometry._center);
  ellipseGeometry._ellipsoid = Ellipsoid_default.clone(ellipseGeometry._ellipsoid);
  return EllipseGeometry_default.createGeometry(ellipseGeometry);
}
var createEllipseGeometry_default = createEllipseGeometry;
export {
  createEllipseGeometry_default as default
};
