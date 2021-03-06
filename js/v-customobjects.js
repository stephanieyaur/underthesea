const fakeBodyCount = 1
const fakeBodySteps = 1000

const trackedKeys = ["size", "color", "fireStrength", "rotation", "position", "paritype", "displayName", "label", "labelWidth"]

// Decorate the head of our guests
Vue.component("obj-head", {
	template: `<a-entity>

		<a-sphere 
			shadow
			:radius="headSize"
			:color="obj.color.toHex()" 
				
			>
			<obj-axes scale=".1 .1 .1" v-if="false" />
		</a-sphere>

		<a-sphere 
			shadow
			:radius="headSize*0.5"
			:color="obj.color.toHex()" 
			position="0.3 0 0"
			>
			<obj-axes scale=".1 .1 .1" v-if="false" />
		</a-sphere>

		<a-cone v-for="(spike,index) in spikes"
			:key="index"
			:height="spike.size"
			:radius-bottom="headSize*.2"
			:position="spike.position.toAFrame(0, .2, 0)"
			:rotation="spike.rotation.toAFrame()"
			:color="obj.color.toHex(.5*Math.sin(index))" 
				
			>
		
		</a-cone>

		<!-- NOSE -->
		<a-cone
		
			:height="headSize*.6"
			:radius-bottom="headSize*.4"
			position="0 0 -.18"
			
			:color="obj.color.toHex(.3)" 
			
		>
	
		</a-cone>

		<a-cone
		
			:height="headSize*.6"
			:radius-bottom="headSize*.4"
			position="0 0 0.18"
			
			:color="obj.color.toHex(.3)" 
			
		>

		</a-cone>

		
	</a-entity>
	`,
	computed: {
		color() {
			return this.obj.color.toHex?this.obj.color.toHex():this.obj.color
		},
		headSize() {
			return this.obj.size instanceof Vector ? this.obj.size.x : this.obj.size
		},
	},

	data() {
		let spikeCount = Math.random()*10 + 10
		let spikes = []
		let h2 = Math.random() - .5
			
		for (var i = 0; i < spikeCount; i++) {
			let h = .1
			let spike = new LiveObject(undefined, { 

				size: Math.random()*.4 + .2,
				color: new Vector(noise(i)*30 + 140, 0, 40 + 20*noise(i*3))
			})
			let r = .2
			// Put them on the other side
			let theta = 4*noise(i*10) + 3
			spike.position.setToCylindrical(r, theta, h*.3)
			// Look randomly
			spike.lookAt(0, h2, 0)
			spike.rotateX(-Math.PI/2)
			spikes.push(spike)
		}

		return {
			spikes: spikes
		}
	},

	mounted() {
		// console.log(this.headSize)
	},
	props: ["obj"]
})


Vue.component("obj-fire", {
	template: `
	<a-entity>
		<obj-axes scale="5 5 5" v-if="false" />
		<a-sphere 
			color="grey"
			radius=2 
			scale="1 .3 1" 
			roughness=1
			segments-height="5"
			segments-width="10"
			theta-start=0
			theta-length=60
			position="0 -.4 0"
			>
		</a-sphere>
		<a-cone
			position="0 .2 0"
			@click="click"
			:animation="heightAnimation"
			:color="obj.color.toHex()"
			height=.2
			radius-bottom=".2"

			:scale="(obj.fireStrength*.2 + 1) + ' ' + .1*obj.fireStrength + ' ' + (obj.fireStrength*.2 + 1)"
			:material="fireMaterial">

		</a-cone>

		<a-light
			:animation="intensityAnimation"

			position="0 1 0"
			intensity="2"
			:color="obj.color.toHex()"
			type="point"
			:distance="obj.fireStrength*4 + 10"
			decay="2">
		</a-light>
	</a-entity>

	`,

	// Values computed on the fly
	computed: {
		fireMaterial() {
			return `emissive:${this.obj.color.toHex(.2)}`
		},
		
		animationSpeed() {
			return 500
		},
		intensityAnimation() {
			return `property: intensity; from:.3; to:.6; dir:alternate;dur: ${this.animationSpeed}; easing:easeInOutQuad;loop:true`
		},
		heightAnimation() {
			return `property: height; from:${this.obj.fireStrength};to:${this.obj.fireStrength*2}; dir:alternate;dur: 500; easing:easeInOutQuad;loop:true`
		}
	},

	methods: {
		click() {
			this.obj.fireStrength += 1
			this.obj.fireStrength = this.obj.fireStrength%10 + 1

			// Tell the server about this action
			this.obj.post()
		}
	},

	// this function runs once when this object is created
	mounted() {

	},



	props: ["obj"]


})

