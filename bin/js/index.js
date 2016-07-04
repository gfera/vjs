var i = 0;
var l = 100;
var time_start;
var time_delta;
var o = {variable:1, obj:{a:1,b:2}}
var elm = null;

var log = vq('#log')[0];
//log.innerHTML += "<p>Creación de DOM y append a un DIV "+l+" elementos</p>";
log.innerHTML += "<p>Crear y agregar "+l+" elementos</p>";
log.innerHTML += "jQuery Test<br>";



function formatMs(t) {
    var n = t / 1024;
    return n.toFixed(3) + 'ms';
}

var $test = $('#test');

$test[0].style.cssText="font-size:12px; line-height:40px;"

time_start = Date.now();
for (; i < l; i++) {    
    o.variable = "texto "+i
    $test.append($('<div style="color:black">'+o.variable+'</div>'))
    
}
time_delta = Date.now() - time_start;
log.innerHTML += "Time: " + formatMs(time_delta)+'<br>';

/*------------------------------------------------------------------------*/
i=0;
$test = vq('#test')
log.innerHTML += "VanillaQuery Test<br>";
time_start = Date.now();

for (; i < l; i++) {
    o.variable = "texto "+i
    elm = $test[0].appendChild(vq.template('<div style="color:black">[variable] [obj.a]</div>',o,true))
    elm.addClass('hola')
    //$test[0].appendChild(vq.template('<div style="color:black">texto '+i+'</div>',null,true))
    //$test[0].appendChild(vq.create('[style="color:black"]',"hola que tal"))
}
time_delta = Date.now() - time_start;
log.innerHTML += "Time: " + formatMs(time_delta);