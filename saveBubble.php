<?php


header(
"Content-Type: application/json"
);



$input =
file_get_contents("php://input");



$data =
json_decode(
$input,
true
);



if(!$data){


echo json_encode([

"ok"=>false,

"error"=>"Datos inválidos"

]);


exit;

}





function siguienteNumero(){


$i=1;



while(true){


$dataFile =
$i==1
?
"data.json"
:
"data".$i.".json";



$configFile =
$i==1
?
"config.json"
:
"config".$i.".json";



if(
!file_exists($dataFile)
&&
!file_exists($configFile)
){


return $i;


}



$i++;


}


}







$id =
siguienteNumero();





$dataName =
$id==1
?
"data.json"
:
"data".$id.".json";



$configName =
$id==1
?
"config.json"
:
"config".$id.".json";







file_put_contents(

$dataName,

json_encode(

$data["data"],

JSON_PRETTY_PRINT |
JSON_UNESCAPED_UNICODE

)

);





file_put_contents(

$configName,

json_encode(

$data["config"],

JSON_PRETTY_PRINT |
JSON_UNESCAPED_UNICODE

)

);







echo json_encode([


"ok"=>true,


"id"=>$id,


"data"=>$dataName,


"config"=>$configName



]);