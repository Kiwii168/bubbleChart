<?php
?>

<!DOCTYPE html>
<html lang="es">

<head>

<meta charset="UTF-8">

<title>Bubble Editor</title>


<link 
href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
rel="stylesheet">


<script src="https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js"></script>


<link rel="stylesheet" href="style.css">


</head>


<body>


<div class="container-fluid">


<h3 class="mt-3">
Crear vista Bubble
</h3>



<div class="row mt-3">


<div class="col-md-3">

<label>
Archivo Excel
</label>

<input 
type="file"
id="file"
class="form-control">

</div>



<div class="col-md-2">

<label>
Entidad
</label>

<select 
id="entity"
class="form-select">
</select>

</div>



<div class="col-md-2">

<label>
Año
</label>

<select 
id="year"
class="form-select">
</select>

</div>



<div class="col-md-2">

<label>
Eje X
</label>

<select 
id="x"
class="form-select">
</select>

</div>



<div class="col-md-2">

<label>
Eje Y
</label>

<select 
id="y"
class="form-select">
</select>

</div>



<div class="col-md-2">

<label>
Tamaño
</label>

<select 
id="size"
class="form-select">
</select>

</div>



<div class="col-md-2">

<label>
Color
</label>

<select 
id="color"
class="form-select">
</select>

</div>


</div>





<div class="mt-3">


<button 
id="save"
class="btn btn-success">

Guardar vista

</button>


</div>



<div id="preview"
class="mt-4">

</div>



</div>



<script src="editBubble.js"></script>


</body>

</html>