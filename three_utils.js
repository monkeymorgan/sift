/**
 * @author Morgan Brickley (morgan.brickley@gmail.com)
 * requires: three.js
 * defines utility classes for graphics libraries - three.js ammo.js and cannon.js
 *
 SIFT_THREE.ThreeBaseUtils =
 SIFT_THREE.ThreeDOMUtils =
 SIFT_THREE.ThreeUtils =
 SIFT_THREE.CannonUtils =
 SIFT_THREE.AmmoUtils =
 Also defines a handful of utility methods e.g. for colour conversion.
 Frankly, it's a mess
 */


var SIFT_THREE = SIFT_THREE || { REVISION: '0' };

var ThreeBaseUtils = Class.extend ({

	init: function (scene) {
		this.scene = scene;
	},

	clear_scene: function (camera) {

		var obj, i;
		for ( i = this.scene.children.length - 1; i >= 0 ; i -- ) {
			obj = this.scene.children[ i ];
			if ( obj !== camera) {
				this.scene.remove(obj);
			}
		}
	},

	set_pos: function(three_object_or_name, updates, period) {
		if (three_object_or_name instanceof THREE.Object3D) {
			three_object = three_object_or_name;
		}
		else
		{
			three_object = this.scene.getChildByName(three_object_or_name);
		}

		if (three_object !== undefined) {
			var new_vec = new THREE.Vector3();
			new_vec.copy(three_object.position);

			updates.hasOwnProperty("x") && (new_vec.x = updates.x);
			updates.hasOwnProperty("y") && (new_vec.y = updates.y);
			updates.hasOwnProperty("z") && (new_vec.z = updates.z);

			if (period > 0)
			{
				new TWEEN.Tween( three_object.position ).to( new_vec, period )
					.easing(TWEEN.Easing.Cubic.Out).start();
			}
			else
			{
				three_object.position.x = new_vec.x;
				three_object.position.y = new_vec.y;
				three_object.position.z = new_vec.z;
			}
		}
		else
		{
			console.log("failed to execute set_pos");
		}
	},

	spin_around_z: function(three_object, degrees) {
		// clamp degrees to multiples PI
		var rot = three_object.rotation;
		var new_y = rot.y + THREE.Math.degToRad( degrees );
		//rot.y = rot.y < Math.PI/2 ? 0 :
		//x		rot.y < Math.PI*1.5 ? 1 : 2 * Math.PI;

		new TWEEN.Tween( three_object.rotation ).to( {
			x: 0,
			y: new_y,
			z: 0 }, 2000 )
		.easing( TWEEN.Easing.Elastic.Out).start();
	},

	get_three_object: function(three_object_or_name) {
		if (three_object_or_name instanceof THREE.Object3D) {
			three_object = three_object_or_name;
		}
		else
		{
			three_object = this.scene.getChildByName(three_object_or_name);
		}

		return three_object;
	},

	get_three_objects: function(three_object_or_name_list) {

		var objs = [];
		for (var i in three_object_or_name_list){
			if (three_object_or_name_list[i] !== undefined){
				objs.push(three_object_or_name_list[i]);
			}
		}

		// TODO: remove undefined's
		return objs;
	},

	remove: function(three_object_or_name) {

		var obj = this.get_three_object(three_object_or_name);
		this.scene.remove(obj);
	},

	set_visibility: function(three_object_or_name, visibility) {
		if (three_object_or_name instanceof THREE.Object3D) {
			three_object = three_object_or_name;
		}
		else
		{
			if (visibility === false){
				three_object = this.scene.getChildByName(three_object_or_name);
			}
			//else
			//{
			//	three_object = this.hidden_scene.getChildByName(three_object_or_name);
			//}
		}

		if (three_object !== undefined) {

			three_object.visible = visibility;
			three_object.material.materials.forEach(function (e) {e.visible = visibility;});
			three_object.material.materials.forEach(function (e) {e.needsUpdate = true;});

			if (visibility === false){
				this.scene.remove(three_object);
				//this.hidden_scene.add(three_object);
			}
			else
			{
				//this.hidden_scene.scene.remove(three_object);
				this.scene.add(three_object);
			}
		}
	},

	set_grey: function(three_object_or_name) {
		if (three_object_or_name instanceof THREE.Object3D) {
			three_object = three_object_or_name;
		}
		else
		{
			three_object = this.scene.getChildByName(three_object_or_name);
		}

		if (three_object !== undefined) {
			three_object.prev_color = three_object.color;
			three_object.color = 0xDDDDDD;

			// right, left, top, bottom, back, front
			three_object.material.materials.forEach(function (e) {e.color.set(0xdddddd);});
		}
	},

	unset_grey: function(three_object_or_name) {
		if (three_object_or_name instanceof THREE.Object3D) {
			three_object = three_object_or_name;
		}
		else
		{
			three_object = this.scene.getChildByName(three_object_or_name);
		}

		if (three_object !== undefined && three_object.prev_color !== undefined) {
			three_object.color = three_object.prev_color;
			// right, left, top, bottom, back, front
			three_object.material.materials.forEach(function (e) {e.color.set(three_object.prev_color);});
			three_object.material.materials.forEach(function (e) {e.needsUpdate = true;});
		}
	},

	explode_from_region: function(three_object_or_name, region, period) {
		if (three_object_or_name instanceof THREE.Object3D) {
			three_object = three_object_or_name;
		}
		else
		{
			three_object = this.scene.getChildByName(three_object_or_name);
		}

		if (three_object !== undefined) {

			var new_vec = new THREE.Vector3();
			new_vec.copy(three_object.position);

			region.hasOwnProperty("x") && (new_vec.x = (new_vec.x < region.x/2) ? -50 : region.x+50);
			region.hasOwnProperty("y") && (new_vec.y = (new_vec.y < region.y/2) ? -50 : region.y+50);
			region.hasOwnProperty("z") && (new_vec.z = (new_vec.z < region.z/2) ? -50 : region.z+50);

			var explode_tween = new TWEEN.Tween( three_object.position ).to( new_vec, period )
				.easing(TWEEN.Easing.Cubic.In).start();

			//three_object.visible = visibility;
			//three_object.material.materials.forEach(function (e) {e.visible = visibility;});
			//three_object.material.materials.forEach(function (e) {e.needsUpdate = true;});

		}
		else
		{
			console.log("failed to execute explode_from_region");
		}
	},

	inc_pos: function(three_object_or_name, inc_pos, period) {
		var three_object;

		if (three_object_or_name instanceof THREE.Object3D) {
			three_object = three_object_or_name;
		}
		else
		{
			three_object = this.scene.getChildByName(three_object_or_name);
		}

		if (three_object !== undefined) {
			var new_pos = new THREE.Vector3();
			new_pos.copy(three_object.position);

			inc_pos.hasOwnProperty("x") && (new_pos.x += inc_pos.x);
			inc_pos.hasOwnProperty("y") && (new_pos.y += inc_pos.y);
			inc_pos.hasOwnProperty("z") && (new_pos.z += inc_pos.z);

			new TWEEN.Tween( three_object.position ).to( new_pos, period )
				.easing(TWEEN.Easing.Cubic.Out).start();
		}
		else
		{
			console.log("failed to execute inc_pos");
		}
	},

	set_rot: function(three_object_or_name, updates, period) {
		if (three_object_or_name instanceof THREE.Object3D) {
			three_object = three_object_or_name;
		}
		else
		{
			three_object = this.scene.getChildByName(three_object_or_name);
		}

		if (three_object !== undefined) {

			var new_vec = new THREE.Vector3();

			updates.hasOwnProperty("x") && (new_vec.x = THREE.Math.degToRad(updates.x));
			updates.hasOwnProperty("y") && (new_vec.y = THREE.Math.degToRad(updates.y));
			updates.hasOwnProperty("z") && (new_vec.z = THREE.Math.degToRad(updates.z));
			new TWEEN.Tween( three_object.rotation).to( new_vec, period )
				.easing(TWEEN.Easing.Cubic.Out).start();
		}
	},

	set_scale: function(three_object_or_name, updates, period) {
		if (three_object_or_name instanceof THREE.Object3D) {
			three_object = three_object_or_name;
		}
		else
		{
			three_object = this.scene.getChildByName(three_object_or_name);
		}

		if (three_object !== undefined) {
			var new_vec = new THREE.Vector3();
			new_vec.copy(three_object.scale);

			updates.hasOwnProperty("x") && (new_vec.x = updates.x);
			updates.hasOwnProperty("y") && (new_vec.y = updates.y);
			updates.hasOwnProperty("z") && (new_vec.z = updates.z);
			new TWEEN.Tween( three_object.scale ).to( new_vec, period )
				.easing(TWEEN.Easing.Cubic.Out).start();
		}
	}
});

