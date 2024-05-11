class LevelOne extends Phaser.Scene {
    constructor() {
        super("levelOne");

        // initialize class variables
        this.my = {sprite: {}, text: {},};

        // create a property inside "sprite" named "bullet"
        this.my.sprite.bullet = [];   
        this.maxBullets = 5;

        this.my.sprite.enemies = [];
        
        // score is a class variable, but needs to be global if shared across scenes/levels
        this.myScore = 0;

        // define start positions
        this.playerStartPositionX = game.config.width/2;
        this.playerStartPositionY = game.config.height - 40;

        //other 
        this.isPlayerMovable = true;
        this.playerLives = 3;
        this.points = [];
        this.time = 0;
        this.trigger = 60;
        this.index = 0;

    }

    preload() {
        // load assets 
        this.load.setPath("./assets/");
        this.load.image("player", "shipYellow_manned.png");
        this.load.image("playerBullet", "laserYellow_burst.png");
        this.load.image("enemyOne", "ghost.png");
        this.load.image("enemyTwo", "bat_fly.png");

        // load animation frames
        this.load.image("ghostDead00", "ghost_hit.png");
        this.load.image("ghostDead01", "ghost.png");

        this.load.image("batDead00", "bat_hit.png");
        this.load.image("batDead01", "bat.png");
        this.load.image("batDead02", "bat_fly.png");

        this.load.image("playerDead00", "shipYellow.png");
        this.load.image("playerDead01", "shipYellow_damage1.png");
        this.load.image("playerDead02", "shipYellow_damage2.png");

        // load Kenny Rocket Square bitmap font
        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");

        // load audio
        this.load.audio("enemyDown", "jingles_NES13.ogg");
        this.load.audio("playerDown","jingles_NES13.ogg");
    }

    create() {
        let my = this.my;

        this.init_game();

        //create paths
        this.points2 = [ 50, 400, 200, 200, 350, 300, 500, 500, 900, 400 ];
        this.curve2 = new Phaser.Curves.Spline(this.points2);

        this.points = [ 267, 88, 676, 232, 65, 366, 321, 645 ];
        this.curve = new Phaser.Curves.Spline(this.points);

        //create enemy group
        my.sprite.enemyOneGroup = this.add.group({
            defaultKey: "enemyOne",
            maxSize: 8
            }
        );
        my.sprite.enemyOneGroup.createMultiple({
            active: true,
            path: this.curve,
            key: my.sprite.enemyOneGroup.defaultKey,
            repeat: my.sprite.enemyOneGroup.maxSize-1
        });

        let i = 110;
        for (let enemy of my.sprite.enemyOneGroup.getChildren()){
            enemy.setPosition(i, 110);
            enemy.setScale(0.7);
            i+=80;
        }

        //create second enemy Group
        my.sprite.enemyTwoGroup = this.add.group({
            classType: Phaser.GameObjects.Sprite.Follower,
            defaultKey: "enemyTwo",
            maxSize: 5
            }
        );
        my.sprite.enemyTwoGroup.createMultiple({
            active: true,
            path: this.curve,
            key: my.sprite.enemyTwoGroup.defaultKey,
            repeat: my.sprite.enemyTwoGroup.maxSize-1
        });
        let j = 110;
        for (let enemy of my.sprite.enemyTwoGroup.getChildren()){
            enemy.setPosition(j, 180);
            enemy.setScale(0.8);
            j+=150;
        }

        // create player avatar
        my.sprite.player = this.add.sprite(this.playerStartPositionX, this.playerStartPositionY, "player");
        my.sprite.player.setScale(0.6);
        // create enemy one for testing
        my.sprite.enemyOne = this.add.follower(this.curve, game.config.width/2, 80, "enemyOne");
        my.sprite.enemyOne.setScale(0.7);
        my.sprite.enemyOne.scorePoints = 50;
        my.sprite.enemyOne.visible = false;
        // create enemy two for testing
        my.sprite.enemyTwo = this.add.sprite(100, 550, "enemyTwo");
        my.sprite.enemyTwo.setScale(0.8);
        my.sprite.enemyTwo.scorePoints = 100;

        //create path follow enemies offscreen
        my.sprite.enemies.push(this.add.follower(this.curve2, -20, 350, "enemyOne").setScale(0.7));
        my.sprite.enemies.push(this.add.follower(this.curve2, -20, 400, "enemyOne").setScale(0.7));
        my.sprite.enemies.push(this.add.follower(this.curve2, -20, 450, "enemyOne").setScale(0.7));

        // create animations
        this.anims.create({
            key: "ghostDead",
            frames: [
                { key: "ghostDead00" },
                { key: "ghostDead01" },
            ],
            frameRate: 30,
            repeat: 7,
            hideOnComplete: true
        });

        this.anims.create({
            key: "batDead",
            frames: [
                { key: "batDead00" },
                { key: "batDead01" },
                { key: "batDead02" },
            ],
            frameRate: 30,
            repeat: 8,
            hideOnComplete: true
        });

        this.anims.create({
            key: "playerDead",
            frames: [
                { key: "playerDead00" },
                { key: "playerDead01" },
                { key: "playerDead02" },
            ],
            frameRate: 30,
            repeat: 12,
            hideOnComplete: true
        });

        // create key objects
        this.left = this.input.keyboard.addKey("A");
        this.right = this.input.keyboard.addKey("D");
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.testKey = this.input.keyboard.addKey("T");

        // set movement speeds (in pixels/tick)
        this.playerSpeed = 11;
        this.enemySpeed = 10;
        this.bulletSpeed = 18;

        // update HTML description
        document.getElementById('description').innerHTML = '<h2>Gallery Shooter: Harmonize</h2>As an alien from Harmonia, it is your duty to bring harmony to all worlds!<br>Help the people of this world by eliminating all enemies.<br><br>A: to move left<br>D: to move right<br>Space: to shoot'

        // put score on screen
        my.text.score = this.add.bitmapText(10, 15, "rocketSquare", "Score " + this.myScore);

        //put lives on screen
        my.text.lives = this.add.bitmapText(625, 15, "rocketSquare", "Lives " + this.playerLives);
    }

    update() {
        let my = this.my;
        this.time+=1;

        //activate follower enemies over time
        if(this.time == this.trigger && this.index < 3){
            console.log("follower activated");
            let follower = my.sprite.enemies[this.index];
            let X = follower.x;
            let Y = follower.y;
                follower.startFollow({
                    duration: 6000,
                    ease: 'Sine.easeInOut',
                    onComplete: () => {
                        follower.pathTween.stop();
                        follower.pathTween = null;
                        follower.setPosition(X, Y); //return to starting position
                    }
                });
            this.index+=1;
            this.trigger+=100;
        }

        // move left
        if (this.left.isDown && this.isPlayerMovable) {
            // Check to make sure the sprite can actually move left
            if (my.sprite.player.x > (my.sprite.player.displayWidth/2)) {
                my.sprite.player.x -= this.playerSpeed;
            }
        }

        // move right
        if (this.right.isDown && this.isPlayerMovable) {
            // Check to make sure the sprite can actually move right
            if (my.sprite.player.x < (game.config.width - (my.sprite.player.displayWidth/2))) {
                my.sprite.player.x += this.playerSpeed;
            }
        }

        // check for bullet being fired
        if (Phaser.Input.Keyboard.JustDown(this.space) && this.isPlayerMovable) {
            // Verify we are under max bullet count
            if (my.sprite.bullet.length < this.maxBullets) {
                my.sprite.bullet.push(this.add.sprite(
                    my.sprite.player.x, my.sprite.player.y-(my.sprite.player.displayHeight/2), "playerBullet")
                );
            }
        }

        // remove all of the bullets which are offscreen
        my.sprite.bullet = my.sprite.bullet.filter((bullet) => bullet.y > -(bullet.displayHeight/2));


        // check for player bullet collision
        for (let bullet of my.sprite.bullet) {
            for (let ghost of my.sprite.enemyOneGroup.getChildren()){
            // collision with enemy one
            if (this.collides(ghost, bullet)) {
                console.log("collision detected - ghost hit.");
                // start animation
                this.ghostDown = this.add.sprite(ghost.x, ghost.y, "ghostDead01").setScale(0.7).play("ghostDead");

                // clear out
                bullet.y = -100;
                ghost.visible = false;
                ghost.active = false;
                ghost.x = -100;
                my.sprite.enemyOneGroup.kill(ghost);
                
                // update score
                this.myScore += my.sprite.enemyOne.scorePoints;
                this.updateScore();

                // play sound
                this.sound.play("enemyDown", {
                    volume: 0.5   // Can adjust volume using this, goes from 0 to 1
                });
            }
            }

            for(let bat of my.sprite.enemyTwoGroup.getChildren()){
            // collision with enemy two
            if (this.collides(bat, bullet)) {
                console.log("collision detected - bat hit.");
                // start animation
                this.batDown = this.add.sprite(bat.x, bat.y, "batDead02").setScale(0.8).play("batDead");

                // clear out
                bullet.y = -100;
                bat.visible = false;
                bat.x = -100;
                my.sprite.enemyTwoGroup.kill(bat);
                
                // update score
                this.myScore += my.sprite.enemyTwo.scorePoints;
                this.updateScore();

                // play sound
                this.sound.play("enemyDown", {
                    volume: 0.5 
                });
            }
            }
        }

        // make all bullets move
        for (let bullet of my.sprite.bullet) {
            bullet.setScale(0.12);
            bullet.y -= this.bulletSpeed;
        }

        //check for enemy collision with player
        for (let followers of my.sprite.enemies){
            if (this.collides(followers, my.sprite.player)){
                console.log("collision detected - enemy collided with player.");
    
                //handle enemy
                followers.visible = false;
                followers.x = -100;
    
                // disable player movement
                this.isPlayerMovable = false;
    
                //update lives
                this.playerLives -= 1;
                this.updateLivesDisplay();
    
                // play sound
                this.sound.play("playerDown", {
                    volume: 0.5 
                });
    
                //play player death animation
                //at end of animation reset player position and enable player movement
                my.sprite.player.visible = false;
                this.playerDead = this.add.sprite(my.sprite.player.x, my.sprite.player.y, "playerDead02").setScale(0.6).play("playerDead");
    
                this.playerDead.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                    my.sprite.player.setPosition(this.playerStartPositionX, this.playerStartPositionY);
                    my.sprite.player.visible = true;
                    this.isPlayerMovable = true;
                  });
            }
        }

        //USED FOR TESTING ENEMY COLLISION and GAME OVER CONDITION (checks for collision with bat on ground)
        if (this.collides(my.sprite.enemyTwo, my.sprite.player)){
            console.log("collision detected - enemy collided with player.");

            //handle enemy
            my.sprite.enemyTwo.visible = false;
            my.sprite.enemyTwo.x = -100;

            // disable player movement
            this.isPlayerMovable = false;

            //update lives
            this.playerLives -= 1;
            this.updateLivesDisplay();

            // play sound
            this.sound.play("playerDown", {
                volume: 0.5 
            });

            //play player death animation
            //at end of animation reset player position and enable player movement
            my.sprite.player.visible = false;
            this.playerDead = this.add.sprite(my.sprite.player.x, my.sprite.player.y, "playerDead02").setScale(0.6).play("playerDead");

            this.playerDead.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                my.sprite.player.setPosition(this.playerStartPositionX, this.playerStartPositionY);
                my.sprite.player.visible = true;
                this.isPlayerMovable = true;

                //place enemy back to test game over condition
                my.sprite.enemyTwo.visible = true;
                my.sprite.enemyTwo.x = 650;
              });
        }

        // check for enemy bullet collision with player


        // check for game over condition
        if (this.playerLives <= 0 && this.isPlayerMovable) {

            console.log("game over");

            this.isPlayerMovable = false;
            this.displayGameOver();

            console.log("restart level");
            setTimeout(() => {
                this.scene.restart(); // restart level after 3000ms
            }, 3000);
        }

        //check for win condition -- all groups empty, no active objects
        if (my.sprite.enemyOneGroup.countActive() == 0 && my.sprite.enemyTwoGroup.countActive() == 0 && this.isPlayerMovable){
            console.log("you won, all enemies destroyed");

            this.isPlayerMovable = false;
            this.displayWin();
            console.log("restart level");
            setTimeout(() => {
                this.scene.restart(); // restart level after 3000ms
            }, 3000);
        }

    }
    //___________________________________________________________
    //FUNCTIONS 
    //___________________________________________________________
    // A center-radius AABB collision check
    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight/2 + b.displayHeight/2)) return false;
        return true;
    }
    // updates score
    updateScore() {
        let my = this.my;
        my.text.score.setText("Score " + this.myScore);
    }
    //updates lives
    updateLivesDisplay(){
        let my = this.my;
        my.text.lives.setText("Lives " + this.playerLives);
    }
    //resets game variables to restart level
    init_game() {
        this.my.sprite.bullet = [];   
        this.maxBullets = 5;
        this.myScore = 0;
        // define start positions
        this.playerStartPositionX = game.config.width/2;
        this.playerStartPositionY = game.config.height - 40;
        //other 
        this.isPlayerMovable = true;
        this.playerLives = 3;
        this.points = [];
        this.time = 0;
        this.trigger = 60;
        this.index = 0;
        this.my.sprite.enemies = [];
    }
    //displays game over screen
    displayGameOver() {
        //create text
        let my = this.my;
        my.text.gameOver = this.add.bitmapText(game.config.width/2 - 100, game.config.height/2, "rocketSquare", "GAME OVER");
        my.sprite.player.visible = false;
        my.sprite.player = this.add.sprite(this.playerStartPositionX, this.playerStartPositionY, "playerDead00").setScale(0.6);
    }
    //displays win screen
    displayWin() {
        //create text
        let my = this.my;
        my.text.win = this.add.bitmapText(game.config.width/2 - 100, game.config.height/2, "rocketSquare", "YOU WIN!");
        //my.sprite.player.setPosition(this.playerStartPositionX, this.playerStartPositionY);
    }

}
 