var map_self = "";
function renderMap(stores) {
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
        _.forEach(stores, function(val, key) {
            //for testing limiting the store numbers to vm
            var temp_val = {};
            temp_val.id = val.svgmap_region;
            temp_val.title = val.unit + " - " + val.name;
            temp_val.link = val.leasing_doc;
            temp_val.pin = "hidden";
            temp_val.zoom = 2;
            temp_val.x = 0.5;
            temp_val.y = 0.5;
            floor_1.locations.push(temp_val);
        });
        mall_json.levels.push(floor_1);
    });

    map = $('#mapplic').mapplic({
        source: mall_json,
        height: 600,
        landmark: true,
        mapfill: true,
        minimap: false,
        sidebar: false,
        hovertip: true,
        developer: false,
        fullscreen: false,
        clearbutton: false,
        deeplinking: false,
        fillcolor: "none",
        maxscale: 5,
        skin: 'mapplic-dark',
        tooltiplabel: 'View Spec Document'
    });

    map.on('mapready', function(e, self) {
        console.log('Map is ready!');
        map_self = self;
        mapLoaded(map, stores);
        console.log("map", map_self);
    });

}

function floorList() {
    var floor_list = [];

    var floor_1 = {};
    floor_1.id = "first-floor";
    floor_1.title = "Level One";
    // console.log(getSVGMapURL().split("?")[0])
    floor_1.map = "https://www.mallmaverick.com/system/site_images/photos/000/038/284/original/St.Vital_-_Map_-_April-06-2018_-_Outlined.svg";
    floor_1.z_index = 1;
    floor_1.show = true;
    floor_list.push(floor_1);
    return floor_list;
}

function svgList(stores) {
    return _.map(stores, 'svgmap_region');
}

function mapLoaded(map, stores) {
    self = map.data('mapplic');
    var svg = document.getElementById('Layer_1');
    // console.log("svg", svg);

    //get floors to be visible 
    $(".mapplic-layer").show();
    //go through all the regions and recalculat the locations
    _.forEach(svgList(stores), function(val, key) {

        if (val !== null) {

            var element = document.getElementById(val);
            if (element) {
                // console.log(val, element);
                elBBox = element.getBoundingClientRect();
                // console.log(elBBox);

                var viewport_center_x = 0;
                var viewport_center_y = 0;
                viewport_center_x = (_.toNumber(elBBox.left) + _.toNumber(elBBox.right)) / 2;
                viewport_center_y = (_.toNumber(elBBox.top) + _.toNumber(elBBox.bottom)) / 2;
                // console.log("viewport_x",viewport_center_x,viewport_center_y);
                pt = svg.createSVGPoint();
                pt.x = viewport_center_x;
                pt.y = viewport_center_y;
                // console.log("pt", pt.x, pt.y)
                var svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
                // console.log("svg points", svgP.x,svgP.y);
                var new_x = svgP.x / 2500;
                var new_y = svgP.y / 2500;
                var location = self.getLocationData(val);
                // console.log("nex_x, y", new_x, new_y)
                if (location !== null && location.el) {
                    location.x = new_x;
                    location.y = new_y;
                    self.updateLocation(val);
                }
            }
        }
    });
    // console.log("self", vm.self);
    //find which levels need to be hidden
    hidden_level = _.filter(self.data.levels, function(o) {
        // console.log (o); 
        return o.show !== true;
    });
    //doing it in a loop for future cases where there are more than two floors
    _.forEach(hidden_level, function(val, key) {
        $(".mapplic-layer[data-floor='" + val.id + "']").hide();
    });
    setTimeout(function() {
        show_content();
    }, 500);
}

function renderLeasingList(container, template, collection, type){
    var item_list = [];
    var item_rendered = [];
    var template_html = $(template).html();
    Mustache.parse(template_html);   // optional, speeds up future uses
    var store_initial="";
    $.each(collection, function(key, val) {
        repo = getRepoDetailsByName(val.neighbourhood);
        if(repo !== null && repo !== undefined) {
            val.leasing_doc = val.image_url;
            val.no_pdf = false;
        }
        else {
            val.no_pdf = true;
        }
        var rendered = Mustache.render(template_html,val);
        item_rendered.push(rendered);
    });

    $(container).html(item_rendered.join(''));
}

function dropPin(svgmap_region) {
        map_self.showLocation(svgmap_region);
        console.log($(".view_specs").is(":visible") );
        // if(!$(".view_specs").is(":visible") ) {
        //     $(".mapplic-popup-link").hide();
        // }
    }
    
