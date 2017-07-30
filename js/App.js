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
        this.el.innerHTML = "";
        this.matrix = this.createTileMatrix(n, m);
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
                this.el.appendChild( tile.el );
                
                l++;
            }
        }
        
        return matrix;
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
        
        var clickedIndex = this.clicked.indexOf(tile);
        if ( clickedIndex != -1 ) {
            this.clicked.splice(clickedIndex, 1);
            tile.revert(-1);
            return;
        }
        
        this.clicked.push(tile);
        this.playSound("revert");
        
        if ( this.clicked.length >= 2 ) {
            tile.revert(1, function() {
                var isWrongAnimals = this.clicked[0].animal != this.clicked[1].animal;
                
                if ( isWrongAnimals ) {
                    for (var i=0, n=this.clicked.length; i<n; i++) {
                        var tile = this.clicked[ i ];
                        tile.revert(-1);
                    }
                } else {
                    this.success(this.clicked[0], this.clicked[1]);
                }
                
                this.clicked = [];
            }.bind(this));
        } else {
            tile.revert(1);
        }
    }
    
    success(tile1, tile2) {
        tile1.hide();
        tile2.hide();
        
        this.successCount += 2;
        
        var n = this.matrix.length,
            m = this.matrix[0].length;
        
        if ( this.successCount >= n * m ) {
            this.newGame();
            this.playSound("win");
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
}