// TODO: PLACE IN SIFT_THREE SCOPE
function hex_to_rgba(hex_color)
{
	var a = (hex_color & 0xff000000) >> 24;
	var r = (hex_color & 0x00ff0000) >> 16;
	var g = (hex_color & 0x0000ff00) >> 8;
	var b = hex_color & 0x000000ff;

	var rgba = "rgba(" + r + "," + g + "," + b + "," + a + ")";
	return rgba;
}

function rand_three_color()
{
	var color = 0xDD000000 | Math.floor(Math.random() * 0x00FFFFFF);
	return color;
}
function rand_three_color_rgb()
{
	var color = new THREE.Color();
	color.setRGB(Math.floor(Math.random() * 255),
				Math.floor(Math.random() * 255),
				Math.floor(Math.random() * 255));
	return color;
}
function rand_three_color_hsv()
{
	var color = new THREE.Color();
	color.setHSV(Math.random(), Math.random(), Math.random());
	return color;
}
function color_to_rgb(color)
{
	var three_color;

	if (color instanceof THREE.Color == false)
	{
		// FIXME
		//three_color = new THREE.Color();
		//three_color.setHex(color);

		var rgba = hex_to_rgba(color);
		return rgba;s
	}
	else
	{
		three_color = color;
	}

	var rgba = "rgba(" + three_color.r + "," + three_color.g + "," + three_color.b + ", 0.7)";
	return rgba;
};


