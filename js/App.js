"use strict";

class App {
    constructor() {
        this.initElems();
        
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
    
    initElems() {
        this.el = document.createElement("div");
        this.el.className = "App";
        
        var tilesBox = document.createElement("div");
        tilesBox.className = "App--tiles";
        this.el.appendChild(tilesBox);
        
        var starsBox = document.createElement("div");
        starsBox.className = "App--stars";
        starsBox.innerHTML = [
            "<div class='App--star App--star1'></div>",
            "<div class='App--star App--star2'></div>",
            "<div class='App--star App--star3'></div>"
        ].join("");
        this.el.appendChild(starsBox);
        
        this.ui = {
            tiles: tilesBox,
            stars: starsBox
        };
        
        document.body.appendChild(this.el);
        this.ui.tiles.addEventListener("click", this.onClickTile.bind(this));
    }
    
    newGame() {
        var game = this.games[ this.gameIndex ];
        if ( !game ) {
            this.congratulations();
            return;
        }
        
        var n = game.n,
            m = game.m;
        
        this.hideStars();
        
        this.clicked = false;
        this.ui.tiles.innerHTML = "";
        this.matrix = this.createTileMatrix(n, m);
        this.successCount = 0;
        this.revertsCount = 0;
        
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
            tile,
            animals = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,16];
        
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
                
                tile = new Tile({
                    animal: stack[ l ],
                    x: i,
                    y: j,
                    size: size
                });
                
                matrix[i][j] = tile;
                this.ui.tiles.appendChild( tile.el );
                
                l++;
            }
        }
        
        return matrix;
    }
    
    onClickTile(e) {
        e.preventDefault();
        
        if ( this._animateWin ) {
            return;
        }
        
        if ( this._clickedAnimation ) {
            return;
        }
        
        var tileElem = e.target,
            tile = tileElem.tile;
        
        if ( !tile ) {
            return;
        }
        
        if ( tile.hidden ) {
            return;
        }
        
        if ( !this.clicked ) {
            this.playSound("revert");
            this.clicked = tile;
            tile.revert(1);
            return;
        }
        
        if ( this.clicked === tile ) {
            this.playSound("revert");
            tile.revert(-1);
            this.clicked = false;
            return;
        }
        
        // has prev clicked tile
        // and 
        // prev clicked tile != it tile
        this._clickedAnimation = true;
        
        this.playSound("revert");
        tile.revert(1, function() {
            setTimeout(function() {
                
                tile.revert(-1);
                this.clicked.revert(-1);
                
                this._clickedAnimation = false;
                this.revertsCount++;
                
                    
                if ( this.clicked.animal == tile.animal ) {
                    this.success(this.clicked, tile);
                }
                
                this.clicked = false;
                
            }.bind(this), 500);
        }.bind(this));
    }
    
    success(tile1, tile2) {
        tile1.hide();
        tile2.hide();
        
        this.successCount++;
        
        var n = this.matrix.length,
            m = this.matrix[0].length;
        
        if ( this.successCount * 2 >= n * m ) {
            this.animateWin(function() {
                this.newGame();
            }.bind(this));
        }
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
    
    hideStars() {
        this.ui.stars.className = "App--stars";
    }
    
    showStars(callback) {
        if ( !f.isFunction(callback) ) {
            callback = function() {};
        }
        
        this.ui.stars.className = "App--stars";
        
        var starsCount,
            prop = this.revertsCount / this.successCount;
            
        console.log(
            "reverts: " + this.revertsCount, 
            "success: " + this.successCount
        );
        
        if ( prop >= 3 ) {
            starsCount = 1;
        } 
        else if ( prop >= 2.1 ) {
            starsCount = 2;
        } 
        else {
            starsCount = 3;
        }
        
        this.ui.stars.className = "App--stars stars-1";
        this.playSound("ring");
        
        clearInterval(this._starsInterval);
        if ( starsCount === 1 ) {
            setTimeout(callback, 300);
            return;
        }
        
        var i = 2;
        this._starsInterval = setInterval(function() {
            this.playSound("ring");
            this.ui.stars.className = "App--stars stars-" + i;
            i++;
            
            if ( i > starsCount ) {
                clearInterval(this._starsInterval);
                setTimeout(callback, 300);
            }
        }.bind(this), 300);
    }
    
    animateWin(callback) {
        if ( !f.isFunction(callback) ) {
            callback = function() {};
        }
        
        this._animateWin = true;
        for (var i=0, n=this.matrix.length; i<n; i++) {
            for (var j=0, m=this.matrix[i].length; j<m; j++) {
                var tile = this.matrix[i][j];
                
                tile.show();
                tile.revert(1);
            }
        }
        
        this.showStars(function() {
            this._animateWin = false;
            this.playSound("win");
            
            setTimeout(function() {
                callback();
            }.bind(this), 2000);
        }.bind(this));
        
    }
}