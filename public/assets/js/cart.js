
let productId,totalCartItems;
const cart = document.querySelector('.total_cart_items')

$(document).on('click', '.cart-bag', function(e)
{
  e.preventDefault()
  if(e.target.classList.contains('cart'))
     {
       productId = e.target.children[1].getAttribute('href').split('/')[3];
       e.target.style.display='none';
       e.target.parentElement.parentElement.children[0].children[3].style.display='block';

     }
     else
     {
       productId = e.target.parentElement.children[1].getAttribute('href').split('/')[3];
       e.target.parentElement.style.display='none';
      //  e.target.parentElement.parentElement.children[0].children[0].children[3].style.display='block';
      e.target.parentElement.parentElement.parentElement.children[0].children[3].style.display='block';


     }

     // SEND SELECT PRODUCT TO THE SERVER
     let http  = new XMLHttpRequest()
     http.open('GET',`/cart/add/${productId}`,true)
     http.setRequestHeader('Content-Type','application/x-www-form-urlencoded')
     http.withCredentials = true;
     http.send()

     // PERSIST CART VALUE
     if(sessionStorage.getItem('cart')== undefined || sessionStorage.getItem('cart')== null)
     {
       sessionStorage.setItem('cart',cart.innerText)
     }
     else
     {
       totalCartItems = Number(cart.innerText)
         sessionStorage.setItem('cart',++totalCartItems)

         cart.innerText = sessionStorage.getItem('cart')
     }

  // window.location.replace(`/cart/add/${productId}`)

})