var ThreeDOMUtils = ThreeBaseUtils.extend({
     init: function(scene) {
         this.lines = [];
         this._super(scene);
     },

    setup: function() {
        var css_renderer = new THREE.CSS3DRenderer();
        css_renderer.setSize( window.innerWidth, window.innerHeight );
        css_renderer.domElement.style.position = 'absolute';
        css_renderer.domElement.style.top = 0;
        //document.body.appendChild( renderer.domElement );
        var css_container = document.createElement( "css_container" );
        document.body.appendChild( css_container );
        css_container.appendChild( css_renderer.domElement );

        glo.css_renderer = css_renderer;
    }
});

var ThreeUtils = ThreeBaseUtils.extend({

	init: function(scene) {
		this.lines = [];
		this._super(scene);
		// todo: remove
        //this.scene = scene;
    },

    setup: function (useCanvas, z){
        var z = z || 100;

        var renderer = new THREE.WebGLRenderer();

        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( renderer.domElement );

        this.effect = new THREE.AnaglyphEffect( renderer );
        var camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
        camera.position.z = z;
        camera.lookAt( scene.position );
        this.projector = new THREE.Projector();
        //this.scene = new THREE.Scene();
        this.renderer = renderer;
        this.camera = camera;
    },

    setupLights: function () {
        var scene = this.scene;

        scene.fog = new THREE.Fog( 0x000000, 0, 500 );

        var ambient = new THREE.AmbientLight( 0x111111 );
        scene.add( ambient );

        light = new THREE.SpotLight( 0xffffff );
        light.position.set( 10, 30, 20 );
        light.target.position.set( 0, 0, 0 );
        if(true){
            light.castShadow = true;

            light.shadowCameraNear = 20;
            light.shadowCameraFar = 50;//camera.far;
            light.shadowCameraFov = 40;

            light.shadowMapBias = 0.1;
            light.shadowMapDarkness = 0.7;
            light.shadowMapWidth = 2*512;
            light.shadowMapHeight = 2*512;

            //light.shadowCameraVisible = true;
        }
        scene.add( light );
    },

    render: function (){
        this.renderer.render(this.scene, this.camera);
    },

    renderAnalgyph: function (){
        this.effect.render(this.scene, this.camera);
    },

	createLine: function(from, to, color, name) {
		line_geom = new THREE.Geometry();
		line_geom.vertices.push( from );
		line_geom.vertices.push( to );
		line = new THREE.Line( line_geom, new THREE.LineBasicMaterial( { color: color, opacity: 0.5 } ) );
		line.name = name;
		this.scene.add( line );
		this.lines.push(line);
		return line;
	},

	removeLines: function() {
		//this.lines.forEach(this.scene.remove);

		for (var i=0; i<this.lines.lenght; i++)
		{
			this.scene.remove(this.lines[i]);
		}
	},

    createBox: function(box_size, texture_image, color) {

        var box_size = box_size || {x:1,y:1,z:1};

        var geometry, material, mesh;

        geometry = new THREE.CubeGeometry(box_size.x, box_size.y, box_size.z);

        if (texture_image !== undefined){
            var texture = THREE.ImageUtils.loadTexture(texture_image);
            texture.anisotropy = renderer.getMaxAnisotropy();
            material = new THREE.MeshBasicMaterial({ map: texture });
        }
        else if (color !== undefined)
        {
            material = new THREE.MeshBasicMaterial( { color: color, opacity:1.0, wireframeLinewidth: 0} );
        }
        else
        {
            material = new THREE.MeshLambertMaterial({ opacity: 1.0, transparent: true });
            material.color.setRGB( Math.random() * 100 / 100, Math.random() * 100 / 100, Math.random() * 100 / 100 );
        }

        mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);
        return mesh;
    },

    createBasicBox: function(box_size, box_pos) {
        var box_size = box_size || {x:1,y:1,z:1};
        var box_pos = box_pos || {x:1,y:1,z:1};

        var geometry = new THREE.CubeGeometry( box_size.x, box_size.y, box_size.z );
        var material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: false } );
        var mesh = new THREE.Mesh( geometry, material );
        mesh.useQuaternion = true;
        mesh.position.set(box_pos);
        this.scene.add(mesh);
    },

	createPanel: function(geom, w, h, front, back_text, color) {

		// front : Image / url / string
		//var color = color !== undefined ? color : rand_three_color_rgb();
		var color = color !== undefined ? color : Math.random() * 0xfffffff;
		var color_hex = color instanceof THREE.Color ? color.getHex() : color;

		var front_tex;
		var front_material;
		if (front !== undefined)
		{
			if (front instanceof Image)
			{
				// reload image
				front = front.src;
			}

			if (front instanceof Image || (typeof front == "string" && front.startsWith("http")))
			{
				//front_tex = new THREE.Texture( front );
				front_tex = THREE.ImageUtils.loadTexture( front );

				front_tex.anisotropy = renderer.getMaxAnisotropy();
				front_material = new THREE.MeshBasicMaterial( { color: 0xffffff,
					map: front_tex, overdraw: false, wireframe: true} );
			}
			else // string
			{
				front_tex = this.createTextureFromText(front, w, h, color_to_rgb(color), undefined, '24px Arial');
				front_material = new THREE.MeshBasicMaterial( { map: front_tex, overdraw: false, wireframe: true} );
			}
		}

		var back_material;
		if (back_text)
		{
			var back_tex = this.createTextureFromText(""+back_text, w, h, color_to_rgb(color));
			back_material = new THREE.MeshBasicMaterial( { map: back_tex, overdraw: false } );
		}
		else
		{
			back_material = new THREE.MeshBasicMaterial( { color: 0xdddddd, opacity:1.0, wireframeLinewidth: 0} )
		}

		// right, left, top, bottom, back, front
		var materials = [];
		var side_material = new THREE.MeshBasicMaterial( { color: color_hex, opacity:0.7, wireframe: false } );
		for (var i = 0; i < 4; i++){
			materials.push(side_material);
		}
		//front ? materials.push(front_material) : materials.push(side_material);
		if (front == undefined){
			materials.push(side_material);
		}
		else
		{
			materials.push(front_material);
		}
		materials.push(back_material);

		var mesh = new THREE.Mesh( geom, new THREE.MeshFaceMaterial(materials) );

		this.scene.add(mesh);
		return mesh;
	},

	createXYZAxes: function(axes_text, axes_length, axes_ticks, particle_size, color) {

		var axes_text = axes_text ? axes_text : ['x axis','y axis','z axis']
		var axes_length = axes_length ? axes_length : [500, 500, 500];
		var axes_ticks = axes_ticks ? axes_ticks : [10, 10, 10];
		var size = particle_size ? particle_size : 5;
		var color = color ? color : 0x888888;

		var x = axes_length[0];
		var y = axes_length[1];
		var z = axes_length[2];

		if (x == y == z == 0)
		{
			return;
		}
		// remove previous
		var previous_axes = this.scene.getChildByName("axes");
		previous_axes && this.scene.remove(previous_axes);

		// axes labels:
		if (x !== 0){
			this.createLabel(axes_text[0], x/2, 0, 0);
			//createTextBanner(axes_text[0], x/2, 0, 100, 50);
		}
		if (y !== 0){
			this.createLabel(axes_text[1], 0, y/2, 0);
			//createTextBanner(axes_text[1], 0, y/2, 100, 50);
		}
		if (z !== 0){
			this.createLabel(axes_text[2], 0, 0, z/2);
			//createTextBanner(axes_text[2], x, 0, 100, 50);
		}

		// particles
		var PI2 = Math.PI * 2;
		var circle_shape = function ( context ) {
				context.beginPath();
				context.arc( 0, 0, 1, 0, PI2, true );
				context.closePath();
				context.fill();
			}

		var material = new THREE.ParticleCanvasMaterial( {
			color: color,
			program: circle_shape
		} );
		var x_material = new THREE.ParticleCanvasMaterial( {
			color: color, //0xff000000,
			program: circle_shape
		} );
		var y_material = new THREE.ParticleCanvasMaterial( {
			color: color, //0x00ff0000,
			program: circle_shape
		} );
		var z_material = new THREE.ParticleCanvasMaterial( {
			color: 0x0000ff00,
			program: circle_shape
		} );

		var axes_group = new THREE.Object3D();
		axes_group.name = "axes";

		var particle;
		var home_particle = new THREE.Particle( material );
		home_particle.position = new THREE.Vector3(0,0,0);
		home_particle.scale.x = home_particle.scale.y = size;
		axes_group.add( home_particle );

		for (var i=0; i<axes_ticks[0]; i++)
		{
			particle = new THREE.Particle( x_material );
			particle.position.x = i * x/axes_ticks[0];
			particle.scale.x = particle.scale.y = size;
			axes_group.add( particle );
		}
		var line_geom, line;

		this.createLine(home_particle.position, particle.position, color, "x_line");

        for (var i=0; i<=axes_ticks[1]; i++)
		{
			particle = new THREE.Particle( y_material );
			particle.position.y = i * y/axes_ticks[1];
			particle.scale.x = particle.scale.y = size;
			axes_group.add( particle );
		}

		this.createLine(home_particle.position, particle.position, color, "y_line");

		for (var i=0; i<=axes_ticks[2]; i++)
		{
			particle = new THREE.Particle( z_material );
			particle.position.z = i * z/axes_ticks[2];
			particle.scale.x = particle.scale.y = size;
			axes_group.add( particle );
		}
		this.createLine(home_particle.position, particle.position, color, "z_line");

		this.scene.add( axes_group );
	},

	createLabel: function(text, x, y, z, size, color, backGroundColor, backgroundMargin) {

		var x = x ? x : 0;
		var y = y ? y : 0;
		var z = z ? z : 0;
		var size = size ? size : 48;
		var color = color ? color : 'rgba(255, 255, 255, 0.7)';
		var backGroundColor = backGroundColor ? backGroundColor : "rgb(1, 123, 123)";
		var backgroundMargin = backgroundMargin ? backgroundMargin : 10;

		var canvas = document.createElement("canvas");
		var context = canvas.getContext("2d");
		context.font = size + "px Arial";

		var textWidth = context.measureText(text).width;
		canvas.width = textWidth + backgroundMargin;
		canvas.height = size + backgroundMargin;

		if(backGroundColor) {
			context.fillStyle = backGroundColor;
			context.fillRect(
				canvas.width / 2 - textWidth / 2 - backgroundMargin / 2,
				canvas.height / 2 - size / 2 - +backgroundMargin / 2,
				textWidth + backgroundMargin,
				size + backgroundMargin);
		}
		// NOTE: We need to reset the font again after fillRect
		context.font = size + "px Arial";
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.fillStyle = color;
		context.fillText(text, canvas.width / 2, canvas.height / 2);

		//context.strokeStyle = "black";
		//context.strokeRect(0, 0, canvas.width, canvas.height);

		var texture = new THREE.Texture(canvas);
		texture.needsUpdate = true;

		var material = new THREE.MeshBasicMaterial({map : texture});
		//var mesh = new THREE.Mesh(new THREE.PlaneGeometry(canvas.width, canvas.height), material);
		//mesh.doubleSided = true;
		var mesh = new THREE.Mesh(new THREE.CubeGeometry(canvas.width, canvas.height, canvas.height), material);

		// mesh.overdraw = true;
		mesh.position.x = x - canvas.width;
		mesh.position.y = y - canvas.height;
		mesh.position.z = z;

		this.scene.add(mesh);
		return mesh;
	},

	createTextureFromText: function(text, w, h, background_color, image, font) {

		// text : a string or a list of strings

		// globals canvas canvas_2d
		var canvas = document.createElement('canvas');
		var canvas_2d = canvas.getContext('2d');

		var font = font ? font : '48px Arial';
		var w = w ? w : 100;
		var h = h ? h : 100;
		var textWidth = canvas_2d.measureText(text).width;
		//w = textWidth;

		canvas.width  = w;
		canvas.height = h;

		if (image !== undefined)
		{
			canvas_2d.drawImage(image, 0, 0, w, h);
			canvas_2d.fillStyle = 'rgba(0, 0, 0, 0)';
			canvas_2d.fillRect(0,0,w,h);
		}

		if(background_color !== undefined) {
			canvas_2d.fillStyle = background_color;
			canvas_2d.fillRect(0,0,w,h);
		}

		canvas_2d.font = font;
		canvas_2d.fillStyle = 'rgba(255, 255, 255, 0.7)';
		canvas_2d.textAlign = "center";
		canvas_2d.textBaseline = "middle";

		if (typeof text == "string")
		{
			canvas_2d.fillText(text, w/2, h/2);
		}
		else
		{
			var lines = text.length;
			var line_h = h/lines;
			for (var y=0;y<lines;y++)
			{
				canvas_2d.fillText(""+text[y], w/2, y*line_h+20);
			}
		}

		/*
		var imageData = canvas_2d.getImageData(0, 0, canvas.width / 2, canvas.height);
		var data = imageData.data;
		for (var i = 0; i < data.length; i += 4) {
			data[i] = 255 - data[i]; // red
			data[i + 1] = 255 - data[i + 1]; // green
			data[i + 2] = 255 - data[i + 2]; // blue
			// i+3 is alpha (the fourth element)
		}
		canvas_2d.putImageData(imageData, 0, 0);
		*/

		var texture = new THREE.Texture(canvas);
		texture.needsUpdate = true;
		return texture;
	},

	createTextBanner: function(text, x, y, z, w, h) {
		// UNTESTED CODE
		var texture = this.createTextureFromText(text, w, h, "rgb(0, 0, 255, 0.7)");
		var material = new THREE.MeshBasicMaterial( { map: texture } );
		var mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
		mesh.doubleSided = true;
		mesh.position.x = x - w;
		mesh.position.y = y - h;
		mesh.position.z = z;

		this.scene.add(mesh);
		return mesh;
	},
});

