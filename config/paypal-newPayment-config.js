module.exports = function newPayment(orderItem,total){
return (
    {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:4000/cart/checkout/sucess",
            "cancel_url": "http://localhost:4000/cart/checkout/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": orderItem
            },
            "amount": {
                "currency": "USD",
                "total": total.toString()
            },
            "description": "Payment on CartIt"
        }]
    }
)
}