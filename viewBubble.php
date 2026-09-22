<?php


$id = isset($_GET["id"])
?
intval($_GET["id"])
:
1;



$dataFile =
$id==1
?
"data.json"
:
"data".$id.".json";



$configFile =
$id==1
?
"config.json"
:
"config".$id.".json";



if(
!file_exists($dataFile)
||
!file_exists($configFile)
){

die("Vista no encontrada");

}


?>


<!DOCTYPE html>
<html lang="es">

<head>

<meta charset="UTF-8">

<title>Bubble View</title>



<link 
href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
rel="stylesheet">



<script src="https://cdn.jsdelivr.net/npm/echarts/dist/echarts.min.js"></script>



<link rel="stylesheet" href="style.css">



</head>


<body>



<div class="container-fluid vh-100">


<div class="row h-100">



<div class="col-lg-10">



<div id="chart"></div>




<div class="timeline">


<div class="d-flex gap-2">


<button 
id="play"
class="btn btn-success">

▶

</button>


<button 
id="pause"
class="btn btn-danger">

Ⅱ

</button>


</div>




<input
id="timeline"
type="range"
class="form-range mt-2">



<div id="years"></div>



</div>



</div>







<div class="col-lg-2">


<div class="card mt-3">


<div class="card-header">

Información

</div>


<div 
id="info"
class="card-body">

Selecciona una burbuja

</div>


</div>


</div>




</div>



</div>




<script>


const DATA_FILE =
"<?php echo $dataFile ?>";


const CONFIG_FILE =
"<?php echo $configFile ?>";



</script>



<script src="viewBubble.js"></script>



</body>

</html>