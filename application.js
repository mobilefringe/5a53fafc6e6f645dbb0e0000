function renderBanner(banner_template,home_banner,banners){
    var item_list = [];
    var item_rendered = [];
    var banner_template_html = $(banner_template).html();
    Mustache.parse(banner_template_html);   // optional, speeds up future uses
    $.each( banners , function( key, val ) {
        today = new Date();
        start = new Date (val.start_date);
        start.setDate(start.getDate());
        if(val.url == "" || val.url === null){
            val.css = "style=cursor:default;";
            val.noLink = "return false";
        }
        if (start <= today){
            if (val.end_date){
                end = new Date (val.end_date);
                end.setDate(end.getDate() + 1);
                if (end >= today){
                    item_list.push(val);  
                }
            } else {
                item_list.push(val);
            }
        }
    });

    $.each( item_list , function( key, val ) {
        var repo_rendered = Mustache.render(banner_template_html,val);
        item_rendered.push(repo_rendered);
    });
    $(home_banner).html(item_rendered.join(''));
}

function renderContest(container, template, collection){
    var item_list = [];
    var item_rendered = [];
    var template_html = $(template).html();
    Mustache.parse(template_html);   // optional, speeds up future uses

    collection.alt_photo_url = getImageURL(collection.photo_url);
    collection.property_name = getPropertyDetails().name;
    var rendered = Mustache.render(template_html,collection);
    item_rendered.push(rendered);
    
    $(container).show();
    $(container).html(item_rendered.join(''));
}

function renderEvents(container, template, collection){
    var mall_name = getPropertyDetails().name;
    var item_list = [];
    var item_rendered = [];
    var template_html = $(template).html();
    Mustache.parse(template_html); 
    $.each( collection , function( key, val ) {
        val.store_name = mall_name;
        val.image_url = val.event_image_url_abs;
        val.logo  = default_image.image_url;
        if(val.image_url.indexOf('missing.png') > 0){
            val.image_url  = val.logo;
        }
        
        if (val.name.length > 30){
            val.name_short = val.name.substring(0,30) + "...";
        } else {
            val.name_short = val.name;
        }
        
        var show_date = moment(val.show_on_web_date);
        var start = moment(val.start_date).tz(getPropertyTimeZone());
        var end = moment(val.end_date).tz(getPropertyTimeZone());
        if (start.format("DMY") == end.format("DMY")){
            val.dates = start.format("MMM D")
        } else {
            val.dates = start.format("MMM D") + " - " + end.format("MMM D")
        }
        
        var rendered = Mustache.render(template_html,val);
        item_rendered.push(rendered);
    });
    $(container).html(item_rendered.join(''));
}

function renderEventDetails(container, template, collection){
    var mall_name = getPropertyDetails().name;
    var item_list = [];
    var item_rendered = [];
    var template_html = $(template).html();
    Mustache.parse(template_html); 
    item_list.push(collection);
    $.each( item_list , function( key, val ) {
        val.image_url = val.event_image_url_abs;
        val.logo  = default_image.image_url;
        if(val.image_url.indexOf('missing.png') > 0){
            val.image_url  = val.logo;
        }
        
        var show_date = moment(val.show_on_web_date);
        var start = moment(val.start_date).tz(getPropertyTimeZone());
        var end = moment(val.end_date).tz(getPropertyTimeZone());
        if (start.format("DMY") == end.format("DMY")){
            val.dates = start.format("MMM D")
        } else {
            val.dates = start.format("MMM D") + " - " + end.format("MMM D")
        }
        
        var rendered = Mustache.render(template_html,val);
        item_rendered.push(rendered);
    });
    $(container).html(item_rendered.join(''));
}

function renderSingleItem(container, template, val){
    var item_list = [];
    var item_rendered = [];
    var template_html = $(template).html();
    Mustache.parse(template_html); 
    // $.each( collection , function( key, val ) {
        console.log("renderGeneral",val)
        var repo_rendered = Mustache.render(template_html,val);
        item_rendered.push(repo_rendered);
    // });
    $(container).html(item_rendered.join(''));
}

function renderGeneral(container, template, collection){
    var item_list = [];
    var item_rendered = [];
    var template_html = $(template).html();
    Mustache.parse(template_html); 
    $.each( collection , function( key, val ) {
        var repo_rendered = Mustache.render(template_html,val);
        item_rendered.push(repo_rendered);
    });
    $(container).html(item_rendered.join(''));
}

