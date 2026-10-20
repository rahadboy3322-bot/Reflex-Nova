(function(){
  var SKUS=[100,200,300,400,500,600,700,800,900,1000].map(function(n){return 'coins_'+n});
  var waiting={};
  document.addEventListener('deviceready',function(){
    if(typeof CdvPurchase==='undefined')return;
    var store=CdvPurchase.store,PT=CdvPurchase.ProductType,PL=CdvPurchase.Platform;
    store.register(SKUS.map(function(id){return{id:id,type:PT.CONSUMABLE,platform:PL.GOOGLE_PLAY}}));
    store.when().approved(function(tx){tx.finish()});
    store.when().finished(function(tx){
      tx.products.forEach(function(p){var w=waiting[p.id];if(w){delete waiting[p.id];w.res(true)}});
    });
    store.initialize([PL.GOOGLE_PLAY]).then(function(){
      window.PlayBilling={purchase:function(sku){
        return new Promise(function(res,rej){
          var prod=store.get(sku,PL.GOOGLE_PLAY),offer=prod&&prod.getOffer();
          if(!offer){rej(new Error('Product not found: '+sku));return}
          waiting[sku]={res:res,rej:rej};
          offer.order().then(function(err){if(err){delete waiting[sku];rej(err)}});
        });
      }};
    });
  },false);
})();
