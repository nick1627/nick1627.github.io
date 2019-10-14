$(window).on("load", function(){
    const dom = {
        cSlider: $("input#CharismaSlider"),
        coSlider: $("input#Colour")
    };

    function Update(){
        $("#CharismaTextField").val($("input#CharismaSlider").val());
        $("#ColourDisplay").html($("input#Colour").val());
    }

    dom.cSlider.on("input", Update);
    dom.coSlider.on("input", Update);

});