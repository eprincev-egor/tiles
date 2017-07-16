"use strict";

var REVERT_SPEED = 5;

class App {
    constructor() {
        this.el = document.querySelector(".game");
        this.el.addEventListener("click", this.onClickTile.bind(this));
        
        window.addEventListener("resize", this.onResize.bind(this));
        this.onResize();
        
        this.winner = false;
        this.gameIndex = 0;
        this.games = [
            {n: 2, m: 2},
            {n: 3, m: 2},
            {n: 4, m: 3}
        ];
        this.newGame();
        
        this.playSound("bg", {loop: true});
    }
    
    newGame() {
        var game = this.games[ this.gameIndex ];
        if ( !game ) {
            this.congratulations();
            return;
        }
        
        var n = game.n,
            m = game.m;
        
        this.clicked = [];
        this.matrix = this.createTileMatrix(n, m);
        this.el.innerHTML = "";
        this.renderTilesMatrix(this.matrix);
        this.successCount = 0;
        
        this.gameIndex++;
    }
    
    onResize() {
        var windowSize = f.getWindowSize(),
            width = windowSize.width,
            height = windowSize.height,
            el = this.el,
            diff;
        
        if ( width > height ) {
            diff = (width - height) / 2;
            el.style.width = height + "px";
            el.style.height = height + "px";
            el.style.left = diff + "px";
            el.style.top = 0 + "px";
        } else {
            diff = (height - width) / 2;
            el.style.width = width + "px";
            el.style.height = width + "px";
            el.style.left = 0 + "px";
            el.style.top = diff + "px";
        }
    }
    
    createTileMatrix(n, m) {
        var matrix = [],
            size = 100 / n,
            i, j, l,
            stack = [],
            rndIndex, rndAnimal,
            animals = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38];
        
        for (i=0, l = n * m / 2; i<l; i++) {
            rndIndex = Math.floor( Math.random() * animals.length );
            rndAnimal = animals[ rndIndex ];
            animals.splice( rndIndex, 1 );
            
            stack.push( rndAnimal );
            stack.push( rndAnimal );
        }
        stack.sort(function() {
            return Math.random() > 0.5 ? 1 : -1;
        });
        
        l = 0;
        for (i=0; i<n; i++) {
            matrix[i] = [];
            
            for (j=0; j<m; j++) {
                
                matrix[i][j] = {
                    animal: stack[ l ],
                    x: i,
                    y: j,
                    size: size
                };
                l++;
            }
        }
        
        return matrix;
    }
    
    renderTilesMatrix(matrix) {
        var line;
        
        for (var i=0, n=matrix.length; i<n; i++) {
            line = matrix[i];
            
            for (var j=0, m=line.length; j<m; j++) {
                var tile = line[j],
                    size = tile.size;
                
                var elem = document.createElement("div");
                elem.className = "Tile animal-" + tile.animal;
                
                elem.innerHTML = "<div class='back'></div><div class='front'></div>";
                
                elem.style.width = size + "%";
                elem.style.height = size + "%";
                elem.style.left = i * size + "%";
                elem.style.top = j * size + "%";
                
                tile.el = elem;
                tile.frontEl = elem.querySelector(".front");
                tile.backEl = elem.querySelector(".back");
                
                elem.tile = tile;
                tile.frontEl.tile = tile;
                tile.backEl.tile = tile;
                
                this.el.appendChild(elem);
            }
        }
    }
    
    onClickTile(e) {
        e.preventDefault();
        var tileElem = e.target,
            tile = tileElem.tile;
        
        if ( !tile ) {
            return;
        }
        
        if ( tile.hidden ) {
            return;
        }
        
        if ( this.clicked.length > 2 ) {
            return;
        }
        
        if ( this.clicked.indexOf(tile) != -1 ) {
            return;
        }
        
        this.clicked.push(tile);
        this.playSound("revert");
        
        if ( this.clicked.length == 2 ) {
            this.animateRevert(tile, REVERT_SPEED, function() {
                
                if ( this.clicked[0].animal == this.clicked[1].animal ) {
                    this.success(this.clicked[0], this.clicked[1]);
                } else {
                    this.animateRevert(this.clicked[0], -REVERT_SPEED);
                    this.animateRevert(this.clicked[1], -REVERT_SPEED);
                }
                
                this.clicked = [];
            }.bind(this));
        } else {
            this.animateRevert(tile, REVERT_SPEED);
        }
    }
    
    animateRevert(tile, vector, callback) {
        if ( tile.animation ) {
            clearInterval( tile.animation.interval );
            
            if ( tile.animation.vector != vector ) {
                tile.animation.state = 100 - tile.animation.state;
            }
        } else {
            tile.animation = {
                vector: vector,
                state: 0
            };
        }
        
        tile.animation.interval = setInterval(
            this.onIntervalAnimation.bind(this, tile, vector, callback), 
        30);
    }
    
    onIntervalAnimation(tile, vector, callback) {
        if ( !f.isFunction(callback) ) {
            callback = function() {};
        }
        
        var state = tile.animation.state;
        tile.animation.state += vector;
        
        if ( vector > 0 ) {
            if ( state > 100 ) {
                tile.animation.state = 100;
                clearInterval(tile.animation.interval);
                callback();
                return;
            }
        } else {
            if ( state < 0 ) {
                tile.animation.state = 0;
                clearInterval(tile.animation.interval);
                callback();
                return;
            }
        }
        
        
        var rotate = (state / 100) * 180,
            style = "transform: rotateY("+ rotate +"deg);",
            frontStyle = style,
            backStyle = style;
        
        if ( rotate >= 90 )  {
            frontStyle += "z-index: 1;";
            backStyle += "z-index: 2;";
        } else {
            frontStyle += "z-index: 2;";
            backStyle += "z-index: 1;";
        }
        
        tile.frontEl.setAttribute("style", frontStyle);
        tile.backEl.setAttribute("style", backStyle);
    }
    
    success(firstTile, secondTile) {
        firstTile.succes = secondTile;
        secondTile.success = firstTile;
        
        this.hideTile(firstTile);
        this.hideTile(secondTile);
        
        this.successCount += 2;
        
        var n = this.matrix.length,
            m = this.matrix[0].length;
        
        if ( this.successCount >= n * m ) {
            this.newGame();
            this.playSound("win");
        }
    }
    
    hideTile(tile) {
        tile.el.className = "Tile animal-"+ tile.animal +" hide";
        tile.hidden = true;
    }
    
    congratulations() {
        this.winner = true;
        this.gameIndex = 0;
        document.body.className = "congratulations";
    }
    
    playSound(src, options) {
        options = f.deepMixin({
            loop: false
        }, options);
        
		var sound = document.createElement("audio");
        sound.autoplay = "autoplay";
        
        if ( options.loop ) {
            sound.loop = "loop";
        }
        
        sound.innerHTML = '<source src="sounds/'+ src +'.mp3" />';
	}
}