function renderHomeHours(container, template, collection){
    var item_list = [];
    var item_rendered = [];
    var template_html = $(template).html();
    Mustache.parse(template_html);   // optional, speeds up future uses
    item_list.push(collection);    
    $.each( item_list , function( key, val ) {
        var d = moment();
        switch(val.day_of_week) {
            case 0:
                val.day = "Sunday";
                break;
            case 1:
                val.day = "Monday";
                break;
            case 2:
                val.day = "Tuesday";
                break;
            case 3:
                val.day = "Wednesday";
                break;
            case 4:
                val.day = "Thursday";
                break;
            case 5:
                val.day = "Friday";
                break;
            case 6:
                val.day = "Saturday";
                break;
        }
        if (val.open_time && val.close_time && (val.is_closed == false || val.is_closed == null)){
            var open_time = moment(val.open_time).tz(getPropertyTimeZone());
            var close_time = moment(val.close_time).tz(getPropertyTimeZone());
            val.open = "Today's Hours :";
            val.hours = open_time.format("h a") + " - " + close_time.format("h a");
            val.open_now = "Open Now"
            val.open_color = "#6dd304"
        } else {
            val.open = "Closed Today";
            val.hours = "";
            val.open_now = "Closed"
            val.open_color = "#ac0a22"
        }
        var rendered = Mustache.render(template_html,val);
        item_rendered.push(rendered);
    });
    $(container).html(item_rendered.join(''));
}

function renderHours(container, template, collection, type){
    var item_list = [];
    var item_rendered = [];
    var template_html = $(template).html();
    Mustache.parse(template_html);   // optional, speeds up future uses
    if (type == "property_details"){
        item_list.push(collection);
        collection = [];
        collection = item_list;
    }
    if (type == "reg_hours") {
        $.each( collection , function( key, val ) {
            if (!val.store_id && val.is_holiday == false) {
                switch(val.day_of_week) {
                case 0:
                    val.day = "Sunday";
                    break;
                case 1:
                    val.day = "Monday";
                    break;
                case 2:
                    val.day = "Tuesday";
                    break;
                case 3:
                    val.day = "Wednesday";
                    break;
                case 4:
                    val.day = "Thursday";
                    break;
                case 5:
                    val.day = "Friday";
                    break;
                case 6:
                    val.day = "Saturday";
                    break;
            }
            if (val.open_time && val.close_time && val.is_closed == false){
                var open_time = moment(val.open_time).tz(getPropertyTimeZone());
                var close_time = moment(val.close_time).tz(getPropertyTimeZone());
                val.h = open_time.format("h:mma") + " - " + close_time.format("h:mma");
            } else {
                "Closed";
            }
                item_list.push(val);
            }
        });
        collection = [];
        collection = item_list;
    }
    
    if (type == "holiday_hours") {
        
        $.each( collection , function( key, val ) {
            if (!val.store_id && val.is_holiday == true) {
                holiday = moment(val.holiday_date).tz(getPropertyTimeZone());
                var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                val.formatted_date = holiday.format("MMM D");
                if (val.open_time && val.close_time && val.is_closed == false){
                    var open_time = moment(val.open_time).tz(getPropertyTimeZone());
                    var close_time = moment(val.close_time).tz(getPropertyTimeZone());
                    if (val.open_time == "0:00 AM"){
                        val.open_time = "12:00 AM";
                    }
                     if (val.close_time == "0:00 AM"){
                        val.close_time = "12:00 AM";
                    }
                    val.h = open_time.format("h:mm A") + " - " + close_time.format("h:mm A");
                } else {
                    val.h = "Closed";
                }
                // if (val.h != "Closed"){
                    item_list.push(val);
                // }
            }
        });
        collection = [];
        collection = item_list;
    }
    
    if (type == "closed_hours") {
        $.each( collection , function( key, val ) {
            if (!val.store_id && val.is_holiday == true) {
                holiday = moment(val.holiday_date).tz(getPropertyTimeZone());
                var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                val.formatted_date = holiday.format("dddd, MMM D, YYYY");
                if (val.open_time && val.close_time && val.is_closed == false){
                    var open_time = moment(val.open_time).tz(getPropertyTimeZone());
                    var close_time = moment(val.close_time).tz(getPropertyTimeZone());   
                    if (val.open_time == "0:00 AM"){
                        val.open_time = "12:00 AM";
                    }
                     if (val.close_time == "0:00 AM"){
                        val.close_time = "12:00 AM";
                    }
                    val.h = open_time.format("h:mm A") + " - " + close_time.format("h:mm A");
                } else {
                    val.h = "Closed";
                }
                if (val.h == "Closed"){
                    item_list.push(val);
                }
            }
        });
        collection = [];
        collection = item_list;
    }
    
    $.each( collection , function( key, val ) {
        var rendered = Mustache.render(template_html,val);
        item_rendered.push(rendered);

    });
    
    $(container).show();
    $(container).html(item_rendered.join(''));
}

