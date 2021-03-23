////////////////
/////most used components
////////////////

const majorComp = {
    article : document.querySelector("body div.article") ,
    article_container : document.querySelector("body div.article_container"),
    text_search : document.querySelector("body input[id='searchQueryInput']"),
    text_search_button : document.getElementById("searchQuerySubmit"),
    side_menu : document.querySelector("body div[class='article_container'] div[class='side_menu']"),
};

/////////////////
///////article parser
////////////////

chrome.storage.local.get(['key'], function(result) {
    var content = result.key.content ;
    var title = result.key.title ;
    document.querySelector("div.article").innerHTML = content;
    console.log("got "+title+" the content");
  });

// majorComp.article.innerHTML = title ;

/////////////////
//////Text search
//////////////////

majorComp.text_search_button.addEventListener("click",function(){
    // var article_text = majorComp.article.innerHTML; 
    const search_query = majorComp.text_search.value;
    const search_array = search_query.split(' ');
    for (let word of search_array){
        search_word = `(>.*)(${word})(.*<)`;
        search_text = new RegExp(search_word,"ig") ;
        // console.log(majorComp.article.matches(search_text));
        majorComp.article.innerHTML = majorComp.article.innerHTML.replace(search_text,`$1<span class="highlight">$2</span>$3`);
    }
    // majorComp.article.innerHTML = article_text ;
},false);

////////////////////
//////preference control
////////////////////

const PrefCtrl = {

    themes : ["nine_anime_dark"  , "discord_dark" ,  "firefox_dark" ,  "youtube_light" , "google_light"],
    font_family : ["Courier","Courier New","Verdana","Open Sans","Avant Garde","Times" , "Brush Script MT" , "Ubuntu" , "Roboto"],
    font_color : ["red","blue","yellow" , "grey" , "white" , "black"],
    background_color : {
        "wheat-like" : "#eadcba",
        "lightgrey" : "lightgrey" ,
        "pink-like" : "rgb(247, 220, 217)",
        "purple-like" : "rgb(197, 176, 206)",
        "dark-sky-blue" : "rgb(132, 163, 172)" ,
        "light-sky-blue" : "rgb(193, 226, 236)" ,
        "light-brown" : "rgb(231, 236, 193)" ,
        "dark-red" : "rgb(68, 43, 43)" ,
        "Mette" : "rgb(49, 23, 23)" ,
        "dark-blue" : "rgb(50, 44, 70)" ,
        "black+blue" : "rgb(0, 34, 45)" ,
        "sheddy-blue" : "rgb(38, 57, 94)" ,
        "light-dark-black" : "rgb(67, 72, 83)",
        "dark-dark-black" : "rgb(42, 45, 51)" ,
    },
    pref_menu_showed : false ,
    dark : "discord_dark",
    light : "google_light",

    article : majorComp.article ,
    article_container : majorComp.article_container ,
    theme_selector : document.getElementById("theme_selector"),
    font_family_selector : document.getElementById("font_selector"),
    font_color_selector : document.getElementById("font_color_selector"),
    bg_color_selector : document.getElementById("background_selector"), 

    // showing item
    show_everything(){
        PrefCtrl.show_themes();
        PrefCtrl.show_fonts_family();
        PrefCtrl.show_font_color();
        PrefCtrl.show_background_color();
        PrefCtrl.pref_menu_showed = true ;
    },

    show_themes() {
        const themes = PrefCtrl.themes.sort();
        for(let curr_theme of themes){
            var new_option = document.createElement("option");
            new_option.innerHTML = curr_theme ;
            PrefCtrl.theme_selector.appendChild(new_option);
        }
    },
    
    show_fonts_family(){
        const fonts = PrefCtrl.font_family.sort();
        for(let curr_font of fonts){
            var new_option = document.createElement("option");
            new_option.innerHTML = curr_font ;
            PrefCtrl.font_family_selector.appendChild(new_option);
        }
    },
    
    show_font_color(){
        const font_colors = PrefCtrl.font_color.sort();;
        for(let curr_font of font_colors){
            var new_option = document.createElement("option");
            new_option.innerHTML = curr_font ;
            PrefCtrl.font_color_selector.appendChild(new_option);
        }
    },

    show_background_color(){
        for(let curr_bg_color in PrefCtrl.background_color){
            var new_option = document.createElement("option");
            new_option.innerHTML = curr_bg_color ;
            PrefCtrl.bg_color_selector.appendChild(new_option);
        }
    },

    // selecting item 
    theme_select(){
        const selectedValue = PrefCtrl.theme_selector.options[PrefCtrl.theme_selector.selectedIndex].value;
        document.documentElement.setAttribute('data-theme', selectedValue);
    },

    font_family_select(){
        const selectedValue = PrefCtrl.font_family_selector.options[PrefCtrl.font_family_selector.selectedIndex].value;
        PrefCtrl.article.style.fontFamily=selectedValue;
    },

    font_color_select(){
        const selectedValue = PrefCtrl.font_color_selector.options[PrefCtrl.font_color_selector.selectedIndex].value;
        PrefCtrl.article.style.color=selectedValue; 
    },

    bg_color_select(){
        const selectedValue = PrefCtrl.bg_color_selector.options[PrefCtrl.bg_color_selector.selectedIndex].value;
        PrefCtrl.article_container.style.backgroundColor=PrefCtrl.background_color[selectedValue];
    }
};

