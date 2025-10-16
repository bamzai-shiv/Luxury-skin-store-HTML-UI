/* global window */
(function(){
  const products = [
    { id:'p-serum-lumi', name:'LumiCrest Serum', slug:'lumicrest-serum', price:39.00, rating:4.8, category:'Serums', stock:36, colors:['#d9b79f','#c5a189','#8e6f59'], c1:'#e7cdb7', c2:'#c5a189', description:'Brightening peptide serum that supports even tone and a dewy finish.' },
    { id:'p-cream-revita', name:'RevitaLuxe Cream', slug:'revitaluxe-cream', price:49.00, rating:4.6, category:'Moisturizers', stock:22, colors:['#e7cdb7','#d1e0cf','#f5d3b8'], c1:'#ead7c9', c2:'#d9b79f', description:'Silky daily moisturizer with ceramides and squalane for barrier care.' },
    { id:'p-elixir-pure', name:'PureGlow Elixir', slug:'pureglow-elixir', price:29.00, rating:4.5, category:'Oils', stock:40, colors:['#f3d7bf','#c2e7e1','#f7e7de'], c1:'#f0dccf', c2:'#f5d3b8', description:'Lightweight facial oil blend that locks in hydration without residue.' },
    { id:'p-cleanse-cloud', name:'CloudClean Cleanser', slug:'cloudclean-cleanser', price:19.00, rating:4.3, category:'Cleansers', stock:60, colors:['#d1e0cf','#bcd6ff','#efe6df'], c1:'#d8e6d6', c2:'#e7cdb7', description:'pH‑balanced gel cleanser that removes impurities while staying gentle.' },
    { id:'p-spf-veil', name:'Veil SPF 50', slug:'veil-spf-50', price:34.00, rating:4.4, category:'SPF', stock:28, colors:['#fff1e6','#e7cdb7','#d9b79f'], c1:'#fff1e6', c2:'#e7cdb7', description:'Daily sunscreen with zero white cast and skincare actives for glow.' },
    { id:'p-set-ritual', name:'Ritual Starter Set', slug:'ritual-starter-set', price:79.00, rating:4.9, category:'Kits', stock:14, colors:['#e7cdb7','#d1e0cf','#fff1e6'], c1:'#e7cdb7', c2:'#d1e0cf', description:'Cleanser, serum, and cream bundled to kickstart a simple routine.' }
  ];
  const categories = ['All', ...Array.from(new Set(products.map(p=>p.category)))];
  const reviews = [
    { name:'Asha', rating:5, text:'Skin looks glassy and calm after two weeks — love the serum.' },
    { name:'Rahul', rating:4, text:'Moisturizer is rich yet non‑greasy and layers well under SPF.' },
    { name:'Mia', rating:5, text:'Starter set is a perfect gift and the packaging feels luxe.' }
  ];
  const posts = [
    { id:'post-barrier', title:'Build a Strong Skin Barrier', excerpt:'Ceramides, cholesterol, and fatty acids are the trio your skin craves.', body:'Focus on gentle cleansing, moisturizers rich in lipids, and SPF daily to protect your barrier.' },
    { id:'post-spf', title:'Why Daily SPF Matters', excerpt:'UV exposure accelerates aging more than any other factor.', body:'Use broad‑spectrum SPF 30+ every day and reapply, even indoors near windows.' },
    { id:'post-layer', title:'Layering 101', excerpt:'From thinnest to thickest is the golden rule for most routines.', body:'Cleanser → Toner → Serum → Moisturizer → SPF in the AM; swap SPF for oil at night.' }
  ];
  window.DB = { products, categories, reviews, posts };
})();