function renderPopup(){
    var popup = getPopups()[0];
    if(popup != undefined){
        if($.cookie("popup_viewed") != "true"){
            $.cookie("popup_viewed", "true", { expires: 1 });
            $('<div class="modal-backdrop custom_backdrop"></div>').appendTo(document.body);
            $('.custom_popup').show()
        }
        $('.close_popup, .custom_backdrop').click(function(){
            $(".modal-backdrop").remove();
	        $(".custom_popup").remove();
        });
        if(popup.contest.id != null){
            $('.custom_img').attr('src', '//mallmaverick.cdn.speedyrails.net'+ popup.photo_url);
            $('.custom_text').text(popup.description1);
            $('.p_name').text(popup.name);
        } else {
            $('.popup_form_div').css('visibility', 'hidden');
            $('.custom_popup').css('background-image', 'url(//mallmaverick.cdn.speedyrails.net' + popup.photo_url + ')');
        }
        $('#form_popup').submit(function(){
            $('#cm-name').val($('#FNAME').val() + " " + $('#LNAME').val());
            if($('#popup_agree').is(':checked') == false){
                alert("Please agree to receive emails.");
                $('#popup_agree').focus();
                return false;
            }
        });
        $('.close_popup').click(function(){
            $('.custom_popup').fadeOut();
        });
    }
}
        
function renderPosts(container, template, collection){
    var item_list = [];
    var item_rendered = [];
    var template_html = $(template).html();
    var counter = 1;
    Mustache.parse(template_html);   // optional, speeds up future uses
    $.each( collection , function( key, val ) {
        if (val.image_url.indexOf('missing.png') > -1) {
            val.post_image = "//codecloud.cdn.speedyrails.net/sites/59c082786e6f6462ee1d0000/image/png/1507232968000/Group 10.png";
        } else {
            val.post_image = val.image_url;
        }
        
        if(val.body.length > 175){
            val.description_short = val.body.substring(0, 175) + "...";
        } else {
            val.description_short = val.body;
        }
        
        val.description_short = val.description_short.replace("&amp;", "&");
        
        var published_on = moment(val.publish_date).tz(getPropertyTimeZone());
        val.publish_date = published_on.format("MMMM D, YYYY");
        
        var rendered = Mustache.render(template_html,val);
        item_rendered.push(rendered);
        counter = counter + 1;
    });
    $(container).html(item_rendered.join(''));
}

function renderJobs(container, template, collection){
    var mall_name = getPropertyDetails().name;
    var item_list = [];
    var item_rendered = [];
    var template_html = $(template).html();
    Mustache.parse(template_html); 
    $.each( collection , function( key, val ) {
        if(val.jobable_type == "Store"){
            val.store_name = getStoreDetailsByID(val.jobable_id).name;
            val.store_slug = getStoreDetailsByID(val.jobable_id).slug;
        } else {
            val.store_name = mall_name;
        }
        
        var show_date = moment(val.show_on_web_date);
        var start = moment(val.start_date).tz(getPropertyTimeZone());
        var end = moment(val.end_date).tz(getPropertyTimeZone());
        if (start.format("DMY") == end.format("DMY")){
            val.dates = start.format("MMM D")
        } else {
            val.dates = start.format("MMM D") + " - " + end.format("MMM D")
        }
        
        var rendered = Mustache.render(template_html,val);
        item_rendered.push(rendered);
    });
    $(container).html(item_rendered.join(''));
}

