/**
 * skylark-net-http - The skylark http  library.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
!function(factory,globals){var define=globals.define,require=globals.require,isAmd="function"==typeof define&&define.amd,isCmd=!isAmd&&"undefined"!=typeof exports;if(!isAmd&&!define){var map={};define=globals.define=function(e,t,r){"function"==typeof r?(map[e]={factory:r,deps:t.map(function(t){return function(e,t){if("."!==e[0])return e;var r=t.split("/"),n=e.split("/");r.pop();for(var s=0;s<n.length;s++)"."!=n[s]&&(".."==n[s]?r.pop():r.push(n[s]));return r.join("/")}(t,e)}),resolved:!1,exports:null},require(e)):map[e]={factory:null,resolved:!0,exports:r}},require=globals.require=function(e){if(!map.hasOwnProperty(e))throw new Error("Module "+e+" has not been defined");var module=map[e];if(!module.resolved){var t=[];module.deps.forEach(function(e){t.push(require(e))}),module.exports=module.factory.apply(globals,t)||null,module.resolved=!0}return module.exports}}if(!define)throw new Error("The module utility (ex: requirejs or skylark-utils) is not loaded!");if(function(define,require){define("skylark-net-http/http",["skylark-langx-ns/ns"],function(e){return e.attach("net.http",{})}),define("skylark-net-http/Xhr",["skylark-langx-ns/ns","skylark-langx-types","skylark-langx-objects","skylark-langx-arrays","skylark-langx-funcs","skylark-langx-async/Deferred","skylark-langx-emitter/Evented","./http"],function(skylark,types,objects,arrays,funcs,Deferred,Evented,http){var each=objects.each,mixin=objects.mixin,noop=funcs.noop,isArray=types.isArray,isFunction=types.isFunction,isPlainObject=types.isPlainObject,type=types.type,getAbsoluteUrl=function(e){return a||(a=document.createElement("a")),a.href=e,a.href},a,Xhr=function(){var jsonpID=0,key,name,rscript=/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,scriptTypeRE=/^(?:text|application)\/javascript/i,xmlTypeRE=/^(?:text|application)\/xml/i,jsonType="application/json",htmlType="text/html",blankRE=/^\s*$/,XhrDefaultOptions={async:!0,type:"GET",beforeSend:noop,success:noop,error:noop,complete:noop,context:null,global:!0,accepts:{script:"text/javascript, application/javascript, application/x-javascript",json:"application/json",xml:"application/xml, text/xml",html:"text/html",text:"text/plain"},crossDomain:!1,timeout:0,processData:!1,cache:!0,traditional:!1,xhrFields:{withCredentials:!1}};function mimeToDataType(e){if(e&&(e=e.split(";",2)[0]),e){if(e==htmlType)return"html";if(e==jsonType)return"json";if(scriptTypeRE.test(e))return"script";if(xmlTypeRE.test(e))return"xml"}return"text"}function appendQuery(e,t){return""==t?e:(e+"&"+t).replace(/[&?]{1,2}/,"?")}function serializeData(e){e.data=e.data||e.query,e.processData&&e.data&&"string"!=type(e.data)&&(e.data=param(e.data,e.traditional)),!e.data||e.type&&"GET"!=e.type.toUpperCase()||("string"!=type(e.data)&&(e.data=param(e.data,e.traditional)),e.url=appendQuery(e.url,e.data),e.data=void 0)}function serialize(e,t,r,n){var s,i=isArray(t),a=isPlainObject(t);each(t,function(t,o){s=type(o),n&&(t=r?n:n+"["+(a||"object"==s||"array"==s?t:"")+"]"),!n&&i?e.add(o.name,o.value):"array"==s||!r&&"object"==s?serialize(e,o,r,t):e.add(t,o)})}var param=function(e,t){var r=[];return r.add=function(e,t){isFunction(t)&&(t=t()),null==t&&(t=""),this.push(encodeURIComponent(e)+"="+encodeURIComponent(t))},serialize(r,e,t),r.join("&").replace(/%20/g,"+")},Xhr=Evented.inherit({klassName:"Xhr",_request:function(args){var _=this._,self=this,options=mixin({},XhrDefaultOptions,_.options,args),xhr=_.xhr=new XMLHttpRequest;serializeData(options),options.beforeSend&&options.beforeSend.call(this,xhr,options);var dataType=options.dataType||options.handleAs,mime=options.mimeType||options.accepts[dataType],headers=options.headers,xhrFields=options.xhrFields,isFormData=options.data&&options.data instanceof FormData,basicAuthorizationToken=options.basicAuthorizationToken,type=options.type,url=options.url,async=options.async,user=options.user,password=options.password,deferred=new Deferred,contentType=options.contentType||!isFormData&&"application/x-www-form-urlencoded";if(xhrFields)for(name in xhrFields)xhr[name]=xhrFields[name];mime&&mime.indexOf(",")>-1&&(mime=mime.split(",",2)[0]),mime&&xhr.overrideMimeType&&xhr.overrideMimeType(mime);var finish=function(){xhr.onloadend=noop,xhr.onabort=noop,xhr.onprogress=noop,xhr.ontimeout=noop,xhr=null},onloadend=function(){var result,error=!1;if(xhr.status>=200&&xhr.status<300||304==xhr.status||0==xhr.status&&getAbsoluteUrl(url).startsWith("file:")){dataType=dataType||mimeToDataType(options.mimeType||xhr.getResponseHeader("content-type")),result=xhr.responseText;try{"script"==dataType?eval(result):"xml"==dataType?result=xhr.responseXML:"json"==dataType?result=blankRE.test(result)?null:JSON.parse(result):"blob"==dataType?result=Blob([xhr.response]):"arraybuffer"==dataType&&(result=xhr.reponse)}catch(e){error=e}error?deferred.reject(error,xhr.status,xhr):deferred.resolve(result,xhr.status,xhr)}else deferred.reject(new Error(xhr.statusText),xhr.status,xhr);finish()},onabort=function(){deferred&&deferred.reject(new Error("abort"),xhr.status,xhr),finish()},ontimeout=function(){deferred&&deferred.reject(new Error("timeout"),xhr.status,xhr),finish()},onprogress=function(e){deferred&&deferred.notify(e,xhr.status,xhr)};if(xhr.onloadend=onloadend,xhr.onabort=onabort,xhr.ontimeout=ontimeout,xhr.onprogress=onprogress,xhr.open(type,url,async,user,password),headers)for(var key in headers){var value=headers[key];"content-type"===key.toLowerCase()?contentType=value:xhr.setRequestHeader(key,value)}return contentType&&!1!==contentType&&xhr.setRequestHeader("Content-Type",contentType),headers&&"X-Requested-With"in headers||xhr.setRequestHeader("X-Requested-With","XMLHttpRequest"),basicAuthorizationToken&&xhr.setRequestHeader("Authorization",basicAuthorizationToken),xhr.send(options.data?options.data:null),deferred.promise},abort:function(){var e=this._,t=e.xhr;t&&t.abort()},request:function(e){return this._request(e)},get:function(e){return(e=e||{}).type="GET",this._request(e)},post:function(e){return(e=e||{}).type="POST",this._request(e)},patch:function(e){return(e=e||{}).type="PATCH",this._request(e)},put:function(e){return(e=e||{}).type="PUT",this._request(e)},del:function(e){return(e=e||{}).type="DELETE",this._request(e)},init:function(e){this._={options:e||{}}}});return["request","get","post","put","del","patch"].forEach(function(e){Xhr[e]=function(t,r){var n=new Xhr({url:t});return n[e](r)}}),Xhr.defaultOptions=XhrDefaultOptions,Xhr.param=param,Xhr}();return http.Xhr=Xhr}),define("skylark-net-http/Restful",["skylark-langx-objects","skylark-langx-strings","skylark-langx-emitter/Evented","./Xhr"],function(e,t,r,n){var s=e.mixin,i=t.substitute,a=r.inherit({klassName:"Restful",idAttribute:"id",getBaseUrl:function(e){var t=i(this.baseEndpoint,e),r=this.server+this.basePath+t;return void 0!==e[this.idAttribute]&&(r=r+"/"+e[this.idAttribute]),r},_head:function(e){},_get:function(e){return n.get(this.getBaseUrl(e),e)},_post:function(e,t){var r=this.getBaseUrl(e);return t&&(r=r+"/"+t),n.post(r,e)},_put:function(e,t){var r=this.getBaseUrl(e);return t&&(r=r+"/"+t),n.put(r,e)},_delete:function(e){var t=this.getBaseUrl(e);return n.del(t)},_patch:function(e){var t=this.getBaseUrl(e);return n.patch(t,e)},query:function(e){return this._post(e)},retrieve:function(e){return this._get(e)},create:function(e){return this._post(e)},update:function(e){return this._put(e)},delete:function(e){return this._delete(e)},patch:function(e){return this._patch(e)},init:function(e){s(this,e)}});return a}),define("skylark-net-http/Upload",["skylark-langx-types","skylark-langx-objects","skylark-langx-arrays","skylark-langx-async/Deferred","skylark-langx-emitter/Evented","./Xhr","./http"],function(e,t,r,n,s,i,a){var o=Blob.prototype.slice||Blob.prototype.webkitSlice||Blob.prototype.mozSlice,u=s.inherit({klassName:"Upload",_construct:function(e){this._options=t.mixin({debug:!1,url:"/upload",headers:{},maxConnections:999,maxChunkSize:void 0,onProgress:function(e,t,r,n){},onComplete:function(e,t,r,n,s){},onCancel:function(e,t){},onFailure:function(e,t,r){}},e),this._queue=[],this._params=[],this._files=[],this._xhrs=[],this._loaded=[]},add:function(e){return this._files.push(e)-1},send:function(e,r){if(this._files[e]&&!(this._queue.indexOf(e)>-1)){var n=this._queue.push(e),s=t.clone(r);this._params[e]=s,n<=this._options.maxConnections&&this._send(e,this._params[e])}},sendAll:function(e){for(var t=0;t<this._files.length;t++)this.send(t,e)},cancel:function(e){this._cancel(e),this._dequeue(e)},cancelAll:function(){for(var e=0;e<this._queue.length;e++)this._cancel(this._queue[e]);this._queue=[]},getName:function(e){var t=this._files[e];return null!=t.fileName?t.fileName:t.name},getSize:function(e){var t=this._files[e];return null!=t.fileSize?t.fileSize:t.size},getLoaded:function(e){return this._loaded[e]||0},_send:function(e,r){var n,s=this._options,a=this.getName(e),u=this.getSize(e),l=s.maxChunkSize||0,p=0,h=this._files[e],d={headers:t.clone(s.headers)};this._loaded[e]=this._loaded[e]||0;var c=this._xhrs[e]=new i({url:s.url});if(l)d.data=o.call(h,this._loaded[e],this._loaded[e]+l,h.type),n=d.data.size,d.headers["content-range"]="bytes "+this._loaded[e]+"-"+(this._loaded[e]+n-1)+"/"+u,d.headers["Content-Type"]="application/octet-stream";else{n=u;var f=r.formParamName,y=r.formData;f?(y||(y=new FormData),y.append(f,h),d.data=y):(d.headers["Content-Type"]=h.type||"application/octet-stream",d.data=h)}var m=this;c.post(d).progress(function(t){t.lengthComputable&&(p+=t.loaded,m._loaded[e]=m._loaded[e]+t.loaded,m._options.onProgress(e,a,m._loaded[e],u))}).then(function(t,s,i){m._files[e]&&(p<n&&(m._loaded[e]=m._loaded[e]+n-p,m._options.onProgress(e,a,m._loaded[e],u)),m._loaded[e]<u?m._send(e,r):(m._options.onComplete(e,a,t,s,i),m._files[e]=null,m._xhrs[e]=null,m._dequeue(e)))}).catch(function(t){m._options.onFailure(e,a,t),m._files[e]=null,m._xhrs[e]=null,m._dequeue(e)})},_cancel:function(e){this._options.onCancel(e,this.getName(e)),this._files[e]=null,this._xhrs[e]&&(this._xhrs[e].abort(),this._xhrs[e]=null)},getQueue:function(){return this._queue},_dequeue:function(e){var t=r.inArray(e,this._queue);this._queue.splice(t,1);var n=this._options.maxConnections;if(this._queue.length>=n&&t<n){var s=this._queue[n-1];this._send(s,this._params[s])}}});return u.send=function(e,t){var r=new u(t),n=r.add(e);return r.send(n,t)},u.sendAll=function(e,t){for(var r=new u(t),n=0,s=e.length;n<s;n++)this.add(file[n]);return r.send(t)},a.Upload=u}),define("skylark-net-http/main",["./http","./Restful","./Xhr","./Upload"],function(e){return e}),define("skylark-net-http",["skylark-net-http/main"],function(e){return e})}(define,require),!isAmd){var skylarkjs=require("skylark-langx-ns");isCmd?module.exports=skylarkjs:globals.skylarkjs=skylarkjs}}(0,this);
//# sourceMappingURL=sourcemaps/skylark-net-http.js.map