var AmmoUtils = Class.extend ({
    init: function (three_utils) {
        this.three = three_utils;
        this.dynamicsWorld = undefined;
        this.bodies = [];

        this.material = new THREE.MeshLambertMaterial( { color: 0x123456 } );
        THREE.ColorUtils.adjustHSV( this.material.color, 0, 0, 0.9 );

    },

    createWorld: function(){
        var collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
        var dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
        var overlappingPairCache = new Ammo.btDbvtBroadphase();
        var solver = new Ammo.btSequentialImpulseConstraintSolver();
        this.dynamicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
        this.dynamicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));

        var groundShape = new Ammo.btBoxShape(new Ammo.btVector3(50, 50, 50));
        var groundTransform = new Ammo.btTransform();
        groundTransform.setIdentity();
        groundTransform.setOrigin(new Ammo.btVector3(0, -56, 0));

        // Create infinite ground plane
        //    var aabbShape = new Ammo.btStaticPlaneShape(this.tVec(0, 1, 0), 0);
        //    var aabbTransform = new Ammo.btTransform();
        //    aabbTransform.setIdentity();
        //    this.localCreateRigidBody(0, aabbTransform, aabbShape);

        var mass = 0;
        var localInertia = new Ammo.btVector3(0, 0, 0);
        var myMotionState = new Ammo.btDefaultMotionState(groundTransform);
        var rbInfo = new Ammo.btRigidBodyConstructionInfo(0, myMotionState, groundShape, localInertia);
        var body = new Ammo.btRigidBody(rbInfo);

        this.dynamicsWorld.addRigidBody(body);
        this.bodies.push(body);

    },

    createBox: function(box_size, box_pos, texture_image, color) {

        var box_size = box_size || {x:1,y:1,z:1};
        var box_pos = box_pos || {x:1,y:1,z:1};

        // ammmo uses half-widths ...
        var boxShape = new Ammo.btBoxShape(box_size.x * 2, box_size.y * 2, box_size.z * 2);
        var startTransform = new Ammo.btTransform();
        startTransform.setIdentity();
        startTransform.setOrigin(box_pos);
        var mass = box_size.x * box_size.y * box_size.z;

        var localInertia = new Ammo.btVector3(0, 0, 0);
        boxShape.calculateLocalInertia(mass, localInertia);

        var myMotionState = new Ammo.btDefaultMotionState(startTransform);
        var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, boxShape, localInertia);
        var body = new Ammo.btRigidBody(rbInfo);
        body.setLinearVelocity(new Ammo.btVector3(0,0,0));
        body.setAngularVelocity(new Ammo.btVector3(0,0,0));
        //body.setContactProcessingThreshold(this.m_defaultContactProcessingThreshold);

        var mesh = this.three.createBox(box_size, texture_image, color);
        mesh.useQuaternion = true;
        body.mesh = mesh;
        mesh.body = body;

        this.dynamicsWorld.addRigidBody(body);
        this.bodies.push(body);

        return body;
    },

    createRigidBody: function(mass, startTransform, shape){

      // rigidbody is dynamic if and only if mass is non zero, otherwise static
      var isDynamic = (mass != 0.0);
      var localInertia = new Ammo.btVector3(0,0,0);
      if(isDynamic)
          shape.calculateLocalInertia(mass, localInertia);

      var myMotionState = new Ammo.btDefaultMotionState(startTransform);
      var cInfo = new Ammo.btRigidBodyConstructionInfo(mass,myMotionState,shape,localInertia);
      var body = new Ammo.btRigidBody(cInfo);
      body.setLinearVelocity(new Ammo.btVector3(0,0,0));
      body.setAngularVelocity(new Ammo.btVector3(0,0,0));
      //body.setContactProcessingThreshold(this.m_defaultContactProcessingThreshold);
      this.dynamicsWorld.addRigidBody(body);
      //this.m_shapeDrawer.add(body,shape,options);
      this.bodies.push(body);
      //this.m_startMotionStates.push(myMotionState);

      geom = new THREE.CubeGeometry(shape.radius*2, shape.length*2, 2.0);
      mesh = new THREE.Mesh( geom, this.material );
      var origin = startTransform.getOrigin();
      mesh.position.set(origin.x, origin.y, origin.z);
      this.three.scene.add(mesh);
      return body;
    },

    syncMeshes: function() {
        var i, transform = new Ammo.btTransform(), origin, rotation;

        for ( i = 0; i < this.bodies.length; i++ ) {
            var body = this.bodies[i];
            body.getMotionState().getWorldTransform( transform ); // Retrieve box position & rotation from Ammo

            if (body.mesh !== undefined){

                // Update position
                origin = transform.getOrigin();
                body.mesh.position.x = origin.x();
                body.mesh.position.y = origin.y();
                body.mesh.position.z = origin.z();

                // Update rotation
                rotation = transform.getRotation();
                body.mesh.quaternion.x = rotation.x();
                body.mesh.quaternion.y = rotation.y();
                body.mesh.quaternion.z = rotation.z();
                body.mesh.quaternion.w = rotation.w();
            }
        }
    },

    simulate: function (dt) {
        this.dynamicsWorld.stepSimulation(dt, 2);
        this.syncMeshes();
    },

});