function renderJobDetails(container, template, collection){
    var mall_name = getPropertyDetails().name;
    var item_list = [];
    var item_rendered = [];
    var template_html = $(template).html();
    Mustache.parse(template_html); 
    item_list.push(collection);
    $.each( item_list , function( key, val ) {
        if (val.jobable_type == "Store") {
            var store_details = getStoreDetailsByID(val.jobable_id);
            val.store_detail_btn = store_details.slug;
            val.store_name = store_details.name;
            // if (store_details.store_front_url_abs.indexOf('missing.png') > -1){
            //     val.image_url = default_image;
            // } else {
            //     val.image_url = store_details.store_front_url_abs;
            // }
        } else {
            val.store_name = mall_name;
            // val.image_url = default_image;
        }
        
        var show_date = moment(val.show_on_web_date);
        var start = moment(val.start_date).tz(getPropertyTimeZone());
        var end = moment(val.end_date).tz(getPropertyTimeZone());
        if (start.format("DMY") == end.format("DMY")){
            val.dates = start.format("MMM D")
        } else {
            val.dates = start.format("MMM D") + " - " + end.format("MMM D")
        }
        
        var rendered = Mustache.render(template_html,val);
        item_rendered.push(rendered);
    });
    $(container).html(item_rendered.join(''));
}

function renderLogoScroll(container, template, collection){
    var item_list = [];
    var item_rendered = [];
    var template_html = $(template).html();
    Mustache.parse(template_html); 
    $.each( collection , function( key, val ) {
        if(val.store_front_url !== null && !(val.store_front_url.indexOf('missing.png') > -1)){
            val.store_logo = getImageURL(val.store_front_url);
        } else {
            val.store_logo = default_image.image_url;
        }
        var repo_rendered = Mustache.render(template_html,val);
        item_rendered.push(repo_rendered);
    });
    $(container).html(item_rendered.join(''));
}  
            
function renderPromotions(container, template, collection){
    var mall_name = getPropertyDetails().name;
    var item_list = [];
    var item_rendered = [];
    var template_html = $(template).html();
    Mustache.parse(template_html); 
    $.each( collection , function( key, val ) {
        if(val.type === "Event") {
            
            val.store_name = mall_name;
            val.image_url = val.event_image_url_abs;
            val.logo  = default_image.image_url;
            if(val.image_url.indexOf('missing.png') > 0){
                val.image_url  = val.logo;
            }
            
            if (val.name.length > 30){
                val.name_short = val.name.substring(0,30) + "...";
            } else {
                val.name_short = val.name;
            }
            
            var show_date = moment(val.show_on_web_date);
            var start = moment(val.start_date).tz(getPropertyTimeZone());
            var end = moment(val.end_date).tz(getPropertyTimeZone());
            if (start.format("DMY") == end.format("DMY")){
                val.dates = start.format("MMMM D")
            } else {
                val.dates = start.format("MMMM D") + " - " + end.format("MMMM D")
            }
            val.promo_slug = "/events/" + val.slug;
        }
        else {
            if (val.promotionable_type == "Store") {
                var store_details = getStoreDetailsByID(val.promotionable_id);
                val.store_detail_btn = store_details.slug ;
                val.store_name = store_details.name;
                if(val.promo_image_url_abs.indexOf('missing.png') > 0){
                    val.image_url = store_details.store_front_url_abs;
                } else {
                    val.image_url = val.promo_image_url_abs;
                }
            } else {
                val.store_name = mall_name;
                if(val.promo_image_url_abs.indexOf('missing.png') > 0){
                    val.image_url = default_image.image_url;
                } else {
                    val.image_url = val.promo_image_url_abs;
                }
            }
    
            var show_date = moment(val.show_on_web_date);
            var start = moment(val.start_date).tz(getPropertyTimeZone());
            var end = moment(val.end_date).tz(getPropertyTimeZone());
            var today = moment().tz(getPropertyTimeZone());
            if (start.format("DMY") == end.format("DMY")){
                val.dates = start.format("MMMM D")
            } else {
                val.dates = start.format("MMMM D") + " - " + end.format("MMMM D")
            }
            
            if(today.format("DMY") == end.format("DMY")){
                val.days_left = "/ SALE ENDS TODAY!";
                // console.log(val.days_left);
            }
            else if (end.diff(today, 'days',true) < 5) {
                var day_diff = Math.floor(end.diff(today, 'days',true));
                if(day_diff >0 && day_diff<=1){
                    val.days_left = "/ 1 DAY LEFT";
                }
                else {
                    val.days_left = "/ " + day_diff + " DAYS LEFT";
                }
                
                //  console.log(today.format("DMY") , end.format("DMY"), today.format("DMY") == end.format("DMY"))
                // console.log(val.days_left);
            }
            if(val.description.length > 160){
                val.description_short = val.description.substring(0, 164) + "...";
            } else {
                val.description_short = val.description;
            }
            
            if(val.description.length > 40){
                val.short_desc = val.description.substring(0, 39) + "...";
            } else {
                val.short_desc = val.description;
            }
            
            val.promo_slug = "/promotions/" + val.slug;
        }
        var rendered = Mustache.render(template_html,val);
        item_rendered.push(rendered);
    });
    $(container).html(item_rendered.join(''));
}

