let data=[];



const file =
document.getElementById("file");


file.onchange=function(e){


let reader =
new FileReader();



reader.onload=function(evt){


let workbook =
XLSX.read(
evt.target.result,
{
type:"binary"
}
);



let sheet =
workbook.Sheets[
workbook.SheetNames[0]
];



data =
XLSX.utils.sheet_to_json(
sheet,
{
defval:""
}
);



if(data.length===0){

alert("Excel vacío");

return;

}



let columns =
Object.keys(data[0]);



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


option.value=col;

option.textContent=col;



select.appendChild(option);



});


});



alert(
"Excel cargado correctamente"
);



};



reader.readAsBinaryString(
e.target.files[0]
);



};








document
.getElementById("save")
.onclick=function(){



if(data.length===0){

alert(
"Carga primero un Excel"
);

return;

}



let config={


title:
"Vista Bubble",


entity:
entity.value,


year:
year.value,


x:
x.value,


y:
y.value,


size:
size.value,


color:
color.value



};





fetch(
"saveBubble.php",
{


method:"POST",


headers:{

"Content-Type":
"application/json"

},


body:

JSON.stringify({

data:data,

config:config

})


}

)

.then(r=>r.json())


.then(resp=>{


if(resp.ok){



alert(

"Vista creada correctamente\n\n"+
"Vista número: "+
resp.id+

"\n\n"+
"Archivo:\n"+
"viewBubble.php?id="+resp.id

);



}


else{


alert(
"Error al guardar"
);


}


})


.catch(err=>{


console.error(err);


alert(
"Error de conexión"
);


});



};