PrefCtrl.theme_selector.addEventListener("change",PrefCtrl.theme_select,false);
PrefCtrl.font_family_selector.addEventListener("change",PrefCtrl.font_family_select,false);
PrefCtrl.font_color_selector.addEventListener("change",PrefCtrl.font_color_select,false);
PrefCtrl.bg_color_selector.addEventListener("change",PrefCtrl.bg_color_select,false);


const SwitchTheme = {
    toggleSwitch : document.querySelector('.switch input[type="checkbox"]'),
    switch(e){
        if (e.target.checked) {
            document.documentElement.setAttribute('data-theme', PrefCtrl.dark);
        }
        else {
            document.documentElement.setAttribute('data-theme', PrefCtrl.light);
        }   
    },
};

SwitchTheme.toggleSwitch.addEventListener('change', SwitchTheme.switch, false);

///////////////////
/////Find head tags for side bar
//////////////////

function findheader(){

var headers = ['h1','h2','h3','h4'];
var u = document.querySelector("body div[class='article_container'] div[class='side_menu']");
const list_item = document.createElement("ul");
list_item.id ="header_list";
for (var curr of headers){
    var header = document.getElementsByTagName(curr);

  for(var child = 0 ; child < header.length ; child++){
      const create_list = document.createElement("li");
      create_list.style.listStyle="none";
      var create_link = document.createElement("a");
      create_link.href = "#"+header[child].innerText;
      create_link.className = "side_menu_element" ;
      create_link.innerHTML=header[child].innerText;
      create_list.appendChild(create_link);
      list_item.appendChild(create_list);


      var range = document.createRange();
      var newparent = document.createElement('a');
      newparent.id = header[child].innerText;
      range.selectNode(header[child]);
      range.surroundContents(newparent);
  }
}
    u.appendChild(list_item);

}

findheader();

//////////////////////
//////Show google search logo
/////////////////////

function showgoogle(event){
    let google = document.querySelector("body div.article_container div.google-wrapper");

    let isvisible = ( google.style.visibility == "visible") ;
    if(isvisible){
        google.setAttribute("style",`visibility: hidden;`);
    }
    else{
        var x = event.clientX ;
        var y = event.clientY ;
        let link = document.querySelector("body div.article_container div.google-wrapper a[id='google_link']");
        link.href = "http://www.google.com/search?q="+google_search();
        google.setAttribute("style",`left:${x}px;top:${y}px;visibility: visible;`);
    }
}

majorComp.article.addEventListener("click",showgoogle,false);


function highlight(){
    var selection = window.getSelection();
    var range = selection.getRangeAt(0);
    var newNode = document.createElement("span");
    newNode.setAttribute("style", "background-color:yellow");
    range.surroundContents(newNode);
}

function google_search(){
    var query = window.getSelection().toString();
    // window.open("http://www.google.com/search?q="+query);
    return query;
}

/////////////////////////////
///// Open / close side bar event
////////////////////////////


document.querySelector("div[id='open_head_content']").addEventListener("click",function(){
    const a = majorComp.side_menu ;
    const c = majorComp.article ; 
    a.setAttribute("style","transform:none;box-shadow: 0px 0px 7px black;");
    c.style.filter = "blur(2px)";
},false);

document.querySelector("div[id='close_head_content']").addEventListener("click",function(){
    const a = majorComp.side_menu ;
    const c = majorComp.article ;
    a.setAttribute("style","transform:translateX(-100%);box-shadow: 0px 0px 0px black;");
    c.style.filter = "none";
},false);


//////////////////
//////Open/close prefmenu
//////////////////

