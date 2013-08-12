define([
    "jquery",
    "underscore",
    "backbone",
    "config",
    "handlebars",
    "util/animation/AnimationUtils",
    "util/MathUtils"
], function (
    $,
    _,
    Backbone,
    Config,
    Handlebars,
    AnimationUtils,
    MathUtils
) {
  return Backbone.View.extend({

        data: null,
        $node: null,
        isActivated: false,

        listImage: null,
        $window: null,
        rotat: 0,

        isTranslation: true,
        isRotation: true,
        isScale: true,

        initialize: function(options) {
            _.bindAll(this, "onFormChange");
            this.data = options.data;
            this.$window = $(window);
            //# Load HTML template
            require(["text!"+Config.BASE_URL+"templates/timeline_image.html!strip"], _.bind(this.onTemplateLoaded, this) );

        },

        cleanUp: function(){

        },

        onTemplateLoaded: function( template ) {
            this.listImage = [];
            var templateFunction = Handlebars.compile( template );
            this.$node = $( templateFunction( { 'title': 'Awesome!', 'time': new Date().toString() } ) );
            this.$el.append(this.$node);

            this.listImage = $('.timeline-image').children();
            for (var i = 0; i < this.listImage.length; i++) {
                var $it = $(this.listImage[i]);
                $it.css('top',(i*600+250)+'px');
                $it.rt = 0;
                $it.side = 2 * (i%2) -1;
                $it.offsetX = 0;
                $it.scale = 1;
                this.listImage[i] = $it;
            }
            $('.form').on('click', this.onFormChange);
        },

        onFormChange: function(e){
           this.isTranslation = $("form #translate").is(':checked');
           this.isRotation = $("form #rotate").is(':checked');
           this.isScale = $("form #scale").is(':checked');
        },

        setTransformation:function($it, rotationy, offsetX, scale){
            var rotationYM = AnimationUtils.getRotationYMatrix(rotationy);
            var translationXM = AnimationUtils.getTransformationMatrix(offsetX,0,0);
            var scaleM = AnimationUtils.getScaleMatrix(scale,scale,scale);
            var listTransform = [];
            if(this.isTranslation){
                listTransform.push(translationXM);
            }
            if(this.isRotation){
                listTransform.push(rotationYM);
            }
            if(this.isScale){
                listTransform.push(scaleM);
            }
            var resultM = AnimationUtils.getResultMatrix(listTransform);
            var cssTransformMatrix = AnimationUtils.getStringTransform3d(resultM);
            $it.css({
                'transform': cssTransformMatrix,
                '-ms-transform': cssTransformMatrix,
                '-webkit-transform': cssTransformMatrix,
                '-moz-transform': cssTransformMatrix,
                '-o-transform': cssTransformMatrix
            });
        },

        update: function(deltaTop){
            for (var i = 0; i < this.listImage.length; i++) {
                var $currentImage = this.listImage[i];
                var targetScale = 1-Math.abs(((deltaTop + this.$window.height() / 4) - $currentImage.position().top)*0.0007);
                if(targetScale < 0){
                    targetScale = 0.001;
                }
                $currentImage.rt += ((((deltaTop + this.$window.height() / 4) - $currentImage.position().top)*0.03) - $currentImage.rt)*0.1;
                $currentImage.offsetX += (($currentImage.side * ((deltaTop + this.$window.height() / 4) - $currentImage.position().top)*0.5)-$currentImage.offsetX)*0.1;
                $currentImage.scale += (targetScale - $currentImage.scale)*0.1;
                this.setTransformation($currentImage,$currentImage.side * $currentImage.rt,$currentImage.offsetX,$currentImage.scale);
           }
        },

		render: function() {
		}
	});
});