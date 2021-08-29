define([
    "skylark-langx-types",
    "skylark-langx-objects",
    "skylark-langx-arrays",
    "skylark-langx-async/deferred",
    "skylark-langx-emitter/evented",    
    "./xhr",
    "./http"
],function(types, objects, arrays, Deferred, Evented,Xhr, http){

    var blobSlice = Blob.prototype.slice || Blob.prototype.webkitSlice || Blob.prototype.mozSlice;


    /*
     *Class for uploading files using xhr.
     */
    var Upload = Evented.inherit({
        klassName : "Upload",

        _construct : function(options) {
            this._options = objects.mixin({
                debug: false,
                url: '/upload',
                headers : {

                },
                // maximum number of concurrent uploads
                maxConnections: 999,
                // To upload large files in smaller chunks, set the following option
                // to a preferred maximum chunk size. If set to 0, null or undefined,
                // or the browser does not support the required Blob API, files will
                // be uploaded as a whole.
                maxChunkSize: undefined,

                onProgress: function(id, fileName, loaded, total){
                },
                onComplete: function(id, fileName,result,status,xhr){
                },
                onCancel: function(id, fileName){
                },
                onFailure : function(id,fileName,e) {                    
                }
            },options);

            this._queue = [];
            // params for files in queue
            this._params = [];

            this._files = [];
            this._xhrs = [];

            // current loaded size in bytes for each file
            this._loaded = [];

        },

        /**
         * Adds file to the queue
         * Returns id to use with upload, cancel
         **/
        add: function(file){
            return this._files.push(file) - 1;
        },

        /**
         * Sends the file identified by id and additional query params to the server.
         */
        send: function(id, params){
            if (!this._files[id]) {
                // Already sended or canceled
                return ;
            }
            if (this._queue.indexOf(id)>-1) {
                // Already in the queue
                return;
            }
            var len = this._queue.push(id);

            var copy = objects.clone(params);

            this._params[id] = copy;

            // if too many active uploads, wait...
            if (len <= this._options.maxConnections){
                this._send(id, this._params[id]);
            }     
        },

        /**
         * Sends all files  and additional query params to the server.
         */
        sendAll: function(params){
           for( var id = 0; id <this._files.length; id++) {
                this.send(id,params);
            }
        },

        /**
         * Cancels file upload by id
         */
        cancel: function(id){
            this._cancel(id);
            this._dequeue(id);
        },

        /**
         * Cancells all uploads
         */
        cancelAll: function(){
            for (var i=0; i<this._queue.length; i++){
                this._cancel(this._queue[i]);
            }
            this._queue = [];
        },

        getName: function(id){
            var file = this._files[id];
            return file.fileName != null ? file.fileName : file.name;
        },

        getSize: function(id){
            var file = this._files[id];
            return file.fileSize != null ? file.fileSize : file.size;
        },

        /**
         * Returns uploaded bytes for file identified by id
         */
        getLoaded: function(id){
            return this._loaded[id] || 0;
        },


        /**
         * Sends the file identified by id and additional query params to the server
         * @param {Object} params name-value string pairs
         */
        _send: function(id, params){
            var options = this._options,
                name = this.getName(id),
                size = this.getSize(id),
                chunkSize = options.maxChunkSize || 0,
                curUploadingSize,
                curLoadedSize = 0,
                file = this._files[id],
                args = {
                    headers : objects.clone(options.headers)                    
                };

            this._loaded[id] = this._loaded[id] || 0;

            var xhr = this._xhrs[id] = new Xhr({
                url : options.url
            });

            if (chunkSize)  {

                args.data = blobSlice.call(
                    file,
                    this._loaded[id],
                    this._loaded[id] + chunkSize,
                    file.type
                );
                // Store the current chunk size, as the blob itself
                // will be dereferenced after data processing:
                curUploadingSize = args.data.size;
                // Expose the chunk bytes position range:
                args.headers["content-range"] = 'bytes ' + this._loaded[id] + '-' +
                    (this._loaded[id] + curUploadingSize - 1) + '/' + size;
                args.headers["Content-Type"] = "application/octet-stream";
            }  else {
                curUploadingSize = size;
                var formParamName =  params.formParamName,
                    formData = params.formData;

                if (formParamName) {
                    if (!formData) {
                        formData = new FormData();
                    }
                    formData.append(formParamName,file);
                    args.data = formData;
    
                } else {
                    args.headers["Content-Type"] = file.type || "application/octet-stream";
                    args.data = file;
                }
            }


            var self = this;
            xhr.post(
                args
            ).progress(function(e){
                if (e.lengthComputable){
                    curLoadedSize = curLoadedSize + e.loaded;
                    self._loaded[id] = self._loaded[id] + e.loaded;
                    self._options.onProgress(id, name, self._loaded[id], size);
                }
            }).then(function(result,status,xhr){
                if (!self._files[id]) {
                    // the request was aborted/cancelled
                    return;
                }

                if (curLoadedSize < curUploadingSize) {
                    // Create a progress event if no final progress event
                    // with loaded equaling total has been triggered
                    // for this chunk:
                    self._loaded[id] = self._loaded[id] + curUploadingSize - curLoadedSize;
                    self._options.onProgress(id, name, self._loaded[id], size);                    
                }

                if (self._loaded[id] <size) {
                    // File upload not yet complete,
                    // continue with the next chunk:
                    self._send(id,params);
                } else {
                    self._options.onComplete(id,name,result,status,xhr);

                    self._files[id] = null;
                    self._xhrs[id] = null;
                    self._dequeue(id);
                }


            }).catch(function(e){
                self._options.onFailure(id,name,e);

                self._files[id] = null;
                self._xhrs[id] = null;
                self._dequeue(id);
            });
        },

        _cancel: function(id){
            this._options.onCancel(id, this.getName(id));

            this._files[id] = null;

            if (this._xhrs[id]){
                this._xhrs[id].abort();
                this._xhrs[id] = null;
            }
        },

        /**
         * Returns id of files being uploaded or
         * waiting for their turn
         */
        getQueue: function(){
            return this._queue;
        },


        /**
         * Removes element from queue, starts upload of next
         */
        _dequeue: function(id){
            var i = arrays.inArray(id,this._queue);
            this._queue.splice(i, 1);

            var max = this._options.maxConnections;

            if (this._queue.length >= max && i < max){
                var nextId = this._queue[max-1];
                this._send(nextId, this._params[nextId]);
            }
        }
    });


  Upload.send = function(file, options) {
    var uploader = new Upload(options);
    var id = uploader.add(file);
    return uploader.send(id,options);
  };

  Upload.sendAll = function(files,options) {
      var uploader = new Upload(options);
      for (var i = 0, len = files.length; i < len; i++) {
        this.add(file[i]);
      }
      return uploader.send(options);
  };

    return http.Upload = Upload;    
});