{/* <a-light type="directional" 
			position="1 3 -2" 
			rotation="-90 0 0" 
			intensity="1"
			castShadow target="#directionaltarget">
			<a-entity id="directionaltarget" position="-10 0 -20"></a-entity>
		</a-light> */}



Vue.component("obj-world", {

	template: `
	<a-entity>
		<!--------- SKYBOX --------->
		<a-sky color="hsl(210,99%,60%)"></a-sky>

		<a-plane 
			color="hsl(200,90%,90%)"
			height="100" 
			width="100" 
			rotation="-90 0 0">
		</a-plane>

		<a-sphere position="1 1.5 -2" radius="0.5" color="hsl(200,100%,100%)"></a-sphere>   

		<!---- lights ----> 
		<a-entity light="type: ambient; intensity: 0.4;" color="white"></a-entity>

		<a-light type="directional" 
			position="10 -10 5" 
			rotation="-90 0 0" 
			intensity="0.5"
			castShadow target="#directionaltarget">
			<a-entity id="directionaltarget" position="-10 0 -20"></a-entity>
		</a-light>

		<a-light type="ambient" 
			color="blue"
			position="0 30 5" 
			rotation="-90 0 0" 
			intensity="0.9"
			castShadow target="#directionaltarget">
			<a-entity id="directionaltarget" position="-10 0 -20"></a-entity>
		</a-light>

		<a-cylinder 
			v-for="(tree,index) in trees"
			:key="'tree' + index" 

			color="#ff634a"	
			:base-radius="tree.size.z*index%10" 
			:height="tree.size.y" 

			segments-radial=10
			segments-height=1
			
			:rotation="tree.rotation.toAFrame()"
			:position="tree.position.toAFrame()"
			:openEnded=true
			:thetaLength=180>
		</a-cylinder>

		<a-box
			position="0 3 0" width="10" height="20" rotation="0 45 0" color="#4CC3D9"
		</a-box>
		

		<a-box 
			v-for="(rock,index) in rocks"
			:key="'rock' + index"
			shadow 

			roughness="1"

			:color="rock.color.toHex()"
			:width="rock.size.x" 
			:depth="rock.size.z" 
			:height="rock.size.y" 
			
			:rotation="rock.rotation.toAFrame()"
			:position="rock.position.toAFrame()">
		</a-box>

		<!--      cloud  1 -->
		<a-sphere position="0 0 -12" radius="1.75" color="#FC8FD6 "></a-sphere>
		<a-sphere position="0 1 -10" radius="1.75" color="#EF2D5E"></a-sphere>
		<a-sphere position="0 2 -12" radius="1.25" color="#FC8FD6 "></a-sphere>
		<a-sphere position="-2 0 -10" radius="1.25" color="#FC8FD6 "></a-sphere>
		<a-sphere position="-2 1 -12" radius="1.75" color="#FC8FD6 "></a-sphere>
		<a-sphere position="-2 2 -10" radius="1.25" color="#FC8FD6 "></a-sphere>
		<a-sphere position="3 -1.5 -10" radius="1.5" color="#EF2D5E"></a-sphere>
		<a-sphere position="2 1 -12" radius="2.25" color="#FC8FD6 "></a-sphere>
		<a-sphere position="2 2 -10" radius="1.25" color="#EF2D5E"></a-sphere>
		<a-sphere position="-4 0 -12" radius="1.25" color="#AD6EEE "></a-sphere>
		<a-sphere position="0 1 -12" radius="1.25" color="#FC8FD6 "></a-sphere>
		<a-sphere position="4 2 -12" radius="2.25" color="#DD6EEE"></a-sphere>
		
		<!--      cloud   2-->
		<a-sphere position="-8 6 -16" radius="1" color="#FC8FD6 "></a-sphere>
		<a-sphere position="-9 7 -14" radius="1" color="#EF2D5E"></a-sphere>
		<a-sphere position="-6 8 -16" radius="1" color="#FC8FD6 "></a-sphere>
		<a-sphere position="-8 6 -14" radius="1.25" color="#FC8FD6 "></a-sphere>
		<a-sphere position="-2 7 -16" radius="1.75" color="#FC8FD6 "></a-sphere>
		<a-sphere position="-10 8 -14" radius="1" color="#FC8FD6 "></a-sphere>
		<a-sphere position="-6 6 -14" radius="1.5" color="#EF2D5E"></a-sphere>
		<a-sphere position="-11 7 -16" radius="1.5" color="#FC8FD6 "></a-sphere>
		<a-sphere position="-11 4 -14" radius="1" color="#EF2D5E"></a-sphere>
		<a-sphere position="-9 6 -16" radius="1.25" color="#AD6EEE "></a-sphere>
		<a-sphere position="0 7 -16" radius="1.25" color="#FC8FD6 "></a-sphere>
		<a-sphere position="-0.5 8 -16" radius="1" color="#DD6EEE"></a-sphere>

	</a-entity>
		`,

	data() {
		// Where we setup the data that this *rendered scene needs*

		// EXAMPLE: Generated landscape
		// Make some random trees and rocks
		// Create a lot of LiveObjects (just as a way 
		//  to store size and color conveniently)
		// Interpret them as whatever A-Frame geometry you want!
		// Cones, spheres, entities with multiple ...things?
		// If you only use "noise" and not "random", 
		// everyone will have the same view. (Wordle-style!)
		let trees = []
		let count = 30
		for (var i = 0; i < count; i++) {
			let h = 6 + 4*noise(i) // Size from 1 to 3
			let tree = new LiveObject(undefined, { 
				size: new THREE.Vector3(.3, h, .3),
				color: new Vector(noise(i*50)*30 + 160, 100, 40 + 10*noise(i*10))
			})
			let r = 20 + 10*noise(i*40)
			let theta = 2*noise(i*10)
			tree.position.setToCylindrical(r, theta, h/2)
			tree.lookAt(0,1,0)
			trees.push(tree)
		}

		let rocks = []
		let rockCount = 20
		for (var i = 0; i < rockCount; i++) {
			let h = 1.2 + noise(i*100) // Size from 1 to 3
			let rock = new LiveObject(undefined, { 
				size: new THREE.Vector3(h, h, h),
				color: new Vector(noise(i)*30 + 140, 0, 40 + 20*noise(i*3))
			})
			let r = 4 + 1*noise(i*1)
			// Put them on the other side
			let theta = 2*noise(i*10) + 3
			rock.position.setToCylindrical(r, theta, h*.3)
			// Look randomly
			rock.lookAt(Math.random()*100,Math.random()*100,Math.random()*100)
			rocks.push(rock)
		}


		return {
			trees: trees,
			rocks: rocks
		}
	},

	mounted() {
		// Create a fire object
		// Attach this liveobject to the ROOM
		// and then the room deals with drawing it to AFRAME
		let fire = new LiveObject(this.room, {
			paritype: "fire",  // Tells it which type to use
			uid: "fire0",
			isTracked: true,
			onUpdate({t, dt, frameCount}) {
				// Change the fire's color
				let hue = (noise(t*.02)+1)*180
				Vue.set(this.color.v, 0, hue)
			}
		})
	

		fire.position.set(0, 0, 0)
		fire.fireStrength = 1

		// let fire2 = new LiveObject(this.room, {
		// 	paritype: "fire",  // Tells it which type to use
		// 	uid: "fire2",
		// 	onUpdate({t, dt, frameCount}) {
		// 		let hue = (noise(t*.02)+1)*180
		// 		Vue.set(this.color.v, 0, hue)
				
		// 		// console.log(this.color[0] )
		// 	}
		// })

		// fire2.position.set(3, 0, -4)
		// fire2.fireStrength = 7


		let grammar = new tracery.createGrammar(  {
			waterActivity : " in the #water# with #creatureAdj# #creature#",
			water: ["Florida Keys", "Bermuda Triangle", "Pacific", "Atlantic", "Mediterranean Sea", "Bahamas", "Dead Sea", "bathtub", "pool", "Nile", "Gulf of Mexico"],
			activity: ["Swim", "Dive", "Snorkle", "Kayak", "Jet ski", "Canoe", "Sail", "Paddle", "Float", "Doggy paddle"],
			creatureAdj : ["colorful", "rainbow", "tiny", "giant", "iridescent", "pink", "happy", "hyper", "beautiful", "majestic", "ethereal", "pudgy", "fresh", "shiny"],
			creature : ["plankton", "sharks", "dolphins", "swordfish", "eels", "penguins", "beluga whales", "starfish", "seahorses", "stingrays", "carp", "fish", "mermaids", "pirates", "seagulls", "Nemo", "kraken", "octopii"],
        
		}, {})
		grammar.addModifiers(baseEngModifiers)

		const activity = ["Swim", "Dive", "Snorkle", "Kayak", "Jet ski", "Canoe", "Sail", "Paddle", "Float", "Doggy paddle"]
		this.room.detailText = "Deep sea adventure time!"

		this.room.time.onSecondChange((second) => {
			// Change the song every minute (60 seconds)
			let rate = 10 // How many seconds between changes
			if (second%rate === 0) {
				let tick = second/rate
				let index = second % activity.length
				let water = activity[index]
				this.room.detailText =  water + grammar.flatten("#waterActivity#")
			}
		})
	},

	props: ["room"]

})

