module.exports = function(order){
    let total=0;
    if(typeof order != 'undefined')
    {
        order.forEach(item=>{
            total +=Number(item.price) * Number(item.qty);
        })

        return total.toFixed(2);
    }
    else{
        return 0;
    }
}