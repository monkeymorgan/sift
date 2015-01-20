/**
 * @author Morgan Brickley (morgan.brickley@gmail.com)
 * requires: <script src="http://connect.facebook.net/en_US/all.js"></script>
 * A collection of classes for manipulating 'person' data from facebook.
 * SIFT.Person - A class representing a single person and their metadata (age, gender)
 * SIFT.Column - A list of Person's and cached min,max ages
 * SIFT.ColumnSet - A list of Column's
 * SIFT.FakeFacebookDataSet - An accesor for the retrieved facebook data.
 */

var SIFT = SIFT || { REVISION: '0' };

SIFT.Column = function() {
	
	this.data = []; // list of SIFT.Person's
	
	this.min = 0;
	this.max = 0;
	this.height = 0;

	// optional	
	this.text = '';
	this.x = 0;
	this.y = 0;
};

SIFT.ColumnSet = function(column_width, column_height, compress_empty_columns, data, num_columns) {

	this.column_width = column_width ? column_width : 100;
	this.column_height = column_height ? column_height : 100;
	this.compress_empty_columns = compress_empty_columns ? compress_empty_columns : false;
	
	this.data = []; // list of SIFT.Person's
	this.columns = []; // list of SIFT.Column's
	this.columns_minima = [];	
	this.columns_maxima = [];
	this.columns_height = [];
	this.max_height = undefined;
	
	this.num_columns = num_columns;
	this.friends = data;
	
	if (data && num_columns){
		this.setData(data, num_columns);
	}
	
};

var valueSort = function ( a, b ) {
	return a.value - b.value;
};
		