function renderPromoDetails(container, template, collection){
    var mall_name = getPropertyDetails().name;
    var item_list = [];
    var item_rendered = [];
    var template_html = $(template).html();
    Mustache.parse(template_html); 
    item_list.push(collection);
    $.each( item_list , function( key, val ) {
        if (val.promotionable_type == "Store") {
            var store_details = getStoreDetailsByID(val.promotionable_id);
            val.store_detail_btn = store_details.slug;
            val.store_name = store_details.name;
            if(val.promo_image_url_abs.indexOf('missing.png') > 0){
                val.image_url = store_details.store_front_url_abs;
            } else {
                val.image_url = val.promo_image_url_abs;
            }
        } else {
            val.store_name = mall_name;
            if(val.promo_image_url_abs.indexOf('missing.png') > 0){
                val.image_url = default_image.image_url;
            } else {
                val.image_url = val.promo_image_url_abs;
            }
        }

        var show_date = moment(val.show_on_web_date);
        var start = moment(val.start_date).tz(getPropertyTimeZone());
        var end = moment(val.end_date).tz(getPropertyTimeZone());
        if (start.format("DMY") == end.format("DMY")){
            val.dates = start.format("MMM D")
        } else {
            val.dates = start.format("MMM D") + " - " + end.format("MMM D")
        }
        var rendered = Mustache.render(template_html,val);
        item_rendered.push(rendered);
    });
    $(container).html(item_rendered.join(''));
}

function renderStoreList(container, template, collection, type){
    var item_list = [];
    var item_rendered = [];
    var template_html = $(template).html();
    Mustache.parse(template_html);   // optional, speeds up future uses
    var store_initial="";
    $.each(collection, function(key, val) {
        if(type == "stores" || type == "category_stores"){
            if(!val.store_front_url_abs ||  val.store_front_url_abs.indexOf('missing.png') > -1 || val.store_front_url_abs.length === 0){
                val.store_front_url_abs = default_image.image_url;
            } 
        }
        
        if(val.categories != null){
            val.cat_list = val.categories.join(',')
        }
        
        var current_initial = val.name[0];
        if(isInt(current_initial)){
            current_initial = "#";
        }
        
        if(store_initial.toLowerCase() == current_initial.toLowerCase()){
            val.initial = "";
            val.show = "display:none;";
        } else {
            val.initial = current_initial.toUpperCase();
            store_initial = current_initial;
        }
        
        if(val.is_coming_soon_store == true){
            val.coming_soon_store = "display: block";
        } else {
            val.coming_soon_store = "display:none";
        }
        
        if(val.is_new_store == true){
            val.new_store = "display: block";
        } else {
            val.new_store = "display: none";
        }
        
        if(val.phone != ""){
            val.phone_exist = "display: inline";
        } else {
            val.phone_exist = "visibility: hidden";
        }
        
        if(val.total_published_promos != null){
            val.promotion_exist = "display: inline";
            val.promotion_list = val.total_published_promos;
        } else {
            val.promotion_exist = "display: none";
        }
        
        if (val.total_published_jobs != null){
            val.job_exist = "display: inline";
            val.job_list = val.total_published_jobs;
        } else {
            val.job_exist = "display: none";
        }
        
        val.block = current_initial + '-block';
        var rendered = Mustache.render(template_html,val);
        var upper_current_initial = current_initial.toUpperCase();
        item_rendered.push(rendered);
    });

    $(container).html(item_rendered.join(''));
}

