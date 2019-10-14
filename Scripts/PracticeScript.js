$(window).on("load", function(){
    const dom = {
        xSlider: $("input#xInput"),
        ySlider: $("input#yInput"),
        zSlider: $("input#zInput")
    };

    function Update(){
        $("#xSpan").html($("input#xInput").val());
        $("#ySpan").html($("input#yInput").val());
        $("#zSpan").html($("input#zInput").val());
    }

    dom.xSlider.on("input", Update);
    dom.ySlider.on("input", Update);
    dom.zSlider.on("input", Update);

});