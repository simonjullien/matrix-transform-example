define([
    "jquery",
    "underscore",
    "backbone",
    "config",
    "TimelineData",
    "util/animation/AnimationUtils",
    "util/MathUtils",
    "view/timeline_components/TimelineImage",
    "handlebars"
], function (
    $,
    _,
    Backbone,
    Config,
    TimelineData,
    AnimationUtils,
    MathUtils,
    TimelineImage,
    Handlebars
) {
  return Backbone.View.extend({

        data: null,

        $momentsNode: null,
        $scrollNode:null,
        $window: null,
        listImages: null,
        dispatcher: null,
        topValue: 0,

        screenCenter: 0,

        loopInterval: null,

        positionYStart: 0,
        positionYMove: 0,
        vectorYMove: 0,
        pagePositionY: 0,
        targetPagePositionY: 0,
        positionPageDeltaOrigineY: 0,
        isTouchDown: false,

        currentValueTest:0,

        tpValue:0,

        timelineImage: null,

        initialize: function(options) {
            this.dispatcher = options.dispatcher;

            _.bindAll(
                this,
                "onScrollChange",
                "loopAnimation",
                "touchStartHandler",
                "touchMoveHandler",
                "touchEndHandler",
                "draw"
            );
            this.$window = $(window);
           require(["text!"+Config.BASE_URL+"templates/timeline.html!strip"], _.bind(this.onTemplateLoaded, this) );
        },

        onScrollChange:function(topValue){
            this.tpValue = - topValue;
            //this.$scrollNode.css('height',(this.$momentsNode.height() + 70)+'px');
        },

        cleanUp: function(){
            $(document).off('touchstart',this.touchStartHandler);
            $(document).off('touchmove',this.touchMoveHandler);
            $(document).off('touchend',this.touchEndHandler);
            this.clearInterval(this.loopInterval);
        },

        onTemplateLoaded: function( template ) {

            var templateFunction = Handlebars.compile( template );

            this.$el.append(
                $( templateFunction( { 'title': 'Awesome!', 'time': new Date().toString() } ) )
            );
            this.init();
        },

        init:function(){
            this.$momentsNode = $('.moment-list');
            this.$scrollNode = $('.timeline-scroll');

            if(Config.IPAD){
                this.$scrollNode.css('display','none');
            }

            this.timelineImage = new TimelineImage({el:this.$momentsNode, data:null});
            this.initEvents();
            this.loopInterval = setInterval(this.loopAnimation,1000/60);

        },

        setPosition:function(deltaCenter){
            var translationM = AnimationUtils.getTransformationMatrix(0,this.pagePositionY,0);
            //var scaleM = AnimationUtils.getScaleMatrix(1,1,1);
            //var rotationYM = AnimationUtils.getRotationZMatrix(10);
            var resultM = AnimationUtils.getResultMatrix([translationM]);
            var cssTransformMatrix = AnimationUtils.getStringTransform3d(resultM);
            this.$momentsNode.css({
                'transform': cssTransformMatrix,
                '-ms-transform': cssTransformMatrix,
                '-webkit-transform': cssTransformMatrix,
                '-moz-transform': cssTransformMatrix,
                '-o-transform': cssTransformMatrix
            });
        },

        loopAnimation:function(){

            if(!Config.IPAD){
                this.pagePositionY += MathUtils.simpleEasing(this.tpValue, this.pagePositionY, 0.15);
            }else{
                this.targetPagePositionY = MathUtils.getDistance(this.positionYMove, this.positionYStart) * 2;
                this.pagePositionY += MathUtils.simpleEasing(this.targetPagePositionY+this.positionPageDeltaOrigineY, this.pagePositionY, 0.1);
                this.vectorYMove *= 0.9;
            }
            this.setPosition();

            this.timelineImage.update(-this.tpValue);
        },

        initEvents:function(){
            //events
            this.dispatcher.on('scroll_change', this.onScrollChange);
            $(document).on('touchstart',this.touchStartHandler);
            $(document).on('touchmove',this.touchMoveHandler);
            $(document).on('touchend',this.touchEndHandler);
        },

        touchStartHandler:function(e){
            this.isTouchDown = true;
             //e.preventDefault();
            this.positionPageDeltaOrigineY = this.pagePositionY;
            this.positionYStart = -e.originalEvent.touches[0].pageY;
            this.positionYMove = -e.originalEvent.touches[0].pageY;
            this.vectorYMove = 0;
        },

        touchMoveHandler:function(e){
            e.preventDefault();
            //this.vectorYMove = (e.originalEvent.touches[0].pageY - this.positionYMove)*10;
            this.positionYMove = -e.originalEvent.touches[0].pageY;

        },

        touchEndHandler:function(e){
            this.isTouchDown = false;
        },

        draw:function() {
        },

		render: function() {
		}


	});
});