var CannonUtils = Class.extend ({
      init: function (three_utils) {
          this.three = three_utils;
          this.dynamicsWorld = undefined;
          this.bodies = [];
      },

      createWorld: function(){

          world = new CANNON.World();
          world.quatNormalizeSkip = 0;
          world.quatNormalizeFast = false;
          world.solver.setSpookParams(300,10);
          world.solver.iterations = 5;
          world.gravity.set(0,-20,0);
          world.broadphase = new CANNON.NaiveBroadphase();
          this.world = world;

         // Create a slippery material (friction coefficient = 0.0)
          physicsMaterial = new CANNON.Material("slipperyMaterial");
          var physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial,
                                                                  physicsMaterial,
                                                                  0.0, // friction coefficient
                                                                  0.3  // restitution
          );
          // We must add the contact materials to the world
          world.addContactMaterial(physicsContactMaterial);

          this.world = world;
          this.physicsMaterial = physicsMaterial;
          this.physicsContactMaterial = physicsContactMaterial;
      },

    createSphere: function(){
        // Create a sphere
        var mass = 5, radius = 1.3;
        sphereShape = new CANNON.Sphere(radius);
        sphereBody = new CANNON.RigidBody(mass,sphereShape,this.physicsMaterial);
        sphereBody.position.set(0,5,0);
        sphereBody.linearDamping = 0.05;
        this.world.add(sphereBody);
    },

    createPlane: function(){
        // Create a plane
        var groundShape = new CANNON.Plane();
        var groundBody = new CANNON.RigidBody(0,groundShape,this.physicsMaterial);
        groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
        this.world.add(groundBody);
    },

    createBox: function(scale, pos, texture_image, color){
        var scale = scale || {x:1,y:1,z:1};
        var pos = pos || {x:1,y:1,z:1};

        var halfExtents = new CANNON.Vec3(scale.x/2, scale.y/2, scale.z/2 );
        var boxShape = new CANNON.Box(halfExtents);
        var boxBody = new CANNON.RigidBody(5,boxShape);
        this.world.add(boxBody);
        boxBody.position.set(pos.x,pos.y,pos.z);

        var boxMesh = this.three.createBox(scale, texture_image, color);
        boxMesh.position.set(pos.x,pos.y,pos.z);
        boxMesh.castShadow = true;
        boxMesh.receiveShadow = true;
        boxMesh.useQuaternion = true;

        boxBody.mesh = boxMesh;
        boxMesh.body = boxBody;
        this.bodies.push(boxBody);
    },

    simulate: function (dt) {
        this.world.step(dt);
        for ( i = 0; i < this.world.bodies.length; i++ ) {
            var body = this.world.bodies[i];

            if (body.mesh !== undefined){
                // Copy coordinates from Cannon.js to Three.js
                body.position.copy(body.mesh.position);
                body.quaternion.copy(body.mesh.quaternion);
            }
        }
    },
});

SIFT_THREE.ThreeBaseUtils = ThreeBaseUtils;
SIFT_THREE.ThreeDOMUtils = ThreeDOMUtils;
SIFT_THREE.ThreeUtils = ThreeUtils;
SIFT_THREE.CannonUtils = CannonUtils;
SIFT_THREE.AmmoUtils = AmmoUtils;
