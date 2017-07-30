"use strict";

var REVERT_SPEED = 5;

class Tile {
    constructor(params) {
        this.params = f.deepMixin({
            x: 0,
            y: 0,
            animal: false,
            size: false
        }, params);
        
        var animal = this.params.animal,
            size = this.params.size,
            x = this.params.x,
            y = this.params.y;
        
        var elem = document.createElement("div");
        elem.className = "Tile animal-" + animal;
        
        elem.innerHTML = "<div class='back'></div><div class='front'></div>";
        
        elem.style.width = size + "%";
        elem.style.height = size + "%";
        elem.style.left = x * size + "%";
        elem.style.top = y * size + "%";
        
        this.el = elem;
        this.ui = {
            front: elem.querySelector(".front"),
            back: elem.querySelector(".back")
        };
        
        elem.tile = this;
        this.ui.front.tile = this;
        this.ui.back.tile = this;
        
        this.animal = animal;
        this.rotate = 0;
        this.reverted = false;
        this.hidden = false;
        
        this.animation = {
            state: 0,
            vector: 0,
            interval: false
        };
        
        this.render();
    }
    
    render() {
        var rotate = this.rotate,
            style = "transform: rotateY("+ rotate +"deg);",
            frontStyle = style,
            backStyle = style;
        
        if ( rotate >= 90 )  {
            frontStyle += "z-index: 1;";
            backStyle += "z-index: 2;";
            this.reverted = true;
        } else {
            frontStyle += "z-index: 2;";
            backStyle += "z-index: 1;";
            this.reverted = false;
        }
        
        this.ui.front.setAttribute("style", frontStyle);
        this.ui.back.setAttribute("style", backStyle);
        
        this.el.className = (
            "Tile" +
            " animal-" + this.animal + 
            (this.reverted ? " reverted" : "") + 
            (this.hidden ? " hide" : "")
        );
    }
    
    onInterval(callback) {
        if ( !f.isFunction(callback) ) {
            callback = function() {};
        }
        
        var state = this.animation.state,
            vector = this.animation.vector * REVERT_SPEED;
        
        if ( vector > 0 ) {
            if ( state >= 100 ) {
                this.animation.state = 100;
                clearInterval(this.animation.interval);
                callback();
                return;
            }
        } else {
            if ( state <= 0 ) {
                this.animation.state = 0;
                clearInterval(this.animation.interval);
                callback();
                return;
            }
        }
        
        this.animation.state += vector;
        this.rotate = (state / 100) * 180;
        
        this.render();
    }
    
    hide() {
        this.hidden = true;
        this.render();
    }
    
    show() {
        this.hidden = false;
        this.render();
    }
    
    // vector: 1 or -1
    revert(vector, callback) {
        clearInterval( this.animation.interval );
        this.animation.vector = vector;
        
        this.animation.interval = setInterval(
            this.onInterval.bind(this, callback), 
        30);
    }
}