(function() {
  var Reqt, ReqtView;

  ReqtView = (function () {
    var ReqtView = function () {
      this.create();
    };

    ReqtView.prototype.create = function () {
      this.$container = $("<div/>", { id: "progress" });
      this.$inner = $("<div/>", { class: "inner" }).appendTo(this.$container);

      $("body").append(this.$container);
    };

    ReqtView.prototype.update = function (css) {
      this.$inner.animate(css, 10);
    };

    ReqtView.prototype.destroy = function () {
      var $container = this.$container;
      setTimeout(function () {
        $container.fadeOut("slow", function () {
          $container.remove();
        });
      }, 100);
    };

    return ReqtView;
  })();

  Reqt = (function () {
    var Reqt = function (args) {
      this.count = this.current = 0;
      this.view_class = ReqtView;

      this.override_open();
    };

    Reqt.prototype.set_view_class = function (klass) {
      this.view_class = klass;
    };

    Reqt.prototype.override_open = function () {
      var _this, o;

      _this = this;
      o = XMLHttpRequest.prototype.open;

      XMLHttpRequest.prototype.open = function () {
        _this.request(this);
        o.apply(this, arguments);
      };
    };

    Reqt.prototype.request = function (request) {
      if(++this.count == 1) { this.view = new this.view_class(); }
      request.addEventListener("progress", this.update.bind(this), false);
      request.addEventListener("load", this.loaded.bind(this), false);
    };

    Reqt.prototype.update = function (event) {
      var total = (this.current / this.count);
      // Include the percentage of the file downloaded if able to be calculated
      if (event.lengthComputable) {
        var section = (event.loaded / event.total);
        total += ((1 / this.count) * section);
      }

      this.view.update({ width: (total * 100) + "%" });
    };

    Reqt.prototype.loaded = function (event) {
      if(++this.current == this.count) {
        this.view.update({ width: "100%" });
        this.view.destroy();
        this.current = this.count = 0;
      }
      event.target.removeEventListener("progress");
      event.target.removeEventListener("load");
    };

    return new Reqt();
  })();

  return Reqt;
}());
