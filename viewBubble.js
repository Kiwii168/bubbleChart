let data=[];
let config={};

let years=[];
let current=0;

let timer=null;

let selected=null;


let colors={};


const chart =
echarts.init(
document.getElementById("chart")
);





function num(v){

return Number(
String(v)
.replace(/,/g,"")
.trim()
)||0;

}






function getColor(name){

if(!colors[name]){

colors[name]=
"#"+
Math.floor(
Math.random()*16777215
)
.toString(16);

}

return colors[name];

}








Promise.all([

fetch(DATA_FILE)
.then(r=>r.json()),


fetch(CONFIG_FILE)
.then(r=>r.json())


])

.then(r=>{


data=r[0];

config=r[1];


init();


});









function init(){



years=[

...new Set(

data.map(

d=>

num(
d[config.year]
)

)

)

]

.sort(
(a,b)=>a-b
);



timeline.max=
years.length-1;


createTimeline();


draw();



}









function createTimeline(){


let box =
document.getElementById("years");


box.innerHTML="";



years.forEach((y,i)=>{


let span =
document.createElement("span");


span.textContent=y;



span.onclick=function(){


current=i;

timeline.value=i;


draw();


};



box.appendChild(span);



});


}










function draw(){



let currentYear =
years[current];



let rows =
data.filter(d=>

num(
d[config.year]
)

===

currentYear

);







let bubbles =
rows.map(d=>{


return {


name:d[config.entity],


value:[

num(d[config.x]),

num(d[config.y]),

num(d[config.size])

],



xValue:num(d[config.x]),

yValue:num(d[config.y]),

sizeValue:num(d[config.size]),



raw:d,



itemStyle:{


color:getColor(
d[config.entity]
),



opacity:


selected===null

?

0.85


:

selected===d[config.entity]

?

1

:

0.15



}


};



});









let point =
bubbles.find(
b=>b.name===selected
);






let trail=[];



if(selected){


trail=

data

.filter(d=>

d[config.entity]===selected

&&

num(d[config.year])

<=

currentYear

)


.sort(

(a,b)=>

num(a[config.year])

-

num(b[config.year])

)


.map(d=>[

num(d[config.x]),

num(d[config.y])

]);


}









chart.setOption({


animation:true,


animationDuration:2500,


animationDurationUpdate:2500,


animationEasing:"cubicInOut",


animationEasingUpdate:"cubicInOut",





title:{


text:String(currentYear),


left:"center",


textStyle:{


fontSize:70,


color:"#ddd"


}


},





tooltip:{


formatter:function(p){



let d=p.data;



return `

<b>${d.name}</b><br>

Año: ${currentYear}<br>

${config.x}: ${d.xValue}<br>

${config.y}: ${d.yValue}<br>

${config.size}: ${d.sizeValue}

`;

}


},





xAxis:{


type:"log",


name:config.x,


nameLocation:"middle",


nameGap:35,


splitLine:{show:true}


},





yAxis:{


type:"value",


name:config.y,


nameLocation:"middle",


nameGap:45,


splitLine:{show:true}


},







series:[



{


type:"line",

data:trail,


showSymbol:false,


lineStyle:{


color:selected?

getColor(selected):

"transparent",


width:3


},


z:1


},





{


type:"scatter",

data:bubbles,


z:2,


symbolSize:function(v){

return Math.sqrt(v[2])*5;

},



emphasis:{

scale:true

},




markLine:point?



{


symbol:"none",


lineStyle:{


type:"dashed",


color:"#555",


width:2


},



label:{


show:true,


fontSize:16,


fontWeight:"bold",


backgroundColor:"#fff",


padding:6


},



data:[



{


xAxis:point.xValue,


label:{


formatter:

`${config.x}: ${point.xValue}`


}


},




{


yAxis:point.yValue,


label:{


formatter:

`${config.y}: ${point.yValue}`


}


}



]



}



:

null




}



]




});



events();



}









function events(){



chart.off("click");



chart.on(
"click",
function(params){


if(params.seriesType!=="scatter")
return;



if(selected===params.data.name){


selected=null;


document.getElementById("info").innerHTML=
"Selecciona una burbuja";


draw();


return;

}



selected=params.data.name;



showInfo(params.data);



draw();



});







chart.getZr().off("click");



chart.getZr().on(
"click",
function(e){


if(!e.target){


selected=null;


document.getElementById("info").innerHTML=
"Selecciona una burbuja";


draw();


}


});



}









function showInfo(d){



document.getElementById("info").innerHTML=

`

<h5>${d.name}</h5>

<hr>

<b>Año:</b> ${years[current]}<br>

<b>${config.x}:</b> ${d.xValue}<br>

<b>${config.y}:</b> ${d.yValue}<br>

<b>${config.size}:</b> ${d.sizeValue}

`;



}









timeline.oninput=function(){


current=
Number(
this.value
);


draw();


};









play.onclick=function(){



if(timer)
return;



timer=setInterval(()=>{


current++;



if(current>=years.length){


current=years.length-1;


timeline.value=current;


draw();


clearInterval(timer);


timer=null;


return;


}



timeline.value=current;


draw();



},3000);



};









pause.onclick=function(){


clearInterval(timer);


timer=null;


};









window.onresize=function(){

chart.resize();

};