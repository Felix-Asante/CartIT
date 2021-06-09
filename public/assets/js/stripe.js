// payment-bottoms and form
const paypalCheckBox = document.getElementById('check-paypal')
const cardField = document.getElementById('card-element')
const cardBtn = document.querySelector('.card-submit')
const paypalBtn = document.querySelector('.paypal-submit')
const form = document.getElementById('payment-form');
const formAction = form.getAttribute('action')

function paymentMethods(){
    if(paypalCheckBox.checked==true){
       cardField.style.display='none'
       cardBtn.style.display='none'
       paypalBtn.style.display='block'
       form.setAttribute('action','/cart/checkout/paypal')
       
      }
      else{
        cardField.style.display='block'
        cardBtn.style.display='block'
        paypalBtn.style.display='none'
        form.setAttribute('action',formAction)

    }
}

// ! STRIPE INPUT FIELD SETUP
var stripe = Stripe('pk_test_51Iv6ajIvfdMNUzOzizOipfianrrdePXZOyHSNrHL6D46tXMKicOnuSFbI2YdEfBGQpxIlo3BFrUPUfUcTL1O7IQ300HkropJkz');
var elements = stripe.elements();
// Custom styling can be passed to options when creating an Element.
var style = {
    base: {
      // Add your base input styles here. For example:
      fontSize: '16px',
      color: '#32325d',
    },
  };
  
  // Create an instance of the card Element.
  var card = elements.create('card', {style: style});
  
  // Add an instance of the card Element into the `card-element` <div>.
  card.mount('#card-element');

  // ! CREATE PAYMENT TOKEN

form.addEventListener('submit', function(event) {

  if(form.getAttribute('action')==formAction){

    event.preventDefault();
    stripe.createToken(card).then(function(result) {
      if (result.error) {
        // Inform the customer that there was an error.
        var errorElement = document.getElementById('card-errors');
        errorElement.textContent = result.error.message;
      } else {
        // Send the token to your server.
        stripeTokenHandler(result.token);
      }
    });
  }

});

// ! TOKEN HANDLER
function stripeTokenHandler(token) {
  // Insert the token ID into the form so it gets submitted to the server
  var form = document.getElementById('payment-form');
  var hiddenInput = document.createElement('input');
  hiddenInput.setAttribute('type', 'hidden');
  hiddenInput.setAttribute('name', 'stripeToken');
  hiddenInput.setAttribute('value', token.id);
  form.appendChild(hiddenInput);

  // Submit the form
  form.submit();
}
