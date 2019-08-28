/**
 * skylark-langx-xhr - The skylark JavaScript language extension library.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
!function(factory,globals){var define=globals.define,require=globals.require,isAmd="function"==typeof define&&define.amd,isCmd=!isAmd&&"undefined"!=typeof exports;if(!isAmd&&!define){var map={};define=globals.define=function(e,r,t){"function"==typeof t?(map[e]={factory:t,deps:r.map(function(r){return function(e,r){if("."!==e[0])return e;var t=r.split("/"),n=e.split("/");t.pop();for(var a=0;a<n.length;a++)"."!=n[a]&&(".."==n[a]?t.pop():t.push(n[a]));return t.join("/")}(r,e)}),resolved:!1,exports:null},require(e)):map[e]={factory:null,resolved:!0,exports:t}},require=globals.require=function(e){if(!map.hasOwnProperty(e))throw new Error("Module "+e+" has not been defined");var r=map[e];if(!r.resolved){var t=[];r.deps.forEach(function(e){t.push(require(e))}),r.exports=r.factory.apply(globals,t)||null,r.resolved=!0}return r.exports}}if(!define)throw new Error("The module utility (ex: requirejs or skylark-utils) is not loaded!");if(function(define,require){define("skylark-langx-xhr/Xhr",["skylark-langx-ns/ns","skylark-langx-types","skylark-langx-objects","skylark-langx-arrays","skylark-langx-funcs","skylark-langx-async/Deferred","skylark-langx-emitter/Evented"],function(skylark,types,objects,arrays,funcs,Deferred,Evented){var each=objects.each,mixin=objects.mixin,noop=funcs.noop,isArray=types.isArray,isFunction=types.isFunction,isPlainObject=types.isPlainObject,type=types.type,getAbsoluteUrl=function(e){return a||(a=document.createElement("a")),a.href=e,a.href},a,Xhr=function(){var jsonpID=0,key,name,rscript=/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,scriptTypeRE=/^(?:text|application)\/javascript/i,xmlTypeRE=/^(?:text|application)\/xml/i,jsonType="application/json",htmlType="text/html",blankRE=/^\s*$/,XhrDefaultOptions={async:!0,type:"GET",beforeSend:noop,success:noop,error:noop,complete:noop,context:null,global:!0,accepts:{script:"text/javascript, application/javascript, application/x-javascript",json:"application/json",xml:"application/xml, text/xml",html:"text/html",text:"text/plain"},crossDomain:!1,timeout:0,processData:!0,cache:!0,xhrFields:{withCredentials:!0}};function mimeToDataType(e){if(e&&(e=e.split(";",2)[0]),e){if(e==htmlType)return"html";if(e==jsonType)return"json";if(scriptTypeRE.test(e))return"script";if(xmlTypeRE.test(e))return"xml"}return"text"}function appendQuery(e,r){return""==r?e:(e+"&"+r).replace(/[&?]{1,2}/,"?")}function serializeData(e){e.data=e.data||e.query,e.processData&&e.data&&"string"!=type(e.data)&&(e.data=param(e.data,e.traditional)),!e.data||e.type&&"GET"!=e.type.toUpperCase()||(e.url=appendQuery(e.url,e.data),e.data=void 0)}function serialize(e,r,t,n){var a,s=isArray(r),o=isPlainObject(r);each(r,function(r,i){a=type(i),n&&(r=t?n:n+"["+(o||"object"==a||"array"==a?r:"")+"]"),!n&&s?e.add(i.name,i.value):"array"==a||!t&&"object"==a?serialize(e,i,t,r):e.add(r,i)})}var param=function(e,r){var t=[];return t.add=function(e,r){isFunction(r)&&(r=r()),null==r&&(r=""),this.push(encodeURIComponent(e)+"="+encodeURIComponent(r))},serialize(t,e,r),t.join("&").replace(/%20/g,"+")},Xhr=Evented.inherit({klassName:"Xhr",_request:function(args){var _=this._,self=this,options=mixin({},XhrDefaultOptions,_.options,args),xhr=_.xhr=new XMLHttpRequest;serializeData(options),options.beforeSend&&options.beforeSend.call(this,xhr,options);var dataType=options.dataType||options.handleAs,mime=options.mimeType||options.accepts[dataType],headers=options.headers,xhrFields=options.xhrFields,isFormData=options.data&&options.data instanceof FormData,basicAuthorizationToken=options.basicAuthorizationToken,type=options.type,url=options.url,async=options.async,user=options.user,password=options.password,deferred=new Deferred,contentType=!isFormData&&"application/x-www-form-urlencoded";if(xhrFields)for(name in xhrFields)xhr[name]=xhrFields[name];mime&&mime.indexOf(",")>-1&&(mime=mime.split(",",2)[0]),mime&&xhr.overrideMimeType&&xhr.overrideMimeType(mime);var finish=function(){xhr.onloadend=noop,xhr.onabort=noop,xhr.onprogress=noop,xhr.ontimeout=noop,xhr=null},onloadend=function(){var result,error=!1;if(xhr.status>=200&&xhr.status<300||304==xhr.status||0==xhr.status&&getAbsoluteUrl(url).startsWith("file:")){dataType=dataType||mimeToDataType(options.mimeType||xhr.getResponseHeader("content-type")),result=xhr.responseText;try{"script"==dataType?eval(result):"xml"==dataType?result=xhr.responseXML:"json"==dataType?result=blankRE.test(result)?null:JSON.parse(result):"blob"==dataType?result=Blob([xhrObj.response]):"arraybuffer"==dataType&&(result=xhr.reponse)}catch(e){error=e}error?deferred.reject(error,xhr.status,xhr):deferred.resolve(result,xhr.status,xhr)}else deferred.reject(new Error(xhr.statusText),xhr.status,xhr);finish()},onabort=function(){deferred&&deferred.reject(new Error("abort"),xhr.status,xhr),finish()},ontimeout=function(){deferred&&deferred.reject(new Error("timeout"),xhr.status,xhr),finish()},onprogress=function(e){deferred&&deferred.notify(e,xhr.status,xhr)};if(xhr.onloadend=onloadend,xhr.onabort=onabort,xhr.ontimeout=ontimeout,xhr.onprogress=onprogress,xhr.open(type,url,async,user,password),headers)for(var key in headers){var value=headers[key];"content-type"===key.toLowerCase()?contentType=headers[hdr]:xhr.setRequestHeader(key,value)}return contentType&&!1!==contentType&&xhr.setRequestHeader("Content-Type",contentType),headers&&"X-Requested-With"in headers||xhr.setRequestHeader("X-Requested-With","XMLHttpRequest"),basicAuthorizationToken&&xhr.setRequestHeader("Authorization",basicAuthorizationToken),xhr.send(options.data?options.data:null),deferred.promise},abort:function(){var e=this._,r=e.xhr;r&&r.abort()},request:function(e){return this._request(e)},get:function(e){return(e=e||{}).type="GET",this._request(e)},post:function(e){return(e=e||{}).type="POST",this._request(e)},patch:function(e){return(e=e||{}).type="PATCH",this._request(e)},put:function(e){return(e=e||{}).type="PUT",this._request(e)},del:function(e){return(e=e||{}).type="DELETE",this._request(e)},init:function(e){this._={options:e||{}}}});return["request","get","post","put","del","patch"].forEach(function(e){Xhr[e]=function(r,t){var n=new Xhr({url:r});return n[e](t)}}),Xhr.defaultOptions=XhrDefaultOptions,Xhr.param=param,Xhr}();return skylark.attach("langx.Xhr",Xhr)}),define("skylark-langx-xhr/main",["./Xhr"],function(e){return e}),define("skylark-langx-xhr",["skylark-langx-xhr/main"],function(e){return e})}(define,require),!isAmd){var skylarkjs=require("skylark-langx/skylark");isCmd?module.exports=skylarkjs:globals.skylarkjs=skylarkjs}}(0,this);
//# sourceMappingURL=sourcemaps/skylark-langx-xhr.js.map