// * CHECKOUT PAGE
const plus = document.querySelectorAll('.plus');
const minus = document.querySelectorAll('.minus');
let total = document.getElementById('total');
let price;

plus.forEach(plusSign=>{
  plusSign.addEventListener('click',(e)=>{
   let quantity = Number(e.target.parentElement.children[1].value)
   e.target.parentElement.children[1].value = ++quantity;
   updateSubTotal(e.target.parentElement)
   updateTotalPrice()
  })
})

minus.forEach(plusSign=>{
  plusSign.addEventListener('click',(e)=>{
   let quantity = Number(e.target.parentElement.children[1].value)

   e.target.parentElement.children[1].value  =  e.target.parentElement.children[1].value == 1 ? 1:--quantity;
   updateSubTotal(e.target.parentElement)
   updateTotalPrice()
    
  })
})

// * UPDATE SUBTOTAL PRICE
function updateSubTotal(target){
    price = Number(target.parentElement.children[2].innerText)
    const product = target.parentElement.children[1].innerText
    let quantity = Number(target.children[1].value);
    const subTotal = target.parentElement.children[4].children[0].children[0]
    let subtotal= (price*quantity).toFixed(2)
    subTotal.innerText =subtotal ;
    
    // * SEND SUB-TOTAL AND QUANTITY TO SERVER
    let http = new XMLHttpRequest()
    http.open('POST',`/cart/updatecart/${quantity}/${product}`,true)
    http.setRequestHeader('Content-Type','application/x-www-form-urlencoded')
    http.withCredentials = true;
    http.send()

}

// * UPDATE TOTAL
function updateTotalPrice(){
    const subTotal = document.querySelectorAll('.sub-total')
    let total =0;

    subTotal.forEach(subtotal=>{
        total += Number(subtotal.innerText)
    })

    document.getElementById('total').innerHTML = total.toFixed(2);
}