SIFT.ColumnSet.prototype = {

	constructor: SIFT.ColumnSet,

	getWidth: function(){
		return this.num_columns * this.column_width;
	},
	
	getHeight: function(){
		return this.max_height * this.column_height;
	},
	
	getMin: function(){
		this.data.sort(valueSort);
		return this.data[0].value;
	},
	
	getMax: function(){
		this.data.sort(valueSort);
		return this.data[this.data.length-1].value;
	},
	
	getMean: function(){
		var combined_values = 0;
		var valid_values = 0;
		
		for (i=0; i<this.data.length-1; i++)
		{
			if (this.data[i] && this.data[i].value)
			{
				combined_values += this.data[i].value;
				valid_values += 1;
			}
		}
		
		if (valid_values > 0)
		{
			return combined_values / valid_values;
		}
		else
		{
			return 0; // hack
		}
	},
	
	getModes: function(){
		
		var modes = [];
		for (var i=0; i<this.column_heights.length; i++)
		{
			if (this.column_heights[i] == this.max_height) {
				modes.push(this.columns[i].data[0].value);
			}
		}
		
		return modes;
	},
	
	getMedian: function(){
		
		var median;
		this.data.sort(valueSort);
		if (this.data.length % 2 == 0)
		{
			var midway = this.data.length/2;
			median = (this.data[midway].value + this.data[midway+1].value)/2;
		}
		else
		{
			median = this.data[(this.data.length+1)/2].value;
		}
		
		return median;
	},

	getMedianColumn: function(){
		return this.getColumnIndex(this.getMedian());
	},

	getMeanColumn: function(){
		return this.getColumnIndex(this.getMean());
	},

	getModeColumns: function(){
		var modes = this.getModes();
		var mode_columns = modes.map(this.getColumnIndex, this);		
		return mode_columns; 		
	},

	getAllColumnData: function(excluded_columns) {
		// Return a simple list of all data in columns except those
		// in the excluded_columns
		var excluded_columns = excluded_columns ? excluded_columns : [];
		var data = [];
		
		for (var c=this.columns.length-1; c>=0; c--)
		{
			if (c in excluded_columns == false)
			{
				for (var i=this.columns[c].data.length-1; i>=0; i--)
				{
					var value = this.columns[c].data[i];
					data.push(value);
				}
			}
		}
		
		return data;
	},

	getColumnData: function(included_columns) {
		// Return a simple list of all data in columns "included_columns"
		var included_columns = included_columns ? included_columns : [];
		var data = [];
		
		for (var c=this.columns.length-1; c>=0; c--)
		{
			if (c in included_columns == true)
			{
				for (var i=this.columns[c].data.length-1; i>=0; i--)
				{
					var value = this.columns[c].data[i];
					data.push(value);
				}
			}
		}
		
		return data;
	},
	
	getColumnIndex: function(value){
		var min = this.getMin();
		
		//scan columns from left
		for (var i=0;i<this.num_columns;i++)
		{
			if (this.columns[i].data[0].value == value){
				return i;
			}
		}
		return -1;
	},
	
	getGaps: function(start_value, end_value){
		var numerical_range = end_value - start_value; 
		var column_range = this.getColumnIndex(end_value) - this.getColumnIndex(start_value);
		
		return numerical_range - column_range;
	},
	
	setData: function(data, num_columns){
		/* Sort 'data' into n exclusive bands of equal range.
		   num_columns: if undefined, use 1 column per value
		   Sets members:
			"columns" - 'data' divided into n 'column's
				colunm.data: list of elements of the original data array.
				column .min .max .height .text
			"column_minima" 
			"column_maxima"
			"column_heights"
			"max_height"
		*/ 
		
		data = data.filter(function(x) { return x && x.value; });
		data.sort(valueSort);
		this.data = data;
	
		if (this.data.length == 0){
			this.columns = [];
			this.columns_minima = [];	
			this.columns_maxima = [];
			this.columns_height = [];
			this.max_height = undefined;
			return;
		}
		
		var min = data[0].value;
		var max = data[data.length-1].value;
		var range = max-min;		
		
		if (num_columns == undefined){
		
			var columns = [];
			for (i=0; i<this.data.length-1; )
			{        
				var column = new SIFT.Column();
				var this_value = data[i].value;
				while (i < this.data.length-1 && data[i].value <= this_value) {
					column.data.push(data[i]);
					i++;
				}
				column.min = this_value;
				column.max = this_value;
				column.text = ""+column.min;
				
				columns.push(column);
			}
			this.columns = columns;
			this.columns_minima = columns;
			this.columns_maxima = columns;
			this.num_columns = columns.length;
		}
		else
		{
			if (num_columns > data.length)
			{
				num_columns = data.length;
			}			
			this.num_columns = num_columns;
			var column_range = Math.round(range/num_columns);
			
			// calculate the exclusive range of each column
			var column_minima = [min];
			var column_maxima = [];
			for (i=0; i<this.num_columns; i++)
			{
				column_maxima[i] = min + ((i+1)*column_range)-1;
				if (i > 0) {
					// this minima is the previous maxima+1
					column_minima.push(column_maxima[i-1]+1); // note: assumes integers !
				}
			}
			column_maxima[this.num_columns-1] = max;
				
			this.columns_minima = column_minima;
			this.columns_maxima = column_maxima;
			
			// convert into a list of columns
			var ii = 0;
			var columns = [];
			for (i=0; i<this.num_columns-1; i++)
			{        
				var column = new SIFT.Column();
				while (data[ii] && data[ii].value && data[ii].value <= column_maxima[i]) {
					column.data.push(data[ii]);
					ii++;
				}
				column.min = column_minima[i];
				column.max = column_maxima[i];
				column.text = ""+column.min+"-"+column.max;
				
				columns.push(column);
			}
			this.columns = columns;
					
		}
			
		// determine the maximum column height
		var column_heights = [];
		for (var i=0; i<columns.length; i++)
		{
			var len = columns[i].data.length;
			column_heights.push(len);
			columns[i].height = len;
		}
		
		this.column_heights = column_heights;
		this.max_height = Math.max.apply(null, column_heights);
		
		return this;
	}    
};

SIFT.Person = function() {
	this.age = 0;
	this.value = 0;
	this.gender = undefined;
	this.relationship_status = undefined;
	this.id = 0;
	//this.desc = 'containter for Facebook Person data';
};

SIFT.Person.prototype = {

	constructor: SIFT.Person,

	randomize: function(min_age, max_age, mean, stddev) {
		this.age = SIFT.Math.randRangedIntStdNormal(min_age, max_age, mean, stddev);
		this.value = this.age;
		this.gender = SIFT.Math.randInt(0,1) == 1 ? "male" : "female";
		this.relationship_status = SIFT.Math.randInt(0,1) == 1 ? "married" : "single";
		this.id = SIFT.Math.randInt(0, 1024 * 1024);
	},
};

SIFT.Math = function() {
	this.desc = 'Maths helpers';
}

SIFT.Math.randInt = function(min, max) {
		var range = Math.round(max - min);
		return min + Math.round((Math.random() * range));
	};
	
SIFT.Math.randIntStdNormal = function() {
		// return a value with mean 0, std dev 1
		return (Math.random()*2-1)+(Math.random()*2-1)+(Math.random()*2-1);
	};