function loadInsidePages () {
    //get jsons 
    prefix = get_prefix();
    var pages_json = prefix + "/pages/svc-submission-requirements.json"
    $.getJSON(pages_json).done(function(data) {
        // $('#mm_page_title').html(data.title);
        $('#submission_req_page').html(data.body);
    }).fail(function(jqXHR) {
        if (jqXHR.status == 404) {
           console.log("Error retreving data. Please try again.")
        }
    });
    pages_json = prefix + "/pages/svc-base-building.json"
    $.getJSON(pages_json).done(function(data) {
        // $('#mm_page_title').html(data.title);
        $('#architectural_page').html(data.body);
    }).fail(function(jqXHR) {
        if (jqXHR.status == 404) {
           console.log("Error retreving data. Please try again.")
        }
    });
    pages_json = prefix + "/pages/svc-base-building--2.json"
    $.getJSON(pages_json).done(function(data) {
        // $('#mm_page_title').html(data.title);
        $('#structural_page').html(data.body);
    }).fail(function(jqXHR) {
        if (jqXHR.status == 404) {
           console.log("Error retreving data. Please try again.")
        }
    });
    pages_json = prefix + "/pages/svc-base-building--3.json"
    $.getJSON(pages_json).done(function(data) {
        // $('#mm_page_title').html(data.title);
        $('#mechanical_page').html(data.body);
    }).fail(function(jqXHR) {
        if (jqXHR.status == 404) {
           console.log("Error retreving data. Please try again.")
        }
    });
    pages_json = prefix + "/pages/svc-base-building--4.json"
    $.getJSON(pages_json).done(function(data) {
        // $('#mm_page_title').html(data.title);
        $('#electrical_page').html(data.body);
    }).fail(function(jqXHR) {
        if (jqXHR.status == 404) {
           console.log("Error retreving data. Please try again.")
        }
    });
    
    pages_json = prefix + "/pages/svc-base-building--5.json"
    $.getJSON(pages_json).done(function(data) {
        // $('#mm_page_title').html(data.title);
        $('#site_page').html(data.body);
    }).fail(function(jqXHR) {
        if (jqXHR.status == 404) {
           console.log("Error retreving data. Please try again.")
        }
    });
    pages_json = prefix + "/pages/svc-base-building--6.json"
    $.getJSON(pages_json).done(function(data) {
        // $('#mm_page_title').html(data.title);
        $('#environment_green_page').html(data.body);
    }).fail(function(jqXHR) {
        if (jqXHR.status == 404) {
           console.log("Error retreving data. Please try again.")
        }
    });
    
    pages_json = prefix + "/pages/svc-construction.json"
    $.getJSON(pages_json).done(function(data) {
        // $('#mm_page_title').html(data.title);
        $('#hoarding_page').html(data.body);
    }).fail(function(jqXHR) {
        if (jqXHR.status == 404) {
           console.log("Error retreving data. Please try again.")
        }
    });
    pages_json = prefix + "/pages/svc-construction--2.json"
    $.getJSON(pages_json).done(function(data) {
        // $('#mm_page_title').html(data.title);
        $('#preferred_trades_page').html(data.body);
    }).fail(function(jqXHR) {
        if (jqXHR.status == 404) {
           console.log("Error retreving data. Please try again.")
        }
    });
    pages_json = prefix + "/pages/svc-construction--3.json"
    $.getJSON(pages_json).done(function(data) {
        // $('#mm_page_title').html(data.title);
        $('#before_construction_page').html(data.body);
    }).fail(function(jqXHR) {
        if (jqXHR.status == 404) {
           console.log("Error retreving data. Please try again.")
        }
    });
    pages_json = prefix + "/pages/svc-construction--4.json"
    $.getJSON(pages_json).done(function(data) {
        // $('#mm_page_title').html(data.title);
        $('#during_construction_page').html(data.body);
    }).fail(function(jqXHR) {
        if (jqXHR.status == 404) {
           console.log("Error retreving data. Please try again.")
        }
    });
    pages_json = prefix + "/pages/svc-sustainability-criteria.json"
    $.getJSON(pages_json).done(function(data) {
        // $('#mm_page_title').html(data.title);
        $('#sustainability_page').html(data.body);
    }).fail(function(jqXHR) {
        if (jqXHR.status == 404) {
           console.log("Error retreving data. Please try again.")
        }
    });
}
