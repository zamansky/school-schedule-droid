
/* Temporary schedule data (from Stuyvesant) 
 * 
 * Until the user can download their own
 *   
*/
var temprawdata="default,regular\nschedules,regular,homeroom,special,conference\nregular,labels,Before,1,2,3,4,5,6,7,8,9,10,After\nregular,start,0:00:00,8:00:00,8:45:00,9:30:00,10:19:00,11:04:00,11:49:00,12:34:00,13:19:00,14:04:00,14:49:00,15:30:00\nregular,stop,8:00:00,8:40:00,9:26:00,10:15:00,11:00:00,11:45:00,12:30:00,13:15:00,14:00:00,14:45:00,15:30:00,23:59:00\nhomeroom,labels,Before,1,2,3,hr,4,5,6,7,8,9,10,After\nhomeroom,start,0:00:00,8:00:00,8:44:00,9:28:00,10:12:00,10:26:00,11:10:00,11:54:00,12:38:00,13:22:00,14:06:00,14:50:00,15:30:00\nhomeroom,stop,8:00:00,8:40:00,9:24:00,10:08:00,10:22:00,11:06:00,11:50:00,12:34:00,13:18:00,14:02:00,14:46:00,15:30:00,23:59:00\n\nconference,labels,Before,1,2,3,4,5,6,7,8,9,10,Meeting,After\nconference,start,0:00:00,8:00:00,8:41:00,9:22:00,10:03:00,10:44:00,11:25:00,12:06:00,12:47:00,13:28:00,14:09:00,14:50:00,15:30:00\nconference,stop,8:00:00,8:37:00,9:18:00,9:59:00,10:40:00,11:21:00,12:02:00,12:43:00,13:24:00,14:05:00,14:46:00,15:30:00,23:59:00\n\nspecial,labels,Before,1,2,3,4,5,6,7,8,9,10,After\nspecial,start,0:00:00,8:30:00,8:42:00,9:24:00,10:08:00,10:50:00,11:32:00,12:14:00,12:56:00,13:38:00,14:20:00,14:59:00\nspecial,stop,8:00:00,8:38:00,9:20:00,10:04:00,10:46:00,11:28:00,12:10:00,12:52:00,13:34:00,14:16:00,14:58:00,23:59:00\n";

/*--------------------------------------------------*/


/*
 * Override toLocalTimeString in javascript Date class
 * to display am/pm time instead of 24hour
 */
Date.prototype.toLocaleTimeString=function(){
    var hours=this.getHours();
    var minutes =this.getMinutes();
    var seconds = this.getSeconds();
    var suffix = "am";
    if (hours > 12){
	hours = hours - 12;
	suffix = "pm";
    }
    if (hours==12)
	suffix="pm";
    var h,m,s;
    h=""+hours;
    if (hours<10)
	h="0"+hours;
    m=""+minutes;
    if (minutes < 10)
	m="0"+minutes;
    s=""+seconds;
    if (seconds<10)
	s="0"+seconds;
    var retval = ""+h+":"+m+":"+s+suffix;    
    return retval;
}


/*----------------------------------------------------------------------*/
/*
 * Schedule
 * 
 * Prototype for a schedule -- name is a string representing the
 * schedule name, data is the rawdata csv pulled originally from the
 * web page and stored later in localStorage
 */
function Schedule(name,data) {
    var hr,min,sec,tmp;
    var a2,d;
    this.name = name;
    this.labels = new Array();
    this.start = new Array();
    this.stop = new Array();
    var d_array = data.split('\n');
    for (l in  d_array) {
	var a = d_array[l].split(',');
	if (a[0] == name && a[1] == "labels") {
	    // process the labels
	    a2 = a.slice(2);
	    for (item in a2) {
		this.labels.push(a2[item]);
	    }
	}
	if (a[0] == name && a[1] == "start") {
	    // process the starts
	    a2 = a.slice(2); 
	    for (item in a2) {
		tmp =  a2[item].split(':');
		hr = tmp[0]; min = tmp[1];
		d = new Date();
		d.setHours(hr);
		d.setMinutes(min);
		d.setSeconds(0);
		this.start.push(d);
	    }
	}
	if (a[0] == name && a[1] == "stop") {
	    // process the stops
	    a2 = a.slice(2); 
	    for (item in a2) {
		tmp =  a2[item].split(':');
		hr = tmp[0]; min = tmp[1];
		d = new Date();
		d.setHours(hr);
		d.setMinutes(min);
		d.setSeconds(0);
		this.stop.push(d);
	    }
	}
    }
}
/*----------------------------------------------------------------------*/
/*
 * Global variables  
 */