SIFT.Math.randIntNormal = function(mean, stdev) {
		// return a value with specified mean and std dev...
		return Math.round(this.randIntStdNormal()*stdev+mean);
	};
	
SIFT.Math.randRangedIntStdNormal = function(min, max, mean, stddev) {
		var val = this.randIntNormal(mean, stddev);
		return Math.max(min, Math.min(val, max));
	};


SIFT.FakeFacebookDataSet = function() {
	this.friends = [];
	this.males = [];
	this.females = [];
	this.married = [];
	this.single = [];
	this.desc = 'helper functions for data generation';
};

SIFT.FakeFacebookDataSet.prototype = {

	constructor: SIFT.FakeFacebookDataSet,
	
	randomPeople: function(min_age, max_age, mean, stddev, count) {
	
		min_age = min_age || 10;
		max_age = max_age || 60;
		mean = mean || 15;
		stddev = stddev || 3;
		
		var len = (count != undefined) ? count : SIFT.Math.randInt(20,100);
			
		this.friends = [];
		this.males = [];
		this.females = [];
		this.married = [];
		this.single = [];
		
		for(var n = 0; n < len; n++) {
			var person = new SIFT.Person();
			person.randomize(min_age, max_age, mean, stddev);

			// randomize creates a random ID but sequential is sometimes better for testing
			person.id = n;

			this.friends.push(person);
			// HACK
			if (person.gender == 'male'){
				this.males.push(person);
			}
			else
			{
				this.females.push(person);			
			}
			if (person.relationship_status == 'married'){
				this.married.push(person);
			}
			else
			{
				this.single.push(person);			
			}
		}
		return this.friends;
	}	
};


/* FACEBOOK */

function compare_birthdays(a,b) {
	if (a.birthday < b.birthday)
	   return -1;
	if (a.birthday > b.birthday)
	  return 1;
	return 0;
}
	
SIFT.FacebookDataSet = function() {

	this.friends = [];
    this.friends_with_birthdays = [];
	
	this.males = [];
	this.females = [];
	this.married = [];
	this.single = [];
	
	this.profile_images = {};		
		
	this.me = undefined;
    this.my_name = undefined;
    this.my_birthday = undefined;
    this.my_gender = undefined;
    
	this.desc = 'helper functions for getting and cached your facebook data';
};

