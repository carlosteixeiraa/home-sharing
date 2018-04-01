var key = 0;
var keyd = 0;

$("#upload").on("click", () => {
    if(key == 0) {
        $("#popup").css('display', 'flex')
        $("#upload").attr('src', 'media/cruz.svg');
        key = 1;
    } else {
        $("#popup").css('display', 'none')
        $("#upload").attr('src', 'media/mais.svg');
        key = 0;
    }
});

$("#btn ").on("click", () => {
    $("#popup").css('display', 'none')
})

$("#sair ").on("click", () => {
    window.location.href = '/sair'
})