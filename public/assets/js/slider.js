$(document).ready(function(){
    $('.slider').slick({
        autoplay:true,
        dots:true,
        arrows:false,
        autoplaySpeed:5000,
        variableWidth:true,
    })
})

// * PRODUCT SLIDER
$(document).ready(function(){
    $('.product-slider').slick({
        autoplay:true,
        dots:false,
        arrows:false,
        autoplaySpeed:1000,
        // variableWidth:true,
        // slidesPerRow: 6,
        slidesToShow: 7,
        centerMode:true,
        slidesToScroll: 7,
    })
})

setTimeout(function(){

    const dots = document.querySelectorAll('.slick-dots li button')
    dots.forEach(dot=>dot.innerHTML="")
    // console.log(dots)
},1000)