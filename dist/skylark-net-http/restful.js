/**
 * skylark-net-http - The skylark http  library.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["skylark-langx-objects","skylark-langx-strings","skylark-langx-emitter/evented","./xhr"],function(t,e,n,r){var i=t.mixin,s=e.substitute;return n.inherit({klassName:"Restful",idAttribute:"id",getBaseUrl:function(t){var e=s(this.baseEndpoint,t),n=this.server+this.basePath+e;return void 0!==t[this.idAttribute]&&(n=n+"/"+t[this.idAttribute]),n},_head:function(t){},_get:function(t){return r.get(this.getBaseUrl(t),t)},_post:function(t,e){var n=this.getBaseUrl(t);return e&&(n=n+"/"+e),r.post(n,t)},_put:function(t,e){var n=this.getBaseUrl(t);return e&&(n=n+"/"+e),r.put(n,t)},_delete:function(t){var e=this.getBaseUrl(t);return r.del(e)},_patch:function(t){var e=this.getBaseUrl(t);return r.patch(e,t)},query:function(t){return this._post(t)},retrieve:function(t){return this._get(t)},create:function(t){return this._post(t)},update:function(t){return this._put(t)},delete:function(t){return this._delete(t)},patch:function(t){return this._patch(t)},init:function(t){i(this,t)}})});
//# sourceMappingURL=sourcemaps/restful.js.map
