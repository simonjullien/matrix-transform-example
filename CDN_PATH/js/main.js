define([
    "jquery",
    "config",
    "router",
    "controller/app_controller",
    "controller/ScrollController",
    "model/app_model",
    "view/Timeline"
],function(
    $,
    Config,
    Router,
    AppController,
    ScrollController,
    AppModel,
    Timeline
) {

		return {

            $rootNode: $('#rootNode'),
            currentView: null,
            scrollController: null,
            dispatcher: null,

			start: function() {


                AppModel.on("change:page", this.onAppModelPage, this);

                this.dispatcher = _.extend({},Backbone.Events);

                Router.setRoutes( [
                    ["",                        AppModel.PAGES.TIMELINE], //# Base url
                    [/^([0-9]+)\/([0-9]+)$/,    AppModel.PAGES.TIMELINE], //# Regexp example
                    ["timeline/:width/:height", AppModel.PAGES.TIMELINE], //# Variable example
                    ["detail",                  AppModel.PAGES.DETAIL]
                ]);

                Router.start();

                this.scrollController = new ScrollController();
                this.scrollController.init($(window),this.dispatcher);

                this.currentView = new Timeline({el:this.$rootNode, dispatcher:this.dispatcher});
            },

            onAppModelPage: function ( model, page ) {

                this.$rootNode.empty();

                if(this.currentView){
                    this.currentView.cleanUp();
                }
            }
		};
});