SIFT.FacebookDataSet.prototype = {

	constructor: SIFT.FacebookDataSet,

	connectUser: function(app_id, channel_id) {
		var channel_id = channel_id ? channel_id : '';
		FB.init({
			appId      : app_id, // App ID
			channelUrl : channel_id, // Channel File
			status     : true, // check login status
			cookie     : true, // enable cookies to allow the server to access the session
			xfbml      : true  // parse XFBML
		});
		FB.getLoginStatus(function(response) {
			if (response.status === 'connected') {
				return true;
			} else {
				console.log("FB.login");
				FB.login(function(response) {
					if (response.authResponse) {
						return true;
					} else {
						alert('User cancelled login or did not fully authorize.');
					}
				}, {scope: 'user_birthday,friends_birthday,user_relationships,friends_relationships'});
			}
		});
	},
	
	connectAndDownloadUser: function(app_id, callback) {
		FB.init({
			appId      : app_id, // App ID
			channelUrl : '', // Channel File
			status     : true, // check login status
			cookie     : true, // enable cookies to allow the server to access the session
			xfbml      : true  // parse XFBML
		});
		// scope: see https://developers.facebook.com/docs/reference/login/extended-profile-properties/
		FB.getLoginStatus(function(response) {
			if (response.status === 'connected') {
				SIFT.g_facebook.downloadData(callback);
			} else {
				console.log("FB.login");
				FB.login(function(response) {
					if (response.authResponse) {
						SIFT.g_facebook.downloadData(callback);
					} else {
						alert('User cancelled login or did not fully authorize.');
					}
				}, {scope: 'user_birthday,friends_birthday,user_relationships,friends_relationships'});
			}
		});
	},
	
	downloadData: function(callback){
		this.downloadMeData();
		this.downloadFriendData(callback);
	},
	
	downloadMeData: function(callback_ok){
		FB.api('/me?fields=id,name,gender,birthday,relationship_status', function(response) {
			SIFT.g_facebook.me = response;
			SIFT.g_facebook.my_name = response.name;
			SIFT.g_facebook.my_birthday = response.birthday;
			SIFT.g_facebook.my_gender = response.gender;
			SIFT.g_facebook.my_relationship_status = response.relationship_status;
			console.log('Got facebook data for: ' + response.name);
			console.log('Birthday:' + response.birthday);
			
			if (callback_ok) {
				callback_ok();
			}
		});
	},
	
	downloadFriendData: function(callback_ok){
		// fields=id,name,gender,birthday,books,movies,television,location,hometown,relationship_status
		FB.api('/me/friends?fields=id,name,gender,birthday,relationship_status', function(response) {
			console.log(response);
			SIFT.g_facebook.friends = response.data;
			
			// filter out those friends who have not set any of their info ...
			SIFT.g_facebook.friends_with_birthdays = SIFT.g_facebook.friends.filter(function(val) { return val.birthday; });
			// HACK:
			SIFT.g_facebook.friends = SIFT.g_facebook.friends_with_birthdays;
			
			for (var i in SIFT.g_facebook.friends){
				var friend = SIFT.g_facebook.friends[i];
				friend.age = SIFT.g_facebook.parseAgeFromBirthday(friend.birthday);
				friend.value = friend.age;
			}
			SIFT.g_facebook.friends_with_relationship = SIFT.g_facebook.friends.filter(function(val) { return val.relationship_status; });
			SIFT.g_facebook.friends_with_gender = SIFT.g_facebook.friends.filter(function(val) { return val.gender; });
			
			SIFT.g_facebook.friends.sort(compare_birthdays);

			SIFT.g_facebook.males = SIFT.g_facebook.friends.filter(function(val) { return val.gender == 'male'; });
			SIFT.g_facebook.females = SIFT.g_facebook.friends.filter(function(val) { return val.gender == 'female'; });
			SIFT.g_facebook.married = SIFT.g_facebook.friends.filter(function(val) { return val.relationship_status == 'Married'; });
			SIFT.g_facebook.single = SIFT.g_facebook.friends.filter(function(val) { return val.relationship_status == 'Single'; });
			SIFT.g_facebook.dating = SIFT.g_facebook.friends.filter(function(val) { return val.relationship_status && val.relationship_status.endsWith('Relationship'); });
			
			console.log('Got facebook data for friends');
			SIFT.g_facebook.downloadProfilePictures(SIFT.g_facebook.friends, callback_ok);
		});
	},
	
	downloadProfilePictures: function(friends, callback_complete, max_images) {

		// load the entire list of friends and then call the callback
		// friends : list of form returned from FB.get(me/friends) - must contain an id attribute
		// callback : fn to be called when all images are ready
		
		var num_images = 0;
		for(var src in friends) {
			num_images++;
		}
		if (max_images != undefined){
			num_images = Math.min(num_images, max_images);
		}
		console.log('Getting facebook profiles for '+num_images+' friends');
		
		var loadedImages = 0;
		for(var i in friends) {
			var friend = friends[i];
			var profile_image = new Image();
			profile_image.src = 'https://graph.facebook.com/'+friend.id+'/picture';
			profile_image.onload = function() {
				if(++loadedImages >= num_images) {
					// final image is loaded...hit it!
					if (callback_complete) {
						callback_complete(SIFT.g_facebook.profile_images);
					}
				}
				console.log('Got '+loadedImages+' facebook friend image: '+friend.name);
			};
			
			SIFT.g_facebook.profile_images[friend.id] = profile_image;
			friend.profile_image = profile_image;
		}
	},
	
	parseAgeFromBirthday: function(birthday_str) {

		var birthday_dmy_str;
		
		if (birthday_str.length == 4)
		{
			birthday_dmy_str = "15/06/"+birthday_str;
		}
		else if (birthday_str.length == 7)
		{
			birthday_dmy_str = "15/"+birthday_str;
		}
		else
		{
			birthday_dmy_str = birthday_str;
		}
		
		var age_ms = Math.abs(new Date() - Date.parse(birthday_dmy_str));
		var ms_in_year = 1000 * 60 * 60 * 24 * 365;
		var age_in_years = Math.round(age_ms / ms_in_year);
		
		age_in_years = Math.min(age_in_years, 100);
		age_in_years = Math.max(age_in_years, 1);
		
		return age_in_years;
	},
	
	getFriendAges: function() {
		var ages = [];
		for (friend in this.friends_with_birthdays){
			var age = this.parseAgeFromBirthday(friend.birthday);
			ages.push(age);
			ages[c++].image = friend.image;
		}
		return ages;
	}
}

SIFT.g_facebook = new SIFT.FacebookDataSet();

/* END FACEBOOK */