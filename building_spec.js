var map_self = "";
var stores = [];
// var store_details = null;
function renderMap(map_stores, height, store_details) {
    var mall_json = {};
    var landmarks = {};
    mall_json.mapwidth = "1000";
    mall_json.mapheight = "1000";
    mall_json.categories = [];
    mall_json.levels = [];
    stores = map_stores;
    // need to add the following for each floor we want to configure.
    _.forEach(floorList(), function(value, key) {
        var floor_1 = {};
        floor_1.id = value.id;
        floor_1.title = value.title;
        floor_1.map = value.map;

        floor_1.show = value.show;
        floor_1.locations = [];
        _.forEach(map_stores, function(val, key) {
            //for testing limiting the store numbers to vm
            var temp_val = {};
            temp_val.id = val.svgmap_region;
            temp_val.title = val.unit + " - " + val.name;
            temp_val.link = val.leasing_doc;
            // temp_val.action = "open-link-new-tab";
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
        height: height,
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
        tooltiplabel: 'Download Design PDF'
    });

    map.on('mapready', function(e, self) {
        console.log("Map Loaded");
        map_self = self;
        mapLoaded(map, stores);
        if( store_details !== null) {
            dropPin(store_details.id);
        }
    });

}

function floorList() {
    var floor_list = [];

    var floor_1 = {};
    floor_1.id = "first-floor";
    floor_1.title = "Level One";
    // console.log(getSVGMapURL().split("?")[0])
    floor_1.map = getSVGMapURL().split("?")[0];//"https://www.mallmaverick.com/system/site_images/photos/000/039/355/original/St.Vital_-_Leasing_Map_-_May-09-2018.svg";
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
    var svg = document.getElementById('landmarks-1');
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
    //get all pdfs
    var temp_repo = getRepoDetailsByName("Building Design Specs");
    var specs_repo = [];
    if (temp_repo !== null && temp_repo !== undefined) {
        specs_repo = temp_repo.images;
    }

    $.each(collection, function(key, val) {
        filtered_list  = specs_repo.filter(function(o){
           return o.name == val.store_service
        });
        if (filtered_list !== null && filtered_list !== undefined && filtered_list.length > 0) {
            val.leasing_doc = filtered_list[0].image_url;
            val.no_pdf = false;
        } else {
            val.no_pdf = true;
        }
        var rendered = Mustache.render(template_html,val);
        item_rendered.push(rendered);
    });

    $(container).html(item_rendered.join(''));
}

function search_units(){
   
    var is_mobile = false;
    
    $('.building_spec_search #close_search').click(function(){
        $(this).hide();
        $('#search_results_units').html('');
        $('#search_results_units').hide();
        $('input#unit_search').val('');
        $('.building_spec_search #search_icon').show();
        removeSearchOverlay();
    });
    
    $('input#unit_search').keyup(function(){ 
        //add modal 
        $(".search_overlay").show();
        $('body').addClass('no_scroll');
         //check if this is a small device 
        if($(window).innerWidth() <= 768) {
            is_mobile = true;
        }
    
        if ($('input#unit_search').val().length === 0){
            $('#search_results_units').html('');
            $('#search_results_units').hide();
            $('.building_spec_search #close_search').hide();
            $('.building_spec_search #search_icon').show();
            removeSearchOverlay();
        } else {
            $('.building_spec_search #close_search').show();
            $('.building_spec_search #search_icon').hide();
            $('#search_results_units').html('');
            var val = $(this).val().toLowerCase();
            var results = getSearchResults(val);
            var s_stores = results.stores;
            if(s_stores !== null && s_stores !== undefined && s_stores.length > 0){
                var h2_stores = "<h2 id='open_stores' class='li_open'>(" +s_stores.length + ") Units<i class='pull-right fa fa-chevron-down'></i></h2>";
                $('#search_results_units').append(h2_stores);
                $.each(s_stores, function(i, v){
                    
                    var div_stores = "<div class='blog_search_results collapse_open_stores'>";
                    if(is_mobile) {
                        div_stores = div_stores + "<h4><a href='/building_spec/"+v.slug+"' data-region = '" + v.svgmap_region +"' data-id='" + v.id +"'>" + v.unit + " - " + v.name + "</a></h4>";
                    }
                    else {
                        div_stores = div_stores + "<h4><a class='map_pin_a' href='#' data-region = '" + v.svgmap_region +"' data-id='" + v.id +"' onClick='dropPin("+v.id + ","+v.no_pdf+");'>" + v.unit + " - " + v.name + "</a></h4>";
                    }
                    div_stores = div_stores + "</div>";
                    $('#search_results_units').append(div_stores);
                    $('#search_results_units').show();
                });
            }
        }
    });
    
}

function removeSearchOverlay (){
    $(".search_overlay").fadeOut();
    $('body').removeClass('no_scroll');
    $(".building_spec_search #close_search").removeClass("red_bg");
}
function dropPin(unit_id) {
    removeSearchOverlay();
    leasing_unit = getLeasingUnitByID(unit_id);
    if(leasing_unit.svgmap_region !== null) {
        map_self.showLocation(leasing_unit.svgmap_region);
        if(leasing_unit.no_pdf) {
            $(".mapplic-popup-link").hide();
        }
        else {
            console.log("new tab added");
            $(".mapplic-popup-link").attr("target" , '_blank');
        }
    }
}
function getLeasingUnitByID (id) {
    return _.find(stores, function(o) { return _.toNumber(o.id) === _.toNumber(id); })
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

function getSearchResults(search_string, max_results, trim_description_length){
    var search_results = {};
    var all_stores = getStoresList();
    var store_ids = [];
    var stores =[];
    var count = 0;
    $.each( all_stores , function( key, val ) {
        // localizeObject(val);
        if(store_ids.indexOf(val.id) == -1){
            if((val.name.toLowerCase().indexOf(search_string.toLowerCase()) > -1) || (val.unit.toLowerCase().indexOf(search_string.toLowerCase()) > -1) ){
                val.description_trim = val.description.substring(0, trim_description_length) + "..";
                stores.push(val);
                store_ids.push(val.id);
                count++;
            }
            if(count >= max_results){
                return false;
            }
        }
    });
    search_results['stores'] = stores;
    if(stores.length === 0){
        search_results['stores_header_style'] = "display:none";
    }
    //we only want to keep checking promos, events or jobs descriptions if there is more that 2 search string characters, otherwise too many results
    if(count >= max_results || search_string.length < 3){
        search_results['summary'] = {"count":count};
        return search_results;
    }
    
    search_results['summary'] = {"count":count};
    
    return search_results;
}