var rawdata;
var sched;
var schedules = new Array(); // holds the names of the schedules
var currentsched; // string name of current sched


/*----------------------------------------------------------------------*/
/*
 * sets the above global variables and store in localStorage
 */
function storeGlobals(data) {
    rawdata = data;
    var a = rawdata.split('\n');
    for (l in a) {
	var line = a[l].split(',');
	if (  line[0] == "default") {
	    currentsched=line[1];
	}

	if (line[0] == "schedules") {
	    var schednames = line.slice(1);
	    for (l in schednames) {
		schedules.push(schednames[l]);
	    }
	}
    }
    localStorage['rawdata'] = rawdata;
    localStorage['currentsched']=currentsched;
    localStorage['schedules']=JSON.stringify(schedules);
}

/*--------------------------------------------------*/
/*
 * Called when you select a different schedule from the "choose" page 
 */
function switchschedules(name) {
    var n = name.target.innerHTML
    sched = new Schedule(n,rawdata);
    currentsched = n;
    localStorage['currentsched'] = currentsched;
    jQT.goBack();
}

/*--------------------------------------------------*/
/*
 * 
 * Pull schedules from localstorage, rebuild schedule selection buttons 
 */
function setVariables() {
    rawdata=localStorage['rawdata'];
    currentsched=localStorage['currentsched'];
    schedules=JSON.parse(localStorage['schedules']);
    sched = new Schedule(currentsched,rawdata);	

    // remove any old buttons
    $("#choices").empty();
    $("#choicelist").remove();
    
    // add the buttons 
    var u = $("<ul id=\"choicelist\" class=\"rounded\"></ul>");
    for (s in schedules) {
	var i =	$("<li class=\"choice\">"+schedules[s]+"</li>");
	i.click(switchschedules);
	u.append(i);
    }
    $("#choices").append(u);


}

/*--------------------------------------------------*/
/*
 *  Callback for  when we click to fetch data from a website
 */
loadFeedCallback = function(data) {
   schedules=new Array(); 
    storeGlobals(data);
    setVariables();
    alert("Data saved");
}

/*--------------------------------------------------*/
/*
 * Sets up the above callback
 */
loadFeed = function() {
    var f = $("#url").val();
    $.get(f,loadFeedCallback);
}

/*--------------------------------------------------*/
/*
 * 
 */
function mainfunc() {

    // Set up swipe event between main page and full schedule
    $(function(){
          // Show a swipe event on swipe test
          $('#main').swipe(function(evt, data) {
			       if (data.direction=="left")
				   jQT.goTo("#fullsched","slideleft");
			       else if (data.direction=="right")
			       jQT.goTo("#fullsched","slideright");
			   });
	  
	  
          $('#fullsched').swipe(function(evt, data) {
				    //jQT.goTo("#main");
				    jQT.goBack("#main");
				});
});
    
    // Set up config form callback
    $("#config form").submit(loadFeed);


    // If no schedule then go to config page
    rawdata = localStorage['rawdata'];
    if (!rawdata) {
	alert("Data Source Not Configured");
	rawdata = temprawdata;
	storeGlobals(rawdata)
	setVariables();
	setInterval(updateDisplay,1000);

    }
    else
    {
	/* In theory we have the data now in localStorage*/
	// load globals from localstorage
	setVariables();
	// parse the current schedule and make the page
	setInterval(updateDisplay,1000);
	
    }
    
    /* We don't have data so do nothing */

}

