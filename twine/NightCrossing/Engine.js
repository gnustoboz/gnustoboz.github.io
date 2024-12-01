"use strict";

window.onload = function() {

	window.Engine = {
		treeOffset: 0,
		treeSpeedBase: 250,
		treeSpeedRange: 50,
		treeSpeed: 130,
		overlayRed: 0,
		overlayGreen: 0,
		overlayBlue: 0,
		overlayAlpha: 1,
		overlayTargetAlpha: 1,
		overlayFadeSpeed: 0.5,
		fadeAudio: false,
		tick: null,
		
		onSetup:	function() {
			
			this.use([
				'stats',
				'trees1',
				'trees2',
				'trees3',
				'sky',
				'overlay',
				'loop'
			]);

			window.onresize = this.resize;
			this.resize();
		},
		
		resize:	function() {
			Engine.sky.style.width = window.innerWidth;
			Engine.sky.style.height = 'auto';
		},
		
		use:	function(ids) {
			var e;
			
			for (var i in ids) {
				e = window.document.getElementById(ids[i]);
				if (e)
					window.Engine[ids[i]] = e;
			}
		},

		onStart:	function() {
			var loading = window.document.getElementById('loading');
			if (loading)
				loading.style.display = 'none';
			
			window.setTimeout(window.Engine.fadeIn, 2000);
			this.startLoop();
		},
	
		update:	function(delta) {
			//this.stats.innerHTML = JSON.stringify(Engine.Core);

			this.treeOffset += delta * this.treeSpeed;
			
			if (this.treeOffset > 1000) {
				this.treeOffset -= 1000;
				this.treeSpeed = this.treeSpeedBase + Math.random() * this.treeSpeedRange;
			}
			
			this.trees1.style.backgroundPosition = this.treeOffset + '% 19%';
			this.trees2.style.backgroundPosition = this.treeOffset * 1.3 + '% 13%';
			this.trees3.style.backgroundPosition = this.treeOffset * 1.7 + '% 25%';
			
			if (this.overlayAlpha != this.overlayTargetAlpha) {
				var step = this.overlayFadeSpeed * delta;
				if (this.overlayAlpha > this.overlayTargetAlpha) {
					step = -step;
				}
				this.overlayAlpha += step;
				
				if (this.overlayAlpha > 1)
					this.overlayAlpha = 1;
				else if (this.overlayAlpha < 0)
					this.overlayAlpha = 0;
			}
			
			this.overlay.style.backgroundColor = 'rgba(' + this.overlayRed + ',' + this.overlayGreen + ',' + this.overlayBlue + ',' + this.overlayAlpha + ')';
			
			if (this.loop.currentTime > 41)
				this.loop.currentTime = 0;
			
			if (window.tick)
				window.tick();
			
			if (this.fadeAudio)
				this.loop.volume = 1 - this.overlayAlpha;
		},
		
		onStop:	function() {
			this.stopLoop();
		},
		
		setOverlayColor: function(r,g,b) {
			window.Engine.overlayRed = r;
			window.Engine.overlayGreen = g;
			window.Engine.overlayBlue = b;
		},
		
		fadeIn: function() {
			window.Engine.overlayTargetAlpha = 0;
		},
		
		fadeOut: function() {
			window.Engine.overlayTargetAlpha = 1;
		},
		
		fadeCycle: function(interval) {
			window.Engine.fadeOut();
			window.setTimeout(window.Engine.fadeIn, interval);
		},
		
		linkAudioFade: function(enabled) {
			window.Engine.fadeAudio = enabled;
		},
		
		linkAndFade: function() {
			window.Engine.linkAudioFade(true);
			window.Engine.fadeOut();
		},
		
		startLoop:	function() {
			window.Engine.loop.play();
		},
		
		stopLoop:	function() {
			window.Engine.loop.pause();
		}
	
	}
	
	
	window.Engine.Core = {
		running: false,
		fps:	0,
		simulatedDelta: 0.02,
		delta:	0,
		thisTime: null,
		lastTime: null,
		
		
		init:	function() {
			Engine.onSetup();
			this.tick(performance.now(), true);
		},
		
		start:	function() {
			if (this.running) {
				this.stop();
			}
			this.running = true;
			this.tick(performance.now(), true);
		},
		

		stop:	function() {
			this.running = false;
		},
		
		nextFrame:	function() {
			this.running = false;
			this.tick(performance.now(), true);
		},
		
		tick:	function(timestamp, simulateDelta) {
			if (Engine.Core.running) {
				window.requestAnimationFrame(Engine.Core.tick);
			}
			
			if (simulateDelta) {
				Engine.Core.thisTime = timestamp / 1000;
				Engine.Core.lastTime = Engine.Core.thisTime - Engine.Core.simulatedDelta;
			} else {
				Engine.Core.lastTime = Engine.Core.thisTime;
				Engine.Core.thisTime = timestamp / 1000;
			}
			Engine.Core.delta = Engine.Core.thisTime - Engine.Core.lastTime;				
			if (Engine.Core.fps < 0)
				Engine.Core.fps = 0;
				
			Engine.Core.fps = (19 * Engine.Core.fps + 1 / Engine.Core.delta) / 20;
			
			Engine.update(Engine.Core.delta);
			
			if (!Engine.Core.running) {
				Engine.onStop();
			}
		},
		
		
	}
	
	
	window.Engine.Interface = {
		start:	function() {
			Engine.onStart();
			Engine.Core.start();
		},
		
		stop:	function() {
			Engine.Core.stop();
		},
		
		nextFrame:	function() {
			Engine.Core.nextFrame();
		},
				
	}
	
	
	Engine.Core.init();
	
	Engine.Interface.start();
}
