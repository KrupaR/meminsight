/*
 * Copyright (c) 2014 Samsung Electronics Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.samsung.memoryanalysis.referencecounter.heap;

import com.samsung.memoryanalysis.traceparser.SourceMap.SourceLocId;

public class Unreachability {
    public final int objId;
    public final SourceLocId slId;
    public final long time;

    public Unreachability(int objId, SourceLocId slId, long time) {
        this.objId = objId;
        this.slId = slId;
        this.time = time;
    }

    @Override
    public String toString() {
        return "Unreachability{" +
                "obj=" + objId +
                ", slId=" + slId +
                '}';
    }
}
