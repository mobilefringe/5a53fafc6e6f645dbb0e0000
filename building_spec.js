function renderMap () {
    var mall_json = {};
            var landmarks = {};
            mall_json.mapwidth = "1000";
            mall_json.mapheight = "1000";
            mall_json.categories = [];
            mall_json.levels = [];
            
            // need to add the following for each floor we want to configure.
            _.forEach(floorList(), function(value, key) { 
                var floor_1 = {};
                floor_1.id = value.id;
                floor_1.title = value.title;
                floor_1.map = value.map;
                
                floor_1.show = value.show;
                floor_1.locations = [];
                var stores_on_floors =  _.filter(stores, function(o) {return value.z_index === o.z_coordinate;}); // ['z_coordinate', value.z_index]);
                _.forEach(stores_on_floors, function(val, key) {
                    //for testing limiting the store numbers to vm
                    var temp_val = {};
                    temp_val.id = val.svgmap_region;
                    temp_val.title = val.name;
                    temp_val.about = val.description.substring(0,200);
                    if(val.categories != null) {
                        if(val.categories.length>1){
                        temp_val.category = val.categories[1];
                        }
                        else {
                            temp_val.category = val.categories[0];
                        }
                    }
                    temp_val.link = "/stores/" + val.slug;
                    temp_val.pin = "hidden";
                   
                    
                    //get svg's wifth/height by checking the map
                    var svg_width = 2500;
                    var svg_height = 2500;

                    temp_val.x = val.x_coordinate / svg_width;
                    temp_val.y = val.y_coordinate / svg_height;
                    floor_1.locations.push(temp_val);
                });
                mall_json.levels.push(floor_1);
            });
            
            map = $('#mapplic').mapplic({
            	source: mall_json,
            	height: 900,
            	landmark : true,
            	mapfill:true,
            	minimap: false,
            	sidebar: false,
            	hovertip: true,
            	developer: false,
            	fullscreen : false,
            	clearbutton: false,
            	deeplinking: false,
            	fillcolor : "none",
            	maxscale: 6,
            	skin: 'mapplic-dark',
            	tooltiplabel : 'Info'
            });
            
            map.on('mapready', function(e, self) {
				console.log('Map is ready!');
				mapLoaded(map);
			});
            
        }
        function floorList () {
            var floor_list = [];
            
            var floor_1 = {};
            floor_1.id = "first-floor";
            floor_1.title = "Level One";
            // console.log(getSVGMapURL().split("?")[0])
            floor_1.map =  "https://www.mallmaverick.com/system/site_images/photos/000/038/284/original/St.Vital_-_Map_-_April-06-2018_-_Outlined.svg"; 
            //"//www.mallmaverick.com/system/site_images/photos/000/037/418/original/Regent_Mall_-_Map_-_March-08-2018_updated.svg";
            // floor_1.minimap = "//codecloud.cdn.speedyrails.net/sites/5a4bb6d36e6f6473fa0a0000/image/png/1513365138000/NorthPark - Dec-15-2017 - Floor 1.png";
            floor_1.z_index = 1;
            floor_1.show = true;
            floor_list.push(floor_1);
            console.log("getSVGMapURL", getSVGMapURL());
            return floor_list;
        }
        function svgList () {
            return _.map(getStoresList(), 'svgmap_region');
        }
        function mapLoaded (map){
            self = map.data('mapplic');
            var svg = document.getElementById('Layer_1');
            // console.log("svg", svg);
            
            //get floors to be visible 
            $(".mapplic-layer").show();
            //go through all the regions and recalculat the locations
            _.forEach(svgList(), function(val, key) {
                
                if(val !== null) {
                    
                    var element = document.getElementById(val);
                    if (element){
                        // console.log(val, element);
                        elBBox = element.getBoundingClientRect();
                        // console.log(elBBox);
                        
                        var viewport_center_x = 0;
                        var viewport_center_y = 0;
                        viewport_center_x = (_.toNumber(elBBox.left) + _.toNumber(elBBox.right) )/2;
                        viewport_center_y = (_.toNumber(elBBox.top) + _.toNumber(elBBox.bottom) )/2;
                        // console.log("viewport_x",viewport_center_x,viewport_center_y);
                        pt = svg.createSVGPoint();
                        pt.x = viewport_center_x;
                        pt.y = viewport_center_y;
                        // console.log("pt", pt.x, pt.y)
                        var svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
                        // console.log("svg points", svgP.x,svgP.y);
                        var new_x = svgP.x/ 2500;
                        var new_y = svgP.y/ 2500;
                        var location = self.getLocationData(val);
                        // console.log("nex_x, y", new_x, new_y)
                        if(location !== null && location.el){
                            location.x = new_x;
                            location.y =  new_y;
                            self.updateLocation(val);
                        }
                    }
                }
            });
            // console.log("self", vm.self);
            //find which levels need to be hidden
            hidden_level = _.filter(self.data.levels , function (o){ 
                // console.log (o); 
                return o.show !== true;
            });
            //doing it in a loop for future cases where there are more than two floors
            _.forEach(hidden_level, function(val, key) {
                $(".mapplic-layer[data-floor='"+val.id+"']").hide();
            });
            setTimeout(function() {
                show_content();
            }, 500);
        }
}