function renderStoreDetails(container, template, collection, slug){
    var item_list = [];
    var item_rendered = [];
    var template_html = $(template).html();
    Mustache.parse(template_html);   // optional, speeds up future uses
    item_list.push(collection);
    $.each( item_list , function( key, val ) {
        if((val.store_front_url_abs).indexOf('missing.png') > -1){
            val.store_logo = default_image.image_url;
        } else {
            val.store_logo = val.store_front_url_abs; 
        }
        
        if(val.categories != null){
            val.store_categories = getCategoriesNamesByStoreSlug(val.slug);
            val.show_category = "display:block";
        }
        else {
            val.show_category = "display:none";
        }
        if(val.store_hours != null){
            var store_hours = getHoursForStoreSlug(val.slug);
        }
        
        if(val.is_coming_soon_store != false){
            val.coming_soon_store = "display: block;"
        } else {
            val.coming_soon_store = "display: none;"
        }

        val.map_x_coordinate = val.x_coordinate - 19;
        val.map_y_coordinate = val.y_coordinate - 58;
        val.property_map = getPropertyDetails().mm_host + getPropertyDetails().map_url;
        
        if (val.website != null && val.website.length > 0){
            val.show_website = "display:block";
        } else {
            val.show_website = "display:none";
        }
        
        if (val.phone != null && val.phone.length > 0){
            val.show_phone = "display:block";
        } else {
            val.show_phone = "display:none";
        }
        
        var rendered = Mustache.render(template_html,val);
        item_rendered.push(rendered);
    });
    $(container).html(item_rendered.join(''));
}

function renderStoreDetailsHours(container, template, collection){
    var item_list = [];
    var item_rendered = [];
    var template_html = $(template).html();
    Mustache.parse(template_html); 
    $.each( collection , function( key, val ) {
        switch(val.day_of_week) {
            case 0:
                val.day = "Sunday";
                break;
            case 1:
                val.day = "Monday";
                break;
            case 2:
                val.day = "Tuesday";
                break;
            case 3:
                val.day = "Wednesday";
                break;
            case 4:
                val.day = "Thursday";
                break;
            case 5:
                val.day = "Friday";
                break;
            case 6:
                val.day = "Saturday";
                break;
        }
        var open_time = moment(val.open_time).tz(getPropertyTimeZone());
        var close_time = moment(val.close_time).tz(getPropertyTimeZone());
        
        if(val.is_closed == null || val.is_closed == false && val.open_full_day == false){
            val.hour_string = open_time.format("h:mmA") + " - " + close_time.format("h:mmA");
        }       
        if(val.is_closed == true){
            val.hour_string = "Closed";
        } 
        if(val.open_full_day == true){
            val.hour_string = "Open 24 hours";
        }     

        var rendered = Mustache.render(template_html,val);
        item_rendered.push(rendered);
    });
    $(container).html(item_rendered.join(''));
}
function renderLeasingList(container, template, collection, type){
    var item_list = [];
    var item_rendered = [];
    var template_html = $(template).html();
    Mustache.parse(template_html);   // optional, speeds up future uses
    var store_initial="";
    $.each(collection, function(key, val) {
        if(type == "stores" || type == "category_stores"){
            if(!val.store_front_url_abs ||  val.store_front_url_abs.indexOf('missing.png') > -1 || val.store_front_url_abs.length === 0){
                val.store_front_url_abs = default_image.image_url;
            } 
        }
        
        if(val.categories != null){
            val.cat_list = val.categories.join(',')
        }
        
        var current_initial = val.name[0];
        if(isInt(current_initial)){
            current_initial = "#";
        }
        
        if(store_initial.toLowerCase() == current_initial.toLowerCase()){
            val.initial = "";
            val.show = "display:none;";
        } else {
            val.initial = current_initial.toUpperCase();
            store_initial = current_initial;
        }
        
        if(val.is_coming_soon_store == true){
            val.coming_soon_store = "display: block";
        } else {
            val.coming_soon_store = "display:none";
        }
        
        if(val.is_new_store == true){
            val.new_store = "display: block";
        } else {
            val.new_store = "display: none";
        }
        
        if(val.phone != ""){
            val.phone_exist = "display: inline";
        } else {
            val.phone_exist = "visibility: hidden";
        }
        
        if(val.total_published_promos != null){
            val.promotion_exist = "display: inline";
            val.promotion_list = val.total_published_promos;
        } else {
            val.promotion_exist = "display: none";
        }
        
        if (val.total_published_jobs != null){
            val.job_exist = "display: inline";
            val.job_list = val.total_published_jobs;
        } else {
            val.job_exist = "display: none";
        }
        
        val.block = current_initial + '-block';
        var rendered = Mustache.render(template_html,val);
        var upper_current_initial = current_initial.toUpperCase();
        item_rendered.push(rendered);
    });

    $(container).html(item_rendered.join(''));
}
