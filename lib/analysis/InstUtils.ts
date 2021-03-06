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

///<reference path='../ts-declarations/jalangi.d.ts' />

/**
 * Created by m.sridharan on 11/6/14.
 */
module ___LoggingAnalysis___ {

    export var isBrowser:boolean = J$.Constants.isBrowser;


    // IID special values: -1 is unknown, -2 corresponds to the initial
    // DOM traversal to attach mutation observers
    export enum LogEntryType {
        DECLARE, // fields: iid, name, obj-id
        CREATE_OBJ, // fields: iid, obj-id
        CREATE_FUN, // fields: iid, function-enter-iid, obj-id.  NOTE: proto-obj-id is always obj-id + 1
        PUTFIELD, // fields: iid, base-obj-id, prop-name, val-obj-id
        WRITE, // fields: iid, name, obj-id
        LAST_USE, // fields: obj-id, timestamp, sourceId (sid + ':' + iid)
        FUNCTION_ENTER, // fields: iid, function-object-id.  NOTE: only emitted when CALL is not emitted
        FUNCTION_EXIT, // fields: iid
        TOP_LEVEL_FLUSH, // fields: sourceId (sid + ':' + iid)
        UPDATE_IID, // fields: obj-id, new-iid
        DEBUG, // fields: call-iid, obj-id
        RETURN, // fields: obj-id
        CREATE_DOM_NODE, // fields: iid, obj-id
        ADD_DOM_CHILD, // fields: parent-obj-id, child-obj-id
        REMOVE_DOM_CHILD, // fields: parent-obj-id, child-obj-id
        ADD_TO_CHILD_SET, // fields: iid, parent-obj-id, name, child-obj-id
        REMOVE_FROM_CHILD_SET, // fields: iid, parent-obj-id, name, child-obj-id
        DOM_ROOT, // fields: obj-id
        CALL, // fields: iid, function-obj-id, function-enter-iid, fun-sid.  NOTE: only emitted for calls to *instrumented* functions
        SCRIPT_ENTER, // fields: iid, scriptId, filename
        SCRIPT_EXIT, // fields: iid
        FREE_VARS, // fields: iid, array-of-names or ANY
        SOURCE_MAPPING, // fields: iid, startLine, startColumn, endLine, endColumn
        UPDATE_CURRENT_SCRIPT, // fields: scriptID
        END_LAST_USE // fields: none
    }

    /**
     * making this enum lets the TypeScript compiler inline the constants
     */
    export enum Constants {
        MUT_OBSERVER_IID = -1,
        INIT_DOM_TRAVERSAL_IID = -2,
        MAX_BUF_SIZE = 64000
    }

    // sentinel source locs for top-level flushes
    export var ALREADY_FLUSHED = "ALREADY_FLUSHED";
    export var UNKNOWN_FLUSH_LOC = "0:-1";

    export var GLOBAL_OBJ = (function () {return this})();

    export function isObject(o : any) : boolean {
        return o && (typeof o === 'object' || typeof o === 'function');
    }

    // some defense against monkey-patching
    var objGetOwnPropDesc = Object.getOwnPropertyDescriptor;
    var objGetPrototypeOf = Object.getPrototypeOf;
    var objProtoHasOwnProperty = Object.prototype.hasOwnProperty;
    var objDefProperty = Object.defineProperty;

    export function getPropertyDescriptor(o: Object, prop: string): PropertyDescriptor {
        var t = o;
        while (t != null) {
            var desc = objGetOwnPropDesc(t, prop);
            if (desc) {
                return desc;
            }
            t = objGetPrototypeOf(t);
        }
        return null;
    }

    export function isGetterSetter(o: any, prop: string): boolean {
        var desc = getPropertyDescriptor(o,prop);
        return desc && (desc.set !== undefined || desc.get !== undefined);
    }

    export function HOP(o: any, prop: string): boolean {
        return objProtoHasOwnProperty.call(o, prop);
    }

    export function objDefineProperty(o: any, p: string, attributes: PropertyDescriptor): any {
        return objDefProperty(o,p,attributes);
    }

    var funEnterRegExp = /J\$\.Fe\(([0-9]+)/;

    /**
     * cache for optimization
     * @type {WeakMap<K, V>}
     */
    var instFunction2EnterIID: WeakMap<any,number> =
        typeof WeakMap === 'undefined' ? undefined : new WeakMap<any,number>();

    var funEnterIIDHiddenProp = "*HP$*";;

    export function getFunEnterIID(f: any) {
        var parsed = funEnterRegExp.exec(f.toString());
        var result: any;
        if (parsed) {
            result = parseInt(parsed[1]);
            setCachedFunEnterIID(f,result);
        } else {
            result = -1;
        }
        return result;
    }

    function setCachedFunEnterIID(f: any, enterIID: number) {
        if (instFunction2EnterIID) {
            instFunction2EnterIID.set(f,enterIID);
        } else {
            // use a hidden property
            objDefineProperty(f, funEnterIIDHiddenProp, {
                enumerable: false,
                writable: true
            });
            f[funEnterIIDHiddenProp] = enterIID;

        }
    }
    export function lookupCachedFunEnterIID(f: any): number {
        if (instFunction2EnterIID) {
            return instFunction2EnterIID.get(f);
        } else {
            return f[funEnterIIDHiddenProp];
        }
    }

}