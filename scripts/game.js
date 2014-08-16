"use strict";
enchant();
var GAME_WIDTH = 800;
var GAME_HEIGHT = 800;

var game;

var sceneGame;
var sceneTitle;

var IMAGE_SUN = "images/sun.png";
var IMAGE_SPIRIT = "images/spirit.png";
var IMAGE_BEAM = "images/beam.png";
var IMAGE_BEAMON = "images/beamon.png";
var IMAGE_CLOUD1 = "images/cloud1.png";
var IMAGE_WIND = "images/wind2.png";
var IMAGE_BIGCLOUD = "images/cloud2.png";
var IMAGE_BACKGROUND = "images/background.jpg";
var IMAGE_ITEM_POWER = "images/power.png";
var IMAGE_ITEM_SPEED = "images/speed.png";
var IMAGE_AIR = "images/air.png";
var resources = [IMAGE_SUN, IMAGE_SPIRIT, IMAGE_BEAM, IMAGE_BEAMON, IMAGE_CLOUD1, IMAGE_WIND, IMAGE_BIGCLOUD, IMAGE_BACKGROUND, IMAGE_ITEM_POWER, IMAGE_ITEM_SPEED, IMAGE_AIR];

var mouseX;
var mouseY;

var touchX = -1;
var touchY = -1;
var speed = 10;
var power = 1;

window.onload = function() {
	game = new Core(GAME_WIDTH, GAME_HEIGHT);
	game.fps = 30;

	game.preload(resources);

	window.document.onmousemove = function(e) {
		var target = document.getElementById('enchant-stage');
		mouseX = (e.pageX - target.offsetLeft) / target.offsetWidth * GAME_WIDTH;
		mouseY = (e.pageY - target.offsetTop) / target.offsetHeight * GAME_HEIGHT;
	};

	game.onload = function() {

		sceneGame = new GameScene();

		this.pushScene(sceneGame);

	};
	game.start();
};