const prefunderctrl = {
    prefmenustatus: 0,

    openpreference : function(){
        if(!PrefCtrl.pref_menu_showed)
            PrefCtrl.show_everything();
        const pref_menu = document.querySelector("body div.article_container div.preference-container");
        pref_menu.setAttribute("style","bottom:0px");
        prefunderctrl.prefmenustatus = 1 ;
    },
    closepreference : function(){
        const pref_menu = document.querySelector("body div.article_container div.preference-container");
        pref_menu.setAttribute("style","bottom:-55px");
        prefunderctrl.prefmenustatus = 0 ;
    },
    ctrl : function(){
        if(prefunderctrl.prefmenustatus === 0)
            prefunderctrl.openpreference();
        else prefunderctrl.closepreference();    
    }

}

document.querySelector("div[id='pref_menu']").addEventListener("click",prefunderctrl.ctrl,false);

/////////////////
/////open/close Setting menu 
////////////////

const settingsunderctrl = {

    settingsmenustatus : 0,

    opensettings : function(){
        const smenu = document.querySelector("body div.flex_box_container div.article_container div.controlcontainer");
        smenu.setAttribute("style","right:5px;");
        settingsunderctrl.settingsmenustatus = 1 ;
    },
    closesettings : function(){
        const smenu = document.querySelector("body div.flex_box_container div.article_container div.controlcontainer");
        smenu.setAttribute("style","right:-275px;");
        settingsunderctrl.settingsmenustatus = 0 ;

    },
    ctrl : function(){
        if(settingsunderctrl.settingsmenustatus === 0)
            settingsunderctrl.opensettings();
        else settingsunderctrl.closesettings();    
    }
};

document.querySelector("div[id='settings_menu']").addEventListener("click",settingsunderctrl.ctrl,false);


window.onscroll = function(e) {
    // print "false" if direction is down and "true" if up
    if(this.oldScroll > this.scrollY)
        document.querySelector("body div[class='flex_box_container'] div[class='flex_box']").setAttribute("style","top:0px;");
    else document.querySelector("body div[class='flex_box_container'] div[class='flex_box']").setAttribute("style","top:-61px;");   
    this.oldScroll = this.scrollY;
  }

const CtrlMenu = {
    line_height : document.querySelector("body div.article_container div.controlcontainer input[id='controllineheight']"),
    content_width : document.querySelector("body div.article_container div.controlcontainer input[id='controlwidth']"),
    letter_space : document.querySelector("body div.article_container div.controlcontainer input[id='controlletterspace']"),
    font_size : document.querySelector("body div.article_container div.controlcontainer input[id='controlfontsize']"),
    article : document.querySelector("body div.article_container div.article"),

    line_height_control(){
        const inputvalue = CtrlMenu.line_height.value ;
        document.querySelector("body div.article_container div.controlcontainer p[id='controllineheightvalue']").innerText = `Line-Height : ${inputvalue}` ;
        CtrlMenu.article.style.lineHeight = `${inputvalue}` ;
    },

    content_width_control(){
        const inputvalue = CtrlMenu.content_width.value ;
        document.querySelector("body div.article_container div.controlcontainer p[id='controlwidthvalue']").innerText = `Content-Width : ${inputvalue}%` ;
        CtrlMenu.article.style.marginLeft = `${inputvalue}%` ;
        CtrlMenu.article.style.marginRight = `${inputvalue}%` ;
    },

    letter_space_control(){
        const inputvalue = CtrlMenu.letter_space.value ;
        document.querySelector("body div.article_container div.controlcontainer p[id='controlletterspacevalue']").innerText = `Letter-Space: ${inputvalue}px` ;
        CtrlMenu.article.style.letterSpacing = `${inputvalue}px` ;
    },

    font_size_control(){
        const inputvalue = CtrlMenu.font_size.value ;
        document.querySelector("body div.article_container div.controlcontainer p[id='controlfontsizevalue']").innerText = `Font-Size: ${inputvalue}px` ;
        CtrlMenu.article.style.fontSize = `${inputvalue}px` ;
    }
};

CtrlMenu.content_width.addEventListener("input",CtrlMenu.content_width_control,false);
CtrlMenu.line_height.addEventListener("input",CtrlMenu.line_height_control,false);
CtrlMenu.letter_space.addEventListener("input",CtrlMenu.letter_space_control,false);
CtrlMenu.font_size.addEventListener("input",CtrlMenu.font_size_control,false);

const content_search = function(){
    var input , ul , li , txt ;
    input = document.getElementById("txt_head_search").value.toUpperCase();
    ul = document.getElementById("header_list");
    li = ul.getElementsByTagName("li")
    for(let curr_list = 0 ; curr_list < li.length ; curr_list++){
        txt = li[curr_list].innerText.toUpperCase();
        txt.replace(' ','');
        if (txt.indexOf(input) > -1){
            li[curr_list].style.display ="";
        }
        else{
            li[curr_list].style.display = "none";
        }
    }
}

document.getElementById("txt_head_search").addEventListener("keyup",content_search,false)