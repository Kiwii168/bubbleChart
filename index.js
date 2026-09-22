let data = [];
let years = [];

let current = 0;
let timer = null;

let selected = null;
let selectedData = null;

let colors = {};

const chart = echarts.init(
    document.getElementById("chart")
);



function num(v){

    return Number(
        String(v)
        .replace(/,/g,"")
        .trim()
    ) || 0;

}



function getColor(name){

    if(!colors[name]){

        colors[name] =
        "#" +
        Math.floor(
            Math.random()*16777215
        )
        .toString(16);

    }

    return colors[name];

}






file.onchange=function(e){


    let reader = new FileReader();



    reader.onload=function(evt){


        let wb =
        XLSX.read(
            evt.target.result,
            {
                type:"binary"
            }
        );



        let sheet =
        wb.Sheets[
            wb.SheetNames[0]
        ];



        data =
        XLSX.utils.sheet_to_json(
            sheet,
            {
                defval:""
            }
        );



        if(!data.length)
            return;




        let columns =
        Object.keys(
            data[0]
        );





        [
            "entity",
            "year",
            "x",
            "y",
            "size",
            "color"

        ]
        .forEach(id=>{


            let select =
            document.getElementById(id);



            select.innerHTML="";



            columns.forEach(col=>{


                let option =
                document.createElement("option");



                option.value = col;

                option.text = col;



                select.appendChild(option);


            });


        });



        console.log(
            "Excel cargado",
            data
        );



    };



    reader.readAsBinaryString(
        e.target.files[0]
    );


};









generate.onclick=function(){


    let yearField =
    year.value;



    years = [

        ...new Set(

            data.map(

                d =>

                num(
                    d[yearField]
                )

            )

        )

    ]

    .filter(
        x=>x!==0
    )

    .sort(
        (a,b)=>a-b
    );



    current=0;



    timeline.max =
    years.length-1;



    timeline.value=0;



    createTimeline();

    createEntities();

    draw();



};









function createTimeline(){


    let box =
    document.getElementById(
        "years"
    );


    box.innerHTML="";



    years.forEach((y,i)=>{


        let span =
        document.createElement(
            "span"
        );



        span.textContent=y;



        span.onclick=function(){


            current=i;


            timeline.value=i;


            draw();


        };



        box.appendChild(span);


    });



}










function createEntities(){


    let box =
    document.getElementById(
        "entities"
    );



    box.innerHTML="";



    let field =
    entity.value;



    let entities = [

        ...new Set(

            data.map(
                d=>d[field]
            )

        )

    ];




    entities.forEach(e=>{


        let div =
        document.createElement(
            "div"
        );



        div.className =
        "entity-item";



        div.dataset.name=e;




        let check =
        document.createElement(
            "input"
        );


        check.type="checkbox";

        check.checked=true;



        check.onclick=function(ev){

            ev.stopPropagation();

            draw();

        };




        div.appendChild(check);



        div.append(
            e
        );





        div.onclick=function(){


            selected=e;



            let row =
            data.find(

                d =>

                d[field]===e

                &&

                num(
                    d[year.value]
                )===years[current]

            );



            selectedData=row;



            draw();


        };



        box.appendChild(div);



    });



}

function draw(){


if(!data.length)
return;



let entityField=entity.value;

let yearField=year.value;

let xField=x.value;

let yField=y.value;

let sizeField=size.value;

let colorField=color.value;



let currentYear=years[current];




let visible=[];



document
.querySelectorAll("#entities input")
.forEach(c=>{


if(c.checked){

visible.push(
c.parentElement.dataset.name
);

}


});





let rows=data.filter(d=>


num(d[yearField])===currentYear

&&

visible.includes(
d[entityField]
)


);





let scatterData=rows.map(d=>{


return {


name:d[entityField],


value:[

num(d[xField]),

num(d[yField]),

num(d[sizeField])

],


xValue:num(d[xField]),

yValue:num(d[yField]),

sizeValue:num(d[sizeField]),


raw:d,


itemStyle:{


color:getColor(
d[entityField]
),


opacity:

selected===null

?

0.8


:

selected===d[entityField]

?

1

:

0.15


}


};


});





let pointSelected =
scatterData.find(
d=>d.name===selected
);





// trayectoria progresiva

let trail=[];


if(selected){


trail=data

.filter(d=>


d[entityField]===selected

&&

num(d[yearField])<=currentYear

)


.sort(

(a,b)=>

num(a[yearField])

-

num(b[yearField])

)


.map(d=>[

num(d[xField]),

num(d[yField])

]);


}






chart.setOption({


animation:true,


animationDuration:1500,

animationDurationUpdate:1500,

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

${xField}: ${d.xValue}<br>

${yField}: ${d.yValue}<br>

${sizeField}: ${d.sizeValue}

`;

}


},





xAxis:{


type:"log",


name:xField,


splitLine:{


show:true


}


},





yAxis:{


type:"value",


name:yField,


splitLine:{


show:true


}


},





series:[



{


type:"line",

data:trail,


showSymbol:false,


lineStyle:{


color:

selected?

getColor(selected):

"transparent",


width:3


},


z:1



},






{


type:"scatter",


data:scatterData,


z:2,



symbolSize:function(v){


return Math.sqrt(v[2])*5;


},



emphasis:{


scale:true


},



markLine:pointSelected?


{


symbol:"none",


lineStyle:{


type:"dashed",

color:"#555"


},



data:[


{

xAxis:

pointSelected.xValue

},


{

yAxis:

pointSelected.yValue

}



]


}


:null




}


]


});



addEvents();



}










function addEvents(){



chart.off("click");



chart.on(
"click",
function(params){


if(params.seriesType!=="scatter")
return;



selected=params.data.name;


selectedData=params.data;



showInfo(params.data);



draw();



});



}










function showInfo(d){



if(!d)
return;



document
.getElementById("info")
.innerHTML=

`

<h5>${d.name}</h5>

<hr>

<b>Año:</b> ${years[current]}<br>

<b>${x.value}:</b> ${d.xValue}<br>

<b>${y.value}:</b> ${d.yValue}<br>

<b>${size.value}:</b> ${d.sizeValue}

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



},1500);



};









pause.onclick=function(){


clearInterval(timer);


timer=null;


};









search.oninput=function(){


let text=
this.value.toLowerCase();



document
.querySelectorAll(".entity-item")
.forEach(e=>{


e.style.display=


e.textContent
.toLowerCase()
.includes(text)


?

"flex"

:

"none";



});



};








window.onresize=function(){

chart.resize();

};