/*--------------------------------------------------*/
/*
 * Update the class period and the time in / left we're in on the screen
 * 
 */
function updatePeriod() {
    var d = new Date();
    var newtime = d.toLocaleTimeString();
    var len=sched.labels.length;
    var i;
    var isinperiod = true;

    /* determine if we're in a period or between */
    for (i=0;i<len;i++) {
	if ( d>=sched.start[i] && d<=sched.stop[i]) {
	    pd = i;
	    isinperiod = true;
	    break;
	}
	if (d>=sched.stop[len-1] || 
	    (d>=sched.stop[i] && d<=sched.start[(i+1)%len])){
	    pd = i;
	    isinperiod = false;
	    break;
	}
    }

    // Now calc how many minutes left and update the html;
    var l;
    if (isinperiod) {
	var current=d.getTime();
	var start = sched.start[i].getTime();
	var stop = sched.stop[i].getTime();
	var into=(current-start) / 1000 / 60 ;
	var left=(stop-current) / 1000 / 60 + 1 ; 
	$("#into").html(parseInt(into));
	$("#left").html(parseInt(left));
	$("#into").addClass("inperiod");
	$("#left").addClass("betweenperiod");
	$("period").html(sched.labels[i]);
	l = sched.labels[i];
	$("#periodlabel").html(l);
    }
    if (!isinperiod) {
	var current=d.getTime();
	var start = sched.stop[i].getTime();
	var stop = sched.start[(i+1)%len].getTime();
	var into=(current-start) / 1000 / 60 ;
	var left=(stop-current) / 1000 / 60 + 1 ; 
	$("#into").html(parseInt(into));
	$("#left").html(parseInt(left));
	$("#into").addClass("betweenperiod");
	$("#left").addClass("inperiod");
	l = "Before pd "+sched.labels[(i+1)%len];
	$("#periodlabel").html(l);
	}
    
    // always update the schedname and time 
    $("#schedname").html(sched.name);
    $("#time").html(newtime);    

}

/*--------------------------------------------------*/
/*
 * Update the full schedule page
 */
function updateSchedule() {
        var i;
    var s="";
    var tr;
    var t = $("<table class=medium border=1></table>");
//    t.append("<tr><th class=medim colspan=3>"+sched.name+"</th></tr>");
    t.append("<tr><th>Period</th><th>Start</th><th>End</th></tr");

    for (i=0;i<sched.labels.length;i++){
	tr="<tr id="+sched.labels[i]+">";
	tr = tr + "<td>"+sched.labels[i]+"</td>";
	tr = tr + "<td>"+sched.start[i].toLocaleTimeString()+"</td><td>"+
	    sched.stop[i].toLocaleTimeString()+"</td>";
	tr = tr + "</tr>";	
	t.append(tr);
    } 
    tr = $("<tr><th colspan=3 id=\"schedtime\">time</th></tr>");
    t.append(tr);
    $("#fullschedname").html(sched.name);
    $("#fullscheddata").html(t);
    var d = new Date();
    var ts = d.toLocaleTimeString();
    $("#schedtime").html(ts);

    /* set the colors via css */
    var len = sched.labels.length;
    for (i=0;i<len;i++){
	// see if we're in a period - if so add the css clas
	if ( d>=sched.start[i] && d<=sched.stop[i]) {
	    $("#"+sched.labels[i]).addClass("inperiod");
	}
	// see if we're between periods - add classes to current and next
	if (d>=sched.stop[i] && d<=sched.start[(i+1)%len])
	{
	    $("#"+sched.labels[i]).addClass("betweenperiod");
	    $("#"+sched.labels[(i+1)%len]).addClass("betweenperiod");
	}
    }



}


/*--------------------------------------------------*/
/*
 * Calls both update routines
 */
function updateDisplay() {
    /* remove the old color coding */
    $(".inperiod").removeClass("inperiod");
    $(".inperiod").removeClass("betweenperiod");
    $(".betweenperiod").removeClass("inperiod");
    $(".betweenperiod").removeClass("betweenperiod");

    updatePeriod();
    updateSchedule();

}