var GameScene = Class.create(enchant.Scene, {
	initialize : function() {
		enchant.Scene.call(this);

		var background = new Sprite(GAME_WIDTH, GAME_HEIGHT);
		var surface = new Surface(100, 100);
		surface.context.fillStyle = 'Black';
		surface.context.fillRect(0, 0, surface.width, surface.height);
		//background.image = surface;
		//background.opacity = 0.8;
		background.image = game.assets[IMAGE_BACKGROUND];
		this.addChild(background);

		this.spriteBigCloud = new Sprite(400, 300);
		this.spriteBigCloud.x = (GAME_WIDTH - this.spriteBigCloud.width) / 2;
		this.spriteBigCloud.image = game.assets[IMAGE_BIGCLOUD];
		this.spriteBigCloud.scaleY = 0.2;
		this.spriteBigCloud.y = this.spriteBigCloud.height * (1 - this.spriteBigCloud.scaleY) / 2 + 100;
		this.addChild(this.spriteBigCloud);

		this.spriteBeam = new Sprite(1000, 20);
		this.spriteBeam.image = game.assets[IMAGE_BEAM];
		this.spriteBeam.originX = 10;
		this.addChild(this.spriteBeam);

		this.spriteSun = new Sprite(100, 100);
		this.spriteSun.image = game.assets[IMAGE_SUN];
		this.addChild(this.spriteSun);
		// 日光の当たる配列
		this.elements = [];
		// 精霊の配列
		this.spriteSpirits = [];
		for (var i = 0; i < 4; i++) {
			var spriteWind = new Sprite(100, 100);
			spriteWind.image = game.assets[IMAGE_SPIRIT];
			spriteWind.wind = 0;
			this.addChild(spriteWind);
			this.spriteSpirits.push(spriteWind);
			this.elements.push(spriteWind);
		}
		this.spriteSpirits[0].x = 200;
		this.spriteSpirits[0].y = 500;
		this.spriteSpirits[1].x = 100;
		this.spriteSpirits[1].y = 700;

		this.spriteSpirits[2].x = 600;
		this.spriteSpirits[2].y = 500;
		this.spriteSpirits[3].x = 500;
		this.spriteSpirits[3].y = 700;

		this.spriteClouds = [];
		for (var i = 0; i < 1; i++) {
			this.createCloud(200, 500, 1);
		}
		this.createCloud(600, 500, 1);

		this.spriteAirs = [];

		this.beamOn = false;
		this.spriteWinds = [];

		this.spriteItems = [];

		this.labelPower = new Label("Power: " + power);
		this.labelPower.x = 10;
		this.labelPower.y = 100;
		this.labelPower.color = "white";
		this.labelPower.font = "24px sans-serif";
		this.addChild(this.labelPower);
		this.labelSpeed = new Label("Speed: " + (speed - 9));
		this.labelSpeed.x = 10;
		this.labelSpeed.y = 130;
		this.labelSpeed.color = "white";
		this.labelSpeed.font = "24px sans-serif";
		this.addChild(this.labelSpeed);

		var parent = this;
		window.document.onmouseup = function(e) {
			console.log("mouseup");
			parent.beamOn = false;
			parent.spriteBeam.image = game.assets[IMAGE_BEAM];
			parent.spriteBeam.frame = [0];
		};

		this.spriteMove = new Sprite(GAME_WIDTH, this.spriteSun.height);
		this.spriteMove.ontouchstart = function(e) {
			touchX = e.x;
			touchY = e.y;
		};
		this.spriteMove.ontouchmove = function(e) {
			touchX = e.x;
			touchY = e.y;
		};
		this.spriteMove.ontouchend = function(e) {
			touchX = -1;
			touchY = -1;
		};
		this.addChild(this.spriteMove);
	},
	onenterframe : function() {
		if (game.input.left || (touchX >= 0 && touchX < this.spriteSun.x + this.spriteSun.width / 2 && touchY < this.spriteSun.height)) {
			this.spriteSun.x -= speed;
		}
		if (game.input.right || (touchX >= 0 && touchX > this.spriteSun.x + this.spriteSun.width / 2 && touchY < this.spriteSun.height)) {
			this.spriteSun.x += speed;
		}
		if (this.spriteSun.x < -this.spriteSun.width / 2) {
			this.spriteSun.x = -this.spriteSun.width / 2;
		}
		if (this.spriteSun.x + this.spriteSun.width / 2 > GAME_WIDTH) {
			this.spriteSun.x = GAME_WIDTH - this.spriteSun.width / 2;
		}

		this.spriteBeam.x = this.spriteSun.x + this.spriteSun.width / 2;
		this.spriteBeam.y = this.spriteSun.y + this.spriteSun.height / 2;
		if (mouseX > this.spriteBeam.x) {
			this.spriteBeam.rotation = Math.atan((mouseY - this.spriteBeam.y) / (mouseX - this.spriteBeam.x)) / Math.PI * 180;
		} else {
			this.spriteBeam.rotation = 180 - Math.atan((mouseY - this.spriteBeam.y) / (-mouseX + this.spriteBeam.x)) / Math.PI * 180;
		}

		//		this.spriteBeam.width = Math.sqrt((mouseX - this.spriteBeam.x) * (mouseX - this.spriteBeam.x) + (mouseY - this.spriteBeam.y) * (mouseY - this.spriteBeam.y));
		this.spriteBeam.width = 1000;
		// 精霊の移動
		for (var i = 0; i < 4; i++) {
			var dx = 0;
			if (this.spriteSpirits[i].wind == 0 && this.spriteSpirits[i].burning && Math.random() > 0.8) {
				if (this.spriteSun.x > this.spriteSpirits[i].x) {
					dx = -Math.floor(Math.random() * 15);
				} else {
					dx = Math.floor(Math.random() * 15);
				}
			} else if (this.spriteSpirits[i].wind == 0 && Math.random() > 0.97) {
				//dx = (Math.random() - 0.5) * 30;
				dx = (Math.random()) * 15 * this.spriteSpirits[i].scaleX * -1;
				if (Math.random() > 0.95) {
					dx *= -1;
				}
			} else if (this.spriteSpirits[i].wind == 0 && Math.random() > 0.96) {
				// 風を出す
				this.spriteSpirits[i].wind = 20;
				this.spriteSpirits[i].frame = [0, 0, 1, 1];
			}
			if (dx > 0) {
				this.spriteSpirits[i].scaleX = -1;
			} else if (dx < 0) {
				this.spriteSpirits[i].scaleX = 1;
			}
			this.spriteSpirits[i].x += dx;
			if (this.spriteSpirits[i].x < 0) {
				this.spriteSpirits[i].x = 0;
				this.spriteSpirits[i].scaleX *= -1;
			}
			if (this.spriteSpirits[i].x + this.spriteSpirits[i].width > GAME_WIDTH) {
				this.spriteSpirits[i].x = GAME_WIDTH - this.spriteSpirits[i].width;
				this.spriteSpirits[i].scaleX *= -1;
			}
			// 風を出す
			if (this.spriteSpirits[i].wind > 0) {
				this.spriteSpirits[i].wind--;
				if (this.spriteWinds[i] == null) {
					this.spriteWinds[i] = new Sprite(100, 100);
					this.spriteWinds[i].image = game.assets[IMAGE_WIND];
					if (this.spriteSpirits[i].scaleX < 0) {
						this.spriteWinds[i].x = this.spriteSpirits[i].x + this.spriteSpirits[i].width;
						this.spriteWinds[i].scaleX = -1;
					} else {
						this.spriteWinds[i].x = this.spriteSpirits[i].x - this.spriteSpirits[i].width;
					}
					this.spriteWinds[i].y = this.spriteSpirits[i].y;
					this.addChild(this.spriteWinds[i]);
				}
				if (this.spriteSpirits[i].wind == 0) {
					this.removeChild(this.spriteWinds[i]);
					this.spriteWinds[i] = null;
					this.spriteSpirits[i].frame = [0];
				}
			}
		}

		// 雲の移動
		moveCloudAir(this.spriteClouds, this.spriteWinds);
		moveCloudAir(this.spriteAirs, this.spriteWinds);
		// 雲のゴール
		for (var i = 0; i < this.spriteClouds.length; i++) {
			if (this.spriteClouds[i].y < 340) {
				this.spriteBigCloud.scaleY += this.spriteClouds[i].size / 10;
				this.spriteBigCloud.y = this.spriteBigCloud.height * (1 - this.spriteBigCloud.scaleY) / 2 + 100;
				this.removeCloud(this.spriteClouds[i]);
				break;
			}
		}
		// 雲の分離
		for (var i = 0; i < this.spriteClouds.length; i++) {
			if (this.spriteClouds[i].size > 0.6 && Math.random() > 0.99) {
				this.removeChild(this.spriteClouds[i]);
				this.createCloud(this.spriteClouds[i].x - this.spriteClouds[i].width * this.spriteClouds[i].scaleX / 2 - 5, this.spriteClouds[i].y, this.spriteClouds[i].size / 2);
				this.createCloud(this.spriteClouds[i].x + this.spriteClouds[i].width * this.spriteClouds[i].scaleX / 2 + 5, this.spriteClouds[i].y, this.spriteClouds[i].size / 2);
				this.removeCloud(this.spriteClouds[i]);
				break;
			}
		}
		// 雲の合体
		for (var i = 0; i < this.spriteClouds.length; i++) {
			for (var j = i + 1; j < this.spriteClouds.length; j++) {
				if (Math.random() > 0.75 && this.spriteClouds[i].intersect(this.spriteClouds[j])) {
					var x = (this.spriteClouds[i].x + this.spriteClouds[j].x) / 2;
					var y = (this.spriteClouds[i].y + this.spriteClouds[j].y) / 2;
					var size = this.spriteClouds[i].size + this.spriteClouds[j].size;
					this.createCloud(x, y, size);
					var cloud1 = this.spriteClouds[i];
					var cloud2 = this.spriteClouds[j];
					this.removeCloud(cloud1);
					this.removeCloud(cloud2);
				}
			}
		}
		// 空気のゴール
		for (var i = 0; i < this.spriteAirs.length; i++) {
			if (this.spriteAirs[i].y < 550) {
				this.createCloud(this.spriteAirs[i].x, this.spriteAirs[i].y, this.spriteAirs[i].size);
				this.removeAir(this.spriteAirs[i]);
				break;
			}
		}
		// 空気の合体
		for (var i = 0; i < this.spriteAirs.length; i++) {
			for (var j = i + 1; j < this.spriteAirs.length; j++) {
				if (Math.random() > 0.75 && this.spriteAirs[i].intersect(this.spriteAirs[j])) {
					var x = (this.spriteAirs[i].x + this.spriteAirs[j].x) / 2;
					var y = (this.spriteAirs[i].y + this.spriteAirs[j].y) / 2;
					var size = this.spriteAirs[i].size + this.spriteAirs[j].size;
					this.createAir(x, y, size);
					var air1 = this.spriteAirs[i];
					var air2 = this.spriteAirs[j];
					this.removeAir(air1);
					this.removeAir(air2);
				}
			}
		}
		// 空気生成
		if (Math.random() > 0.99) {
			var allsize = 0;
			for (var i = 0; i < this.spriteAirs.length; i++) {
				if (this.spriteAirs[i].y > 650) {
					allsize += this.spriteAirs[i].size;
				}
			}
			if (allsize < 3) {
				this.createAir(700 * Math.random(), 700, 0.5);
			}
		}
		// 炎上フラグリセット
		for (var i = 0; i < this.elements.length; i++) {
			this.elements[i].burning = false;
		}
		// 太陽光の処理
		if (this.beamOn) {
			var hits = [];
			for (var i = 0; i < this.elements.length; i++) {
				if (this.spriteBeam.intersectStrict(this.elements[i])) {

					hits.push(this.elements[i]);
				}
			}
			if (hits.length > 0) {
				var nearest = hits[0];
				for (var i = 1; i < hits.length; i++) {
					if ((this.spriteSun.x - nearest.x) * (this.spriteSun.x - nearest.x) + (this.spriteSun.y - nearest.y) * (this.spriteSun.y - nearest.y) > (this.spriteSun.x - hits[i].x) * (this.spriteSun.x - hits[i].x) + (this.spriteSun.y - hits[i].y) * (this.spriteSun.y - hits[i].y)) {
						nearest = hits[i];
					}
				}
				nearest.burning = true;
				//				nearest.opacity -= 0.05;
				this.spriteBeam.width = Math.sqrt((nearest.x + nearest.width / 2 - this.spriteBeam.x) * (nearest.x + nearest.width / 2 - this.spriteBeam.x) + (nearest.y + nearest.height / 2 - this.spriteBeam.y) * (nearest.y + nearest.height / 2 - this.spriteBeam.y));
			}
		}

		// アイテム生成
		if (Math.random() > 0.995) {
			this.addItem(Math.random() * (GAME_WIDTH - 100), 700);
		}
		for (var i = 0; i < this.spriteItems.length; i++) {
			if (this.spriteSun.intersect(this.spriteItems[i])) {
				this.spriteItems[i].effect();
				this.removeItem(i);
				break;
			} else {
				this.spriteItems[i].y -= 8;
				if (this.spriteItems[i].y + this.spriteItems[i].height < 0) {
					this.removeItem(i);
					break;
				}
			}
		}
	},
	ontouchstart : function(e) {
		this.beamOn = true;
		this.spriteBeam.image = game.assets[IMAGE_BEAMON];
		this.spriteBeam.frame = [0, 0, 1, 1, 2, 2];
		mouseX = e.x;
		mouseY = e.y;
		console.log("touchstart");
	},
	ontouchend : function(e) {
		console.log("touchend");
		this.beamOn = false;
		this.spriteBeam.image = game.assets[IMAGE_BEAM];
		this.spriteBeam.frame = [0];
	},
	ontouchmove : function(e) {
		mouseX = e.x;
		mouseY = e.y;
	},
	createCloud : function(x, y, size) {
		var spriteCloud = new Sprite(100, 100);
		spriteCloud.image = game.assets[IMAGE_CLOUD1];
		spriteCloud.x = x;
		spriteCloud.y = y;
		if (size < 1) {
			spriteCloud.scaleX = 1 - (1 - size) * (1 - size);
			spriteCloud.scaleY = 1 - (1 - size) * (1 - size);
		} else {
			spriteCloud.scaleX = Math.sqrt(size);
			spriteCloud.scaleY = Math.sqrt(size);
		}
		spriteCloud.size = size;
		this.addChild(spriteCloud);
		this.spriteClouds.push(spriteCloud);
		this.elements.push(spriteCloud);
	},
	removeCloud : function(cloud) {
		this.removeChild(cloud);
		for (var j = 0; j < this.spriteClouds.length; j++) {
			if (this.spriteClouds[j] == cloud) {
				this.spriteClouds.splice(j, 1);
				break;
			}
		}
		for (var j = 0; j < this.elements.length; j++) {
			if (this.elements[j] == cloud) {
				this.elements.splice(j, 1);
				break;
			}
		}
	},
	createAir : function(x, y, size) {
		var spriteCloud = new Sprite(100, 100);
		spriteCloud.image = game.assets[IMAGE_AIR];
		spriteCloud.x = x;
		spriteCloud.y = y;
		if (size < 1) {
			spriteCloud.scaleX = 1 - (1 - size) * (1 - size);
			spriteCloud.scaleY = 1 - (1 - size) * (1 - size);
		} else {
			spriteCloud.scaleX = Math.sqrt(size);
			spriteCloud.scaleY = Math.sqrt(size);
		}
		spriteCloud.size = size;
		this.addChild(spriteCloud);
		this.spriteAirs.push(spriteCloud);
		this.elements.push(spriteCloud);
	},
	removeAir : function(cloud) {
		this.removeChild(cloud);
		for (var j = 0; j < this.spriteAirs.length; j++) {
			if (this.spriteAirs[j] == cloud) {
				this.spriteAirs.splice(j, 1);
				break;
			}
		}
		for (var j = 0; j < this.elements.length; j++) {
			if (this.elements[j] == cloud) {
				this.elements.splice(j, 1);
				break;
			}
		}
	},
	addItem : function(x, y) {
		var spriteItem = new Sprite(100, 60);
		spriteItem.x = x;
		spriteItem.y = y;
		if (Math.random() > 0.5) {
			spriteItem.image = game.assets[IMAGE_ITEM_SPEED];
			var parent = this;
			spriteItem.effect = function() {
				speed++;
				parent.labelSpeed.text = "Speed: " + (speed - 9);
			};
		} else {
			spriteItem.image = game.assets[IMAGE_ITEM_POWER];
			var parent = this;
			spriteItem.effect = function() {
				power++;
				parent.labelPower.text = "Power: " + power;
			};
		}
		this.addChild(spriteItem);
		this.spriteItems.push(spriteItem);
	},
	removeItem : function(index) {
		this.removeChild(this.spriteItems[index]);
		this.spriteItems.splice(index, 1);
	}
});

function moveCloudAir(spriteClouds, spriteWinds) {
	for (var i = 0; i < spriteClouds.length; i++) {
		var dx = 0;
		var wind = 0;
		for (var j = 0; j < spriteWinds.length; j++) {
			if (spriteClouds[i].intersect(spriteWinds[j])) {
				wind = spriteWinds[j].scaleX;
			}
		}
		if (wind == 0 && Math.random() > 0.95) {
			dx = (Math.random() - 0.5) * 30;
		} else if (wind != 0 && Math.random() > 0.8) {
			if (wind > 0) {
				dx = -(Math.random()) * 15;
			} else {
				dx = (Math.random()) * 15;
			}
		}
		spriteClouds[i].x += dx;
		if (spriteClouds[i].x < 0) {
			spriteClouds[i].x = 0;
		}
		if (spriteClouds[i].x + spriteClouds[i].width > GAME_WIDTH) {
			spriteClouds[i].x = GAME_WIDTH - spriteClouds[i].width;
		}
		if (spriteClouds[i].burning && spriteClouds[i].size >= 0.6) {
			spriteClouds[i].y -= power;
		}
	}
}
