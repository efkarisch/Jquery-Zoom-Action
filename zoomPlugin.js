/*!
* jQuery Zoom Action plugin
 * Original author: Edward Karisch (@efkarisch)
 * Description: Plugin to watch browser zoom level and perform callbacks based on target zoom level
 * Licensed under the MIT license
 */

(function($){

    $.zoomAction = function(cbACtion, cbUnActionOrOptions, options){

        var base = this;

        var private = {

            innerPrev: null,
            outerPrev: null,
            screenPrev: null,
            reachedTrigger: null,

        };

        base.init = function(){

            if(typeof cbACtion != 'function'){

                $.error( 'Please provide a function as the first argument');
            }
            
            if($.isPlainObject(options)){
            
            
                if(typeof cbUnActionOrOptions != 'function'){

                    $.error( 'Please provide a function as the second argument');
                }

                //set properties
                base.options = $.extend({},$.zoomAction.defaultOptions, options);

            }else if(!options){ //when second cb is not provided, 2nd argument should be options

                if($.isPlainObject(cbUnActionOrOptions)){

                    //set properties
                    base.options = $.extend({},$.zoomAction.defaultOptions, cbUnActionOrOptions);

                }else if (typeof cbUnActionOrOptions != 'function'){

                    $.error( 'Please provide a function as the second argument');
                }

            }

            private.screenSizesSet();
            // private.action = private.debounce(cbACtion, base.options.debounceTimer)
            // private.unAction = private.debounce(cbUnActionOrOptions, base.options.debounceTimer)
            
            //init bool bit flipping state
            private.reachedTrigger = base.getZoomLevel() >= base.options.zoomLevel

            //set actions from params
            private.action = cbACtion
            private.unAction = cbUnActionOrOptions

        };

        private.debounce = function(func, wait, immediate) {
            var timeout;
            return function() {
                var context = this, args = arguments;
                var later = function() {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
                var callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(context, args);
            };
        };

        private.screenSizesSet = function(){

            var w = window
            private.innerPrev  = w.innerWidth
            private.outerPrev  = w.outerWidth
            private.screenPrev = w.screen.availWidth
        }

        base.getZoomLevel = function(){

            var w = window
            return ((w.outerWidth  / w.innerWidth).toFixed(2)*100).toFixed();

        }

        base.hasReachedTrigger = function(){
            return base.getZoomLevel() >= base.options.zoomLevel
        }

        //return: true,false
        private.determineAction = function(){

            var w = window
            var innerSame           = w.innerWidth == private.innerPrev;
            var outerSame           = w.outerWidth == private.outerPrev;
            var innerEqualToOuter   = w.innerWidth == private.outerWidth
    
            //is zoom?, else it was a scroll.
            if ( (!innerSame && outerSame) && !innerEqualToOuter) {
		
                
                var zoomLevel = base.getZoomLevel();
                if(base.options.debug) console.log('zoom changed and is enabled at:' + zoomLevel + '%')
                
                var reachedTrigger = base.hasReachedTrigger()

                //if option set, do not complete determineAction() upon condition
                if(base.options.triggerOnce){
                    
                    if( private.reachedTrigger == reachedTrigger ){
                        //same as previous state, exit function
                        return false
                    }

                }

                if(reachedTrigger){
    
                    private.action()
    
                }else {
                    
                    private.unAction()
    
                }

                private.reachedTrigger = reachedTrigger;
    
            }else if(!innerSame && !outerSame){
    
                if(base.options.debug) console.log('window was resized')
    
            }

        }


        private.attach = function(){
            
            $(window).resize( private.debounce(private.determineAction, base.options.debounceTimer) )

        }

        private.detach = function(){
            $(window).off("resize", private.debounce(private.determineAction, base.options.debounceTimer) )
        }

        base.destroy = function(){
            
            private.detach();
            private = null;
            bas = null;
            this.detach();

        }

        // Run initialization methods
        base.init();
        private.attach();

        return base;

    };
    
    $.zoomAction.defaultOptions = {
        zoomLevel : 300, //level at which to trigger the firing action, undo action is below this level
        debounceTimer: 350,
        triggerOnce: true, //only fire once on zoom change when above or below target zoomLevel, if set to false it will fire at every zoomchange after debounce and perform the appropriate action for the zoom state
        debug:false

    };

    
})(jQuery);


// Example Usage

//  $(function() {

//     var action = function(){

//         // what you want to do when you reach & surpass the target zoom level

//         alert('you reached the target zoom level!')
    
//     }
    
//     var unAction = function(){
    
//         // what you want to undo when you have not reached or go back below the target zoom level
    
//         alert('you are below the target zoom level')

//     }
    
//     $.zoomAction(action, unAction, {/** options object **/})

//  });